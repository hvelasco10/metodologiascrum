import { useAppStore } from "@/lib/store";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  FolderKanban,
  Users,
  FileBarChart,
  Zap,
  ChevronLeft,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { SectionKey } from "@/lib/sections";

const NAV_ITEMS: { icon: any; label: string; path: string; key: SectionKey }[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", key: "dashboard" },
  { icon: KanbanSquare, label: "Tablero Scrum", path: "/board", key: "board" },
  { icon: Calendar, label: "Sprints", path: "/sprints", key: "sprints" },
  { icon: FolderKanban, label: "Backlog", path: "/backlog", key: "backlog" },
  { icon: Users, label: "Equipo", path: "/team", key: "team" },
  { icon: FileBarChart, label: "Informes", path: "/reports", key: "reports" },
];

export function AppSidebar() {
  const location = useLocation();
  const { projects, selectedProjectId, setSelectedProject } = useAppStore();
  const { user, signOut } = useAuth();
  const { can, isAdmin } = usePermissions();
  const visibleItems = NAV_ITEMS.filter((it) => can(it.key));
  const [collapsed, setCollapsed] = useState(false);
  const currentProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold truncate">ScrumFlow</h1>
            <p className="text-xs text-sidebar-muted truncate">Gestión Ágil</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-sidebar-accent transition-colors shrink-0"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Project Selector */}
      {!collapsed && (
        <div className="p-3 border-b border-sidebar-border">
          <label className="text-[10px] uppercase tracking-wider text-sidebar-muted font-medium">
            Proyecto
          </label>
          <select
            value={selectedProjectId || ""}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full mt-1 bg-sidebar-accent text-sidebar-foreground text-sm rounded-md px-2 py-1.5 border border-sidebar-border focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                  : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/users"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mt-2",
              location.pathname === "/users"
                ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Usuarios</span>}
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {!collapsed && user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-medium text-sidebar-primary-foreground shrink-0">
              {(user.email?.[0] ?? "U").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
