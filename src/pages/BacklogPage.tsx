import { useAppStore } from "@/lib/store";
import { PRIORITY_LABELS, STATUS_LABELS, Task, Priority, TaskStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const emptyForm = { title: "", description: "", priority: "medium" as Priority, storyPoints: 3, labels: "", assigneeId: "" };

export default function BacklogPage() {
  const { tasks, selectedProjectId, addTask, sprints, updateTask, deleteTask, teamMembers, projects } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);

  const project = projects.find(p => p.id === selectedProjectId);
  const team = teamMembers.filter(m => project?.teamMembers.includes(m.id));

  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);
  const backlogTasks = projectTasks.filter((t) => !t.sprintId);
  const filtered = filterPriority === "all" ? backlogTasks : backlogTasks.filter((t) => t.priority === filterPriority);
  const projectSprints = sprints.filter((s) => s.projectId === selectedProjectId && s.status !== "completed");

  const openCreate = () => { setEditingTask(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({ title: task.title, description: task.description, priority: task.priority, storyPoints: task.storyPoints, labels: task.labels.join(", "), assigneeId: task.assigneeId || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !selectedProjectId) return;
    const labels = form.labels.split(",").map((l) => l.trim()).filter(Boolean);
    if (editingTask) {
      updateTask(editingTask.id, { title: form.title, description: form.description, priority: form.priority, storyPoints: form.storyPoints, labels, assigneeId: form.assigneeId || undefined });
    } else {
      addTask({
        id: `t${Date.now()}`, title: form.title, description: form.description, status: "backlog",
        priority: form.priority, storyPoints: form.storyPoints, projectId: selectedProjectId,
        createdAt: new Date().toISOString().split("T")[0], labels, assigneeId: form.assigneeId || undefined,
      });
    }
    setDialogOpen(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Backlog</h1>
          <p className="text-sm text-muted-foreground mt-1">{backlogTasks.length} historias sin asignar a sprint</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5"><Plus className="w-4 h-4" /> Nueva Historia</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTask ? "Editar Historia" : "Crear Historia de Usuario"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Título</Label><Input placeholder="Como usuario, quiero..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Descripción</Label><Textarea placeholder="Criterios de aceptación..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prioridad</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(PRIORITY_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Story Points</Label>
                <Select value={String(form.storyPoints)} onValueChange={(v) => setForm({ ...form, storyPoints: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 5, 8, 13, 21].map((p) => (<SelectItem key={p} value={String(p)}>{p}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Asignar a</Label>
              <Select value={form.assigneeId} onValueChange={(v) => setForm({ ...form, assigneeId: v })}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {team.map((m) => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Etiquetas (separadas por coma)</Label><Input placeholder="Frontend, API, UX..." value={form.labels} onChange={(e) => setForm({ ...form, labels: e.target.value })} /></div>
            <Button onClick={handleSave} className="w-full">{editingTask ? "Guardar Cambios" : "Crear Historia"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2">
        <Badge variant={filterPriority === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilterPriority("all")}>Todas</Badge>
        {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
          <Badge key={k} variant={filterPriority === k ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilterPriority(k)}>{v}</Badge>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((task) => (
          <Card key={task.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: `hsl(var(--priority-${task.priority}))` }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{task.storyPoints} pts</Badge>
                    {task.labels.map((l) => (
                      <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Select onValueChange={(v) => updateTask(task.id, { sprintId: v })}>
                    <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Asignar sprint" /></SelectTrigger>
                    <SelectContent>{projectSprints.map((s) => (<SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>))}</SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(task)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteTask(task.id)}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">Backlog vacío</p>
            <p className="text-sm mt-1">Crea nuevas historias de usuario para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
