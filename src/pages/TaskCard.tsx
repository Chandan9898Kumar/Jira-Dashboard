import {  PRIORITY_LABEL } from "@/schema/types";
import type { ColumnId,  Task } from "@/schema/types";
import { colorFor, initials, typeGlyph } from "../utils";

interface Props {
  task: Task;
  columnName: string;
  isKeyboardSelected: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onCardDragOver: (e: React.DragEvent) => void;
  onCardDrop: (e: React.DragEvent, target: Task) => void;
  onKeyDown: (e: React.KeyboardEvent, task: Task) => void;
}

export const TaskCard = ({
  task,
  columnName,
  isKeyboardSelected,
  onClick,
  onDragStart,
  onDragEnd,
  onCardDragOver,
  onCardDrop,
  onKeyDown,
}: Props) => {
  return (
    <article
      className={`card ${isKeyboardSelected ? "kb-selected" : ""}`}
      draggable
      tabIndex={0}
      role="button"
      aria-label={`${task.key}, ${task.title}, priority ${task.priority}, assigned to ${task.assignee}, status ${columnName}. Press Enter to edit, Space to pick up.`}
      aria-grabbed={isKeyboardSelected}
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onDragOver={onCardDragOver}
      onDrop={(e) => onCardDrop(e, task)}
      onClick={onClick}
      onKeyDown={(e) => onKeyDown(e, task)}
    >
      <div className="card-title">{task.title}</div>
      <div className="card-meta">
        <div className="card-tags">
          <span className={`type-icon ${task.type}`} aria-label={`Type: ${task.type}`} role="img">
            <span aria-hidden="true">{typeGlyph(task.type)}</span>
          </span>
          <span className="tag-key">{task.key}</span>
          <span className={`priority ${task.priority}`} aria-label={`Priority: ${task.priority}`} role="img">
            <span aria-hidden="true">{PRIORITY_LABEL[task.priority]}</span>
          </span>
        </div>
        <div
          className="avatar avatar-inline"
          aria-label={`Assignee: ${task.assignee}`}
          role="img"
          style={{ background: colorFor(task.assignee) }}
        >
          <span aria-hidden="true">{initials(task.assignee)}</span>
        </div>
      </div>
    </article>
  );
};

// Re-export so BoardColumn doesn't need a separate import path
export type { ColumnId };
