import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// ENV VARIABLE VALIDATION ON STARTUP
// ============================================
console.log("\n🔍 Validating environment variables...");
const requiredEnvVars = ["GOOGLE_SHEET_ID", "GOOGLE_SERVICE_ACCOUNT_KEY"];
let startupValid = true;

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing env variable: ${key}`);
    startupValid = false;
  } else {
    console.log(`✅ ${key} is set`);
  }
});

if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  try {
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    console.log(`✅ GOOGLE_SERVICE_ACCOUNT_KEY is valid JSON`);
    console.log(`   Service Account Email: ${creds.client_email}`);
  } catch (e) {
    console.error(`❌ GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON: ${e.message}`);
    startupValid = false;
  }
}

if (!startupValid) {
  console.error("\n❌ Startup validation failed. Exiting.");
  process.exit(1);
}

console.log("✅ All environment variables validated!\n");

// Middleware
app.use(cors());
app.use(express.json());

// Student name mapping - must match frontend mockData
const studentMap = {
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

function getStudentName(studentId) {
  return studentMap[studentId] || "Unknown Student";
}

// Matrix layout - no separate ensure headers function needed

// POST /api/sync-attendance
app.post("/api/sync-attendance", async (req, res) => {
  try {
    const { records, date } = req.body;

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

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res.status(500).json({
        success: false,
        error: "GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set",
      });
    }

    // Parse credentials
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      return res.status(500).json({
        success: false,
        error: "Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON",
      });
    }

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // ========================================
    // MATRIX/PIVOT LAYOUT SYNC
    // ========================================

    // Step 1: Read entire sheet
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1",
    });
    let rows = existing.data.values || [];

    // Step 2: Parse or initialize header row
    if (rows.length === 0) {
      rows.push(["Student Name"]); // Initialize with header
    }
    const header = rows[0];

    // Step 3: Add new date column if it doesn't exist
    let dateColIndex = header.indexOf(date);
    if (dateColIndex === -1) {
      header.push(date);
      dateColIndex = header.length - 1;
      console.log(`📅 Added new date column: ${date} at index ${dateColIndex}`);
    } else {
      console.log(`📅 Date column ${date} already exists at index ${dateColIndex}`);
    }

    // Step 4: Build a map of studentName -> row index
    const studentRowMap = {};
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        studentRowMap[rows[i][0]] = i;
      }
    }

    // Step 5: Update or add rows for each record
    for (const record of records) {
      const statusChar = record.status === "present" ? "P" : "A";
      if (studentRowMap[record.studentName] !== undefined) {
        const rowIdx = studentRowMap[record.studentName];
        // Pad row if needed
        while (rows[rowIdx].length <= dateColIndex) {
          rows[rowIdx].push("");
        }
        rows[rowIdx][dateColIndex] = statusChar;
        console.log(`  ✓ Updated ${record.studentName}: ${statusChar}`);
      } else {
        // New student row
        const newRow = new Array(dateColIndex + 1).fill("");
        newRow[0] = record.studentName;
        newRow[dateColIndex] = statusChar;
        rows.push(newRow);
        studentRowMap[record.studentName] = rows.length - 1;
        console.log(`  ✓ Added new student: ${record.studentName} with ${statusChar}`);
      }
    }

    // Step 6: Write entire updated matrix back to sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: { values: rows },
    });

    console.log(`✓ Synced ${records.length} attendance records for ${date}`);
    res.json({ success: true });
  } catch (error) {
    console.error("\n=== 🚨 SYNC ERROR ===");
    console.error("Message:", error.message);
    console.error("Error Type:", error.constructor.name);
    if (error.stack) {
      console.error("Stack Trace:", error.stack);
    }
    if (error.errors) {
      console.error("Details:", error.errors);
    }
    console.error("==================\n");
    res.status(500).json({
      success: false,
      error: error.message || "Unknown error",
    });
  }
});

// ============================================
// HEALTH CHECK - Tests auth independently
// ============================================
app.get("/api/health", async (req, res) => {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res.status(500).json({
        success: false,
        error: "GOOGLE_SERVICE_ACCOUNT_KEY not set",
      });
    }

    // Parse and validate credentials
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      return res.status(500).json({
        success: false,
        error: `Invalid JSON in GOOGLE_SERVICE_ACCOUNT_KEY: ${e.message}`,
      });
    }

    // Test auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    res.json({
      success: true,
      message: "✅ Backend is healthy",
      serviceAccountEmail: credentials.client_email,
      sheetId: process.env.GOOGLE_SHEET_ID,
      tokenObtained: !!token.token,
      tokenExpiry: token.expiry_date ? new Date(token.expiry_date).toISOString() : null,
    });
  } catch (err) {
    console.error("\n=== 🚨 HEALTH CHECK ERROR ===");
    console.error("Message:", err.message);
    console.error("Error Type:", err.constructor.name);
    if (err.errors) {
      console.error("Details:", err.errors);
    }
    console.error("==================\n");
    res.status(500).json({
      success: false,
      error: err.message || "Health check failed",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Backend server running on http://localhost:${PORT}`);
});
