import { useState, useCallback, useMemo } from "react";
import { students, type AttendanceRecord } from "@/data/mockData";
import { format } from "date-fns";
import { toast } from "sonner";

export function useAttendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [syncing, setSyncing] = useState(false);

  const dateKey = format(selectedDate, "yyyy-MM-dd");

  const markAttendance = useCallback(
    (studentId: string, status: "present" | "absent") => {
      setRecords((prev) => {
        const filtered = prev.filter(
          (r) => !(r.studentId === studentId && r.date === dateKey)
        );
        return [
          ...filtered,
          { studentId, date: dateKey, status, timestamp: new Date().toISOString() },
        ];
      });
    },
    [dateKey]
  );

  const markAllPresent = useCallback(() => {
    const now = new Date().toISOString();
    setRecords((prev) => {
      const filtered = prev.filter((r) => r.date !== dateKey);
      const newRecords = students.map((s) => ({
        studentId: s.id,
        date: dateKey,
        status: "present" as const,
        timestamp: now,
      }));
      return [...filtered, ...newRecords];
    });
    toast.success("All students marked present");
  }, [dateKey]);

  const resetDay = useCallback(() => {
    setRecords((prev) => prev.filter((r) => r.date !== dateKey));
    toast.success("Day reset");
  }, [dateKey]);

  const resetStudent = useCallback(
    (studentId: string) => {
      setRecords((prev) =>
        prev.filter((r) => !(r.studentId === studentId && r.date === dateKey))
      );
    },
    [dateKey]
  );

  const syncToSheets = useCallback(async () => {
    setSyncing(true);
    try {
      const dayRecords = records.filter((r) => r.date === dateKey);
      
      // Enrich records with student names
      const enrichedRecords = dayRecords.map((r) => ({
        ...r,
        studentName: students.find((s) => s.id === r.studentId)?.name ?? r.studentId,
      }));
      
      const response = await fetch("/api/sync-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: enrichedRecords, date: dateKey }),
      });
      if (!response.ok) {
        throw new Error("Sync failed");
      }
      toast.success("Synced to Google Sheets");
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Sync failed. Is the server running?");
    } finally {
      setSyncing(false);
    }
  }, [records, dateKey]);

  const summary = useMemo(() => {
    const dayRecords = records.filter((r) => r.date === dateKey);
    const present = dayRecords.filter((r) => r.status === "present").length;
    const absent = dayRecords.filter((r) => r.status === "absent").length;
    const total = students.length;
    const unmarked = total - present - absent;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, total, unmarked, rate };
  }, [records, dateKey]);

  const getStudentStatus = useCallback(
    (studentId: string): AttendanceRecord | undefined => {
      return records.find((r) => r.studentId === studentId && r.date === dateKey);
    },
    [records, dateKey]
  );

  return {
    selectedDate,
    setSelectedDate,
    records,
    markAttendance,
    markAllPresent,
    resetDay,
    resetStudent,
    syncToSheets,
    syncing,
    summary,
    getStudentStatus,
    dateKey,
  };
}
