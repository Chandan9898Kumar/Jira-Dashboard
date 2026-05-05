import type { Task } from "@/../src/schema/types";

export const STORAGE_KEY = "jira-dashboard-tasks-v1";

export const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AVATAR_PALETTE = ["#0052cc", "#00875a", "#de350b", "#5243aa", "#ff8b00"];

export const colorFor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
};

export const seedTasks = (): Task[] => [
  {
    id: crypto.randomUUID(),
    key: "PRJ-1",
    title: "Set up authentication flow",
    priority: "high",
    type: "task",
    assignee: "Alex Kim",
    column: "todo",
    description: "OAuth + email login",
  },
  {
    id: crypto.randomUUID(),
    key: "PRJ-2",
    title: "Design empty states for dashboard",
    priority: "medium",
    type: "story",
    assignee: "Priya Shah",
    column: "todo",
  },
  {
    id: crypto.randomUUID(),
    key: "PRJ-3",
    title: "Fix drag-and-drop on Safari",
    priority: "highest",
    type: "bug",
    assignee: "Jordan Lee",
    column: "inprogress",
  },
  {
    id: crypto.randomUUID(),
    key: "PRJ-4",
    title: "Refactor task store to use reducer",
    priority: "low",
    type: "task",
    assignee: "Sam Chen",
    column: "inprogress",
  },
  {
    id: crypto.randomUUID(),
    key: "PRJ-5",
    title: "Code review: API rate limiting",
    priority: "medium",
    type: "task",
    assignee: "Riley Park",
    column: "review",
  },
  {
    id: crypto.randomUUID(),
    key: "PRJ-6",
    title: "Deploy v1.0 to production",
    priority: "high",
    type: "story",
    assignee: "Alex Kim",
    column: "done",
  },
  {
    id: crypto.randomUUID(),
    key: "PRJ-7",
    title: "Write onboarding docs",
    priority: "lowest",
    type: "task",
    assignee: "Priya Shah",
    column: "done",
  },
];

export const nextTaskKey = (tasks: Task[]) => {
  const max = tasks.reduce(
    (m, t) => Math.max(m, parseInt(t.key.split("-")[1] || "0", 10)),
    0,
  );
  return `PRJ-${max + 1}`;
};

export const typeGlyph = (t: Task["type"]) =>
  t === "task" ? "✓" : t === "bug" ? "!" : "★";
