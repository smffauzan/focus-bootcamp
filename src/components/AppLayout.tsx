import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, ClipboardList } from "lucide-react";
import { AttendanceProvider } from "@/context/AttendanceContext";
import focusLogo from "@/assets/focus-logo.png";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attendance", label: "Attendance", icon: ClipboardList },
];

export function AppLayout() {
  return (
    <AttendanceProvider>
      <div className="flex min-h-screen">
        <aside className="w-56 shrink-0 border-r border-border bg-sidebar hidden md:flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-mono font-bold text-sm tracking-widest text-primary">FCC BOOTCAMP</h2>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">ATTENDANCE TRACKER</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-mono transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-primary font-semibold"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <p className="text-[10px] font-mono text-muted-foreground">v1.0.0 — LOCAL MODE</p>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="md:hidden flex items-center justify-between p-3 border-b border-border bg-sidebar">
            <h2 className="font-mono font-bold text-sm tracking-widest text-primary">FCC BOOTCAMP</h2>
            <nav className="flex gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `p-2 rounded-md ${isActive ? "bg-sidebar-accent text-primary" : "text-muted-foreground"}`
                  }
                >
                  <item.icon className="h-4 w-4" />
                </NavLink>
              ))}
            </nav>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AttendanceProvider>
  );
}
