import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getInitials } from "@/data/mockData";
import type { Student, AttendanceRecord } from "@/data/mockData";
import { format } from "date-fns";

interface StudentRowProps {
  student: Student;
  record?: AttendanceRecord;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onMark: (id: string, status: "present" | "absent") => void;
}

const avatarColors = [
  "bg-primary/20 text-primary",
  "bg-accent/20 text-accent",
  "bg-destructive/20 text-destructive",
  "bg-blue-500/20 text-blue-400",
  "bg-purple-500/20 text-purple-400",
  "bg-orange-500/20 text-orange-400",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function StudentRow({ student, record, selected, onToggleSelect, onMark }: StudentRowProps) {
  const status = record?.status || "unmarked";

  return (
    <div className="flex items-center gap-3 p-3 rounded-md border border-border/50 bg-card hover:bg-secondary/30 transition-colors">
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggleSelect(student.id)}
        className="border-muted-foreground"
      />
      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${getColor(student.name)}`}>
        {getInitials(student.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{student.name}</p>
        <p className="text-xs font-mono text-muted-foreground">{student.id}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={status === "present" ? "default" : "outline"}
          className={status === "present" ? "bg-success hover:bg-success/80 text-primary-foreground" : "border-success/30 text-success hover:bg-success/10"}
          onClick={() => onMark(student.id, "present")}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={status === "absent" ? "destructive" : "outline"}
          className={status !== "absent" ? "border-danger/30 text-danger hover:bg-danger/10" : ""}
          onClick={() => onMark(student.id, "absent")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Badge
        variant={status === "present" ? "default" : status === "absent" ? "destructive" : "outline"}
        className={`font-mono text-[10px] uppercase w-16 justify-center ${status === "present" ? "bg-success/20 text-success border-success/30" : status === "absent" ? "bg-danger/20 text-danger border-danger/30" : "text-muted-foreground"}`}
      >
        {status}
      </Badge>
      <span className="text-[10px] font-mono text-muted-foreground w-14 text-right">
        {record?.timestamp ? format(new Date(record.timestamp), "HH:mm") : "—"}
      </span>
    </div>
  );
}
