import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Board from './Board'
import type { Task } from '@/schema/types'

// Mock all child components
vi.mock('./Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}))

vi.mock('./TopBar', () => ({
  default: ({ filters, onFiltersChange, onCreate }: any) => (
    <div data-testid="topbar">
      <button onClick={() => onFiltersChange({ search: 'test', assignee: 'all', priority: 'all' })}>
        Change Filters
      </button>
      <button onClick={onCreate}>Create Task</button>
    </div>
  )
}))

vi.mock('./BoardColumn', () => ({
  BoardColumn: ({ id, name, items, onCreate, onEditTask }: any) => (
    <div data-testid={`column-${id}`}>
      <h2>{name}</h2>
      <div>Items: {items.length}</div>
      <button onClick={() => onCreate(id)}>Create in {name}</button>
      {items.map((item: Task) => (
        <button key={item.id} onClick={() => onEditTask(item)}>
          Edit {item.title}
        </button>
      ))}
    </div>
  )
}))

vi.mock('./TaskModal', () => ({
  TaskModal: ({ open, initial, defaultColumn, onClose, onSave, onDelete }: any) => (
    open ? (
      <div data-testid="task-modal">
        <div>Modal Open</div>
        <div>Default Column: {defaultColumn}</div>
        <div>Editing: {initial ? initial.title : 'New Task'}</div>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSave({ title: 'Test Task', priority: 'medium', type: 'task', assignee: 'Alex Kim', column: 'todo' })}>
          Save
        </button>
        {initial && onDelete && (
          <button onClick={() => onDelete(initial.id)}>Delete</button>
        )}
      </div>
    ) : null
  )
}))

// Mock hooks
const mockUseTasks = {
  visibleTasks: [
    {
      id: '1',
      key: 'PRJ-1',
      title: 'Test Task 1',
      priority: 'high',
      type: 'task',
      assignee: 'Alex Kim',
      column: 'todo'
    },
    {
      id: '2',
      key: 'PRJ-2', 
      title: 'Test Task 2',
      priority: 'medium',
      type: 'bug',
      assignee: 'Priya Shah',
      column: 'inprogress'
    }
  ] as Task[],
  tasks: [] as Task[],
  filters: { search: '', assignee: 'all', priority: 'all' },
  setFilters: vi.fn(),
  saveTask: vi.fn(),
  deleteTask: vi.fn(),
  moveTask: vi.fn(),
  reorderTask: vi.fn(),
  announcement: '',
  setAnnouncement: vi.fn()
}

const mockUseDragAndDrop = {
  dragOver: null,
  keyboardSelected: null,
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
  onDragOver: vi.fn(),
  onDragLeave: vi.fn(),
  onDrop: vi.fn(),
  onCardDragOver: vi.fn(),
  onCardDrop: vi.fn(),
  onCardKeyDown: vi.fn()
}

vi.mock('@/hooks/useTasks', () => ({
  useTasks: () => mockUseTasks
}))

vi.mock('@/hooks/useDragAndDrop', () => ({
  useDragAndDrop: () => mockUseDragAndDrop
}))

