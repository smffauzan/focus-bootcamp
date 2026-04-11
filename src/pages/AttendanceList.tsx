import { useState, useMemo } from "react";
import { Search, CheckCheck, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { students } from "@/data/mockData";
import { useAttendance } from "@/hooks/useAttendance";
import { StudentRow } from "@/components/StudentRow";
import { SyncButton } from "@/components/SyncButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

type Filter = "all" | "present" | "absent" | "unmarked";

export default function AttendanceList() {
  const { selectedDate, setSelectedDate, markAttendance, getStudentStatus, syncToSheets, syncing } = useAttendance();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filter === "all") return true;
      const record = getStudentStatus(s.id);
      if (filter === "unmarked") return !record;
      return record?.status === filter;
    });
  }, [search, filter, getStudentStatus]);

  const batchMark = (status: "present" | "absent") => {
    selected.forEach((id) => markAttendance(id, status));
    toast.success(`${selected.size} students marked ${status}`);
    setSelected(new Set());
  };

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Present", value: "present" },
    { label: "Absent", value: "absent" },
    { label: "Unmarked", value: "unmarked" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight">ATTENDANCE</h1>
          <p className="text-sm text-muted-foreground font-mono">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="font-mono text-xs">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(selectedDate, "MMM d")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} />
            </PopoverContent>
          </Popover>
          <SyncButton syncing={syncing} onSync={syncToSheets} />
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-mono text-sm bg-secondary border-border/50"
          />
        </div>
        <div className="flex gap-1">
          {filters.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? "default" : "outline"}
              className="font-mono text-xs uppercase"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Batch Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-md bg-secondary border border-border/50">
          <span className="text-xs font-mono text-muted-foreground">{selected.size} selected</span>
          <Button size="sm" className="bg-success hover:bg-success/80 font-mono text-xs" onClick={() => batchMark("present")}>
            <CheckCheck className="h-3 w-3 mr-1" /> Present
          </Button>
          <Button size="sm" variant="destructive" className="font-mono text-xs" onClick={() => batchMark("absent")}>
            <X className="h-3 w-3 mr-1" /> Absent
          </Button>
          <Button size="sm" variant="ghost" className="font-mono text-xs" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Student List */}
      <div className="space-y-2">
        {filteredStudents.map((student) => (
          <StudentRow
            key={student.id}
            student={student}
            record={getStudentStatus(student.id)}
            selected={selected.has(student.id)}
            onToggleSelect={toggleSelect}
            onMark={markAttendance}
          />
        ))}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-mono text-sm">
            No students found
          </div>
        )}
      </div>
    </div>
  );
}
