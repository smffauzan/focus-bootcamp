export interface Student {
  id: string;
  name: string;
  email: string;
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: "present" | "absent" | "unmarked";
  timestamp: string;
}

export const students: Student[] = [
  { id: "S001", name: "Aisha Johnson", email: "aisha@fcc.org" },
  { id: "S002", name: "Brian Kim", email: "brian@fcc.org" },
  { id: "S003", name: "Carlos Rivera", email: "carlos@fcc.org" },
  { id: "S004", name: "Diana Osei", email: "diana@fcc.org" },
  { id: "S005", name: "Elijah Patel", email: "elijah@fcc.org" },
  { id: "S006", name: "Fatima Al-Rashid", email: "fatima@fcc.org" },
  { id: "S007", name: "George Chen", email: "george@fcc.org" },
  { id: "S008", name: "Hannah Brooks", email: "hannah@fcc.org" },
  { id: "S009", name: "Ibrahim Mensah", email: "ibrahim@fcc.org" },
  { id: "S010", name: "Julia Torres", email: "julia@fcc.org" },
  { id: "S011", name: "Kevin Nakamura", email: "kevin@fcc.org" },
  { id: "S012", name: "Lena Ivanova", email: "lena@fcc.org" },
  { id: "S013", name: "Marcus Washington", email: "marcus@fcc.org" },
  { id: "S014", name: "Nadia Okonkwo", email: "nadia@fcc.org" },
  { id: "S015", name: "Oscar Gutierrez", email: "oscar@fcc.org" },
  { id: "S016", name: "Priya Sharma", email: "priya@fcc.org" },
  { id: "S017", name: "Quincy Adams", email: "quincy@fcc.org" },
  { id: "S018", name: "Rosa Fernandez", email: "rosa@fcc.org" },
  { id: "S019", name: "Samuel Lee", email: "samuel@fcc.org" },
  { id: "S020", name: "Tanya Williams", email: "tanya@fcc.org" },
  { id: "S021", name: "Umar Diallo", email: "umar@fcc.org" },
  { id: "S022", name: "Victoria Nguyen", email: "victoria@fcc.org" },
];

export function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary", "bg-accent", "bg-destructive",
    "hsl(200, 70%, 45%)", "hsl(280, 60%, 50%)", "hsl(30, 80%, 50%)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
}
