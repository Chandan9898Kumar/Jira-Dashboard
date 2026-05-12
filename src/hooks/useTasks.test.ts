import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTasks } from './useTasks'
import { STORAGE_KEY } from '../utils'
import type { Task } from '@/schema/types'

const mockTasks: Task[] = [
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
]

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('initialization', () => {
    it('should initialize with seed data when localStorage is empty', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      
      const { result } = renderHook(() => useTasks())
      
      expect(result.current.tasks).toHaveLength(7)
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY)
    })

    it('should initialize with data from localStorage when available', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockTasks))
      
      const { result } = renderHook(() => useTasks())
      
      expect(result.current.tasks).toEqual(mockTasks)
    })

    it('should fallback to seed data when localStorage contains invalid JSON', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid json')
      
      const { result } = renderHook(() => useTasks())
      
      expect(result.current.tasks).toHaveLength(7)
    })

    it('should initialize filters with default values', () => {
      const { result } = renderHook(() => useTasks())
      
      expect(result.current.filters).toEqual({
        search: '',
        assignee: 'all',
        priority: 'all'
      })
    })

    it('should initialize announcement as empty string', () => {
      const { result } = renderHook(() => useTasks())
      
      expect(result.current.announcement).toBe('')
    })
  })

  describe('persistence', () => {
    it('should save tasks to localStorage when tasks change', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockTasks))
      
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.saveTask({
          title: 'New Task',
          priority: 'low',
          type: 'story',
          assignee: 'Jordan Lee',
          column: 'todo'
        })
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('New Task')
      )
    })
  })

  describe('filtering', () => {
    beforeEach(() => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockTasks))
    })

    it('should filter by search term in title', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.setFilters({
          search: 'Task 1',
          assignee: 'all',
          priority: 'all'
        })
      })

      expect(result.current.visibleTasks).toHaveLength(1)
      expect(result.current.visibleTasks[0].title).toBe('Test Task 1')
    })

    it('should filter by search term in key', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.setFilters({
          search: 'PRJ-2',
          assignee: 'all',
          priority: 'all'
        })
      })

      expect(result.current.visibleTasks).toHaveLength(1)
      expect(result.current.visibleTasks[0].key).toBe('PRJ-2')
    })

    it('should filter by assignee', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.setFilters({
          search: '',
          assignee: 'Alex Kim',
          priority: 'all'
        })
      })

      expect(result.current.visibleTasks).toHaveLength(1)
      expect(result.current.visibleTasks[0].assignee).toBe('Alex Kim')
    })

    it('should filter by priority', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.setFilters({
          search: '',
          assignee: 'all',
          priority: 'high'
        })
      })

      expect(result.current.visibleTasks).toHaveLength(1)
      expect(result.current.visibleTasks[0].priority).toBe('high')
    })

    it('should apply multiple filters', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.setFilters({
          search: 'Task',
          assignee: 'Alex Kim',
          priority: 'high'
        })
      })

      expect(result.current.visibleTasks).toHaveLength(1)
      expect(result.current.visibleTasks[0].title).toBe('Test Task 1')
    })

    it('should handle case insensitive search', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.setFilters({
          search: 'test task',
          assignee: 'all',
          priority: 'all'
        })
      })

      expect(result.current.visibleTasks).toHaveLength(2)
    })

    it('should return empty array when no matches', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.setFilters({
          search: 'nonexistent',
          assignee: 'all',
          priority: 'all'
        })
      })

      expect(result.current.visibleTasks).toHaveLength(0)
    })
  })

  describe('saveTask', () => {
    beforeEach(() => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockTasks))
    })

    it('should create new task when no id provided', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.saveTask({
          title: 'New Task',
          priority: 'low',
          type: 'story',
          assignee: 'Jordan Lee',
          column: 'todo'
        })
      })

      expect(result.current.tasks).toHaveLength(3)
      const newTask = result.current.tasks.find(t => t.title === 'New Task')
      expect(newTask).toBeDefined()
      expect(newTask?.key).toBe('PRJ-3')
      expect(result.current.announcement).toContain('New Task created')
    })

    it('should update existing task when id provided', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.saveTask({
          id: '1',
          title: 'Updated Task',
          priority: 'highest',
          type: 'bug',
          assignee: 'Sam Chen',
          column: 'done'
        })
      })

      expect(result.current.tasks).toHaveLength(2)
      const updatedTask = result.current.tasks.find(t => t.id === '1')
      expect(updatedTask?.title).toBe('Updated Task')
      expect(updatedTask?.priority).toBe('highest')
      expect(updatedTask?.key).toBe('PRJ-1') // Key should be preserved
      expect(result.current.announcement).toContain('Updated Task updated')
    })
  })

  describe('deleteTask', () => {
    beforeEach(() => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockTasks))
    })

    it('should remove task by id', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.deleteTask('1')
      })

      expect(result.current.tasks).toHaveLength(1)
      expect(result.current.tasks.find(t => t.id === '1')).toBeUndefined()
      expect(result.current.announcement).toContain('Test Task 1 deleted')
    })

    it('should handle deleting non-existent task', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.deleteTask('nonexistent')
      })

      expect(result.current.tasks).toHaveLength(2)
    })
  })

  describe('moveTask', () => {
    beforeEach(() => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockTasks))
    })

    it('should move task to different column', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.moveTask('1', 'done')
      })

      const movedTask = result.current.tasks.find(t => t.id === '1')
      expect(movedTask?.column).toBe('done')
      expect(result.current.announcement).toContain('Test Task 1')
      expect(result.current.announcement).toContain('Done')
    })

    it('should not announce when moving to same column', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.moveTask('1', 'todo')
      })

      expect(result.current.announcement).toBe('')
    })

    it('should handle moving non-existent task', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.moveTask('nonexistent', 'done')
      })

      expect(result.current.tasks).toEqual(mockTasks)
    })
  })

  describe('reorderTask', () => {
    beforeEach(() => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockTasks))
    })

    it('should not reorder when dragged and target are same', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.reorderTask('1', '1', 'todo')
      })

      expect(result.current.tasks).toEqual(mockTasks)
    })

    it('should handle non-existent dragged task', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.reorderTask('nonexistent', '2', 'todo')
      })

      expect(result.current.tasks).toEqual(mockTasks)
    })

    it('should handle non-existent target task', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.reorderTask('1', 'nonexistent', 'todo')
      })

      expect(result.current.tasks).toEqual(mockTasks)
    })

    it('should reorder tasks within same column (drag down)', () => {
      const tasksInSameColumn = [
        { ...mockTasks[0], column: 'todo' as const },
        { ...mockTasks[1], column: 'todo' as const, id: '3', key: 'PRJ-3' }
      ]
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(tasksInSameColumn))
      
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.reorderTask('1', '3', 'todo')
      })

      expect(result.current.tasks[1].id).toBe('1')
      expect(result.current.announcement).toContain('Reordered')
    })

    it('should reorder tasks within same column (drag up)', () => {
      const tasksInSameColumn = [
        { ...mockTasks[0], column: 'todo' as const },
        { ...mockTasks[1], column: 'todo' as const, id: '3', key: 'PRJ-3' }
      ]
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(tasksInSameColumn))
      
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.reorderTask('3', '1', 'todo')
      })

      expect(result.current.tasks[0].id).toBe('3')
      expect(result.current.announcement).toContain('Reordered')
    })

    it('should move task to different column and reorder', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.reorderTask('1', '2', 'inprogress')
      })

      const movedTask = result.current.tasks.find(t => t.id === '1')
      expect(movedTask?.column).toBe('inprogress')
      expect(result.current.announcement).toContain('Moved')
      expect(result.current.announcement).toContain('In Progress')
    })
  })

  describe('setAnnouncement', () => {
    it('should update announcement', () => {
      const { result } = renderHook(() => useTasks())
      
      act(() => {
        result.current.setAnnouncement('Test announcement')
      })

      expect(result.current.announcement).toBe('Test announcement')
    })
  })
})