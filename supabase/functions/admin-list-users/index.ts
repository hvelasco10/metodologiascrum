import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: callerRole } = await admin
      .from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!callerRole) return new Response(JSON.stringify({ error: "Solo admin" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const ids = list.users.map((u) => u.id);
    const [{ data: perms }, { data: roles }] = await Promise.all([
      admin.from("user_permissions").select("*").in("user_id", ids),
      admin.from("user_roles").select("user_id, role").in("user_id", ids),
    ]);

    const users = list.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      permissions: perms?.find((p) => p.user_id === u.id) ?? null,
      roles: (roles ?? []).filter((r) => r.user_id === u.id).map((r) => r.role),
    }));

    return new Response(JSON.stringify({ users }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
