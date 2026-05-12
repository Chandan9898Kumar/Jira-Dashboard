import { describe, it, expect } from 'vitest'
import { COLUMNS, ASSIGNEES, PRIORITY_LABEL } from './types'
import type { ColumnId, Priority, IssueType, Task } from './types'

describe('schema/types', () => {
  describe('COLUMNS', () => {
    it('should have correct column structure', () => {
      expect(COLUMNS).toHaveLength(4)
      expect(COLUMNS).toEqual([
        { id: 'todo', name: 'To Do' },
        { id: 'inprogress', name: 'In Progress' },
        { id: 'review', name: 'In Review' },
        { id: 'done', name: 'Done' }
      ])
    })

    it('should have unique column IDs', () => {
      const ids = COLUMNS.map(col => col.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(COLUMNS.length)
    })

    it('should have non-empty names', () => {
      COLUMNS.forEach(col => {
        expect(col.name).toBeTruthy()
        expect(col.name.length).toBeGreaterThan(0)
      })
    })
  })

  describe('ASSIGNEES', () => {
    it('should have correct assignees list', () => {
      expect(ASSIGNEES).toEqual([
        'Alex Kim',
        'Priya Shah', 
        'Jordan Lee',
        'Sam Chen',
        'Riley Park'
      ])
    })

    it('should have 5 assignees', () => {
      expect(ASSIGNEES).toHaveLength(5)
    })

    it('should have unique assignees', () => {
      const uniqueAssignees = new Set(ASSIGNEES)
      expect(uniqueAssignees.size).toBe(ASSIGNEES.length)
    })

    it('should have non-empty assignee names', () => {
      ASSIGNEES.forEach(assignee => {
        expect(assignee).toBeTruthy()
        expect(assignee.length).toBeGreaterThan(0)
      })
    })
  })

  describe('PRIORITY_LABEL', () => {
    it('should have correct priority labels', () => {
      expect(PRIORITY_LABEL).toEqual({
        highest: '↑↑',
        high: '↑',
        medium: '=',
        low: '↓',
        lowest: '↓↓'
      })
    })

    it('should have labels for all priority levels', () => {
      const priorities: Priority[] = ['highest', 'high', 'medium', 'low', 'lowest']
      priorities.forEach(priority => {
        expect(PRIORITY_LABEL[priority]).toBeDefined()
        expect(PRIORITY_LABEL[priority]).toBeTruthy()
      })
    })

    it('should have string labels', () => {
      Object.values(PRIORITY_LABEL).forEach(label => {
        expect(typeof label).toBe('string')
      })
    })
  })

  describe('Type definitions', () => {
    it('should accept valid ColumnId values', () => {
      const validColumns: ColumnId[] = ['todo', 'inprogress', 'review', 'done']
      validColumns.forEach(col => {
        expect(COLUMNS.some(c => c.id === col)).toBe(true)
      })
    })

    it('should accept valid Priority values', () => {
      const validPriorities: Priority[] = ['highest', 'high', 'medium', 'low', 'lowest']
      validPriorities.forEach(priority => {
        expect(Object.keys(PRIORITY_LABEL)).toContain(priority)
      })
    })

    it('should accept valid IssueType values', () => {
      const validTypes: IssueType[] = ['task', 'bug', 'story']
      // This test ensures the types are properly defined
      validTypes.forEach(type => {
        expect(['task', 'bug', 'story']).toContain(type)
      })
    })

    it('should define Task interface correctly', () => {
      const mockTask: Task = {
        id: 'test-id',
        key: 'PRJ-1',
        title: 'Test Task',
        description: 'Test description',
        priority: 'medium',
        type: 'task',
        assignee: 'Alex Kim',
        column: 'todo'
      }

      expect(mockTask.id).toBe('test-id')
      expect(mockTask.key).toBe('PRJ-1')
      expect(mockTask.title).toBe('Test Task')
      expect(mockTask.description).toBe('Test description')
      expect(mockTask.priority).toBe('medium')
      expect(mockTask.type).toBe('task')
      expect(mockTask.assignee).toBe('Alex Kim')
      expect(mockTask.column).toBe('todo')
    })

    it('should allow optional description in Task', () => {
      const taskWithoutDescription: Task = {
        id: 'test-id',
        key: 'PRJ-1',
        title: 'Test Task',
        priority: 'medium',
        type: 'task',
        assignee: 'Alex Kim',
        column: 'todo'
      }

      expect(taskWithoutDescription.description).toBeUndefined()
    })
  })
})