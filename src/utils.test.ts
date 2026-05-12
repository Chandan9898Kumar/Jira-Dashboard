import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initials, colorFor, seedTasks, nextTaskKey, typeGlyph, STORAGE_KEY } from './utils'
import type { Task } from '@/schema/types'

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('STORAGE_KEY', () => {
    it('should have correct storage key', () => {
      expect(STORAGE_KEY).toBe('jira-dashboard-tasks-v1')
    })
  })

  describe('initials', () => {
    it('should return initials for single name', () => {
      expect(initials('John')).toBe('J')
    })

    it('should return initials for full name', () => {
      expect(initials('John Doe')).toBe('JD')
    })

    it('should return first two initials for multiple names', () => {
      expect(initials('John Michael Doe Smith')).toBe('JM')
    })

    it('should handle empty string', () => {
      expect(initials('')).toBe('')
    })

    it('should handle single character names', () => {
      expect(initials('A B')).toBe('AB')
    })

    it('should convert to uppercase', () => {
      expect(initials('john doe')).toBe('JD')
    })
  })

  describe('colorFor', () => {
    it('should return consistent color for same name', () => {
      const color1 = colorFor('John Doe')
      const color2 = colorFor('John Doe')
      expect(color1).toBe(color2)
    })

    it('should return different colors for different names', () => {
      const color1 = colorFor('John Doe')
      const color2 = colorFor('Jane Smith')
      expect(color1).not.toBe(color2)
    })

    it('should return valid hex color', () => {
      const color = colorFor('Test User')
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('should handle empty string', () => {
      const color = colorFor('')
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('should return color from predefined palette', () => {
      const validColors = ['#0052cc', '#00875a', '#de350b', '#5243aa', '#ff8b00']
      const color = colorFor('Test')
      expect(validColors).toContain(color)
    })
  })

  describe('seedTasks', () => {
    it('should return array of 7 tasks', () => {
      const tasks = seedTasks()
      expect(tasks).toHaveLength(7)
    })

    it('should return tasks with required properties', () => {
      const tasks = seedTasks()
      tasks.forEach(task => {
        expect(task).toHaveProperty('id')
        expect(task).toHaveProperty('key')
        expect(task).toHaveProperty('title')
        expect(task).toHaveProperty('priority')
        expect(task).toHaveProperty('type')
        expect(task).toHaveProperty('assignee')
        expect(task).toHaveProperty('column')
      })
    })

    it('should have unique IDs for all tasks', () => {
      const tasks = seedTasks()
      const ids = tasks.map(t => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(tasks.length)
    })

    it('should have sequential keys starting with PRJ-', () => {
      const tasks = seedTasks()
      const keys = tasks.map(t => t.key).sort()
      expect(keys).toEqual(['PRJ-1', 'PRJ-2', 'PRJ-3', 'PRJ-4', 'PRJ-5', 'PRJ-6', 'PRJ-7'])
    })

    it('should have valid priority values', () => {
      const tasks = seedTasks()
      const validPriorities = ['highest', 'high', 'medium', 'low', 'lowest']
      tasks.forEach(task => {
        expect(validPriorities).toContain(task.priority)
      })
    })

    it('should have valid type values', () => {
      const tasks = seedTasks()
      const validTypes = ['task', 'bug', 'story']
      tasks.forEach(task => {
        expect(validTypes).toContain(task.type)
      })
    })

    it('should have valid column values', () => {
      const tasks = seedTasks()
      const validColumns = ['todo', 'inprogress', 'review', 'done']
      tasks.forEach(task => {
        expect(validColumns).toContain(task.column)
      })
    })
  })

  describe('nextTaskKey', () => {
    it('should return PRJ-1 for empty array', () => {
      expect(nextTaskKey([])).toBe('PRJ-1')
    })

    it('should return next sequential key', () => {
      const tasks: Task[] = [
        { id: '1', key: 'PRJ-1', title: 'Test', priority: 'medium', type: 'task', assignee: 'John', column: 'todo' },
        { id: '2', key: 'PRJ-3', title: 'Test', priority: 'medium', type: 'task', assignee: 'John', column: 'todo' }
      ]
      expect(nextTaskKey(tasks)).toBe('PRJ-4')
    })

    it('should handle non-sequential keys', () => {
      const tasks: Task[] = [
        { id: '1', key: 'PRJ-1', title: 'Test', priority: 'medium', type: 'task', assignee: 'John', column: 'todo' },
        { id: '2', key: 'PRJ-10', title: 'Test', priority: 'medium', type: 'task', assignee: 'John', column: 'todo' }
      ]
      expect(nextTaskKey(tasks)).toBe('PRJ-11')
    })

    it('should handle invalid key formats', () => {
      const tasks: Task[] = [
        { id: '1', key: 'INVALID', title: 'Test', priority: 'medium', type: 'task', assignee: 'John', column: 'todo' },
        { id: '2', key: 'PRJ-5', title: 'Test', priority: 'medium', type: 'task', assignee: 'John', column: 'todo' }
      ]
      expect(nextTaskKey(tasks)).toBe('PRJ-6')
    })

    it('should handle empty key parts', () => {
      const tasks: Task[] = [
        { id: '1', key: 'PRJ-', title: 'Test', priority: 'medium', type: 'task', assignee: 'John', column: 'todo' }
      ]
      expect(nextTaskKey(tasks)).toBe('PRJ-1')
    })
  })

  describe('typeGlyph', () => {
    it('should return correct glyph for task', () => {
      expect(typeGlyph('task')).toBe('✓')
    })

    it('should return correct glyph for bug', () => {
      expect(typeGlyph('bug')).toBe('!')
    })

    it('should return correct glyph for story', () => {
      expect(typeGlyph('story')).toBe('★')
    })
  })
})