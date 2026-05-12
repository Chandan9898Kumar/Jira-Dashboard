import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TopBar from './TopBar'
import type { TaskFilters } from '@/hooks/useTasks'

// Mock utility functions
vi.mock('../utils', () => ({
  colorFor: vi.fn((name: string) => '#0052cc'),
  initials: vi.fn((name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase())
}))

const defaultFilters: TaskFilters = {
  search: '',
  assignee: 'all',
  priority: 'all'
}

const defaultProps = {
  filters: defaultFilters,
  onFiltersChange: vi.fn(),
  onCreate: vi.fn()
}

describe('TopBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with proper accessibility structure', () => {
    render(<TopBar {...defaultProps} />)

    const header = screen.getByRole('search')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass('topbar')
  })

  it('should render search input with proper accessibility', () => {
    render(<TopBar {...defaultProps} />)

    const searchInput = screen.getByRole('searchbox')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder', 'Search issues...')
    expect(searchInput).toHaveAttribute('type', 'search')

    const searchLabel = screen.getByLabelText('Search issues')
    expect(searchLabel).toBeInTheDocument()
    expect(searchLabel).toHaveClass('sr-only')
  })

  it('should render search icon', () => {
    render(<TopBar {...defaultProps} />)

    const searchIcon = screen.getByRole('img', { hidden: true })
    expect(searchIcon).toBeInTheDocument()
    expect(searchIcon).toHaveAttribute('aria-hidden', 'true')
    expect(searchIcon).toHaveAttribute('focusable', 'false')
  })

  it('should render assignee filter with all options', () => {
    render(<TopBar {...defaultProps} />)

    const assigneeSelect = screen.getByDisplayValue('All assignees')
    expect(assigneeSelect).toBeInTheDocument()

    const assigneeLabel = screen.getByLabelText('Filter by assignee')
    expect(assigneeLabel).toBeInTheDocument()
    expect(assigneeLabel).toHaveClass('sr-only')

    // Check all assignee options
    expect(screen.getByRole('option', { name: 'All assignees' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Alex Kim' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Priya Shah' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Jordan Lee' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Sam Chen' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Riley Park' })).toBeInTheDocument()
  })

  it('should render priority filter with all options', () => {
    render(<TopBar {...defaultProps} />)

    const prioritySelect = screen.getByDisplayValue('All priorities')
    expect(prioritySelect).toBeInTheDocument()

    const priorityLabel = screen.getByLabelText('Filter by priority')
    expect(priorityLabel).toBeInTheDocument()
    expect(priorityLabel).toHaveClass('sr-only')

    // Check all priority options
    expect(screen.getByRole('option', { name: 'All priorities' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Highest' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'High' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Medium' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Low' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Lowest' })).toBeInTheDocument()
  })

  it('should render team member avatars', () => {
    render(<TopBar {...defaultProps} />)

    const avatarsContainer = screen.getByLabelText('Team members')
    expect(avatarsContainer).toBeInTheDocument()
    expect(avatarsContainer).toHaveClass('avatars')

    // Should show first 4 assignees as avatars
    expect(screen.getByTitle('Alex Kim')).toBeInTheDocument()
    expect(screen.getByTitle('Priya Shah')).toBeInTheDocument()
    expect(screen.getByTitle('Jordan Lee')).toBeInTheDocument()
    expect(screen.getByTitle('Sam Chen')).toBeInTheDocument()

    // Should not show Riley Park (5th assignee)
    expect(screen.queryByTitle('Riley Park')).not.toBeInTheDocument()
  })

  it('should render create button with proper accessibility', () => {
    render(<TopBar {...defaultProps} />)

    const createButton = screen.getByRole('button', { name: /create/i })
    expect(createButton).toBeInTheDocument()
    expect(createButton).toHaveClass('btn', 'btn-primary')
    expect(createButton).toHaveTextContent('Create')

    const srOnlyText = screen.getByText('new issue')
    expect(srOnlyText).toHaveClass('sr-only')
  })

  it('should handle search input changes', async () => {
    const user = userEvent.setup()
    render(<TopBar {...defaultProps} />)

    const searchInput = screen.getByRole('searchbox')
    await user.type(searchInput, 'test search')

    expect(defaultProps.onFiltersChange).toHaveBeenLastCalledWith({
      search: 'test search',
      assignee: 'all',
      priority: 'all'
    })
  })

  it('should handle assignee filter changes', async () => {
    const user = userEvent.setup()
    render(<TopBar {...defaultProps} />)

    const assigneeSelect = screen.getByDisplayValue('All assignees')
    await user.selectOptions(assigneeSelect, 'Alex Kim')

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      search: '',
      assignee: 'Alex Kim',
      priority: 'all'
    })
  })

  it('should handle priority filter changes', async () => {
    const user = userEvent.setup()
    render(<TopBar {...defaultProps} />)

    const prioritySelect = screen.getByDisplayValue('All priorities')
    await user.selectOptions(prioritySelect, 'high')

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      search: '',
      assignee: 'all',
      priority: 'high'
    })
  })

  it('should handle create button click', async () => {
    const user = userEvent.setup()
    render(<TopBar {...defaultProps} />)

    const createButton = screen.getByRole('button', { name: /create/i })
    await user.click(createButton)

    expect(defaultProps.onCreate).toHaveBeenCalledTimes(1)
  })

  it('should display current filter values', () => {
    const filtersWithValues: TaskFilters = {
      search: 'test query',
      assignee: 'Alex Kim',
      priority: 'high'
    }

    render(<TopBar {...defaultProps} filters={filtersWithValues} />)

    expect(screen.getByDisplayValue('test query')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Alex Kim')).toBeInTheDocument()
    expect(screen.getByDisplayValue('high')).toBeInTheDocument()
  })

  it('should clear search input', async () => {
    const user = userEvent.setup()
    const filtersWithSearch: TaskFilters = {
      search: 'existing search',
      assignee: 'all',
      priority: 'all'
    }

    render(<TopBar {...defaultProps} filters={filtersWithSearch} />)

    const searchInput = screen.getByDisplayValue('existing search')
    await user.clear(searchInput)

    expect(defaultProps.onFiltersChange).toHaveBeenLastCalledWith({
      search: '',
      assignee: 'all',
      priority: 'all'
    })
  })

  it('should handle multiple filter changes', async () => {
    const user = userEvent.setup()
    render(<TopBar {...defaultProps} />)

    // Change search
    const searchInput = screen.getByRole('searchbox')
    await user.type(searchInput, 'bug')

    // Change assignee
    const assigneeSelect = screen.getByDisplayValue('All assignees')
    await user.selectOptions(assigneeSelect, 'Priya Shah')

    // Change priority
    const prioritySelect = screen.getByDisplayValue('All priorities')
    await user.selectOptions(prioritySelect, 'highest')

    // Should have been called multiple times with cumulative changes
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      search: 'bug',
      assignee: 'all',
      priority: 'all'
    })

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      search: 'bug',
      assignee: 'Priya Shah',
      priority: 'all'
    })

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      search: 'bug',
      assignee: 'Priya Shah',
      priority: 'highest'
    })
  })

  it('should render avatar initials correctly', () => {
    render(<TopBar {...defaultProps} />)

    const alexAvatar = screen.getByTitle('Alex Kim')
    expect(alexAvatar).toHaveTextContent('AK')

    const priyaAvatar = screen.getByTitle('Priya Shah')
    expect(priyaAvatar).toHaveTextContent('PS')
  })

  it('should apply correct avatar styling', () => {
    render(<TopBar {...defaultProps} />)

    const alexAvatar = screen.getByTitle('Alex Kim')
    expect(alexAvatar).toHaveClass('avatar')
    expect(alexAvatar).toHaveStyle({ background: '#0052cc' })
    expect(alexAvatar).toHaveAttribute('role', 'img')
    expect(alexAvatar).toHaveAttribute('aria-label', 'Alex Kim')
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<TopBar {...defaultProps} />)

    // Tab through interactive elements
    await user.tab()
    expect(screen.getByRole('searchbox')).toHaveFocus()

    await user.tab()
    expect(screen.getByDisplayValue('All assignees')).toHaveFocus()

    await user.tab()
    expect(screen.getByDisplayValue('All priorities')).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: /create/i })).toHaveFocus()
  })

  it('should handle empty search gracefully', async () => {
    const user = userEvent.setup()
    render(<TopBar {...defaultProps} />)

    const searchInput = screen.getByRole('searchbox')
    await user.type(searchInput, 'test')
    await user.clear(searchInput)

    expect(defaultProps.onFiltersChange).toHaveBeenLastCalledWith({
      search: '',
      assignee: 'all',
      priority: 'all'
    })
  })

  it('should maintain filter state consistency', () => {
    const { rerender } = render(<TopBar {...defaultProps} />)

    const updatedFilters: TaskFilters = {
      search: 'updated',
      assignee: 'Jordan Lee',
      priority: 'low'
    }

    rerender(<TopBar {...defaultProps} filters={updatedFilters} />)

    expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Jordan Lee')).toBeInTheDocument()
    expect(screen.getByDisplayValue('low')).toBeInTheDocument()
  })

  it('should have proper spacer element', () => {
    render(<TopBar {...defaultProps} />)

    const spacer = document.querySelector('.topbar-spacer')
    expect(spacer).toBeInTheDocument()
  })

  it('should handle special characters in search', async () => {
    const user = userEvent.setup()
    render(<TopBar {...defaultProps} />)

    const searchInput = screen.getByRole('searchbox')
    await user.type(searchInput, 'PRJ-123 & special chars!')

    expect(defaultProps.onFiltersChange).toHaveBeenLastCalledWith({
      search: 'PRJ-123 & special chars!',
      assignee: 'all',
      priority: 'all'
    })
  })
})