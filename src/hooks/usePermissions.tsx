import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { EMPTY_PERMS, Permissions, SectionKey } from "@/lib/sections";

export function usePermissions() {
  const { user, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<Permissions>(EMPTY_PERMS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setPermissions(EMPTY_PERMS);
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    let cancel = false;
    (async () => {
      setLoading(true);
      const [{ data: roles }, { data: perms }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("user_permissions").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (cancel) return;
      const admin = !!roles?.some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) {
        setPermissions({ dashboard: true, board: true, sprints: true, backlog: true, team: true, reports: true });
      } else {
        setPermissions({
          dashboard: !!perms?.dashboard,
          board: !!perms?.board,
          sprints: !!perms?.sprints,
          backlog: !!perms?.backlog,
          team: !!perms?.team,
          reports: !!perms?.reports,
        });
      }
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [user, authLoading]);

  const can = (section: SectionKey) => isAdmin || permissions[section];
  return { permissions, isAdmin, loading, can };
}
