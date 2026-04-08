import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Target, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SprintStatus, STATUS_LABELS } from "@/lib/types";

const SPRINT_STATUS_CONFIG: Record<SprintStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  planned: { label: "Planificado", variant: "outline" },
  active: { label: "Activo", variant: "default" },
  completed: { label: "Completado", variant: "secondary" },
};

export default function SprintsPage() {
  const { sprints, tasks, selectedProjectId, updateSprint } = useAppStore();
  const projectSprints = sprints.filter((s) => s.projectId === selectedProjectId);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sprints</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona las iteraciones de tu proyecto
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {projectSprints.map((sprint) => {
          const sprintTasks = tasks.filter(
            (t) => t.sprintId === sprint.id && t.projectId === selectedProjectId
          );
          const doneTasks = sprintTasks.filter((t) => t.status === "done").length;
          const progress = sprintTasks.length > 0 ? (doneTasks / sprintTasks.length) * 100 : 0;
          const totalPoints = sprintTasks.reduce((a, t) => a + t.storyPoints, 0);
          const completedPoints = sprintTasks
            .filter((t) => t.status === "done")
            .reduce((a, t) => a + t.storyPoints, 0);

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
                      <Target className="w-3.5 h-3.5" />
                      <span>{sprint.goal}</span>
                    </div>
                  </div>
                  {sprint.status === "planned" && (
                    <Button
                      size="sm"
                      onClick={() => updateSprint(sprint.id, { status: "active" })}
                      className="gap-1.5"
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> Iniciar Sprint
                    </Button>
                  )}
                  {sprint.status === "active" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateSprint(sprint.id, { status: "completed" })}
                      className="gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completar Sprint
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {sprint.startDate} → {sprint.endDate}
                    </span>
                  </div>
                  <span>
                    {sprintTasks.length} tareas · {totalPoints} pts
                  </span>
                  <span>
                    {completedPoints}/{totalPoints} pts completados
                  </span>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progreso</span>
                  <span>
                    {doneTasks}/{sprintTasks.length} ({Math.round(progress)}%)
                  </span>
                </div>
                <Progress value={progress} className="h-2" />

                {/* Task breakdown */}
                {sprintTasks.length > 0 && (
                  <div className="mt-4 flex gap-3 flex-wrap">
                    {(["backlog", "todo", "in_progress", "review", "done"] as const).map(
                      (status) => {
                        const count = sprintTasks.filter((t) => t.status === status).length;
                        if (count === 0) return null;
                        return (
                          <div key={status} className="flex items-center gap-1.5 text-xs">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: `hsl(var(--status-${status === "in_progress" ? "progress" : status}))`,
                              }}
                            />
                            <span className="text-muted-foreground">
                              {STATUS_LABELS[status]}: {count}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
