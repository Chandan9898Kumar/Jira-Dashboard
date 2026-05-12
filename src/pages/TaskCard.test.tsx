import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'
import type { Task } from '@/schema/types'

// Mock utility functions
vi.mock('../utils', () => ({
  colorFor: vi.fn((name: string) => '#0052cc'),
  initials: vi.fn((name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()),
  typeGlyph: vi.fn((type: string) => type === 'task' ? '✓' : type === 'bug' ? '!' : '★')
}))

const mockTask: Task = {
  id: 'task-1',
  key: 'PRJ-1',
  title: 'Test Task Title',
  description: 'Test description',
  priority: 'high',
  type: 'task',
  assignee: 'Alex Kim',
  column: 'todo'
}

const defaultProps = {
  task: mockTask,
  columnName: 'To Do',
  isKeyboardSelected: false,
  onClick: vi.fn(),
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
  onCardDragOver: vi.fn(),
  onCardDrop: vi.fn(),
  onKeyDown: vi.fn()
}

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render task card with correct structure', () => {
    render(<TaskCard {...defaultProps} />)

    const card = screen.getByRole('button')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('card')
    expect(card).toHaveAttribute('draggable', 'true')
    expect(card).toHaveAttribute('tabIndex', '0')
  })

  it('should display task title', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText('Test Task Title')).toBeInTheDocument()
    expect(screen.getByText('Test Task Title')).toHaveClass('card-title')
  })

  it('should display task key', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText('PRJ-1')).toBeInTheDocument()
    expect(screen.getByText('PRJ-1')).toHaveClass('tag-key')
  })

  it('should display type icon with correct glyph', () => {
    render(<TaskCard {...defaultProps} />)

    const typeIcon = screen.getByLabelText('Type: task')
    expect(typeIcon).toBeInTheDocument()
    expect(typeIcon).toHaveClass('type-icon', 'task')
    expect(typeIcon).toHaveTextContent('✓')
  })

  it('should display priority with correct label', () => {
    render(<TaskCard {...defaultProps} />)

    const priority = screen.getByLabelText('Priority: high')
    expect(priority).toBeInTheDocument()
    expect(priority).toHaveClass('priority', 'high')
    expect(priority).toHaveTextContent('↑')
  })

  it('should display assignee avatar with correct styling', () => {
    render(<TaskCard {...defaultProps} />)

    const avatar = screen.getByLabelText('Assignee: Alex Kim')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveClass('avatar', 'avatar-inline')
    expect(avatar).toHaveStyle({ background: '#0052cc' })
    expect(avatar).toHaveTextContent('AK')
  })

  it('should have proper accessibility attributes', () => {
    render(<TaskCard {...defaultProps} />)

    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-label', 
      'PRJ-1, Test Task Title, priority high, assigned to Alex Kim, status To Do. Press Enter to edit, Space to pick up.'
    )
    expect(card).toHaveAttribute('aria-grabbed', 'false')
  })

  it('should apply keyboard selected class when selected', () => {
    render(<TaskCard {...defaultProps} isKeyboardSelected={true} />)

    const card = screen.getByRole('button')
    expect(card).toHaveClass('card', 'kb-selected')
    expect(card).toHaveAttribute('aria-grabbed', 'true')
  })

  it('should not apply keyboard selected class when not selected', () => {
    render(<TaskCard {...defaultProps} isKeyboardSelected={false} />)

    const card = screen.getByRole('button')
    expect(card).toHaveClass('card')
    expect(card).not.toHaveClass('kb-selected')
    expect(card).toHaveAttribute('aria-grabbed', 'false')
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    render(<TaskCard {...defaultProps} />)

    const card = screen.getByRole('button')
    await user.click(card)

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('should handle drag start events', () => {
    render(<TaskCard {...defaultProps} />)

    const card = screen.getByRole('button')
    const dragEvent = new Event('dragstart', { bubbles: true })

    fireEvent(card, dragEvent)

    expect(defaultProps.onDragStart).toHaveBeenCalledWith(dragEvent, 'task-1')
  })

  it('should handle drag end events', () => {
    render(<TaskCard {...defaultProps} />)

    const card = screen.getByRole('button')
    const dragEvent = new Event('dragend', { bubbles: true })

    fireEvent(card, dragEvent)

    expect(defaultProps.onDragEnd).toHaveBeenCalledWith(dragEvent)
  })

  it('should handle drag over events', () => {
    render(<TaskCard {...defaultProps} />)

    const card = screen.getByRole('button')
    const dragEvent = new Event('dragover', { bubbles: true })

    fireEvent(card, dragEvent)

    expect(defaultProps.onCardDragOver).toHaveBeenCalledWith(dragEvent)
  })

  it('should handle drop events', () => {
    render(<TaskCard {...defaultProps} />)

    const card = screen.getByRole('button')
    const dropEvent = new Event('drop', { bubbles: true })

    fireEvent(card, dropEvent)

    expect(defaultProps.onCardDrop).toHaveBeenCalledWith(dropEvent, mockTask)
  })

  it('should handle keydown events', () => {
    render(<TaskCard {...defaultProps} />)

    const card = screen.getByRole('button')
    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' })

    fireEvent(card, keyEvent)

    expect(defaultProps.onKeyDown).toHaveBeenCalledWith(keyEvent, mockTask)
  })

  it('should render different task types correctly', () => {
    const bugTask = { ...mockTask, type: 'bug' as const }
    render(<TaskCard {...defaultProps} task={bugTask} />)

    const typeIcon = screen.getByLabelText('Type: bug')
    expect(typeIcon).toHaveClass('type-icon', 'bug')
    expect(typeIcon).toHaveTextContent('!')
  })

  it('should render different priorities correctly', () => {
    const lowPriorityTask = { ...mockTask, priority: 'low' as const }
    render(<TaskCard {...defaultProps} task={lowPriorityTask} />)

    const priority = screen.getByLabelText('Priority: low')
    expect(priority).toHaveClass('priority', 'low')
    expect(priority).toHaveTextContent('↓')
  })

  it('should handle different assignees correctly', () => {
    const differentAssigneeTask = { ...mockTask, assignee: 'Priya Shah' }
    render(<TaskCard {...defaultProps} task={differentAssigneeTask} />)

    const avatar = screen.getByLabelText('Assignee: Priya Shah')
    expect(avatar).toHaveTextContent('PS')
  })

  it('should render story type correctly', () => {
    const storyTask = { ...mockTask, type: 'story' as const }
    render(<TaskCard {...defaultProps} task={storyTask} />)

    const typeIcon = screen.getByLabelText('Type: story')
    expect(typeIcon).toHaveClass('type-icon', 'story')
    expect(typeIcon).toHaveTextContent('★')
  })

  it('should render all priority levels correctly', () => {
    const priorities = ['highest', 'high', 'medium', 'low', 'lowest'] as const
    const expectedLabels = ['↑↑', '↑', '=', '↓', '↓↓']

    priorities.forEach((priority, index) => {
      const taskWithPriority = { ...mockTask, priority }
      const { unmount } = render(<TaskCard {...defaultProps} task={taskWithPriority} />)

      const priorityElement = screen.getByLabelText(`Priority: ${priority}`)
      expect(priorityElement).toHaveClass('priority', priority)
      expect(priorityElement).toHaveTextContent(expectedLabels[index])

      unmount()
    })
  })

  it('should have proper semantic structure', () => {
    render(<TaskCard {...defaultProps} />)

    // Should be an article element
    const article = screen.getByRole('button')
    expect(article.tagName).toBe('ARTICLE')

    // Should have card title
    const title = screen.getByText('Test Task Title')
    expect(title).toHaveClass('card-title')

    // Should have card meta section
    const meta = title.nextElementSibling
    expect(meta).toHaveClass('card-meta')

    // Should have tags section
    const tags = meta?.querySelector('.card-tags')
    expect(tags).toBeInTheDocument()
  })

  it('should handle long task titles', () => {
    const longTitleTask = {
      ...mockTask,
      title: 'This is a very long task title that might wrap to multiple lines and should be handled gracefully'
    }
    render(<TaskCard {...defaultProps} task={longTitleTask} />)

    expect(screen.getByText(longTitleTask.title)).toBeInTheDocument()
  })

  it('should handle tasks without description', () => {
    const taskWithoutDescription = { ...mockTask }
    delete taskWithoutDescription.description
    
    render(<TaskCard {...defaultProps} task={taskWithoutDescription} />)

    // Should still render properly
    expect(screen.getByText('Test Task Title')).toBeInTheDocument()
    expect(screen.getByText('PRJ-1')).toBeInTheDocument()
  })

  it('should maintain focus management', async () => {
    const user = userEvent.setup()
    render(<TaskCard {...defaultProps} />)

    const card = screen.getByRole('button')
    
    // Should be focusable
    await user.tab()
    expect(card).toHaveFocus()
  })

  it('should update aria-grabbed when keyboard selection changes', () => {
    const { rerender } = render(<TaskCard {...defaultProps} isKeyboardSelected={false} />)

    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-grabbed', 'false')

    rerender(<TaskCard {...defaultProps} isKeyboardSelected={true} />)
    expect(card).toHaveAttribute('aria-grabbed', 'true')
  })
})