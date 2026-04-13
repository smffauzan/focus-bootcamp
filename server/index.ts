import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface AttendanceRecord {
  studentId: string;
  date: string;
  status: "present" | "absent";
  timestamp: string;
}

interface SyncRequest {
  records: AttendanceRecord[];
  date: string;
}

// Helper: Get Google Sheets auth client
function getAuthClient(): JWT {
  let credentials: any;

  // Try to get from env var first
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON:", e);
      throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY format");
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Fallback to file path
    const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!fs.existsSync(filePath)) {
      throw new Error(`Service account file not found: ${filePath}`);
    }
    credentials = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } else {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS must be set"
    );
  }

  return new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// Helper: Get student name from studentId
function getStudentName(studentId: string): string {
  // Map of student IDs to names - align with frontend mockData
  const studentMap: Record<string, string> = {
    S001: "Aisha Johnson",
    S002: "Brian Kim",
    S003: "Carlos Rivera",
    S004: "Diana Osei",
    S005: "Elijah Patel",
    S006: "Fatima Al-Rashid",
    S007: "George Chen",
    S008: "Hannah Brooks",
    S009: "Ibrahim Mensah",
    S010: "Julia Torres",
    S011: "Kevin Nakamura",
    S012: "Lena Ivanova",
    S013: "Marcus Washington",
    S014: "Nadia Okonkwo",
    S015: "Oscar Gutierrez",
    S016: "Priya Sharma",
    S017: "Quincy Adams",
    S018: "Rosa Fernandez",
    S019: "Samuel Lee",
    S020: "Tanya Williams",
    S021: "Umar Diallo",
    S022: "Victoria Nguyen",
  };
  return studentMap[studentId] || "Unknown Student";
}

// Helper: Ensure headers exist in sheet
async function ensureHeaders(sheets: any, spreadsheetId: string, sheetId: number) {
  try {
    // Check if first row has headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Sheet1!A1:E1`,
    });

    const values = response.data.values;

    if (!values || values.length === 0) {
      // Insert headers
      const headers = [["Date", "Student ID", "Student Name", "Status", "Timestamp"]];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A1:E1`,
        valueInputOption: "RAW",
        requestBody: {
          values: headers,
        },
      });
      console.log("Headers created in Google Sheet");
    }
  } catch (error) {
    console.error("Error ensuring headers:", error);
  }
}

// Main sync endpoint
app.post("/api/sync-attendance", async (req: Request, res: Response) => {
  try {
    const { records, date }: SyncRequest = req.body;

    // Validate input
    if (!records || !Array.isArray(records) || !date) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid records/date in request body",
      });
    }

    if (!process.env.GOOGLE_SHEET_ID) {
      return res.status(500).json({
        success: false,
        error: "GOOGLE_SHEET_ID environment variable not set",
      });
    }

    // Get auth client and sheets API
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Ensure headers exist
    await ensureHeaders(sheets, spreadsheetId, 0);

    // Clear existing rows for this date
    // First, get all values to find rows to clear
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Sheet1!A2:E1000`,
    });

    const existingValues = getResponse.data.values || [];
    const rowsToDelete: number[] = [];

    // Find rows with the same date (they're in row index + 2 because headers are row 1)
    existingValues.forEach((row, index) => {
      if (row[0] === date) {
        rowsToDelete.push(index + 2); // +2 because A2 is index 2 in the sheet
      }
    });

    // Delete rows in reverse order to avoid index shifting
    if (rowsToDelete.length > 0) {
      const requests = rowsToDelete.map((rowIndex) => ({
        deleteDimension: {
          range: {
            sheetId: 0,
            dimension: "ROWS",
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      }));

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests,
        },
      });
    }

    // Prepare new rows
    const newRows = records.map((record) => [
      record.date,
      record.studentId,
      getStudentName(record.studentId),
      record.status,
      record.timestamp,
    ]);

    // Append new records
    if (newRows.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `Sheet1!A2`,
        valueInputOption: "RAW",
        requestBody: {
          values: newRows,
        },
      });
    }

    console.log(
      `Successfully synced ${records.length} attendance records for ${date}`
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
