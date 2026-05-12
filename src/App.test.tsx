import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

// Mock the Board component
vi.mock('@/pages/Board', () => ({
  default: () => <div data-testid="board">Board Component</div>
}))

// Mock the NotFound component
vi.mock('@/pages/NotFound', () => ({
  default: () => <div data-testid="not-found">NotFound Component</div>
}))

describe('App', () => {
  it('should render Board component for root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByTestId('board')).toBeInTheDocument()
  })

  it('should render NotFound component for unknown paths', async () => {
    render(
      <MemoryRouter initialEntries={['/unknown-path']}>
        <App />
      </MemoryRouter>
    )

    // Wait for lazy component to load
    expect(await screen.findByTestId('not-found')).toBeInTheDocument()
  })

  it('should show loading fallback while lazy component loads', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-path']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('loading...')).toBeInTheDocument()
  })

  it('should handle multiple unknown paths', async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/path1']}>
        <App />
      </MemoryRouter>
    )

    expect(await screen.findByTestId('not-found')).toBeInTheDocument()

    rerender(
      <MemoryRouter initialEntries={['/path2']}>
        <App />
      </MemoryRouter>
    )

    expect(await screen.findByTestId('not-found')).toBeInTheDocument()
  })

  it('should navigate between routes', async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByTestId('board')).toBeInTheDocument()

    rerender(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>
    )

    expect(await screen.findByTestId('not-found')).toBeInTheDocument()
  })
})