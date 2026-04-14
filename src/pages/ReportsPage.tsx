import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { STATUS_LABELS, PRIORITY_LABELS, TaskStatus, Priority } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Target,
  Sparkles,
  ShieldAlert,
  Lightbulb,
  AlertCircle,
} from "lucide-react";

interface AiPrediction {
  tipo: "riesgo" | "alerta" | "recomendacion";
  titulo: string;
  descripcion: string;
  severidad: "alta" | "media" | "baja";
}

interface AiAnalysis {
  resumen: string;
  predicciones: AiPrediction[];
}

function getSprintDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

export default function ReportsPage() {
  const { projects, sprints, tasks, selectedProjectId, teamMembers } = useAppStore();
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const project = projects.find((p) => p.id === selectedProjectId);

  if (!project) return <p className="p-6 text-muted-foreground">Selecciona un proyecto</p>;

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const projectSprints = sprints.filter((s) => s.projectId === project.id);
  const team = teamMembers.filter((m) => project.teamMembers.includes(m.id));

  const totalCost = projectTasks.reduce((a, t) => a + t.cost, 0);
  const completedCost = projectTasks.filter((t) => t.status === "done").reduce((a, t) => a + t.cost, 0);
  const totalPoints = projectTasks.reduce((a, t) => a + t.storyPoints, 0);
  const completedPoints = projectTasks.filter((t) => t.status === "done").reduce((a, t) => a + t.storyPoints, 0);
  const overallProgress = projectTasks.length > 0
    ? (projectTasks.filter((t) => t.status === "done").length / projectTasks.length) * 100
    : 0;

  const statusCounts: Record<TaskStatus, number> = { backlog: 0, todo: 0, in_progress: 0, review: 0, done: 0 };
  projectTasks.forEach((t) => statusCounts[t.status]++);

  const priorityCounts: Record<Priority, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  projectTasks.forEach((t) => priorityCounts[t.priority]++);

  const criticalNotDone = projectTasks.filter((t) => t.priority === "critical" && t.status !== "done");

  const generateAiAnalysis = async () => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const projectData = {
        nombre: project.name,
        tipo: project.type,
        presupuesto: project.budget ?? 0,
        progreso: Math.round(overallProgress),
        tareas: {
          total: projectTasks.length,
          completadas: statusCounts.done,
          enCurso: statusCounts.in_progress + statusCounts.review,
          pendientes: statusCounts.backlog + statusCounts.todo,
        },
        prioridades: priorityCounts,
        costos: {
          total: totalCost,
          ejecutado: completedCost,
          pendiente: totalCost - completedCost,
          presupuestoUtilizado: project.budget ? Math.round((totalCost / project.budget) * 100) : null,
        },
        storyPoints: { total: totalPoints, completados: completedPoints },
        sprints: projectSprints.map((s) => {
          const sTasks = projectTasks.filter((t) => t.sprintId === s.id);
          const sDone = sTasks.filter((t) => t.status === "done").length;
          const sCost = sTasks.reduce((a, t) => a + t.cost, 0);
          return {
            nombre: s.name, estado: s.status, presupuesto: s.budget ?? 0,
            costoReal: sCost, tareas: sTasks.length, completadas: sDone,
            puntos: sTasks.reduce((a, t) => a + t.storyPoints, 0),
          };
        }),
        equipo: team.map((m) => {
          const mTasks = projectTasks.filter((t) => t.assigneeId === m.id);
          return {
            nombre: m.name, rol: m.role,
            tareasAsignadas: mTasks.length,
            tareasCompletadas: mTasks.filter((t) => t.status === "done").length,
          };
        }),
        tareasCriticasPendientes: criticalNotDone.length,
      };

      const { data, error } = await supabase.functions.invoke("ai-report", {
        body: { projectData },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setAiAnalysis(data as AiAnalysis);
    } catch (err: any) {
      console.error("AI analysis error:", err);
      toast.error("Error al generar el análisis con IA");
    } finally {
      setAiLoading(false);
    }
  };

  const predictionIcon = (tipo: string) => {
    switch (tipo) {
      case "riesgo": return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case "alerta": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "recomendacion": return <Lightbulb className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const severityBadge = (sev: string) => {
    const v: Record<string, "destructive" | "default" | "secondary"> = { alta: "destructive", media: "default", baja: "secondary" };
    return <Badge variant={v[sev] || "secondary"} className="text-[10px]">{sev.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Informes de Avance</h1>
          <p className="text-sm text-muted-foreground mt-1">{project.name} — Reporte general del proyecto</p>
        </div>
        <Button onClick={generateAiAnalysis} disabled={aiLoading} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {aiLoading ? "Analizando..." : "Análisis con IA"}
        </Button>
      </div>

      {/* AI Analysis Section */}
      {aiLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card border-primary/20">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Resumen Ejecutivo</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[70%]" />
            </CardContent>
          </Card>
          <Card className="glass-card border-primary/20">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-primary" /> Predicciones y Alertas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {aiAnalysis && !aiLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Resumen Ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{aiAnalysis.resumen}</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" /> Predicciones y Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiAnalysis.predicciones?.map((pred, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                  <div className="mt-0.5">{predictionIcon(pred.tipo)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{pred.titulo}</span>
                      {severityBadge(pred.severidad)}
                    </div>
                    <p className="text-xs text-muted-foreground">{pred.descripcion}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overall Progress */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Progreso General del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-5xl font-bold text-primary">{Math.round(overallProgress)}%</p>
            <p className="text-sm text-muted-foreground pb-1">completado</p>
          </div>
          <Progress value={overallProgress} className="h-3 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold">{projectTasks.length}</p>
              <p className="text-xs text-muted-foreground">Total Tareas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-green-500">{statusCounts.done}</p>
              <p className="text-xs text-muted-foreground">Completadas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-blue-500">{statusCounts.in_progress + statusCounts.review}</p>
              <p className="text-xs text-muted-foreground">En Curso</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-orange-500">{statusCounts.backlog + statusCounts.todo}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost & Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Resumen de Costos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Presupuesto del proyecto</span>
              <span className="text-lg font-bold">${(project.budget ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Costo total (todas las tareas)</span>
              <span className="text-lg font-bold">${totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Costo ejecutado (completadas)</span>
              <span className="text-lg font-bold text-green-500">${completedCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Costo pendiente</span>
              <span className="text-lg font-bold text-orange-500">${(totalCost - completedCost).toLocaleString()}</span>
            </div>
            <div className="h-px bg-border" />
            {project.budget && project.budget > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Presupuesto utilizado</span>
                  <span className={`text-sm font-medium ${totalCost > project.budget ? "text-red-500" : "text-green-500"}`}>
                    {Math.round((totalCost / project.budget) * 100)}%
                    {totalCost > project.budget ? " ⚠️ Excedido" : ""}
                  </span>
                </div>
                <Progress value={Math.min((totalCost / project.budget) * 100, 100)} className="h-2" />
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Sin presupuesto definido</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Story Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Puntos totales</span>
              <span className="text-lg font-bold">{totalPoints}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Puntos completados</span>
              <span className="text-lg font-bold text-green-500">{completedPoints}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Puntos restantes</span>
              <span className="text-lg font-bold text-orange-500">{totalPoints - completedPoints}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Velocidad (completados)</span>
              <span className="text-sm font-medium">{completedPoints} pts</span>
            </div>
            <Progress value={totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Sprint-by-Sprint Report */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Avance por Sprint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectSprints.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay sprints creados</p>
          ) : (
            projectSprints.map((sprint) => {
              const sTasks = projectTasks.filter((t) => t.sprintId === sprint.id);
              const sDone = sTasks.filter((t) => t.status === "done").length;
              const sProgress = sTasks.length > 0 ? (sDone / sTasks.length) * 100 : 0;
              const sCost = sTasks.reduce((a, t) => a + t.cost, 0);
              const sPoints = sTasks.reduce((a, t) => a + t.storyPoints, 0);
              const days = getSprintDays(sprint.startDate, sprint.endDate);
              const dailyCost = sCost / days;

              return (
                <div key={sprint.id} className="p-4 rounded-xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{sprint.name}</h3>
                      <Badge
                        variant={sprint.status === "active" ? "default" : sprint.status === "completed" ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        {sprint.status === "active" ? "Activo" : sprint.status === "completed" ? "Completado" : "Planificado"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {sprint.startDate} → {sprint.endDate}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sprint.goal}</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-sm font-bold">{sTasks.length}</p>
                      <p className="text-[10px] text-muted-foreground">Tareas</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-sm font-bold">{sDone}</p>
                      <p className="text-[10px] text-muted-foreground">Hechas</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-sm font-bold">{sPoints}</p>
                      <p className="text-[10px] text-muted-foreground">Puntos</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-sm font-bold">${sCost.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Costo Real</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className={`text-sm font-bold ${sprint.budget && sCost > sprint.budget ? "text-red-500" : ""}`}>
                        ${(sprint.budget ?? 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Presupuesto</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{sDone}/{sTasks.length} completadas</span>
                    <span>{Math.round(sProgress)}%</span>
                  </div>
                  <Progress value={sProgress} className="h-2" />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Team Workload & Critical Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5" /> Carga por Miembro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {team.map((member) => {
              const memberTasks = projectTasks.filter((t) => t.assigneeId === member.id);
              const memberDone = memberTasks.filter((t) => t.status === "done").length;
              const memberCost = memberTasks.reduce((a, t) => a + t.cost, 0);
              const memberPoints = memberTasks.reduce((a, t) => a + t.storyPoints, 0);

              return (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground shrink-0">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="text-xs">{memberDone}/{memberTasks.length} tareas</p>
                    <p className="text-[10px] text-muted-foreground">{memberPoints} pts · ${memberCost.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" /> Tareas Críticas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {criticalNotDone.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-500 py-4">
                <CheckCircle2 className="w-4 h-4" />
                Todas las tareas críticas están completadas
              </div>
            ) : (
              criticalNotDone.map((task) => {
                const assignee = teamMembers.find((m) => m.id === task.assigneeId);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="text-sm flex-1 truncate">{task.title}</span>
                    <span className="text-xs text-muted-foreground">${task.cost.toLocaleString()}</span>
                    <Badge variant="outline" className="text-[10px]">{STATUS_LABELS[task.status]}</Badge>
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

      {/* Priority Distribution */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Distribución por Prioridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.entries(priorityCounts) as [Priority, number][]).map(([priority, count]) => {
              const colors: Record<Priority, string> = {
                critical: "text-red-500",
                high: "text-orange-500",
                medium: "text-yellow-500",
                low: "text-blue-500",
              };
              return (
                <div key={priority} className="text-center p-4 rounded-xl border border-border">
                  <p className={`text-3xl font-bold ${colors[priority]}`}>{count}</p>
                  <p className="text-sm text-muted-foreground mt-1">{PRIORITY_LABELS[priority]}</p>
                  <p className="text-xs text-muted-foreground">
                    {projectTasks.length > 0 ? Math.round((count / projectTasks.length) * 100) : 0}%
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
