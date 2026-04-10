import { useAppStore } from "@/lib/store";
import { PROJECT_TYPE_LABELS, STATUS_LABELS, TaskStatus } from "@/lib/types";
import {
  FolderKanban,
  TrendingUp,
  Users,
  Zap,
  Code2,
  Megaphone,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const TYPE_ICONS = {
  software: Code2,
  marketing: Megaphone,
  event: CalendarDays,
};

export default function Dashboard() {
  const { projects, sprints, tasks, selectedProjectId, teamMembers } = useAppStore();
  const project = projects.find((p) => p.id === selectedProjectId);

  if (!project) return null;

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const projectSprints = sprints.filter((s) => s.projectId === project.id);
  const activeSprint = projectSprints.find((s) => s.status === "active");
  const activeSprintTasks = activeSprint
    ? projectTasks.filter((t) => t.sprintId === activeSprint.id)
    : [];

  const doneTasks = activeSprintTasks.filter((t) => t.status === "done").length;
  const totalSprintTasks = activeSprintTasks.length;
  const sprintProgress = totalSprintTasks > 0 ? (doneTasks / totalSprintTasks) * 100 : 0;

  const totalPoints = projectTasks.reduce((a, t) => a + t.storyPoints, 0);
  const completedPoints = projectTasks
    .filter((t) => t.status === "done")
    .reduce((a, t) => a + t.storyPoints, 0);
  const velocity = completedPoints;

  const statusCounts: Record<TaskStatus, number> = {
    backlog: 0, todo: 0, in_progress: 0, review: 0, done: 0,
  };
  projectTasks.forEach((t) => statusCounts[t.status]++);

  const TypeIcon = TYPE_ICONS[project.type];
  const team = teamMembers.filter((m) => project.teamMembers.includes(m.id));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {PROJECT_TYPE_LABELS[project.type]}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FolderKanban className="w-4 h-4" /> Total Historias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projectTasks.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalPoints} story points</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Velocidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{velocity}</p>
            <p className="text-xs text-muted-foreground mt-1">puntos completados</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" /> Sprint Activo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold truncate">{activeSprint?.name || "Ninguno"}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{doneTasks}/{totalSprintTasks} tareas</span>
                <span>{Math.round(sprintProgress)}%</span>
              </div>
              <Progress value={sprintProgress} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex -space-x-2">
              {team.map((m) => (
                <div
                  key={m.id}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground ring-2 ring-card"
                  title={m.name}
                >
                  {m.avatar}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{team.length} miembros</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution + Sprint Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.entries(statusCounts) as [TaskStatus, number][]).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor: `hsl(var(--status-${status === "in_progress" ? "progress" : status}))`,
                  }}
                />
                <span className="text-sm flex-1">{STATUS_LABELS[status]}</span>
                <span className="text-sm font-medium">{count}</span>
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${projectTasks.length > 0 ? (count / projectTasks.length) * 100 : 0}%`,
                      backgroundColor: `hsl(var(--status-${status === "in_progress" ? "progress" : status}))`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Tareas del Sprint Actual</CardTitle>
            <Link
              to="/board"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Ver tablero <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeSprintTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay sprint activo</p>
            ) : (
              activeSprintTasks.slice(0, 5).map((task) => {
                const assignee = useAppStore.getState().teamMembers.find((m) => m.id === task.assigneeId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: `hsl(var(--priority-${task.priority}))`,
                      }}
                    />
                    <span className="text-sm flex-1 truncate">{task.title}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {STATUS_LABELS[task.status]}
                    </Badge>
                    {assignee && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary shrink-0">
                        {assignee.avatar}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Projects */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Todos los Proyectos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {projects.map((p) => {
              const Icon = TYPE_ICONS[p.type];
              const pTasks = tasks.filter((t) => t.projectId === p.id);
              const pDone = pTasks.filter((t) => t.status === "done").length;
              const pProgress = pTasks.length > 0 ? (pDone / pTasks.length) * 100 : 0;
              return (
                <button
                  key={p.id}
                  onClick={() => useAppStore.getState().setSelectedProject(p.id)}
                  className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                    p.id === selectedProjectId
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium truncate">{p.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {p.description}
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{pDone}/{pTasks.length}</span>
                    <span>{Math.round(pProgress)}%</span>
                  </div>
                  <Progress value={pProgress} className="h-1" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
