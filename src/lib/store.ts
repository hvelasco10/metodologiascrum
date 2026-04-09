import { Project, Sprint, Task, TeamMember } from "./types";

// Demo team members
export const TEAM_MEMBERS: TeamMember[] = [
  { id: "m1", name: "Ana García", avatar: "AG", role: "Product Owner" },
  { id: "m2", name: "Carlos López", avatar: "CL", role: "Scrum Master" },
  { id: "m3", name: "María Ruiz", avatar: "MR", role: "Desarrolladora" },
  { id: "m4", name: "Pedro Martín", avatar: "PM", role: "Diseñador UX" },
  { id: "m5", name: "Laura Sánchez", avatar: "LS", role: "QA Engineer" },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "App Fintech Mobile",
    description: "Desarrollo de aplicación móvil para gestión financiera personal con IA",
    type: "software",
    createdAt: "2026-03-01",
    teamMembers: ["m1", "m2", "m3", "m4", "m5"],
  },
  {
    id: "p2",
    name: "Lanzamiento Producto Q2",
    description: "Campaña de marketing digital para el lanzamiento del nuevo producto en Q2 2026",
    type: "marketing",
    createdAt: "2026-03-15",
    teamMembers: ["m1", "m2", "m4"],
  },
  {
    id: "p3",
    name: "Tech Summit 2026",
    description: "Organización del evento tecnológico anual con speakers internacionales",
    type: "event",
    createdAt: "2026-02-20",
    teamMembers: ["m1", "m2", "m5"],
  },
];

export const INITIAL_SPRINTS: Sprint[] = [
  {
    id: "s1",
    name: "Sprint 1 - MVP Auth",
    goal: "Implementar autenticación y onboarding de usuarios",
    projectId: "p1",
    status: "completed",
    startDate: "2026-03-03",
    endDate: "2026-03-14",
    tasks: ["t1", "t2", "t3"],
  },
  {
    id: "s2",
    name: "Sprint 2 - Dashboard",
    goal: "Crear dashboard principal con métricas financieras",
    projectId: "p1",
    status: "active",
    startDate: "2026-03-17",
    endDate: "2026-03-28",
    tasks: ["t4", "t5", "t6", "t7"],
  },
  {
    id: "s3",
    name: "Sprint 3 - Notificaciones",
    goal: "Sistema de alertas y notificaciones push",
    projectId: "p1",
    status: "planned",
    startDate: "2026-03-31",
    endDate: "2026-04-11",
    tasks: [],
  },
  {
    id: "s4",
    name: "Sprint 1 - Estrategia",
    goal: "Definir estrategia de canales y contenido",
    projectId: "p2",
    status: "active",
    startDate: "2026-03-17",
    endDate: "2026-03-28",
    tasks: ["t8", "t9", "t10"],
  },
];

