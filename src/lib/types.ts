export type ProjectType = "software" | "marketing" | "event";
export type Priority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type SprintStatus = "planned" | "active" | "completed";

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  storyPoints: number;
  cost: number; // cost in USD
  assigneeId?: string;
  sprintId?: string;
  projectId: string;
  createdAt: string;
  labels: string[];
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  projectId: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  tasks: string[]; // task IDs
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  createdAt: string;
  teamMembers: string[]; // member IDs
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Por Hacer",
  in_progress: "En Progreso",
  review: "En Revisión",
  done: "Hecho",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  software: "Desarrollo de Software",
  marketing: "Campaña de Marketing",
  event: "Gestión de Evento",
};
