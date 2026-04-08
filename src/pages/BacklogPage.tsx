import { useAppStore, TEAM_MEMBERS } from "@/lib/store";
import { PRIORITY_LABELS, STATUS_LABELS, Task, Priority, TaskStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function BacklogPage() {
  const { tasks, selectedProjectId, addTask, sprints, updateTask } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);
  const backlogTasks = projectTasks.filter((t) => !t.sprintId);
  
  const filtered = filterPriority === "all"
    ? backlogTasks
    : backlogTasks.filter((t) => t.priority === filterPriority);

  const projectSprints = sprints.filter(
    (s) => s.projectId === selectedProjectId && s.status !== "completed"
  );

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    storyPoints: 3,
    labels: "",
  });

  const handleCreate = () => {
    if (!newTask.title.trim() || !selectedProjectId) return;
    const task: Task = {
      id: `t${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: "backlog",
      priority: newTask.priority,
      storyPoints: newTask.storyPoints,
      projectId: selectedProjectId,
      createdAt: new Date().toISOString().split("T")[0],
      labels: newTask.labels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
    };
    addTask(task);
    setNewTask({ title: "", description: "", priority: "medium", storyPoints: 3, labels: "" });
    setDialogOpen(false);
  };

  const assignToSprint = (taskId: string, sprintId: string) => {
    updateTask(taskId, { sprintId });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Backlog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {backlogTasks.length} historias sin asignar a sprint
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="w-4 h-4" /> Nueva Historia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Historia de Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Título</Label>
                <Input
                  placeholder="Como usuario, quiero..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Criterios de aceptación..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridad</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v) => setNewTask({ ...newTask, priority: v as Priority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Story Points</Label>
                  <Select
                    value={String(newTask.storyPoints)}
                    onValueChange={(v) => setNewTask({ ...newTask, storyPoints: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 5, 8, 13, 21].map((p) => (
                        <SelectItem key={p} value={String(p)}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Etiquetas (separadas por coma)</Label>
                <Input
                  placeholder="Frontend, API, UX..."
                  value={newTask.labels}
                  onChange={(e) => setNewTask({ ...newTask, labels: e.target.value })}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Crear Historia
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Badge
          variant={filterPriority === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterPriority("all")}
        >
          Todas
        </Badge>
        {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
          <Badge
            key={k}
            variant={filterPriority === k ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterPriority(k)}
          >
            {v}
          </Badge>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.map((task) => (
          <Card key={task.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                  style={{
                    backgroundColor: `hsl(var(--priority-${task.priority}))`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">
                      {task.storyPoints} pts
                    </Badge>
                    {task.labels.map((l) => (
                      <span
                        key={l}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <Select onValueChange={(v) => assignToSprint(task.id, v)}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                      <SelectValue placeholder="Asignar a sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectSprints.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
