
import Sidebar from "./Sidebar";
const Board = () => {
  return ( <div className="jira-app">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        
      </div>

      <Sidebar />

      <main className="main" id="main-content">
        

        <div className="board-header">
          <div>
            <nav aria-label="Breadcrumb" className="crumbs">Projects / Jiraboard</nav>
            <h1 className="board-title">Sprint 24 Board</h1>
          </div>
        </div>

        <div className="board" role="list" aria-label="Kanban columns">
          
        </div>
      </main>

      
    </div>
  );
};

export default Board;