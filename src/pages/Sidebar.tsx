import { useState } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "board", label: "Board", icon: "▦" },
  { id: "backlog", label: "Backlog", icon: "≡" },
  { id: "roadmap", label: "Roadmap", icon: "→" },
  { id: "reports", label: "Reports", icon: "◔" },
  { id: "issues", label: "Issues", icon: "✓" },
] as const;

const Sidebar = () => {
  const [active, setActive] = useState<string>("board");

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <div className="brand-mark" aria-hidden="true">
          J
        </div>
        <div>Jiraboard</div>
      </div>

      <h2 className="sidebar-section" id="nav-planning">
        Planning
      </h2>
      <nav aria-labelledby="nav-planning">
        {NAV_ITEMS.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`sidebar-link ${active === n.id ? "active" : ""}`}
            aria-current={active === n.id ? "page" : undefined}
            onClick={() => setActive(n.id)}
          >
            <span className="icon" aria-hidden="true">
              {n.icon}
            </span>
            {n.label}
          </button>
        ))}
      </nav>

      <h2 className="sidebar-section" id="nav-project">
        Project
      </h2>
      <nav aria-labelledby="nav-project">
        <button type="button" className="sidebar-link">
          <span className="icon" aria-hidden="true">
            ⚙
          </span>
          Settings
        </button>
        <button type="button" className="sidebar-link">
          <span className="icon" aria-hidden="true">
            +
          </span>
          Add shortcut
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