export const INITIAL_TASKS: Task[] = [
  // Project 1 - completed sprint
  { id: "t1", title: "Diseñar flujo de registro", description: "Wireframes y prototipos del flujo de registro de nuevos usuarios", status: "done", priority: "high", storyPoints: 5, assigneeId: "m4", sprintId: "s1", projectId: "p1", createdAt: "2026-03-01", labels: ["UX", "Auth"] },
  { id: "t2", title: "Implementar login con email", description: "Backend y frontend del login con email y contraseña", status: "done", priority: "critical", storyPoints: 8, assigneeId: "m3", sprintId: "s1", projectId: "p1", createdAt: "2026-03-01", labels: ["Backend", "Auth"] },
  { id: "t3", title: "Tests de integración auth", description: "Pruebas end-to-end del flujo de autenticación", status: "done", priority: "medium", storyPoints: 3, assigneeId: "m5", sprintId: "s1", projectId: "p1", createdAt: "2026-03-02", labels: ["QA"] },
  // Project 1 - active sprint
  { id: "t4", title: "API de métricas financieras", description: "Endpoints REST para obtener balances, gastos e ingresos", status: "in_progress", priority: "critical", storyPoints: 8, assigneeId: "m3", sprintId: "s2", projectId: "p1", createdAt: "2026-03-15", labels: ["Backend", "API"] },
  { id: "t5", title: "Componente gráfico de gastos", description: "Visualización interactiva de gastos por categoría", status: "todo", priority: "high", storyPoints: 5, assigneeId: "m4", sprintId: "s2", projectId: "p1", createdAt: "2026-03-15", labels: ["Frontend", "Charts"] },
  { id: "t6", title: "Widget de balance general", description: "Tarjeta con resumen del balance actual del usuario", status: "review", priority: "medium", storyPoints: 3, assigneeId: "m3", sprintId: "s2", projectId: "p1", createdAt: "2026-03-16", labels: ["Frontend"] },
  { id: "t7", title: "Tests del dashboard", description: "Pruebas unitarias y de integración del dashboard", status: "backlog", priority: "low", storyPoints: 3, assigneeId: "m5", sprintId: "s2", projectId: "p1", createdAt: "2026-03-16", labels: ["QA"] },
  // Project 1 - backlog (no sprint)
  { id: "t11", title: "Integración con bancos", description: "Conectar con APIs bancarias para importar transacciones", status: "backlog", priority: "high", storyPoints: 13, projectId: "p1", createdAt: "2026-03-10", labels: ["Backend", "Integración"] },
  { id: "t12", title: "Exportar reportes PDF", description: "Generar reportes financieros mensuales en PDF", status: "backlog", priority: "medium", storyPoints: 5, projectId: "p1", createdAt: "2026-03-12", labels: ["Feature"] },
  // Project 2
  { id: "t8", title: "Definir buyer personas", description: "Investigar y documentar los perfiles de cliente objetivo", status: "in_progress", priority: "high", storyPoints: 5, assigneeId: "m1", sprintId: "s4", projectId: "p2", createdAt: "2026-03-15", labels: ["Estrategia"] },
  { id: "t9", title: "Plan de contenido redes sociales", description: "Calendario editorial para Instagram, LinkedIn y Twitter", status: "todo", priority: "medium", storyPoints: 5, assigneeId: "m4", sprintId: "s4", projectId: "p2", createdAt: "2026-03-16", labels: ["Contenido", "RRSS"] },
  { id: "t10", title: "Landing page de producto", description: "Diseño y desarrollo de landing page de conversión", status: "backlog", priority: "critical", storyPoints: 8, sprintId: "s4", projectId: "p2", createdAt: "2026-03-16", labels: ["Web", "Conversión"] },
];

// Simple in-memory store with React state
import { create } from "zustand";

interface AppState {
  projects: Project[];
  sprints: Sprint[];
  tasks: Task[];
  teamMembers: TeamMember[];
  selectedProjectId: string | null;
  
  // Actions
  setSelectedProject: (id: string | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  projects: INITIAL_PROJECTS,
  sprints: INITIAL_SPRINTS,
  tasks: INITIAL_TASKS,
  teamMembers: TEAM_MEMBERS,
  selectedProjectId: "p1",

  setSelectedProject: (id) => set({ selectedProjectId: id }),
  
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  updateProject: (id, updates) => set((s) => ({
    projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
  })),
  deleteProject: (id) => set((s) => ({
    projects: s.projects.filter((p) => p.id !== id),
    selectedProjectId: s.selectedProjectId === id ? (s.projects.find(p => p.id !== id)?.id || null) : s.selectedProjectId,
  })),
  
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, updates) => set((s) => ({
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  deleteTask: (id) => set((s) => ({
    tasks: s.tasks.filter((t) => t.id !== id),
  })),
  
  moveTask: (taskId, newStatus) => set((s) => ({
    tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
  })),
  
  addSprint: (sprint) => set((s) => ({ sprints: [...s.sprints, sprint] })),
  updateSprint: (id, updates) => set((s) => ({
    sprints: s.sprints.map((sp) => (sp.id === id ? { ...sp, ...updates } : sp)),
  })),
  deleteSprint: (id) => set((s) => ({
    sprints: s.sprints.filter((sp) => sp.id !== id),
    tasks: s.tasks.map((t) => (t.sprintId === id ? { ...t, sprintId: undefined } : t)),
  })),

  addTeamMember: (member) => set((s) => ({ teamMembers: [...s.teamMembers, member] })),
  updateTeamMember: (id, updates) => set((s) => ({
    teamMembers: s.teamMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
  })),
  deleteTeamMember: (id) => set((s) => ({
    teamMembers: s.teamMembers.filter((m) => m.id !== id),
    tasks: s.tasks.map((t) => (t.assigneeId === id ? { ...t, assigneeId: undefined } : t)),
  })),
}));
