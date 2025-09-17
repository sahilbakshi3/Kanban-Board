// types/column.js
import { COLUMN_COLORS } from '../utils/constants.js';

/**
 * Column type definition and validation
 */
export class ColumnType {
  constructor({
    id = '',
    title = '',
    color = 'bg-gray-100',
    taskIds = [],
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
    order = 0
  } = {}) {
    this.id = id;
    this.title = title;
    this.color = color;
    this.taskIds = Array.isArray(taskIds) ? [...taskIds] : [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.order = order;
  }

  /**
   * Validate column data
   * @returns {object} Validation result with isValid and errors
   */
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (this.title && this.title.length > 50) {
      errors.push('Title must be less than 50 characters');
    }

    if (this.color && !COLUMN_COLORS.some(c => c.value === this.color)) {
      errors.push('Invalid column color');
    }

    if (!Array.isArray(this.taskIds)) {
      errors.push('TaskIds must be an array');
    }

    if (this.taskIds.length > 100) {
      errors.push('Column cannot contain more than 100 tasks');
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
      color: this.color,
      taskIds: [...this.taskIds],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      order: this.order
    };
  }

  /**
   * Create from plain object
   * @param {object} data - Plain object data
   * @returns {ColumnType} New ColumnType instance
   */
  static fromObject(data) {
    return new ColumnType(data);
  }

  /**
   * Update column properties
   * @param {object} updates - Properties to update
   * @returns {ColumnType} Updated ColumnType instance
   */
  update(updates) {
    const updatedColumn = new ColumnType({
      ...this.toObject(),
      ...updates,
      updatedAt: new Date().toISOString()
    });

    const validation = updatedColumn.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid column data: ${validation.errors.join(', ')}`);
    }

    return updatedColumn;
  }

  /**
   * Add task to column
   * @param {string} taskId - Task ID to add
   * @returns {ColumnType} Updated column
   */
  addTask(taskId) {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('Task ID must be a valid string');
    }

    if (this.taskIds.includes(taskId)) {
      return this; // Task already exists
    }

    return this.update({
      taskIds: [...this.taskIds, taskId]
    });
  }

  /**
   * Remove task from column
   * @param {string} taskId - Task ID to remove
   * @returns {ColumnType} Updated column
   */
  removeTask(taskId) {
    return this.update({
      taskIds: this.taskIds.filter(id => id !== taskId)
    });
  }

  /**
   * Move task within column
   * @param {string} taskId - Task ID to move
   * @param {number} newIndex - New position
   * @returns {ColumnType} Updated column
   */
  moveTask(taskId, newIndex) {
    if (!this.taskIds.includes(taskId)) {
      throw new Error('Task not found in column');
    }

    const currentIndex = this.taskIds.indexOf(taskId);
    const newTaskIds = [...this.taskIds];
    
    // Remove from current position
    newTaskIds.splice(currentIndex, 1);
    
    // Insert at new position
    newTaskIds.splice(newIndex, 0, taskId);

    return this.update({
      taskIds: newTaskIds
    });
  }

  /**
   * Get task count
   * @returns {number} Number of tasks in column
   */
  getTaskCount() {
    return this.taskIds.length;
  }

  /**
   * Check if column is empty
   * @returns {boolean} Whether column has no tasks
   */
  isEmpty() {
    return this.taskIds.length === 0;
  }

  /**
   * Get column header color based on title
   * @returns {string} CSS class for header color
   */
  getHeaderColor() {
    const lowerTitle = this.title.toLowerCase();
    
    const colorMap = {
      'to do': 'border-t-slate-500',
      'in progress': 'border-t-blue-500',
      'review': 'border-t-yellow-500',
      'done': 'border-t-green-500',
      'testing': 'border-t-purple-500',
      'blocked': 'border-t-red-500'
    };

    return colorMap[lowerTitle] || 'border-t-gray-500';
  }

  /**
   * Clone column with new ID
   * @returns {ColumnType} Cloned column
   */
  clone() {
    return new ColumnType({
      ...this.toObject(),
      id: '', // Will be assigned new ID when added to board
      taskIds: [], // Start with empty tasks
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}

/**
 * Column factory functions
 */
export const ColumnFactory = {
  /**
   * Create new empty column
   * @returns {ColumnType} Empty column
   */
  createEmpty() {
    return new ColumnType();
  },

  /**
   * Create column from form data
   * @param {object} formData - Form data
   * @returns {ColumnType} New column
   */
  createFromForm(formData) {
    return new ColumnType({
      title: formData.title || '',
      color: formData.color || 'bg-gray-100'
    });
  },

  /**
   * Create default columns set
   * @returns {ColumnType[]} Array of default columns
   */
  createDefaultSet() {
    return [
      new ColumnType({
        title: 'To Do',
        color: 'bg-slate-100'
      }),
      new ColumnType({
        title: 'In Progress',
        color: 'bg-blue-50'
      }),
      new ColumnType({
        title: 'Review',
        color: 'bg-yellow-50'
      }),
      new ColumnType({
        title: 'Done',
        color: 'bg-green-50'
      })
    ];
  }
};