# Drag-and-Drop & Reordering — How It Works

A plain-English walkthrough of the Kanban board's drag-and-drop, written
against the actual code in this project. No libraries — just the native
HTML5 Drag and Drop API plus a tiny bit of state.

---

## 1. The big picture

The feature is split across **two hooks** and **three components**:

| File | Job |
|------|-----|
| `useTasks.ts` | Owns the data. Knows how to move/reorder tasks in the array. |
| `useDragAndDrop.ts` | Owns the *interaction*. Knows what the mouse/keyboard is doing. |
| `Board.tsx` | Wires the two hooks together and passes handlers down. |
| `BoardColumn.tsx` | A drop zone (the whole column). |
| `TaskCard.tsx` | A draggable item AND a drop target (so you can drop on a specific card). |

**Golden rule:** the interaction layer never mutates data directly. It just
calls `moveTask(...)` or `reorderTask(...)` from `useTasks`.

---

## 2. The mental model

Tasks live in one flat array:

```ts
tasks = [
  { id: "1", column: "todo",       title: "A" },
  { id: "2", column: "todo",       title: "B" },
  { id: "3", column: "todo",       title: "C" },
  { id: "4", column: "inprogress", title: "D" },
]
```

Two things matter:

1. **Which column** a task belongs to → `task.column`
2. **The order inside that column** → just the order they appear in the array

That's it. There is no `position` field. Reordering = rearranging the array.

---

## 3. The native HTML5 DnD API in 5 events

We only use 5 events. Here's what each one does:

| Event | Where | What it does |
|-------|-------|--------------|
| `onDragStart` | on the card | "I'm picking this card up." Stash the task id. |
| `onDragOver`  | on the drop target | Fires constantly while hovering. **Must call `preventDefault()`** or the drop is silently rejected. |
| `onDragLeave` | on the drop target | Cursor left the zone — clear any highlight. |
| `onDrop`      | on the drop target | "Released here." Read the id back and act. |
| `onDragEnd`   | on the card | Drag is over (drop or cancel). Cleanup. |

The id travels through the drag using `dataTransfer`:

```ts
// pickup
e.dataTransfer.setData("text/plain", id);

// drop
const id = e.dataTransfer.getData("text/plain");
```

---

## 4. Step by step: dragging a card to another **column**

This is the simple case — just change `task.column`.

### Step 4.1 — User starts dragging (`TaskCard`)

```ts
// useDragAndDrop.ts
const onDragStart = (e, id) => {
  e.dataTransfer.setData("text/plain", id);   // remember which card
  e.dataTransfer.effectAllowed = "move";
  e.currentTarget.classList.add("dragging");  // visual "lifted" state
};
```

### Step 4.2 — Cursor enters a column (`BoardColumn`)

```ts
const onDragOver = (e, col) => {
  e.preventDefault();                 // REQUIRED, or onDrop won't fire
  e.dataTransfer.dropEffect = "move";
  if (dragOver !== col) setDragOver(col);   // highlight this column
};
```

### Step 4.3 — User releases over the column

```ts
const onDrop = (e, col) => {
  e.preventDefault();
  const id = e.dataTransfer.getData("text/plain");
  moveTask(id, col);                  // ← the only data mutation
};
```

### Step 4.4 — `moveTask` updates the task's column

```ts
// useTasks.ts
const moveTask = (id, col) => {
  setTasks(prev => prev.map(x => x.id === id ? { ...x, column: col } : x));
};
```

Done. React re-renders, the card now appears under the new column.

---

## 5. Step by step: **reordering** within a column

This is the trickier case — same column, just a different position.

### Step 5.1 — The card is *also* a drop target

In `TaskCard.tsx`:

```tsx
<article
  draggable
  onDragStart={...}
  onDragOver={onCardDragOver}   // ← card itself accepts drops
  onDrop={(e) => onCardDrop(e, task)}
>
```

When you drop on a card, we know the **target card** — not just the column.

