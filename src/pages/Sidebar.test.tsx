import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render sidebar with proper accessibility structure', () => {
    render(<Sidebar />)

    const sidebar = screen.getByRole('complementary', { name: 'Primary navigation' })
    expect(sidebar).toBeInTheDocument()
    expect(sidebar).toHaveClass('sidebar')
  })

  it('should render brand section', () => {
    render(<Sidebar />)

    const brandMark = screen.getByText('J')
    expect(brandMark).toBeInTheDocument()
    expect(brandMark).toHaveClass('brand-mark')
    expect(brandMark).toHaveAttribute('aria-hidden', 'true')

    const brandText = screen.getByText('Jiraboard')
    expect(brandText).toBeInTheDocument()
  })

  it('should render planning section with proper heading', () => {
    render(<Sidebar />)

    const planningHeading = screen.getByRole('heading', { level: 2, name: 'Planning' })
    expect(planningHeading).toBeInTheDocument()
    expect(planningHeading).toHaveAttribute('id', 'nav-planning')
    expect(planningHeading).toHaveClass('sidebar-section')
  })

  it('should render planning navigation with proper accessibility', () => {
    render(<Sidebar />)

    const planningNav = screen.getByRole('navigation', { name: 'Planning' })
    expect(planningNav).toBeInTheDocument()
    expect(planningNav).toHaveAttribute('aria-labelledby', 'nav-planning')
  })

  it('should render all planning navigation items', () => {
    render(<Sidebar />)

    const expectedItems = [
      { label: 'Board', icon: '▦' },
      { label: 'Backlog', icon: '≡' },
      { label: 'Roadmap', icon: '→' },
      { label: 'Reports', icon: '◔' },
      { label: 'Issues', icon: '✓' }
    ]

    expectedItems.forEach(({ label, icon }) => {
      const button = screen.getByRole('button', { name: label })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('sidebar-link')

      const iconElement = button.querySelector('.icon')
      expect(iconElement).toBeInTheDocument()
      expect(iconElement).toHaveTextContent(icon)
      expect(iconElement).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('should have Board as default active item', () => {
    render(<Sidebar />)

    const boardButton = screen.getByRole('button', { name: 'Board' })
    expect(boardButton).toHaveClass('sidebar-link', 'active')
    expect(boardButton).toHaveAttribute('aria-current', 'page')
  })

  it('should handle navigation item clicks', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const backlogButton = screen.getByRole('button', { name: 'Backlog' })
    await user.click(backlogButton)

    expect(backlogButton).toHaveClass('sidebar-link', 'active')
    expect(backlogButton).toHaveAttribute('aria-current', 'page')

    // Board should no longer be active
    const boardButton = screen.getByRole('button', { name: 'Board' })
    expect(boardButton).toHaveClass('sidebar-link')
    expect(boardButton).not.toHaveClass('active')
    expect(boardButton).not.toHaveAttribute('aria-current')
  })

  it('should switch between different navigation items', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    // Click Roadmap
    const roadmapButton = screen.getByRole('button', { name: 'Roadmap' })
    await user.click(roadmapButton)

    expect(roadmapButton).toHaveClass('active')
    expect(roadmapButton).toHaveAttribute('aria-current', 'page')

    // Click Reports
    const reportsButton = screen.getByRole('button', { name: 'Reports' })
    await user.click(reportsButton)

    expect(reportsButton).toHaveClass('active')
    expect(reportsButton).toHaveAttribute('aria-current', 'page')
    expect(roadmapButton).not.toHaveClass('active')
    expect(roadmapButton).not.toHaveAttribute('aria-current')
  })

  it('should render project section with proper heading', () => {
    render(<Sidebar />)

    const projectHeading = screen.getByRole('heading', { level: 2, name: 'Project' })
    expect(projectHeading).toBeInTheDocument()
    expect(projectHeading).toHaveAttribute('id', 'nav-project')
    expect(projectHeading).toHaveClass('sidebar-section')
  })

  it('should render project navigation with proper accessibility', () => {
    render(<Sidebar />)

    const projectNavs = screen.getAllByRole('navigation', { name: 'Project' })
    expect(projectNavs).toHaveLength(1)
    expect(projectNavs[0]).toHaveAttribute('aria-labelledby', 'nav-project')
  })

  it('should render project navigation items', () => {
    render(<Sidebar />)

    const settingsButton = screen.getByRole('button', { name: 'Settings' })
    expect(settingsButton).toBeInTheDocument()
    expect(settingsButton).toHaveClass('sidebar-link')

    const settingsIcon = settingsButton.querySelector('.icon')
    expect(settingsIcon).toHaveTextContent('⚙')
    expect(settingsIcon).toHaveAttribute('aria-hidden', 'true')

    const shortcutButton = screen.getByRole('button', { name: 'Add shortcut' })
    expect(shortcutButton).toBeInTheDocument()
    expect(shortcutButton).toHaveClass('sidebar-link')

    const shortcutIcon = shortcutButton.querySelector('.icon')
    expect(shortcutIcon).toHaveTextContent('+')
    expect(shortcutIcon).toHaveAttribute('aria-hidden', 'true')
  })

  it('should handle project navigation clicks', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const settingsButton = screen.getByRole('button', { name: 'Settings' })
    await user.click(settingsButton)

    // Settings button should be clickable (no specific state change expected)
    expect(settingsButton).toBeInTheDocument()

    const shortcutButton = screen.getByRole('button', { name: 'Add shortcut' })
    await user.click(shortcutButton)

    // Add shortcut button should be clickable (no specific state change expected)
    expect(shortcutButton).toBeInTheDocument()
  })

  it('should maintain active state correctly', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    // Initially Board is active
    expect(screen.getByRole('button', { name: 'Board' })).toHaveClass('active')

    // Click Issues
    const issuesButton = screen.getByRole('button', { name: 'Issues' })
    await user.click(issuesButton)

    expect(issuesButton).toHaveClass('active')
    expect(screen.getByRole('button', { name: 'Board' })).not.toHaveClass('active')

    // Click Board again
    const boardButton = screen.getByRole('button', { name: 'Board' })
    await user.click(boardButton)

    expect(boardButton).toHaveClass('active')
    expect(issuesButton).not.toHaveClass('active')
  })

  it('should have proper keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    // Tab through navigation items
    await user.tab()
    expect(screen.getByRole('button', { name: 'Board' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Backlog' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Roadmap' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Reports' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Issues' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Add shortcut' })).toHaveFocus()
  })

  it('should handle Enter key activation', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const backlogButton = screen.getByRole('button', { name: 'Backlog' })
    backlogButton.focus()
    
    await user.keyboard('{Enter}')

    expect(backlogButton).toHaveClass('active')
    expect(backlogButton).toHaveAttribute('aria-current', 'page')
  })

  it('should handle Space key activation', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const roadmapButton = screen.getByRole('button', { name: 'Roadmap' })
    roadmapButton.focus()
    
    await user.keyboard(' ')

    expect(roadmapButton).toHaveClass('active')
    expect(roadmapButton).toHaveAttribute('aria-current', 'page')
  })

  it('should have proper semantic structure', () => {
    render(<Sidebar />)

    // Should have proper heading hierarchy
    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings).toHaveLength(2)
    expect(headings[0]).toHaveTextContent('Planning')
    expect(headings[1]).toHaveTextContent('Project')

    // Should have proper navigation structure
    const navigations = screen.getAllByRole('navigation')
    expect(navigations).toHaveLength(2)
  })

  it('should not affect project buttons when planning items are clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const settingsButton = screen.getByRole('button', { name: 'Settings' })
    const backlogButton = screen.getByRole('button', { name: 'Backlog' })

    // Click planning item
    await user.click(backlogButton)

    // Project buttons should remain unchanged (no active state)
    expect(settingsButton).not.toHaveClass('active')
    expect(settingsButton).not.toHaveAttribute('aria-current')
  })

  it('should render all icons correctly', () => {
    render(<Sidebar />)

    const expectedIcons = {
      'Board': '▦',
      'Backlog': '≡',
      'Roadmap': '→',
      'Reports': '◔',
      'Issues': '✓',
      'Settings': '⚙',
      'Add shortcut': '+'
    }

    Object.entries(expectedIcons).forEach(([label, icon]) => {
      const button = screen.getByRole('button', { name: label })
      const iconElement = button.querySelector('.icon')
      expect(iconElement).toHaveTextContent(icon)
    })
  })
})