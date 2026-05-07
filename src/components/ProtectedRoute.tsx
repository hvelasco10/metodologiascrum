import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { SectionKey } from "@/lib/sections";
import NoAccess from "@/pages/NoAccess";

export function ProtectedRoute({ children, section }: { children: ReactNode; section?: SectionKey | "admin" }) {
  const { user, loading } = useAuth();
  const { isAdmin, can, loading: permLoading } = usePermissions();

  if (loading || permLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  if (section === "admin") {
    if (!isAdmin) return <NoAccess />;
  } else if (section) {
    if (!can(section)) return <NoAccess />;
  }
  return <>{children}</>;
}