### Step 5.2 — Stop the column from also handling the drop

```ts
const onCardDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();   // don't let the column's onDragOver fire too
};

const onCardDrop = (e, target) => {
  e.preventDefault();
  e.stopPropagation();   // don't let the column's onDrop fire too
  const draggedId = e.dataTransfer.getData("text/plain");
  if (!draggedId || draggedId === target.id) return;
  reorderTask(draggedId, target.id, target.column);
};
```

`stopPropagation` is the important bit. Without it, dropping on a card would
bubble up and trigger the column's `onDrop` *as well*, and we'd fight ourselves.

### Step 5.3 — `reorderTask` rearranges the array

This is the heart of it. Three operations:

1. **Remove** the dragged task from the array.
2. **Find** the target task's new index in that shorter array.
3. **Splice** the dragged task back in at that index.

```ts
// useTasks.ts
const reorderTask = (draggedId, targetId, col) => {
  if (draggedId === targetId) return;

  const draggedIdx = tasks.findIndex(x => x.id === draggedId);
  const targetIdx  = tasks.findIndex(x => x.id === targetId);
  const dragged    = tasks[draggedIdx];
  const fromCol    = dragged.column;

  // Direction-aware: see Step 5.4 for the WHY
  const insertAfter = fromCol === col && draggedIdx < targetIdx;

  setTasks(prev => {
    const without = prev.filter(x => x.id !== draggedId);   // 1. remove
    let idx = without.findIndex(x => x.id === targetId);    // 2. find
    if (insertAfter) idx += 1;
    const updated = { ...dragged, column: col };
    return [...without.slice(0, idx), updated, ...without.slice(idx)];  // 3. splice
  });
};
```

### Step 5.4 — Why the `insertAfter` flag exists (the bug we hit)

Naïve version: "always insert *before* the target." Looks fine, but breaks
when dragging **downward in the same column**.

Example — list is `[A, B, C]`, you drag **A onto B**:

1. Remove A → `[B, C]`
2. Find B → index `0`
3. Insert A before B → `[A, B, C]` ← **same as before, nothing visibly moved!**

The fix is to detect "dragging down within the same column" and insert *after*
the target instead:

| Situation | Insert |
|-----------|--------|
| Dragging **down** in the same column (`draggedIdx < targetIdx`) | **after** target |
| Dragging **up** in the same column | **before** target |
| Dragging from a **different** column | **before** target (natural "drop on top") |

That single boolean (`insertAfter`) is the whole fix.

---

## 6. Keyboard support (accessibility)

Same `reorderTask` / `moveTask` are reused — only the trigger changes.

```ts
// useDragAndDrop.ts — onCardKeyDown
// Space         → pick up / drop
// Esc           → cancel
// ← / →         → moveTask(id, neighbouringColumn)
// ↑ / ↓         → reorderTask(id, neighbourCardInSameColumn, sameColumn)
```

For ↑/↓ we just find the immediate neighbour card in the same column and
hand it to `reorderTask`. Because `reorderTask` is direction-aware, it
"just works" in both directions.

---

## 7. Why this design is nice

- **No library.** ~150 lines of plain React + the browser's own DnD API.
- **Single source of truth.** Order = array order. No `position` field to keep in sync.
- **One mutation point.** Mouse and keyboard both call the same two functions.
- **Testable.** `useTasks` is pure data logic — you can unit-test it without rendering anything.
- **Accessible by default.** Same logic powers keyboard moves and screen-reader announcements.

---

## 8. TL;DR cheat sheet

```
DRAG START  → stash id in dataTransfer
DRAG OVER   → preventDefault (required!) + highlight
DROP on column → moveTask(id, column)        // change column only
DROP on card   → reorderTask(id, targetId, column)
                 ├─ remove dragged from array
                 ├─ find target index
                 └─ splice back in (after target if dragging down in same col, else before)
DRAG END    → cleanup classes/state
```

That's the whole feature.
