import { useState } from "react";
import { COLUMNS } from "@/schema/types";
import type { ColumnId, Task } from "@/schema/types";

interface Params {
  /** Called when a card should change column (mouse drop on empty area OR arrow-key move). */
  moveTask: (id: string, col: ColumnId) => void;
  /** Insert dragged card before a target card (handles same-column reorder + cross-column insert). */
  reorderTask: (draggedId: string, targetId: string, col: ColumnId) => void;
  /** Pushes a message into the screen-reader live region in Board.tsx. */
  setAnnouncement: (msg: string) => void;
  /** Opens the edit modal for a given task (Enter key). */
  openEdit: (t: Task) => void;
  /** Master task list — needed for keyboard up/down reordering inside a column. */
  tasks: Task[];
}

/**
 * useDragAndDrop — the "interaction" layer of the board.
 *
 * This hook owns NO data. It only tracks how the user is currently
 * grabbing a card (with mouse or keyboard) and delegates the actual
 * move to `moveTask` from useTasks. That clean split means we could
 * swap the storage layer tomorrow and this file wouldn't change.
 *
 * Two interaction modes are supported in parallel:
 *   1. Pointer drag-and-drop using the native HTML5 DnD API.
 *   2. Keyboard drag using Space (pick up) → Arrow keys → Space (drop).
 *      This is what makes the board usable without a mouse and is the
 *      pattern screen-reader users expect.
 */
export const useDragAndDrop = ({
  moveTask,
  reorderTask,
  setAnnouncement,
  openEdit,
  tasks,
}: Params) => {
  // Which column is currently being hovered during a pointer drag.
  // Used to add the `.drag-over` highlight class on that column.
  const [dragOver, setDragOver] = useState<ColumnId | null>(null);

  // Id of the card the user has "picked up" with the Space key — like
  // holding a card mid-air, waiting for arrow keys to choose where to
  // drop it. `null` means nothing is currently picked up.
  const [keyboardSelected, setKeyboardSelected] = useState<string | null>(null);

  // ─── Pointer (HTML5 native drag-and-drop) ─────────────────────────────

  /**
   * Fires once when the user starts dragging a card.
   * We stash the task id on the drag event itself so any drop target
   * can read it back via `getData("text/plain")`. We also add a
   * `.dragging` class for the "lifted" visual state.
   */
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).classList.add("dragging");
  };

  /** Fires when the drag finishes (drop OR cancel). Cleanup only. */
  const onDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("dragging");
    setDragOver(null);
  };

  /**
   * Fires REPEATEDLY while the cursor is over a column during a drag.
   * - `e.preventDefault()` is REQUIRED by the HTML5 spec; without it
   *   the browser refuses to fire `onDrop`.
   * - The `if (dragOver !== col)` guard avoids calling setState on
   *   every pixel of mouse movement (perf).
   */
  const onDragOver = (e: React.DragEvent, col: ColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOver !== col) setDragOver(col);
  };

  /** Cursor left a column → clear its highlight. */
  const onDragLeave = () => setDragOver(null);

  /**
   * The actual drop. Reads the task id back from the drag event and
   * delegates the real work to moveTask — this is the only line that
   * mutates data in this whole file.
   */
  const onDrop = (e: React.DragEvent, col: ColumnId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    moveTask(id, col);
    setDragOver(null);
  };

  /**
   * Card-level drag-over. Stops propagation so the column's onDragOver
   * doesn't also fire — we want the card itself to be the drop target
   * when hovering over a card (for precise insertion between cards).
   */
  const onCardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  /**
   * Drop ONTO a specific card → insert the dragged card immediately
   * before this target card. Works inside the same column (reorder)
   * or across columns (precise insert position).
   */
  const onCardDrop = (e: React.DragEvent, target: Task) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === target.id) return;
    reorderTask(draggedId, target.id, target.column);
    setDragOver(null);
  };

  // Helper for nicer announcements ("In Progress" instead of "inprogress").
  const colName = (id: ColumnId) =>
    COLUMNS.find((c) => c.id === id)?.name ?? id;

  // ─── Keyboard drag-and-drop (accessibility) ───────────────────────────

  /**
   * Single keydown handler attached to every card. Implements the
   * standard "pick up / move / drop" keyboard pattern:
   *
   *   Enter        → open the edit modal for this card
   *   Space (1st)  → pick the card up, announce instructions
   *   Space (2nd)  → drop the card in its current column
   *   Escape       → cancel the pickup without moving
   *   ArrowLeft /  → only while picked up: move the card one column
   *   ArrowRight     left or right (clamped to first / last column)
   *
   * Every action emits an announcement so screen readers narrate what
   * just happened.
   */
  const onCardKeyDown = (e: React.KeyboardEvent, task: Task) => {
    // Enter → activate the card (open editor).
    if (e.key === "Enter") {
      e.preventDefault();
      openEdit(task);
      return;
    }

    // Space → toggle "picked up" state for this card.
    if (e.key === " ") {
      e.preventDefault();
      if (keyboardSelected === task.id) {
        // Second press → drop it where it currently is.
        setKeyboardSelected(null);
        setAnnouncement(`Dropped ${task.title} in ${colName(task.column)}.`);
      } else {
        // First press → pick it up and tell the user how to move it.
        setKeyboardSelected(task.id);
        setAnnouncement(
          `Picked up ${task.title}. Use arrow keys to move between columns, space to drop, escape to cancel.`,
        );
      }
      return;
    }

    // Escape while picked up → cancel without moving.
    if (e.key === "Escape" && keyboardSelected === task.id) {
      setKeyboardSelected(null);
      setAnnouncement("Cancelled move.");
      return;
    }

    // Arrow keys only do something while THIS card is picked up.
    // We compute the neighbouring column index, clamp to [0, last]
    // so we can't walk off the board, and call moveTask if it changed.
    if (
      (e.key === "ArrowLeft" || e.key === "ArrowRight") &&
      keyboardSelected === task.id
    ) {
      e.preventDefault();
      const idx = COLUMNS.findIndex((c) => c.id === task.column);
      const next =
        e.key === "ArrowRight"
          ? Math.min(COLUMNS.length - 1, idx + 1)
          : Math.max(0, idx - 1);
      if (next !== idx) moveTask(task.id, COLUMNS[next].id);
    }

    // ArrowUp / ArrowDown while picked up → reorder within the same
    // column. reorderTask is direction-aware, so we just point at the
    // immediate neighbour and it figures out before/after insertion.
    if (
      (e.key === "ArrowUp" || e.key === "ArrowDown") &&
      keyboardSelected === task.id
    ) {
      e.preventDefault();
      const sameCol = tasks.filter((t) => t.column === task.column);
      const pos = sameCol.findIndex((t) => t.id === task.id);
      const neighbour = sameCol[e.key === "ArrowDown" ? pos + 1 : pos - 1];
      if (!neighbour) return;
      reorderTask(task.id, neighbour.id, task.column);
    }
  };

  return {
    dragOver,
    keyboardSelected,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    onCardDragOver,
    onCardDrop,
    onCardKeyDown,
  };
};
