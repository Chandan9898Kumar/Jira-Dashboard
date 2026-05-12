import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDragAndDrop } from './useDragAndDrop'
import type { Task } from '@/schema/types'

const mockTask: Task = {
  id: 'task-1',
  key: 'PRJ-1',
  title: 'Test Task',
  priority: 'medium',
  type: 'task',
  assignee: 'Alex Kim',
  column: 'todo'
}

const mockTasks: Task[] = [
  mockTask,
  {
    id: 'task-2',
    key: 'PRJ-2',
    title: 'Test Task 2',
    priority: 'high',
    type: 'bug',
    assignee: 'Priya Shah',
    column: 'todo'
  }
]

const mockParams = {
  moveTask: vi.fn(),
  reorderTask: vi.fn(),
  setAnnouncement: vi.fn(),
  openEdit: vi.fn(),
  tasks: mockTasks
}

describe('useDragAndDrop', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with null dragOver', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      expect(result.current.dragOver).toBeNull()
    })

    it('should initialize with null keyboardSelected', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      expect(result.current.keyboardSelected).toBeNull()
    })
  })

  describe('pointer drag and drop', () => {
    it('should handle onDragStart', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const mockEvent = {
        dataTransfer: {
          setData: vi.fn(),
          effectAllowed: ''
        },
        currentTarget: {
          classList: {
            add: vi.fn()
          }
        }
      } as any

      act(() => {
        result.current.onDragStart(mockEvent, 'task-1')
      })

      expect(mockEvent.dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'task-1')
      expect(mockEvent.dataTransfer.effectAllowed).toBe('move')
      expect(mockEvent.currentTarget.classList.add).toHaveBeenCalledWith('dragging')
    })

    it('should handle onDragEnd', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const mockEvent = {
        currentTarget: {
          classList: {
            remove: vi.fn()
          }
        }
      } as any

      act(() => {
        result.current.onDragEnd(mockEvent)
      })

      expect(mockEvent.currentTarget.classList.remove).toHaveBeenCalledWith('dragging')
      expect(result.current.dragOver).toBeNull()
    })

    it('should handle onDragOver', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { dropEffect: '' }
      } as any

      act(() => {
        result.current.onDragOver(mockEvent, 'inprogress')
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.dataTransfer.dropEffect).toBe('move')
      expect(result.current.dragOver).toBe('inprogress')
    })

    it('should not update dragOver if same column', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      // Set initial dragOver
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { dropEffect: '' }
      } as any

      act(() => {
        result.current.onDragOver(mockEvent, 'inprogress')
      })

      expect(result.current.dragOver).toBe('inprogress')

      // Try to set same column again
      act(() => {
        result.current.onDragOver(mockEvent, 'inprogress')
      })

      expect(result.current.dragOver).toBe('inprogress')
    })

    it('should handle onDragLeave', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      act(() => {
        result.current.onDragLeave()
      })

      expect(result.current.dragOver).toBeNull()
    })

    it('should handle onDrop', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          getData: vi.fn().mockReturnValue('task-1')
        }
      } as any

      act(() => {
        result.current.onDrop(mockEvent, 'done')
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockParams.moveTask).toHaveBeenCalledWith('task-1', 'done')
      expect(result.current.dragOver).toBeNull()
    })

    it('should handle onDrop with empty data', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          getData: vi.fn().mockReturnValue('')
        }
      } as any

      act(() => {
        result.current.onDrop(mockEvent, 'done')
      })

      expect(mockParams.moveTask).not.toHaveBeenCalled()
    })

    it('should handle onCardDragOver', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { dropEffect: '' }
      } as any

      act(() => {
        result.current.onCardDragOver(mockEvent)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
      expect(mockEvent.dataTransfer.dropEffect).toBe('move')
    })

    it('should handle onCardDrop', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          getData: vi.fn().mockReturnValue('task-1')
        }
      } as any

      act(() => {
        result.current.onCardDrop(mockEvent, mockTask)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
      expect(mockParams.reorderTask).toHaveBeenCalledWith('task-1', 'task-1', 'todo')
      expect(result.current.dragOver).toBeNull()
    })

    it('should handle onCardDrop with same task', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          getData: vi.fn().mockReturnValue('task-1')
        }
      } as any

      act(() => {
        result.current.onCardDrop(mockEvent, mockTask)
      })

      expect(mockParams.reorderTask).not.toHaveBeenCalled()
    })

    it('should handle onCardDrop with empty data', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          getData: vi.fn().mockReturnValue('')
        }
      } as any

      act(() => {
        result.current.onCardDrop(mockEvent, mockTask)
      })

      expect(mockParams.reorderTask).not.toHaveBeenCalled()
    })
  })

  describe('keyboard interactions', () => {
    it('should handle Enter key to open edit', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(mockEvent, mockTask)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockParams.openEdit).toHaveBeenCalledWith(mockTask)
    })

    it('should handle Space key to pick up task', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const mockEvent = {
        key: ' ',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(mockEvent, mockTask)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(result.current.keyboardSelected).toBe('task-1')
      expect(mockParams.setAnnouncement).toHaveBeenCalledWith(
        expect.stringContaining('Picked up Test Task')
      )
    })

    it('should handle Space key to drop task', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      // First pick up the task
      const mockEvent = {
        key: ' ',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(mockEvent, mockTask)
      })

      // Then drop it
      act(() => {
        result.current.onCardKeyDown(mockEvent, mockTask)
      })

      expect(result.current.keyboardSelected).toBeNull()
      expect(mockParams.setAnnouncement).toHaveBeenLastCalledWith(
        expect.stringContaining('Dropped Test Task')
      )
    })

    it('should handle Escape key to cancel', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      // First pick up the task
      const spaceEvent = {
        key: ' ',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(spaceEvent, mockTask)
      })

      // Then cancel with Escape
      const escapeEvent = {
        key: 'Escape',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(escapeEvent, mockTask)
      })

      expect(result.current.keyboardSelected).toBeNull()
      expect(mockParams.setAnnouncement).toHaveBeenLastCalledWith('Cancelled move.')
    })

    it('should handle ArrowRight to move task right', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      // First pick up the task
      const spaceEvent = {
        key: ' ',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(spaceEvent, mockTask)
      })

      // Then move right
      const arrowEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(arrowEvent, mockTask)
      })

      expect(mockParams.moveTask).toHaveBeenCalledWith('task-1', 'inprogress')
    })

    it('should handle ArrowLeft to move task left', () => {
      const taskInProgress = { ...mockTask, column: 'inprogress' as const }
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      // First pick up the task
      const spaceEvent = {
        key: ' ',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(spaceEvent, taskInProgress)
      })

      // Then move left
      const arrowEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(arrowEvent, taskInProgress)
      })

      expect(mockParams.moveTask).toHaveBeenCalledWith('task-1', 'todo')
    })

    it('should not move beyond leftmost column', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      // First pick up the task (already in todo)
      const spaceEvent = {
        key: ' ',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(spaceEvent, mockTask)
      })

      // Try to move left from todo
      const arrowEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(arrowEvent, mockTask)
      })

      expect(mockParams.moveTask).not.toHaveBeenCalled()
    })

    it('should not move beyond rightmost column', () => {
      const taskDone = { ...mockTask, column: 'done' as const }
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      // First pick up the task
      const spaceEvent = {
        key: ' ',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(spaceEvent, taskDone)
      })

      // Try to move right from done
      const arrowEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(arrowEvent, taskDone)
      })

      expect(mockParams.moveTask).not.toHaveBeenCalled()
    })

    it('should handle ArrowDown to reorder within column', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      // First pick up the task
      const spaceEvent = {
        key: ' ',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(spaceEvent, mockTask)
      })

      // Then move down
      const arrowEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(arrowEvent, mockTask)
      })

      expect(mockParams.reorderTask).toHaveBeenCalledWith('task-1', 'task-2', 'todo')
    })

    it('should handle ArrowUp to reorder within column', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      // Pick up the second task
      const spaceEvent = {
        key: ' ',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(spaceEvent, mockTasks[1])
      })

      // Then move up
      const arrowEvent = {
        key: 'ArrowUp',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(arrowEvent, mockTasks[1])
      })

      expect(mockParams.reorderTask).toHaveBeenCalledWith('task-2', 'task-1', 'todo')
    })

    it('should not reorder when no neighbour exists', () => {
      const singleTaskParams = {
        ...mockParams,
        tasks: [mockTask]
      }
      const { result } = renderHook(() => useDragAndDrop(singleTaskParams))
      
      // First pick up the task
      const spaceEvent = {
        key: ' ',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(spaceEvent, mockTask)
      })

      // Try to move down (no neighbour)
      const arrowEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(arrowEvent, mockTask)
      })

      expect(mockParams.reorderTask).not.toHaveBeenCalled()
    })

    it('should ignore keys when task not picked up', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const arrowEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(arrowEvent, mockTask)
      })

      expect(mockParams.moveTask).not.toHaveBeenCalled()
    })

    it('should ignore Escape when no task picked up', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const escapeEvent = {
        key: 'Escape',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(escapeEvent, mockTask)
      })

      expect(mockParams.setAnnouncement).not.toHaveBeenCalled()
    })

    it('should ignore other keys', () => {
      const { result } = renderHook(() => useDragAndDrop(mockParams))
      
      const otherEvent = {
        key: 'Tab',
        preventDefault: vi.fn()
      } as any

      act(() => {
        result.current.onCardKeyDown(otherEvent, mockTask)
      })

      expect(mockParams.moveTask).not.toHaveBeenCalled()
      expect(mockParams.openEdit).not.toHaveBeenCalled()
    })
  })
})