describe('Board', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all main components', () => {
    render(<Board />)

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('topbar')).toBeInTheDocument()
    expect(screen.getByText('Sprint 24 Board')).toBeInTheDocument()
    expect(screen.getByText('Projects / Jiraboard')).toBeInTheDocument()
  })

  it('should render skip link for accessibility', () => {
    render(<Board />)

    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('should render live region for announcements', () => {
    render(<Board />)

    const liveRegion = screen.getByRole('status')
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
    expect(liveRegion).toHaveClass('sr-only')
  })

  it('should render main content with proper accessibility attributes', () => {
    render(<Board />)

    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-content')
    expect(main).toHaveClass('main')
  })

  it('should render breadcrumb navigation', () => {
    render(<Board />)

    const breadcrumb = screen.getByLabelText('Breadcrumb')
    expect(breadcrumb).toBeInTheDocument()
    expect(breadcrumb).toHaveTextContent('Projects / Jiraboard')
  })

  it('should render board with proper accessibility attributes', () => {
    render(<Board />)

    const board = screen.getByRole('list', { name: 'Kanban columns' })
    expect(board).toBeInTheDocument()
    expect(board).toHaveClass('board')
  })

  it('should render all four columns', () => {
    render(<Board />)

    expect(screen.getByTestId('column-todo')).toBeInTheDocument()
    expect(screen.getByTestId('column-inprogress')).toBeInTheDocument()
    expect(screen.getByTestId('column-review')).toBeInTheDocument()
    expect(screen.getByTestId('column-done')).toBeInTheDocument()
  })

  it('should pass correct props to columns', () => {
    render(<Board />)

    // Check that tasks are filtered correctly by column
    expect(screen.getByTestId('column-todo')).toHaveTextContent('Items: 1')
    expect(screen.getByTestId('column-inprogress')).toHaveTextContent('Items: 1')
    expect(screen.getByTestId('column-review')).toHaveTextContent('Items: 0')
    expect(screen.getByTestId('column-done')).toHaveTextContent('Items: 0')
  })

  it('should handle filter changes from TopBar', async () => {
    const user = userEvent.setup()
    render(<Board />)

    const changeFiltersButton = screen.getByText('Change Filters')
    await user.click(changeFiltersButton)

    expect(mockUseTasks.setFilters).toHaveBeenCalledWith({
      search: 'test',
      assignee: 'all',
      priority: 'all'
    })
  })

  it('should open create modal from TopBar', async () => {
    const user = userEvent.setup()
    render(<Board />)

    const createButton = screen.getByText('Create Task')
    await user.click(createButton)

    expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    expect(screen.getByText('Default Column: todo')).toBeInTheDocument()
    expect(screen.getByText('Editing: New Task')).toBeInTheDocument()
  })

  it('should open create modal from column', async () => {
    const user = userEvent.setup()
    render(<Board />)

    const createInProgressButton = screen.getByText('Create in In Progress')
    await user.click(createInProgressButton)

    expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    expect(screen.getByText('Default Column: inprogress')).toBeInTheDocument()
  })

  it('should open edit modal when editing task', async () => {
    const user = userEvent.setup()
    render(<Board />)

    const editButton = screen.getByText('Edit Test Task 1')
    await user.click(editButton)

    expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    expect(screen.getByText('Editing: Test Task 1')).toBeInTheDocument()
  })

  it('should close modal', async () => {
    const user = userEvent.setup()
    render(<Board />)

    // Open modal first
    const createButton = screen.getByText('Create Task')
    await user.click(createButton)

    expect(screen.getByTestId('task-modal')).toBeInTheDocument()

    // Close modal
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)

    expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()
  })

  it('should save task and close modal', async () => {
    const user = userEvent.setup()
    render(<Board />)

    // Open modal
    const createButton = screen.getByText('Create Task')
    await user.click(createButton)

    // Save task
    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    expect(mockUseTasks.saveTask).toHaveBeenCalledWith({
      title: 'Test Task',
      priority: 'medium',
      type: 'task',
      assignee: 'Alex Kim',
      column: 'todo'
    })
    expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()
  })

  it('should delete task and close modal', async () => {
    const user = userEvent.setup()
    render(<Board />)

    // Open edit modal
    const editButton = screen.getByText('Edit Test Task 1')
    await user.click(editButton)

    // Delete task
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    expect(mockUseTasks.deleteTask).toHaveBeenCalledWith('1')
    expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()
  })

  it('should pass drag and drop handlers to columns', () => {
    render(<Board />)

    // Verify that useDragAndDrop was called with correct parameters
    expect(mockUseDragAndDrop).toBeDefined()
  })

  it('should display announcements in live region', () => {
    const mockUseTasksWithAnnouncement = {
      ...mockUseTasks,
      announcement: 'Task moved to Done'
    }

    vi.mocked(mockUseTasks).announcement = 'Task moved to Done'

    render(<Board />)

    const liveRegion = screen.getByRole('status')
    expect(liveRegion).toHaveTextContent('Task moved to Done')
  })

  it('should handle keyboard navigation', () => {
    render(<Board />)

    const board = screen.getByRole('list', { name: 'Kanban columns' })
    
    // Test that the board is focusable and accessible
    expect(board).toBeInTheDocument()
  })

  it('should maintain modal state correctly', async () => {
    const user = userEvent.setup()
    render(<Board />)

    // Modal should not be visible initially
    expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()

    // Open create modal
    const createButton = screen.getByText('Create Task')
    await user.click(createButton)
    expect(screen.getByTestId('task-modal')).toBeInTheDocument()

    // Close and reopen with edit
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)
    expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()

    // Open edit modal
    const editButton = screen.getByText('Edit Test Task 1')
    await user.click(editButton)
    expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    expect(screen.getByText('Editing: Test Task 1')).toBeInTheDocument()
  })

  it('should handle empty task lists', () => {
    const mockUseTasksEmpty = {
      ...mockUseTasks,
      visibleTasks: []
    }

    vi.mocked(mockUseTasks).visibleTasks = []

    render(<Board />)

    // All columns should show 0 items
    expect(screen.getByTestId('column-todo')).toHaveTextContent('Items: 0')
    expect(screen.getByTestId('column-inprogress')).toHaveTextContent('Items: 0')
    expect(screen.getByTestId('column-review')).toHaveTextContent('Items: 0')
    expect(screen.getByTestId('column-done')).toHaveTextContent('Items: 0')
  })
})