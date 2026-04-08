import { useAppStore, TEAM_MEMBERS } from "@/lib/store";
import { TaskStatus, STATUS_LABELS, PRIORITY_LABELS, Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { GripVertical, MessageSquare } from "lucide-react";
import { useState } from "react";

const COLUMNS: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done"];

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: "bg-status-backlog",
  todo: "bg-status-todo",
  in_progress: "bg-status-progress",
  review: "bg-status-review",
  done: "bg-status-done",
};

export default function ScrumBoard() {
  const { tasks, sprints, selectedProjectId, moveTask } = useAppStore();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const activeSprint = sprints.find(
    (s) => s.projectId === selectedProjectId && s.status === "active"
  );

  const boardTasks = tasks.filter(
    (t) => t.projectId === selectedProjectId && t.sprintId === activeSprint?.id
  );

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);
  const handleDragOver = (e: React.DragEvent, col: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(col);
  };
  const handleDrop = (col: TaskStatus) => {
    if (draggedTask) {
      moveTask(draggedTask, col);
    }
    setDraggedTask(null);
    setDragOverCol(null);
  };
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverCol(null);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tablero Scrum</h1>
        {activeSprint ? (
          <p className="text-sm text-muted-foreground mt-1">
            {activeSprint.name} — {activeSprint.goal}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">
            No hay sprint activo. Inicia uno desde la vista de Sprints.
          </p>
        )}
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {COLUMNS.map((col) => {
          const colTasks = boardTasks.filter((t) => t.status === col);
          const colPoints = colTasks.reduce((a, t) => a + t.storyPoints, 0);

          return (
            <div
              key={col}
              className={`flex-1 min-w-[260px] flex flex-col rounded-xl transition-colors ${
                dragOverCol === col ? "bg-primary/5" : "bg-muted/30"
              }`}
              onDragOver={(e) => handleDragOver(e, col)}
              onDrop={() => handleDrop(col)}
              onDragLeave={() => setDragOverCol(null)}
            >
              {/* Column Header */}
              <div className="p-3 flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[col]}`} />
                <span className="text-sm font-semibold">{STATUS_LABELS[col]}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {colTasks.length} · {colPoints}pts
                </span>
              </div>

              {/* Tasks */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDragging={draggedTask === task.id}
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Arrastra tareas aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const assignee = TEAM_MEMBERS.find((m) => m.id === task.assigneeId);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-card rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((label) => (
            <span
              key={label}
              className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm font-medium leading-snug mb-2">{task.title}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: `hsl(var(--priority-${task.priority}))`,
            }}
            title={PRIORITY_LABELS[task.priority]}
          />
          <span className="text-[10px] text-muted-foreground font-medium">
            {task.storyPoints} pts
          </span>
        </div>

        {assignee && (
          <div
            className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary"
            title={assignee.name}
          >
            {assignee.avatar}
          </div>
        )}
      </div>
    </div>
  );
}
