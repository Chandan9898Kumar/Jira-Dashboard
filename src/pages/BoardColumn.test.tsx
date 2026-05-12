import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BoardColumn } from './BoardColumn'
import type { Task } from '@/schema/types'

// Mock TaskCard component
vi.mock('./TaskCard', () => ({
  TaskCard: ({ task, columnName, isKeyboardSelected, onClick, onDragStart, onDragEnd, onCardDragOver, onCardDrop, onKeyDown }: any) => (
    <div data-testid={`task-card-${task.id}`}>
      <div>Task: {task.title}</div>
      <div>Column: {columnName}</div>
      <div>Selected: {isKeyboardSelected ? 'true' : 'false'}</div>
      <button onClick={onClick}>Edit Task</button>
      <button 
        onDragStart={(e) => onDragStart(e, task.id)}
        onDragEnd={onDragEnd}
        onDragOver={onCardDragOver}
        onDrop={(e) => onCardDrop(e, task)}
        onKeyDown={(e) => onKeyDown(e, task)}
      >
        Drag Handle
      </button>
    </div>
  )
}))

const mockTasks: Task[] = [
  {
    id: 'task-1',
    key: 'PRJ-1',
    title: 'Test Task 1',
    priority: 'high',
    type: 'task',
    assignee: 'Alex Kim',
    column: 'todo'
  },
  {
    id: 'task-2',
    key: 'PRJ-2',
    title: 'Test Task 2',
    priority: 'medium',
    type: 'bug',
    assignee: 'Priya Shah',
    column: 'todo'
  }
]

const defaultProps = {
  id: 'todo' as const,
  name: 'To Do',
  items: mockTasks,
  isDragOver: false,
  keyboardSelectedId: null,
  onCreate: vi.fn(),
  onEditTask: vi.fn(),
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
  onDragOver: vi.fn(),
  onDragLeave: vi.fn(),
  onDrop: vi.fn(),
  onCardDragOver: vi.fn(),
  onCardDrop: vi.fn(),
  onCardKeyDown: vi.fn()
}

