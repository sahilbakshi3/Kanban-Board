// types/task.js
import { PRIORITY_LEVELS } from '../utils/constants.js';

/**
 * Task type definition and validation
 */
export class TaskType {
  constructor({
    id = '',
    title = '',
    description = '',
    priority = PRIORITY_LEVELS.MEDIUM,
    assignee = '',
    dueDate = '',
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.assignee = assignee;
    this.dueDate = dueDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Validate task data
   * @returns {object} Validation result with isValid and errors
   */
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (this.title && this.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    if (this.description && this.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    if (this.priority && !Object.values(PRIORITY_LEVELS).includes(this.priority)) {
      errors.push('Invalid priority level');
    }

    if (this.assignee && this.assignee.length > 50) {
      errors.push('Assignee name must be less than 50 characters');
    }

    if (this.dueDate) {
      const date = new Date(this.dueDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid due date format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object
   * @returns {object} Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      assignee: this.assignee,
      dueDate: this.dueDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create from plain object
   * @param {object} data - Plain object data
   * @returns {TaskType} New TaskType instance
   */
  static fromObject(data) {
    return new TaskType(data);
  }

  /**
   * Update task properties
   * @param {object} updates - Properties to update
   * @returns {TaskType} Updated TaskType instance
   */
  update(updates) {
    const updatedTask = new TaskType({
      ...this.toObject(),
      ...updates,
      updatedAt: new Date().toISOString()
    });

    const validation = updatedTask.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid task data: ${validation.errors.join(', ')}`);
    }

    return updatedTask;
  }

  /**
   * Check if task is overdue
   * @returns {boolean} Whether task is overdue
   */
  isOverdue() {
    if (!this.dueDate) return false;
    
    const dueDate = new Date(this.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }

  /**
   * Check if task is due today
   * @returns {boolean} Whether task is due today
   */
  isDueToday() {
    if (!this.dueDate) return false;
    
    const dueDate = new Date(this.dueDate);
    const today = new Date();
    
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Clone task with new ID
   * @returns {TaskType} Cloned task
   */
  clone() {
    return new TaskType({
      ...this.toObject(),
      id: '', // Will be assigned new ID when added to board
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}

/**
 * Task factory functions
 */
export const TaskFactory = {
  /**
   * Create new empty task
   * @returns {TaskType} Empty task
   */
  createEmpty() {
    return new TaskType();
  },

  /**
   * Create task from form data
   * @param {object} formData - Form data
   * @returns {TaskType} New task
   */
  createFromForm(formData) {
    return new TaskType({
      title: formData.title || '',
      description: formData.description || '',
      priority: formData.priority || PRIORITY_LEVELS.MEDIUM,
      assignee: formData.assignee || '',
      dueDate: formData.dueDate || ''
    });
  }
};