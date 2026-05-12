import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskModal } from './TaskModal'
import type { Task } from '@/schema/types'

const mockTask: Task = {
  id: 'task-1',
  key: 'PRJ-1',
  title: 'Test Task',
  description: 'Test description',
  priority: 'high',
  type: 'bug',
  assignee: 'Priya Shah',
  column: 'inprogress'
}

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSave: vi.fn(),
  onDelete: vi.fn()
}

describe('TaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock focus methods
    HTMLElement.prototype.focus = vi.fn()
    
    // Mock document.activeElement
    Object.defineProperty(document, 'activeElement', {
      value: document.body,
      writable: true
    })
  })

  it('should not render when closed', () => {
    render(<TaskModal {...defaultProps} open={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render modal with proper accessibility when open', () => {
    render(<TaskModal {...defaultProps} />)

    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveClass('modal')
  })

  it('should render create modal heading when no initial task', () => {
    render(<TaskModal {...defaultProps} />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Create issue')
  })

  it('should render edit modal heading when initial task provided', () => {
    render(<TaskModal {...defaultProps} initial={mockTask} />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Edit issue')
  })

  it('should render all form fields with proper labels', () => {
    render(<TaskModal {...defaultProps} />)

    expect(screen.getByLabelText(/summary/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/assignee/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  })

  it('should populate form fields when editing existing task', () => {
    render(<TaskModal {...defaultProps} initial={mockTask} />)

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('bug')).toBeInTheDocument()
    expect(screen.getByDisplayValue('high')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Priya Shah')).toBeInTheDocument()
    expect(screen.getByDisplayValue('inprogress')).toBeInTheDocument()
  })

  it('should use default values for new task', () => {
    render(<TaskModal {...defaultProps} defaultColumn="review" />)

    expect(screen.getByDisplayValue('')).toBeInTheDocument() // title
    expect(screen.getByDisplayValue('medium')).toBeInTheDocument() // priority
    expect(screen.getByDisplayValue('task')).toBeInTheDocument() // type
    expect(screen.getByDisplayValue('Alex Kim')).toBeInTheDocument() // assignee
    expect(screen.getByDisplayValue('review')).toBeInTheDocument() // column
  })

  it('should handle form input changes', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    const titleInput = screen.getByLabelText(/summary/i)
    await user.type(titleInput, 'New Task Title')

    expect(titleInput).toHaveValue('New Task Title')

    const descriptionInput = screen.getByLabelText(/description/i)
    await user.type(descriptionInput, 'New description')

    expect(descriptionInput).toHaveValue('New description')
  })

  it('should handle select field changes', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    const typeSelect = screen.getByLabelText(/type/i)
    await user.selectOptions(typeSelect, 'story')
    expect(typeSelect).toHaveValue('story')

    const prioritySelect = screen.getByLabelText(/priority/i)
    await user.selectOptions(prioritySelect, 'highest')
    expect(prioritySelect).toHaveValue('highest')

    const assigneeSelect = screen.getByLabelText(/assignee/i)
    await user.selectOptions(assigneeSelect, 'Jordan Lee')
    expect(assigneeSelect).toHaveValue('Jordan Lee')

    const statusSelect = screen.getByLabelText(/status/i)
    await user.selectOptions(statusSelect, 'done')
    expect(statusSelect).toHaveValue('done')
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: 'Create' })
    await user.click(submitButton)

    expect(screen.getByRole('alert')).toHaveTextContent('Summary is required.')
    expect(defaultProps.onSave).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    const titleInput = screen.getByLabelText(/summary/i)
    await user.type(titleInput, 'Valid Task Title')

    const submitButton = screen.getByRole('button', { name: 'Create' })
    await user.click(submitButton)

    expect(defaultProps.onSave).toHaveBeenCalledWith({
      title: 'Valid Task Title',
      description: '',
      priority: 'medium',
      type: 'task',
      assignee: 'Alex Kim',
      column: 'todo'
    })
  })

  it('should submit form with all fields filled', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    await user.type(screen.getByLabelText(/summary/i), 'Complete Task')
    await user.type(screen.getByLabelText(/description/i), 'Full description')
    await user.selectOptions(screen.getByLabelText(/type/i), 'bug')
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high')
    await user.selectOptions(screen.getByLabelText(/assignee/i), 'Sam Chen')
    await user.selectOptions(screen.getByLabelText(/status/i), 'review')

    const submitButton = screen.getByRole('button', { name: 'Create' })
    await user.click(submitButton)

    expect(defaultProps.onSave).toHaveBeenCalledWith({
      title: 'Complete Task',
      description: 'Full description',
      priority: 'high',
      type: 'bug',
      assignee: 'Sam Chen',
      column: 'review'
    })
  })

  it('should handle edit form submission', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} initial={mockTask} />)

    const titleInput = screen.getByDisplayValue('Test Task')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Task')

    const submitButton = screen.getByRole('button', { name: 'Save' })
    await user.click(submitButton)

    expect(defaultProps.onSave).toHaveBeenCalledWith({
      id: 'task-1',
      title: 'Updated Task',
      description: 'Test description',
      priority: 'high',
      type: 'bug',
      assignee: 'Priya Shah',
      column: 'inprogress'
    })
  })

  it('should handle close button click', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    const closeButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should handle backdrop click', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    const backdrop = document.querySelector('.modal-backdrop')
    expect(backdrop).toBeInTheDocument()

    await user.click(backdrop!)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should not close when clicking inside modal', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    const modal = screen.getByRole('dialog')
    await user.click(modal)

    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('should render delete button for existing tasks', () => {
    render(<TaskModal {...defaultProps} initial={mockTask} />)

    const deleteButton = screen.getByRole('button', { name: 'Delete issue PRJ-1' })
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).toHaveClass('btn', 'btn-danger')
  })

  it('should not render delete button for new tasks', () => {
    render(<TaskModal {...defaultProps} />)

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('should handle delete button click', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} initial={mockTask} />)

    const deleteButton = screen.getByRole('button', { name: 'Delete issue PRJ-1' })
    await user.click(deleteButton)

    expect(defaultProps.onDelete).toHaveBeenCalledWith('task-1')
  })

  it('should handle Escape key to close', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    await user.keyboard('{Escape}')

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should focus first field on open', async () => {
    const mockFocus = vi.fn()
    HTMLInputElement.prototype.focus = mockFocus

    render(<TaskModal {...defaultProps} />)

    await waitFor(() => {
      expect(mockFocus).toHaveBeenCalled()
    })
  })

  it('should restore focus on close', () => {
    const mockElement = { focus: vi.fn() }
    Object.defineProperty(document, 'activeElement', {
      value: mockElement,
      writable: true
    })

    const { unmount } = render(<TaskModal {...defaultProps} />)
    unmount()

    expect(mockElement.focus).toHaveBeenCalled()
  })

  it('should clear error when form is resubmitted', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    // Submit empty form to trigger error
    const submitButton = screen.getByRole('button', { name: 'Create' })
    await user.click(submitButton)

    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Fill in title and resubmit
    const titleInput = screen.getByLabelText(/summary/i)
    await user.type(titleInput, 'Valid Title')
    await user.click(submitButton)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should trim whitespace from inputs', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    const titleInput = screen.getByLabelText(/summary/i)
    await user.type(titleInput, '  Trimmed Title  ')

    const descriptionInput = screen.getByLabelText(/description/i)
    await user.type(descriptionInput, '  Trimmed Description  ')

    const submitButton = screen.getByRole('button', { name: 'Create' })
    await user.click(submitButton)

    expect(defaultProps.onSave).toHaveBeenCalledWith({
      title: 'Trimmed Title',
      description: 'Trimmed Description',
      priority: 'medium',
      type: 'task',
      assignee: 'Alex Kim',
      column: 'todo'
    })
  })

  it('should handle form submission via Enter key', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    const titleInput = screen.getByLabelText(/summary/i)
    await user.type(titleInput, 'Enter Key Task')
    await user.keyboard('{Enter}')

    expect(defaultProps.onSave).toHaveBeenCalledWith({
      title: 'Enter Key Task',
      description: '',
      priority: 'medium',
      type: 'task',
      assignee: 'Alex Kim',
      column: 'todo'
    })
  })

  it('should render all type options', () => {
    render(<TaskModal {...defaultProps} />)

    const typeSelect = screen.getByLabelText(/type/i)
    expect(screen.getByRole('option', { name: 'Task' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Bug' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Story' })).toBeInTheDocument()
  })

  it('should render all priority options', () => {
    render(<TaskModal {...defaultProps} />)

    const prioritySelect = screen.getByLabelText(/priority/i)
    expect(screen.getByRole('option', { name: 'Highest' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'High' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Medium' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Low' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Lowest' })).toBeInTheDocument()
  })

  it('should render all assignee options', () => {
    render(<TaskModal {...defaultProps} />)

    const assigneeSelect = screen.getByLabelText(/assignee/i)
    expect(screen.getByRole('option', { name: 'Alex Kim' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Priya Shah' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Jordan Lee' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Sam Chen' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Riley Park' })).toBeInTheDocument()
  })

  it('should render all status options', () => {
    render(<TaskModal {...defaultProps} />)

    const statusSelect = screen.getByLabelText(/status/i)
    expect(screen.getByRole('option', { name: 'To Do' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'In Review' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Done' })).toBeInTheDocument()
  })

  it('should handle task without description', () => {
    const taskWithoutDescription = { ...mockTask }
    delete taskWithoutDescription.description

    render(<TaskModal {...defaultProps} initial={taskWithoutDescription} />)

    const descriptionInput = screen.getByLabelText(/description/i)
    expect(descriptionInput).toHaveValue('')
  })

  it('should maintain form state during interaction', async () => {
    const user = userEvent.setup()
    render(<TaskModal {...defaultProps} />)

    // Fill multiple fields
    await user.type(screen.getByLabelText(/summary/i), 'Test Title')
    await user.type(screen.getByLabelText(/description/i), 'Test Description')
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high')

    // Verify all values are maintained
    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('high')).toBeInTheDocument()
  })
})