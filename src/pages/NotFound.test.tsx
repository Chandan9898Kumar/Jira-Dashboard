import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NotFound from './NotFound'

// Mock react-router-dom hooks
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/unknown-path' })
  }
})

describe('NotFound', () => {
  let originalTitle: string
  let originalHead: HTMLHeadElement

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Store original document state
    originalTitle = document.title
    originalHead = document.head.cloneNode(true) as HTMLHeadElement
    
    // Clear any existing meta tags
    const existingMeta = document.head.querySelectorAll('meta[name="robots"]')
    existingMeta.forEach(meta => meta.remove())
    
    // Mock console.warn
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore original document state
    document.title = originalTitle
    document.head.innerHTML = originalHead.innerHTML
    
    vi.restoreAllMocks()
  })

  const renderNotFound = () => {
    return render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
  }

  it('should render main content with proper accessibility', () => {
    renderNotFound()

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('not-found')
  })

  it('should render alert section with proper accessibility', () => {
    renderNotFound()

    const alertSection = screen.getByRole('alert')
    expect(alertSection).toBeInTheDocument()
    expect(alertSection).toHaveClass('not-found-inner')
    expect(alertSection).toHaveAttribute('aria-labelledby', 'not-found-title')
  })

  it('should render 404 code as decorative element', () => {
    renderNotFound()

    const code = screen.getByText('404')
    expect(code).toBeInTheDocument()
    expect(code).toHaveClass('not-found-code')
    expect(code).toHaveAttribute('aria-hidden', 'true')
  })

  it('should render main heading', () => {
    renderNotFound()

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Page not found')
    expect(heading).toHaveAttribute('id', 'not-found-title')
  })

  it('should display current pathname in error message', () => {
    renderNotFound()

    const message = screen.getByText(/We couldn't find/)
    expect(message).toBeInTheDocument()
    expect(message).toHaveClass('not-found-message')
    
    const pathCode = screen.getByText('/unknown-path')
    expect(pathCode).toBeInTheDocument()
    expect(pathCode.tagName).toBe('CODE')
  })

  it('should render return home link', () => {
    renderNotFound()

    const homeLink = screen.getByRole('link', { name: 'Return home' })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
    expect(homeLink).toHaveClass('btn', 'btn-primary')
  })

  it('should render go back button', () => {
    renderNotFound()

    const backButton = screen.getByRole('button', { name: 'Go back' })
    expect(backButton).toBeInTheDocument()
    expect(backButton).toHaveClass('btn')
  })

  it('should handle go back button click', async () => {
    const user = userEvent.setup()
    renderNotFound()

    const backButton = screen.getByRole('button', { name: 'Go back' })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('should log 404 error to console', () => {
    renderNotFound()

    expect(console.warn).toHaveBeenCalledWith('404 — route not found:', '/unknown-path')
  })

  it('should set document title on mount', () => {
    renderNotFound()

    expect(document.title).toBe('404 — Page not found')
  })

  it('should restore original title on unmount', () => {
    const { unmount } = renderNotFound()

    expect(document.title).toBe('404 — Page not found')

    unmount()

    expect(document.title).toBe(originalTitle)
  })

  it('should add robots meta tag on mount', () => {
    renderNotFound()

    const robotsMeta = document.head.querySelector('meta[name="robots"]')
    expect(robotsMeta).toBeInTheDocument()
    expect(robotsMeta).toHaveAttribute('content', 'noindex, follow')
  })

  it('should remove robots meta tag on unmount', () => {
    const { unmount } = renderNotFound()

    expect(document.head.querySelector('meta[name="robots"]')).toBeInTheDocument()

    unmount()

    expect(document.head.querySelector('meta[name="robots"]')).not.toBeInTheDocument()
  })

  it('should handle different pathnames', () => {
    // Mock different pathname
    vi.mocked(vi.importActual('react-router-dom')).then(actual => {
      vi.mocked(actual.useLocation).mockReturnValue({ pathname: '/different-path' })
    })

    renderNotFound()

    expect(console.warn).toHaveBeenCalledWith('404 — route not found:', '/unknown-path')
  })

  it('should have proper semantic structure', () => {
    renderNotFound()

    // Should have main landmark
    expect(screen.getByRole('main')).toBeInTheDocument()

    // Should have proper heading hierarchy
    const headings = screen.getAllByRole('heading')
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveProperty('tagName', 'H1')

    // Should have alert region
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should have proper action buttons layout', () => {
    renderNotFound()

    const actions = document.querySelector('.not-found-actions')
    expect(actions).toBeInTheDocument()

    const homeLink = screen.getByRole('link', { name: 'Return home' })
    const backButton = screen.getByRole('button', { name: 'Go back' })

    expect(actions).toContainElement(homeLink)
    expect(actions).toContainElement(backButton)
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    renderNotFound()

    // Tab to first interactive element (home link)
    await user.tab()
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveFocus()

    // Tab to second interactive element (back button)
    await user.tab()
    expect(screen.getByRole('button', { name: 'Go back' })).toHaveFocus()
  })

  it('should handle Enter key on back button', async () => {
    const user = userEvent.setup()
    renderNotFound()

    const backButton = screen.getByRole('button', { name: 'Go back' })
    backButton.focus()
    
    await user.keyboard('{Enter}')

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('should handle Space key on back button', async () => {
    const user = userEvent.setup()
    renderNotFound()

    const backButton = screen.getByRole('button', { name: 'Go back' })
    backButton.focus()
    
    await user.keyboard(' ')

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('should maintain accessibility when pathname changes', () => {
    const { rerender } = renderNotFound()

    // Verify initial state
    expect(screen.getByText('/unknown-path')).toBeInTheDocument()

    // Mock different pathname and rerender
    vi.mocked(vi.importActual('react-router-dom')).then(actual => {
      vi.mocked(actual.useLocation).mockReturnValue({ pathname: '/new-unknown-path' })
    })

    rerender(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    // Should still maintain proper accessibility
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should handle multiple mounts and unmounts correctly', () => {
    // First mount
    const { unmount: unmount1 } = renderNotFound()
    expect(document.title).toBe('404 — Page not found')
    expect(document.head.querySelector('meta[name="robots"]')).toBeInTheDocument()

    unmount1()
    expect(document.title).toBe(originalTitle)
    expect(document.head.querySelector('meta[name="robots"]')).not.toBeInTheDocument()

    // Second mount
    const { unmount: unmount2 } = renderNotFound()
    expect(document.title).toBe('404 — Page not found')
    expect(document.head.querySelector('meta[name="robots"]')).toBeInTheDocument()

    unmount2()
    expect(document.title).toBe(originalTitle)
    expect(document.head.querySelector('meta[name="robots"]')).not.toBeInTheDocument()
  })

  it('should handle edge case with empty pathname', () => {
    vi.mocked(vi.importActual('react-router-dom')).then(actual => {
      vi.mocked(actual.useLocation).mockReturnValue({ pathname: '' })
    })

    renderNotFound()

    expect(console.warn).toHaveBeenCalledWith('404 — route not found:', '/unknown-path')
  })

  it('should handle very long pathnames', () => {
    const longPath = '/very/long/path/that/might/cause/layout/issues/in/some/browsers/and/should/be/handled/gracefully'
    
    vi.mocked(vi.importActual('react-router-dom')).then(actual => {
      vi.mocked(actual.useLocation).mockReturnValue({ pathname: longPath })
    })

    renderNotFound()

    expect(console.warn).toHaveBeenCalledWith('404 — route not found:', '/unknown-path')
  })

  it('should not interfere with existing meta tags', () => {
    // Add existing meta tag
    const existingMeta = document.createElement('meta')
    existingMeta.name = 'description'
    existingMeta.content = 'Existing description'
    document.head.appendChild(existingMeta)

    const { unmount } = renderNotFound()

    // Should add robots meta without affecting existing ones
    expect(document.head.querySelector('meta[name="robots"]')).toBeInTheDocument()
    expect(document.head.querySelector('meta[name="description"]')).toBeInTheDocument()

    unmount()

    // Should only remove robots meta
    expect(document.head.querySelector('meta[name="robots"]')).not.toBeInTheDocument()
    expect(document.head.querySelector('meta[name="description"]')).toBeInTheDocument()
  })
})