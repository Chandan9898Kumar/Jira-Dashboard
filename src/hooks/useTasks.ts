import { useEffect, useMemo, useState } from "react";
import { COLUMNS } from "@/schema/types";
import type { ColumnId, Task } from "@/schema/types";
import { STORAGE_KEY, nextTaskKey, seedTasks } from "../utils";

/**
 * Shape of the filter bar at the top of the board.
 * - search:   free-text query matched against title + key (e.g. "PRJ-3")
 * - assignee: "all" or a specific person's name
 * - priority: "all" or one of the Priority values
 */
export interface TaskFilters {
  search: string;
  assignee: string;
  priority: string;
}

/**
 * useTasks — the "brain" of the board.
 *
 * Owns the entire task collection and everything you can do with it:
 *   • load / save to localStorage  (persistence across reloads)
 *   • create / edit / delete       (CRUD)
 *   • filter by search/assignee/priority
 *   • move a task between columns
 *   • emit screen-reader announcements after each change
 *
 * Board.tsx never touches task state directly — it just calls the
 * functions returned here. That separation is what keeps Board.tsx
 * tiny (~85 lines) and makes this logic independently testable.
 */
export const useTasks = () => {
  // ── Master list of every task on the board ──────────────────────────
  // The initializer runs ONCE on mount. We try localStorage first so the
  // user's work survives a refresh; if nothing is stored (first visit) or
  // the JSON is corrupted, we fall back to a seeded demo dataset so the
  // board is never empty.
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Task[];
    } catch {
      /* corrupted storage — silently fall back to seed data */
    }
    return seedTasks();
  });

  // ── What the user has typed/selected in the TopBar filters ──────────
  // TopBar calls setFilters; that triggers visibleTasks to recompute.
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    assignee: "all",
    priority: "all",
  });

  // ── A short message read aloud by screen readers ────────────────────
  // Board renders this inside an aria-live="polite" region. Sighted users
  // never see it (.sr-only), but assistive tech narrates every change.
  const [announcement, setAnnouncement] = useState("");

  // ── Persistence ─────────────────────────────────────────────────────
  // Any time `tasks` changes (create/edit/delete/move) we serialize the
  // whole array to localStorage. Cheap because the dataset is small.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // ── Derived: the filtered subset the board actually renders ─────────
  // useMemo so we only recompute when tasks OR filters change — not on
  // every unrelated re-render.
  const visibleTasks = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return tasks.filter((t) => {
      // Search matches against title OR ticket key (e.g. "PRJ-3").
      if (
        q &&
        !t.title.toLowerCase().includes(q) &&
        !t.key.toLowerCase().includes(q)
      )
        return false;
      if (filters.assignee !== "all" && t.assignee !== filters.assignee)
        return false;
      if (filters.priority !== "all" && t.priority !== filters.priority)
        return false;
      return true;
    });
  }, [tasks, filters]);

  // Tiny helper: turn an internal id like "inprogress" into the human
  // label "In Progress" — used inside the announcement strings below.
  const colName = (id: ColumnId) =>
    COLUMNS.find((c) => c.id === id)?.name ?? id;

  /**
   * saveTask — handles BOTH create and edit, dispatched by the modal.
   *
   * If `data.id` exists  → it's an edit: replace the matching task while
   *                        preserving its original id and key (so they
   *                        can't be tampered with from the form).
   * If `data.id` missing → it's a create: generate a fresh UUID and the
   *                        next "PRJ-N" key, then append.
   * Either way, push a friendly announcement.
   */
  const saveTask = (data: Omit<Task, "id" | "key"> & { id?: string }) => {
    if (data.id) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === data.id ? { ...t, ...data, id: t.id, key: t.key } : t,
        ),
      );
      setAnnouncement(`Issue ${data.title} updated.`);
    } else {
      const newTask: Task = {
        ...data,
        id: crypto.randomUUID(),
        key: nextTaskKey(tasks),
      };
      setTasks((prev) => [...prev, newTask]);
      setAnnouncement(
        `Issue ${newTask.title} created in ${colName(newTask.column)}.`,
      );
    }
  };

  /**
   * deleteTask — remove a task by id.
   * We look the task up FIRST so we still know its title for the
   * announcement after it's gone from state.
   */
  const deleteTask = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    setTasks((prev) => prev.filter((x) => x.id !== id));
    if (t) setAnnouncement(`Issue ${t.title} deleted.`);
  };

  /**
   * moveTask — the ONLY way a task changes column.
   * Called by both pointer drag-and-drop and keyboard moves. We only
   * announce when the column actually changes, so dropping a card back
   * where it started doesn't generate noise for screen-reader users.
   */
  const moveTask = (id: string, col: ColumnId) => {
    const t = tasks.find((x) => x.id === id);
    setTasks((prev) =>
      prev.map((x) => (x.id === id ? { ...x, column: col } : x)),
    );
    if (t && t.column !== col)
      setAnnouncement(`Moved ${t.title} to ${colName(col)}.`);
  };

  /**
   * reorderTask — drop card `draggedId` immediately before card `targetId`.
   *
   * Order on the board IS the order in the master `tasks` array, so to
   * reorder we simply: remove the dragged item, find the target's index
   * in the new array, and splice the dragged item back in there.
   *
   * If the drop also crosses columns (drop card A onto card B that lives
   * in a different column), we update the column at the same time — this
   * gives "insert between two specific cards in another column" for free.
   */
  const reorderTask = (draggedId: string, targetId: string, col: ColumnId) => {
    if (draggedId === targetId) return;
    const draggedIdx = tasks.findIndex((x) => x.id === draggedId);
    const targetIdx = tasks.findIndex((x) => x.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;
    const dragged = tasks[draggedIdx];
    const fromCol = dragged.column;

    // Direction-aware insert:
    //   - dragging DOWN within the same column (draggedIdx < targetIdx) →
    //     insert AFTER the target, otherwise the array shifts back to the
    //     same order and nothing visibly moves.
    //   - dragging UP, or coming from a different column → insert BEFORE
    //     the target (the natural "drop on top of this card" behavior).
    const insertAfter = fromCol === col && draggedIdx < targetIdx;

    setTasks((prev) => {
      const without = prev.filter((x) => x.id !== draggedId);
      let idx = without.findIndex((x) => x.id === targetId);
      if (idx === -1) return prev;
      if (insertAfter) idx += 1;
      const updated = { ...dragged, column: col };
      return [...without.slice(0, idx), updated, ...without.slice(idx)];
    });

    if (fromCol !== col)
      setAnnouncement(`Moved ${dragged.title} to ${colName(col)}.`);
    else setAnnouncement(`Reordered ${dragged.title} in ${colName(col)}.`);
  };

  return {
    tasks,
    visibleTasks,
    filters,
    setFilters,
    saveTask,
    deleteTask,
    moveTask,
    reorderTask,
    announcement,
    setAnnouncement,
  };
};
