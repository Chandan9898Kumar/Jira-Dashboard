import { useEffect, useId, useRef, useState } from "react";
import { ASSIGNEES, COLUMNS } from "@/schema/types";
import type { ColumnId, IssueType, Priority, Task } from "@/schema/types";

interface Props {
  open: boolean;
  initial?: Task | null;
  defaultColumn?: ColumnId;
  onClose: () => void;
  onSave: (t: Omit<Task, "id" | "key"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

export const TaskModal = ({ open, initial, defaultColumn, onClose, onSave, onDelete }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [type, setType] = useState<IssueType>("task");
  const [assignee, setAssignee] = useState(ASSIGNEES[0]);
  const [column, setColumn] = useState<ColumnId>(defaultColumn || "todo");
  const titleId = useId();
  const descId = useId();
  const typeId = useId();
  const prioId = useId();
  const asgnId = useId();
  const colId = useId();
  const headingId = useId();
  const errId = useId();
  const [error, setError] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description || "");
      setPriority(initial.priority);
      setType(initial.type);
      setAssignee(initial.assignee);
      setColumn(initial.column);
    } else {
      setTitle(""); setDescription(""); setPriority("medium");
      setType("task"); setAssignee(ASSIGNEES[0]);
      setColumn(defaultColumn || "todo");
    }
    setError("");
    setTimeout(() => firstFieldRef.current?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previousFocus.current?.focus?.();
    };
  }, [open, initial, defaultColumn, onClose]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Summary is required.");
      return;
    }
    onSave({
      id: initial?.id,
      title: title.trim(),
      description: description.trim(),
      priority, type, assignee, column,
    });
  };
console.log("Rendering TaskModal", { title, description, priority, type, assignee, column });
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={error ? errId : undefined}
      >
        <h2 id={headingId}>{initial ? "Edit issue" : "Create issue"}</h2>

        {error && <p id={errId} role="alert" style={{ color: "#de350b", margin: "0 0 12px", fontSize: 13 }}>{error}</p>}

        <div className="field">
          <label htmlFor={titleId}>Summary <span aria-hidden="true">*</span></label>
          <input
            id={titleId}
            ref={firstFieldRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        <div className="field">
          <label htmlFor={descId}>Description</label>
          <textarea id={descId} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more detail…" />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor={typeId}>Type</label>
            <select id={typeId} value={type} onChange={(e) => setType(e.target.value as IssueType)}>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="story">Story</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor={prioId}>Priority</label>
            <select id={prioId} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="highest">Highest</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="lowest">Lowest</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor={asgnId}>Assignee</label>
            <select id={asgnId} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              {ASSIGNEES.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={colId}>Status</label>
            <select id={colId} value={column} onChange={(e) => setColumn(e.target.value as ColumnId)}>
              {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <div>
            {initial && onDelete && (
              <button type="button" className="btn btn-danger" onClick={() => onDelete(initial.id)} aria-label={`Delete issue ${initial.key}`}>Delete</button>
            )}
          </div>
          <div className="right">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? "Save" : "Create"}</button>
          </div>
        </div>
      </form>
    </div>
  );
};
