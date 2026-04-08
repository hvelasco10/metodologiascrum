import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TeamMember } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyForm = { name: "", role: "" };

export default function TeamPage() {
  const { projects, selectedProjectId, tasks, teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, updateProject } = useAppStore();
  const project = projects.find((p) => p.id === selectedProjectId);
  const team = teamMembers.filter((m) => project?.teamMembers.includes(m.id));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (m: TeamMember) => { setEditing(m); setForm({ name: m.name, role: m.role }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name.trim() || !selectedProjectId || !project) return;
    const initials = form.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    if (editing) {
      updateTeamMember(editing.id, { name: form.name, role: form.role, avatar: initials });
    } else {
      const id = `m${Date.now()}`;
      addTeamMember({ id, name: form.name, role: form.role, avatar: initials });
      updateProject(selectedProjectId, { teamMembers: [...project.teamMembers, id] });
    }
    setDialogOpen(false);
  };

  const handleDelete = (memberId: string) => {
    deleteTeamMember(memberId);
    if (project && selectedProjectId) {
      updateProject(selectedProjectId, { teamMembers: project.teamMembers.filter(id => id !== memberId) });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipo</h1>
          <p className="text-sm text-muted-foreground mt-1">Miembros del equipo Scrum de {project?.name}</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5"><Plus className="w-4 h-4" /> Nuevo Miembro</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Miembro" : "Agregar Miembro"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Nombre completo</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ana García" /></div>
            <div><Label>Rol</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Desarrolladora, Scrum Master..." /></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Guardar Cambios" : "Agregar Miembro"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => {
          const memberTasks = tasks.filter((t) => t.assigneeId === member.id && t.projectId === selectedProjectId);
          const doneTasks = memberTasks.filter((t) => t.status === "done").length;
          const inProgress = memberTasks.filter((t) => t.status === "in_progress").length;

          return (
            <Card key={member.id} className="glass-card hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-lg font-semibold text-primary-foreground">
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{member.name}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Shield className="w-3 h-3" /><span>{member.role}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(member)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
                          <AlertDialogDescription>Se desasignará de todas sus tareas.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(member.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{memberTasks.length}</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-status-progress">{inProgress}</p>
                    <p className="text-[10px] text-muted-foreground">Activas</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-status-done">{doneTasks}</p>
                    <p className="text-[10px] text-muted-foreground">Hechas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
