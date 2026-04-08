import { useAppStore, TEAM_MEMBERS } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield } from "lucide-react";

export default function TeamPage() {
  const { projects, selectedProjectId, tasks } = useAppStore();
  const project = projects.find((p) => p.id === selectedProjectId);
  const team = TEAM_MEMBERS.filter((m) => project?.teamMembers.includes(m.id));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Equipo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Miembros del equipo Scrum de {project?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => {
          const memberTasks = tasks.filter(
            (t) => t.assigneeId === member.id && t.projectId === selectedProjectId
          );
          const doneTasks = memberTasks.filter((t) => t.status === "done").length;
          const inProgress = memberTasks.filter((t) => t.status === "in_progress").length;

          return (
            <Card key={member.id} className="glass-card hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-lg font-semibold text-primary-foreground">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      <span>{member.role}</span>
                    </div>
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
