export const SECTIONS = [
  { key: "dashboard", label: "Dashboard", path: "/" },
  { key: "board", label: "Tablero Scrum", path: "/board" },
  { key: "sprints", label: "Sprints", path: "/sprints" },
  { key: "backlog", label: "Backlog", path: "/backlog" },
  { key: "team", label: "Equipo", path: "/team" },
  { key: "reports", label: "Informes", path: "/reports" },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

export type Permissions = Record<SectionKey, boolean>;

export const EMPTY_PERMS: Permissions = {
  dashboard: false, board: false, sprints: false, backlog: false, team: false, reports: false,
};
