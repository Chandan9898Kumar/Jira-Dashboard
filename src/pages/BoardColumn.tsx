import type { ColumnId, Task } from "@/schema/types";

import { TaskCard } from "./TaskCard";

interface Props {
  id: ColumnId;
  name: string;
  items: Task[];
  isDragOver: boolean;
  keyboardSelectedId: string | null;
  onCreate: (col: ColumnId) => void;
  onEditTask: (t: Task) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, col: ColumnId) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, col: ColumnId) => void;
  onCardDragOver: (e: React.DragEvent) => void;
  onCardDrop: (e: React.DragEvent, target: Task) => void;
  onCardKeyDown: (e: React.KeyboardEvent, task: Task) => void;
}

export const BoardColumn = ({
  id, name, items, isDragOver, keyboardSelectedId,
  onCreate, onEditTask,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
  onCardDragOver, onCardDrop, onCardKeyDown,
}: Props) => {
  const headingId = `col-${id}`;

  return (
    <section className="column" role="listitem" aria-labelledby={headingId}>
      <div className="column-head">
        <h2 className="column-name" id={headingId}>
          {name}
          <span className="count-badge" aria-label={`${items.length} issues`}>
            {items.length}
          </span>
        </h2>
      </div>

      <ul
        className={`cards ${isDragOver ? "drag-over" : ""}`}
        aria-label={`${name} issues`}
        onDragOver={(e) => onDragOver(e, id)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, id)}
      >
        {items.map((t) => (
          <li key={t.id}>
            <TaskCard
              task={t}
              columnName={name}
              isKeyboardSelected={keyboardSelectedId === t.id}
              onClick={() => onEditTask(t)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onCardDragOver={onCardDragOver}
              onCardDrop={onCardDrop}
              onKeyDown={onCardKeyDown}
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="add-card"
        onClick={() => onCreate(id)}
        aria-label={`Create issue in ${name}`}
      >
        <span aria-hidden="true">+ </span>Create issue
      </button>
    </section>
  );
};
