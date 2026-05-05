import { useId } from "react";
import { ASSIGNEES } from "@/schema/types";
import type { TaskFilters } from "@/hooks/useTasks";
import { colorFor, initials } from "../utils";

interface Props {
  filters: TaskFilters;
  onFiltersChange: (next: TaskFilters) => void;
  onCreate: () => void;
}

const TopBar = ({ filters, onFiltersChange, onCreate }: Props) => {
  const searchId = useId();
  const assigneeId = useId();
  const priorityId = useId();

  const update = (patch: Partial<TaskFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  return (
    <header className="topbar" role="search">
      <div className="search">
        <label htmlFor={searchId} className="sr-only">Search issues</label>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id={searchId}
          type="search"
          placeholder="Search issues..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <label htmlFor={assigneeId} className="sr-only">Filter by assignee</label>
        <select
          id={assigneeId}
          className="select"
          value={filters.assignee}
          onChange={(e) => update({ assignee: e.target.value })}
        >
          <option value="all">All assignees</option>
          {ASSIGNEES.map((a) => <option key={a}>{a}</option>)}
        </select>

        <label htmlFor={priorityId} className="sr-only">Filter by priority</label>
        <select
          id={priorityId}
          className="select"
          value={filters.priority}
          onChange={(e) => update({ priority: e.target.value })}
        >
          <option value="all">All priorities</option>
          <option value="highest">Highest</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="lowest">Lowest</option>
        </select>
      </div>

      <div className="topbar-spacer" />

      <div className="avatars" aria-label="Team members">
        {ASSIGNEES.slice(0, 4).map((a) => (
          <div
            key={a}
            className="avatar"
            title={a}
            aria-label={a}
            role="img"
            style={{ background: colorFor(a) }}
          >
            {initials(a)}
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-primary" onClick={onCreate}>
        <span aria-hidden="true">+ </span>Create
        <span className="sr-only"> new issue</span>
      </button>
    </header>
  );
};


export default TopBar;