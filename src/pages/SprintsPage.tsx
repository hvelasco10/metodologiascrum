import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Target, CheckCircle2, PlayCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SprintStatus, STATUS_LABELS, Sprint } from "@/lib/types";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SPRINT_STATUS_CONFIG: Record<SprintStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  planned: { label: "Planificado", variant: "outline" },
  active: { label: "Activo", variant: "default" },
  completed: { label: "Completado", variant: "secondary" },
};

const emptyForm = { name: "", goal: "", startDate: "", endDate: "", status: "planned" as SprintStatus, budget: "" };

export default function SprintsPage() {
  const { sprints, tasks, selectedProjectId, updateSprint, addSprint, deleteSprint } = useAppStore();
  const projectSprints = sprints.filter((s) => s.projectId === selectedProjectId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingSprint(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setForm({ name: sprint.name, goal: sprint.goal, startDate: sprint.startDate, endDate: sprint.endDate, status: sprint.status, budget: sprint.budget?.toString() || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !selectedProjectId) return;
    const budgetValue = form.budget ? parseFloat(form.budget) : undefined;
    if (editingSprint) {
      updateSprint(editingSprint.id, { name: form.name, goal: form.goal, startDate: form.startDate, endDate: form.endDate, status: form.status, budget: budgetValue });
    } else {
      addSprint({
        id: `s${Date.now()}`,
        name: form.name,
        goal: form.goal,
        projectId: selectedProjectId,
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate,
        tasks: [],
        budget: budgetValue,
      });
    }
    setDialogOpen(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sprints</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las iteraciones de tu proyecto</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo Sprint
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSprint ? "Editar Sprint" : "Crear Sprint"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Nombre</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sprint 1 - MVP" /></div>
            <div><Label>Objetivo</Label><Input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Implementar funcionalidad X" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Fecha inicio</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label>Fecha fin</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as SprintStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SPRINT_STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Presupuesto ($)</Label><Input type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="5000" /></div>
            <Button onClick={handleSave} className="w-full">{editingSprint ? "Guardar Cambios" : "Crear Sprint"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {projectSprints.map((sprint) => {
          const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id && t.projectId === selectedProjectId);
          const doneTasks = sprintTasks.filter((t) => t.status === "done").length;
          const progress = sprintTasks.length > 0 ? (doneTasks / sprintTasks.length) * 100 : 0;
          const totalPoints = sprintTasks.reduce((a, t) => a + t.storyPoints, 0);
          const completedPoints = sprintTasks.filter((t) => t.status === "done").reduce((a, t) => a + t.storyPoints, 0);
          const config = SPRINT_STATUS_CONFIG[sprint.status];

          return (
            <Card key={sprint.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{sprint.name}</CardTitle>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <Target className="w-3.5 h-3.5" /><span>{sprint.goal}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {sprint.status === "planned" && (
                      <Button size="sm" onClick={() => updateSprint(sprint.id, { status: "active" })} className="gap-1.5">
                        <PlayCircle className="w-3.5 h-3.5" /> Iniciar
                      </Button>
                    )}
                    {sprint.status === "active" && (
                      <Button size="sm" variant="secondary" onClick={() => updateSprint(sprint.id, { status: "completed" })} className="gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completar
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(sprint)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar sprint?</AlertDialogTitle>
                          <AlertDialogDescription>Las tareas asignadas volverán al backlog.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSprint(sprint.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{sprint.startDate} → {sprint.endDate}</span>
                  </div>
                  <span>{sprintTasks.length} tareas · {totalPoints} pts</span>
                  <span>{completedPoints}/{totalPoints} pts completados</span>
                </div>
                {sprint.budget != null && (
                  <div className={`flex items-center gap-2 text-sm mb-3 ${
                    sprintTasks.reduce((a, t) => a + t.cost, 0) > sprint.budget ? "text-red-500" : "text-green-500"
                  }`}>
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Presupuesto: ${sprint.budget.toLocaleString()}</span>
                    <span className="text-muted-foreground">·</span>
                    <span>Costo real: ${sprintTasks.reduce((a, t) => a + t.cost, 0).toLocaleString()}</span>
                    {sprintTasks.reduce((a, t) => a + t.cost, 0) > sprint.budget && (
                      <Badge variant="destructive" className="text-[10px]">Excedido</Badge>
                    )}
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progreso</span>
                  <span>{doneTasks}/{sprintTasks.length} ({Math.round(progress)}%)</span>
                </div>
                <Progress value={progress} className="h-2" />
                {sprintTasks.length > 0 && (
                  <div className="mt-4 flex gap-3 flex-wrap">
                    {(["backlog", "todo", "in_progress", "review", "done"] as const).map((status) => {
                      const count = sprintTasks.filter((t) => t.status === status).length;
                      if (count === 0) return null;
                      return (
                        <div key={status} className="flex items-center gap-1.5 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(var(--status-${status === "in_progress" ? "progress" : status}))` }} />
                          <span className="text-muted-foreground">{STATUS_LABELS[status]}: {count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {projectSprints.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">Sin sprints</p>
            <p className="text-sm mt-1">Crea tu primer sprint para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
