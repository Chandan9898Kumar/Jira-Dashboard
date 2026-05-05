
import Sidebar from "./Sidebar";
import { useState } from "react";
import { COLUMNS} from "@/schema/types";
import type { ColumnId, Task } from "@/schema/types";
import { TaskModal } from "./TaskModal";
import  TopBar  from "./TopBar";
import { BoardColumn } from "./BoardColumn";
import { useTasks } from "@/hooks/useTasks";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

const Board = () => {
  const {
    visibleTasks, tasks, filters, setFilters,
    saveTask, deleteTask, moveTask, reorderTask,
    announcement, setAnnouncement,
  } = useTasks();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaultCol, setDefaultCol] = useState<ColumnId>("todo");

  const openCreate = (col: ColumnId) => {
    setEditing(null);
    setDefaultCol(col);
    setModalOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setModalOpen(true);
  };

  const dnd = useDragAndDrop({ moveTask, reorderTask, setAnnouncement, openEdit, tasks });

  return (
    <div className="jira-app">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <Sidebar />

      <main className="main" id="main-content">
        <TopBar
          filters={filters}
          onFiltersChange={setFilters}
          onCreate={() => openCreate("todo")}
        />

        <div className="board-header">
          <div>
            <nav aria-label="Breadcrumb" className="crumbs">Projects / Jiraboard</nav>
            <h1 className="board-title">Sprint 24 Board</h1>
          </div>
        </div>

        <div className="board" role="list" aria-label="Kanban columns">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.id}
              id={col.id}
              name={col.name}
              items={visibleTasks.filter((t) => t.column === col.id)}
              isDragOver={dnd.dragOver === col.id}
              keyboardSelectedId={dnd.keyboardSelected}
              onCreate={openCreate}
              onEditTask={openEdit}
              onDragStart={dnd.onDragStart}
              onDragEnd={dnd.onDragEnd}
              onDragOver={dnd.onDragOver}
              onDragLeave={dnd.onDragLeave}
              onDrop={dnd.onDrop}
              onCardDragOver={dnd.onCardDragOver}
              onCardDrop={dnd.onCardDrop}
              onCardKeyDown={dnd.onCardKeyDown}
            />
          ))}
        </div>
      </main>

      <TaskModal
        open={modalOpen}
        initial={editing}
        defaultColumn={defaultCol}
        onClose={() => setModalOpen(false)}
        onSave={(data) => { saveTask(data); setModalOpen(false); }}
        onDelete={(id) => { deleteTask(id); setModalOpen(false); }}
      />
    </div>
  );
};


export default Board;