import { Users, UserCheck, UserX, TrendingUp, CheckCheck, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";

export default function Dashboard() {
  const { selectedDate, setSelectedDate, summary, markAllPresent, resetDay } = useAttendance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight">DASHBOARD</h1>
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
          <Button variant="outline" size="sm" className="font-mono text-xs" onClick={markAllPresent}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark All
          </Button>
          <Button variant="outline" size="sm" className="font-mono text-xs text-danger hover:text-danger" onClick={resetDay}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-secondary border border-border/50 font-mono text-sm">
        <span className="text-muted-foreground">STATUS:</span>
        <span className="text-success font-bold">Present: {summary.present}</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-danger font-bold">Absent: {summary.absent}</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-foreground">Total: {summary.total}</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={summary.total} icon={Users} accent="text-foreground" />
        <StatCard title="Present Today" value={summary.present} icon={UserCheck} accent="text-success" />
        <StatCard title="Absent Today" value={summary.absent} icon={UserX} accent="text-danger" />
        <StatCard title="Attendance %" value={`${summary.rate}%`} icon={TrendingUp} accent="text-accent" />
      </div>
    </div>
  );
}
