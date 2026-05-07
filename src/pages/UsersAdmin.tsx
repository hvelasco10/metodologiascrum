import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, UserPlus, Pencil, ShieldCheck } from "lucide-react";
import { SECTIONS, EMPTY_PERMS, Permissions, SectionKey } from "@/lib/sections";
import { useAuth } from "@/hooks/useAuth";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  permissions: Record<string, boolean> | null;
  roles: string[];
}

export default function UsersAdmin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-list-users");
    if (error || (data as any)?.error) toast.error((data as any)?.error ?? error?.message);
    else setUsers((data as any).users ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`¿Eliminar al usuario ${u.email}? Esta acción es permanente.`)) return;
    const { data, error } = await supabase.functions.invoke("admin-delete-user", { body: { userId: u.id } });
    if (error || (data as any)?.error) { toast.error((data as any)?.error ?? error?.message); return; }
    toast.success("Usuario eliminado");
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6" /> Gestión de usuarios</h1>
          <p className="text-sm text-muted-foreground">Crea usuarios y define a qué secciones tienen acceso.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="w-4 h-4 mr-2" />Nuevo usuario</Button>
          </DialogTrigger>
          <CreateUserDialog onClose={() => { setCreateOpen(false); load(); }} />
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Usuarios ({users.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => {
                const isAdminUser = u.roles.includes("admin");
                return (
                  <div key={u.id} className="flex items-start justify-between gap-4 p-3 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{u.email}</span>
                        {isAdminUser && <Badge variant="default">Admin</Badge>}
                        {u.id === user?.id && <Badge variant="outline">Tú</Badge>}
                      </div>
                      <div className="flex items-center gap-1 flex-wrap mt-2">
                        {isAdminUser ? (
                          <Badge variant="secondary">Acceso total</Badge>
                        ) : SECTIONS.filter((s) => u.permissions?.[s.key]).length === 0 ? (
                          <span className="text-xs text-muted-foreground">Sin secciones asignadas</span>
                        ) : (
                          SECTIONS.filter((s) => u.permissions?.[s.key]).map((s) => (
                            <Badge key={s.key} variant="secondary">{s.label}</Badge>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isAdminUser && (
                        <Button size="sm" variant="outline" onClick={() => setEditing(u)}><Pencil className="w-4 h-4" /></Button>
                      )}
                      {u.id !== user?.id && (
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(u)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && <EditPermissionsDialog user={editing} onClose={() => { setEditing(null); load(); }} />}
      </Dialog>
    </div>
  );
}

function PermissionsCheckboxes({ value, onChange }: { value: Permissions; onChange: (v: Permissions) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {SECTIONS.map((s) => (
        <label key={s.key} className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-accent">
          <Checkbox
            checked={value[s.key]}
            onCheckedChange={(c) => onChange({ ...value, [s.key]: !!c })}
          />
          <span className="text-sm">{s.label}</span>
        </label>
      ))}
    </div>
  );
}

function CreateUserDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [permissions, setPermissions] = useState<Permissions>(EMPTY_PERMS);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-create-user", {
      body: { email, password, displayName, permissions },
    });
    setLoading(false);
    if (error || (data as any)?.error) { toast.error((data as any)?.error ?? error?.message); return; }
    toast.success("Usuario creado");
    onClose();
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Crear nuevo usuario</DialogTitle>
        <DialogDescription>Define email, contraseña y secciones a las que tendrá acceso.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 col-span-2">
            <Label>Nombre</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Contraseña</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Acceso a secciones</Label>
          <PermissionsCheckboxes value={permissions} onChange={setPermissions} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>{loading ? "Creando..." : "Crear usuario"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EditPermissionsDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const initial: Permissions = {
    dashboard: !!user.permissions?.dashboard,
    board: !!user.permissions?.board,
    sprints: !!user.permissions?.sprints,
    backlog: !!user.permissions?.backlog,
    team: !!user.permissions?.team,
    reports: !!user.permissions?.reports,
  };
  const [permissions, setPermissions] = useState<Permissions>(initial);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const row = { user_id: user.id, ...permissions };
    const { error } = await supabase.from("user_permissions").upsert([row], { onConflict: "user_id" });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Permisos actualizados");
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editar permisos</DialogTitle>
        <DialogDescription>{user.email}</DialogDescription>
      </DialogHeader>
      <PermissionsCheckboxes value={permissions} onChange={setPermissions} />
      <DialogFooter>
        <Button onClick={submit} disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
