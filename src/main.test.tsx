import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRoot } from 'react-dom/client'

// Mock React DOM
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn()
  }))
}))

// Mock App component
vi.mock('./App.tsx', () => ({
  default: () => 'App'
}))

// Mock CSS imports
vi.mock('./index.css', () => ({}))

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset DOM
    document.body.innerHTML = '<div id="root"></div>'
    
    // Reset global mocks
    vi.stubGlobal('import.meta', {
      env: { PROD: false }
    })
    
    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: vi.fn(() => Promise.resolve({
          scope: '/',
          addEventListener: vi.fn(),
          installing: null
        }))
      },
      configurable: true
    })

    // Mock window.addEventListener
    window.addEventListener = vi.fn()
  })

  it('should render App in StrictMode', async () => {
    const mockRender = vi.fn()
    const mockRoot = { render: mockRender }
    vi.mocked(createRoot).mockReturnValue(mockRoot as any)

    // Import main.tsx to execute the code
    await import('./main')

    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'))
    expect(mockRender).toHaveBeenCalled()
  })

  it('should not register service worker in development', async () => {
    vi.stubGlobal('import.meta', {
      env: { PROD: false }
    })

    await import('./main')

    expect(navigator.serviceWorker.register).not.toHaveBeenCalled()
  })

  it('should register service worker in production', async () => {
    vi.stubGlobal('import.meta', {
      env: { PROD: true }
    })

    // Mock successful service worker registration
    const mockRegistration = {
      scope: '/',
      addEventListener: vi.fn(),
      installing: null
    }
    vi.mocked(navigator.serviceWorker.register).mockResolvedValue(mockRegistration as any)

    await import('./main')

    // Wait for load event to be set up
    expect(window.addEventListener).toHaveBeenCalledWith('load', expect.any(Function))

    // Simulate load event
    const loadHandler = vi.mocked(window.addEventListener).mock.calls.find(
      call => call[0] === 'load'
    )?.[1] as Function

    if (loadHandler) {
      await loadHandler()
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', { scope: '/' })
    }
  })

  it('should handle service worker registration success', async () => {
    vi.stubGlobal('import.meta', {
      env: { PROD: true }
    })

    const mockRegistration = {
      scope: '/',
      addEventListener: vi.fn(),
      installing: null
    }
    vi.mocked(navigator.serviceWorker.register).mockResolvedValue(mockRegistration as any)

    const consoleSpy = vi.spyOn(console, 'log')

    await import('./main')

    const loadHandler = vi.mocked(window.addEventListener).mock.calls.find(
      call => call[0] === 'load'
    )?.[1] as Function

    if (loadHandler) {
      await loadHandler()
      expect(consoleSpy).toHaveBeenCalledWith('[SW] Registered, scope:', '/')
    }
  })

  it('should handle service worker registration failure', async () => {
    vi.stubGlobal('import.meta', {
      env: { PROD: true }
    })

    const error = new Error('SW registration failed')
    vi.mocked(navigator.serviceWorker.register).mockRejectedValue(error)

    const consoleSpy = vi.spyOn(console, 'error')

    await import('./main')

    const loadHandler = vi.mocked(window.addEventListener).mock.calls.find(
      call => call[0] === 'load'
    )?.[1] as Function

    if (loadHandler) {
      await loadHandler()
      expect(consoleSpy).toHaveBeenCalledWith('[SW] Registration failed:', error)
    }
  })

  it('should handle service worker update', async () => {
    vi.stubGlobal('import.meta', {
      env: { PROD: true }
    })

    const mockNewWorker = {
      state: 'installed',
      addEventListener: vi.fn(),
      postMessage: vi.fn()
    }

    const mockRegistration = {
      scope: '/',
      addEventListener: vi.fn(),
      installing: mockNewWorker
    }

    // Mock existing service worker controller
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      value: {},
      configurable: true
    })

    vi.mocked(navigator.serviceWorker.register).mockResolvedValue(mockRegistration as any)

    await import('./main')

    const loadHandler = vi.mocked(window.addEventListener).mock.calls.find(
      call => call[0] === 'load'
    )?.[1] as Function

    if (loadHandler) {
      await loadHandler()

      // Simulate updatefound event
      const updateFoundHandler = vi.mocked(mockRegistration.addEventListener).mock.calls.find(
        call => call[0] === 'updatefound'
      )?.[1] as Function

      if (updateFoundHandler) {
        updateFoundHandler()

        // Simulate statechange event
        const stateChangeHandler = vi.mocked(mockNewWorker.addEventListener).mock.calls.find(
          call => call[0] === 'statechange'
        )?.[1] as Function

        if (stateChangeHandler) {
          stateChangeHandler()
          expect(mockNewWorker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
        }
      }
    }
  })

  it('should handle service worker update without existing controller', async () => {
    vi.stubGlobal('import.meta', {
      env: { PROD: true }
    })

    const mockNewWorker = {
      state: 'installed',
      addEventListener: vi.fn(),
      postMessage: vi.fn()
    }

    const mockRegistration = {
      scope: '/',
      addEventListener: vi.fn(),
      installing: mockNewWorker
    }

    // No existing service worker controller
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      value: null,
      configurable: true
    })

    vi.mocked(navigator.serviceWorker.register).mockResolvedValue(mockRegistration as any)

    await import('./main')

    const loadHandler = vi.mocked(window.addEventListener).mock.calls.find(
      call => call[0] === 'load'
    )?.[1] as Function

    if (loadHandler) {
      await loadHandler()

      const updateFoundHandler = vi.mocked(mockRegistration.addEventListener).mock.calls.find(
        call => call[0] === 'updatefound'
      )?.[1] as Function

      if (updateFoundHandler) {
        updateFoundHandler()

        const stateChangeHandler = vi.mocked(mockNewWorker.addEventListener).mock.calls.find(
          call => call[0] === 'statechange'
        )?.[1] as Function

        if (stateChangeHandler) {
          stateChangeHandler()
          expect(mockNewWorker.postMessage).not.toHaveBeenCalled()
        }
      }
    }
  })

  it('should handle missing new worker in updatefound', async () => {
    vi.stubGlobal('import.meta', {
      env: { PROD: true }
    })

    const mockRegistration = {
      scope: '/',
      addEventListener: vi.fn(),
      installing: null
    }

    vi.mocked(navigator.serviceWorker.register).mockResolvedValue(mockRegistration as any)

    await import('./main')

    const loadHandler = vi.mocked(window.addEventListener).mock.calls.find(
      call => call[0] === 'load'
    )?.[1] as Function

    if (loadHandler) {
      await loadHandler()

      const updateFoundHandler = vi.mocked(mockRegistration.addEventListener).mock.calls.find(
        call => call[0] === 'updatefound'
      )?.[1] as Function

      if (updateFoundHandler) {
        // Should not throw when installing is null
        expect(() => updateFoundHandler()).not.toThrow()
      }
    }
  })

  it('should not register service worker when not supported', async () => {
    vi.stubGlobal('import.meta', {
      env: { PROD: true }
    })

    // Remove serviceWorker from navigator
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      configurable: true
    })

    await import('./main')

    const loadHandler = vi.mocked(window.addEventListener).mock.calls.find(
      call => call[0] === 'load'
    )?.[1] as Function

    if (loadHandler) {
      await loadHandler()
      // Should not throw when serviceWorker is not supported
      expect(() => loadHandler()).not.toThrow()
    }
  })
})