describe('BoardColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render column with correct structure', () => {
    render(<BoardColumn {...defaultProps} />)

    expect(screen.getByRole('listitem')).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toHaveClass('column')
  })

  it('should render column header with name and count', () => {
    render(<BoardColumn {...defaultProps} />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('To Do')
    expect(heading).toHaveAttribute('id', 'col-todo')

    const countBadge = screen.getByLabelText('2 issues')
    expect(countBadge).toHaveTextContent('2')
  })

  it('should render cards list with proper accessibility', () => {
    render(<BoardColumn {...defaultProps} />)

    const cardsList = screen.getByRole('list', { name: 'To Do issues' })
    expect(cardsList).toBeInTheDocument()
    expect(cardsList).toHaveClass('cards')
  })

  it('should render all task cards', () => {
    render(<BoardColumn {...defaultProps} />)

    expect(screen.getByTestId('task-card-task-1')).toBeInTheDocument()
    expect(screen.getByTestId('task-card-task-2')).toBeInTheDocument()
  })

  it('should pass correct props to task cards', () => {
    render(<BoardColumn {...defaultProps} keyboardSelectedId="task-1" />)

    // Check first task card
    const firstCard = screen.getByTestId('task-card-task-1')
    expect(firstCard).toHaveTextContent('Task: Test Task 1')
    expect(firstCard).toHaveTextContent('Column: To Do')
    expect(firstCard).toHaveTextContent('Selected: true')

    // Check second task card
    const secondCard = screen.getByTestId('task-card-task-2')
    expect(secondCard).toHaveTextContent('Selected: false')
  })

  it('should render create button with proper accessibility', () => {
    render(<BoardColumn {...defaultProps} />)

    const createButton = screen.getByRole('button', { name: 'Create issue in To Do' })
    expect(createButton).toBeInTheDocument()
    expect(createButton).toHaveClass('add-card')
    expect(createButton).toHaveTextContent('Create issue')
  })

  it('should handle create button click', async () => {
    const user = userEvent.setup()
    render(<BoardColumn {...defaultProps} />)

    const createButton = screen.getByRole('button', { name: 'Create issue in To Do' })
    await user.click(createButton)

    expect(defaultProps.onCreate).toHaveBeenCalledWith('todo')
  })

  it('should handle task edit click', async () => {
    const user = userEvent.setup()
    render(<BoardColumn {...defaultProps} />)

    const editButton = screen.getAllByText('Edit Task')[0]
    await user.click(editButton)

    expect(defaultProps.onEditTask).toHaveBeenCalledWith(mockTasks[0])
  })

  it('should apply drag-over class when dragging', () => {
    render(<BoardColumn {...defaultProps} isDragOver={true} />)

    const cardsList = screen.getByRole('list', { name: 'To Do issues' })
    expect(cardsList).toHaveClass('cards', 'drag-over')
  })

  it('should not apply drag-over class when not dragging', () => {
    render(<BoardColumn {...defaultProps} isDragOver={false} />)

    const cardsList = screen.getByRole('list', { name: 'To Do issues' })
    expect(cardsList).toHaveClass('cards')
    expect(cardsList).not.toHaveClass('drag-over')
  })

  it('should handle drag over events', () => {
    render(<BoardColumn {...defaultProps} />)

    const cardsList = screen.getByRole('list', { name: 'To Do issues' })
    const dragEvent = new Event('dragover', { bubbles: true })

    fireEvent(cardsList, dragEvent)

    expect(defaultProps.onDragOver).toHaveBeenCalledWith(dragEvent, 'todo')
  })

  it('should handle drag leave events', () => {
    render(<BoardColumn {...defaultProps} />)

    const cardsList = screen.getByRole('list', { name: 'To Do issues' })
    const dragEvent = new Event('dragleave', { bubbles: true })

    fireEvent(cardsList, dragEvent)

    expect(defaultProps.onDragLeave).toHaveBeenCalled()
  })

  it('should handle drop events', () => {
    render(<BoardColumn {...defaultProps} />)

    const cardsList = screen.getByRole('list', { name: 'To Do issues' })
    const dropEvent = new Event('drop', { bubbles: true })

    fireEvent(cardsList, dropEvent)

    expect(defaultProps.onDrop).toHaveBeenCalledWith(dropEvent, 'todo')
  })

  it('should render empty column correctly', () => {
    render(<BoardColumn {...defaultProps} items={[]} />)

    const countBadge = screen.getByLabelText('0 issues')
    expect(countBadge).toHaveTextContent('0')

    // Should not render any task cards
    expect(screen.queryByTestId('task-card-task-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('task-card-task-2')).not.toBeInTheDocument()
  })

  it('should handle different column types', () => {
    const inProgressProps = {
      ...defaultProps,
      id: 'inprogress' as const,
      name: 'In Progress'
    }

    render(<BoardColumn {...inProgressProps} />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('In Progress')
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'col-inprogress')
    expect(screen.getByRole('list', { name: 'In Progress issues' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create issue in In Progress' })).toBeInTheDocument()
  })

  it('should pass drag handlers to task cards', () => {
    render(<BoardColumn {...defaultProps} />)

    const dragHandle = screen.getAllByText('Drag Handle')[0]
    
    // Test drag start
    const dragStartEvent = new Event('dragstart', { bubbles: true })
    fireEvent(dragHandle, dragStartEvent)
    expect(defaultProps.onDragStart).toHaveBeenCalled()

    // Test drag end
    const dragEndEvent = new Event('dragend', { bubbles: true })
    fireEvent(dragHandle, dragEndEvent)
    expect(defaultProps.onDragEnd).toHaveBeenCalled()

    // Test card drag over
    const dragOverEvent = new Event('dragover', { bubbles: true })
    fireEvent(dragHandle, dragOverEvent)
    expect(defaultProps.onCardDragOver).toHaveBeenCalled()

    // Test card drop
    const dropEvent = new Event('drop', { bubbles: true })
    fireEvent(dragHandle, dropEvent)
    expect(defaultProps.onCardDrop).toHaveBeenCalled()

    // Test key down
    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' })
    fireEvent(dragHandle, keyEvent)
    expect(defaultProps.onCardKeyDown).toHaveBeenCalled()
  })

  it('should have proper ARIA labeling', () => {
    render(<BoardColumn {...defaultProps} />)

    const section = screen.getByRole('listitem')
    expect(section).toHaveAttribute('aria-labelledby', 'col-todo')

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveAttribute('id', 'col-todo')
  })

  it('should handle single task correctly', () => {
    const singleTaskProps = {
      ...defaultProps,
      items: [mockTasks[0]]
    }

    render(<BoardColumn {...singleTaskProps} />)

    const countBadge = screen.getByLabelText('1 issues')
    expect(countBadge).toHaveTextContent('1')

    expect(screen.getByTestId('task-card-task-1')).toBeInTheDocument()
    expect(screen.queryByTestId('task-card-task-2')).not.toBeInTheDocument()
  })

  it('should maintain keyboard selection state', () => {
    const { rerender } = render(<BoardColumn {...defaultProps} keyboardSelectedId={null} />)

    expect(screen.getByTestId('task-card-task-1')).toHaveTextContent('Selected: false')

    rerender(<BoardColumn {...defaultProps} keyboardSelectedId="task-1" />)

    expect(screen.getByTestId('task-card-task-1')).toHaveTextContent('Selected: true')
    expect(screen.getByTestId('task-card-task-2')).toHaveTextContent('Selected: false')
  })
})