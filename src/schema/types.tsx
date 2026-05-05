export type ColumnId = "todo" | "inprogress" | "review" | "done";
export type Priority = "highest" | "high" | "medium" | "low" | "lowest";
export type IssueType = "task" | "bug" | "story";

export interface Task {
  id: string;
  key: string;
  title: string;
  description?: string;
  priority: Priority;
  type: IssueType;
  assignee: string;
  column: ColumnId;
}

export const COLUMNS: { id: ColumnId; name: string }[] = [
  { id: "todo", name: "To Do" },
  { id: "inprogress", name: "In Progress" },
  { id: "review", name: "In Review" },
  { id: "done", name: "Done" },
];

export const ASSIGNEES = ["Alex Kim", "Priya Shah", "Jordan Lee", "Sam Chen", "Riley Park"];

export const PRIORITY_LABEL: Record<Priority, string> = {
  highest: "↑↑", high: "↑", medium: "=", low: "↓", lowest: "↓↓",
};
