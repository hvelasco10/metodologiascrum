import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SECTIONS = ["dashboard", "board", "sprints", "backlog", "team", "reports"] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Verify caller is admin OR there is no admin yet (bootstrap)
    const { count: adminCount } = await admin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    const { data: callerRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isBootstrap = (adminCount ?? 0) === 0;
    const isAdmin = !!callerRole;

    if (!isAdmin && !isBootstrap) {
      return new Response(JSON.stringify({ error: "Solo el administrador puede crear usuarios" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { email, password, displayName, permissions, makeAdmin } = body ?? {};

    if (!email || !password || password.length < 6) {
      return new Response(JSON.stringify({ error: "Email y contraseña (mín 6) requeridos" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName ?? email },
    });
    if (createErr || !created.user) {
      return new Response(JSON.stringify({ error: createErr?.message ?? "Error creando usuario" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const newUserId = created.user.id;
    const grantAdmin = isBootstrap || !!makeAdmin;

    if (grantAdmin) {
      await admin.from("user_roles").insert({ user_id: newUserId, role: "admin" });
    }

    const perms: Record<string, boolean> = { user_id: newUserId } as any;
    for (const s of SECTIONS) {
      perms[s] = grantAdmin ? true : !!permissions?.[s];
    }
    await admin.from("user_permissions").upsert(perms, { onConflict: "user_id" });

    return new Response(JSON.stringify({ ok: true, userId: newUserId, bootstrappedAdmin: isBootstrap }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
