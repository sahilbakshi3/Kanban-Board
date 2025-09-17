// hooks/useKanban.js
import { useState, useCallback, useEffect } from 'react';
import { generateTaskId, generateColumnId } from '../utils/idGenerator.js';
import { TaskType, TaskFactory } from '../types/task.js';
import { ColumnType, ColumnFactory } from '../types/column.js';
import { useKanbanStorage } from './useLocalStorage.js';
import { MESSAGES } from '../utils/constants.js';

/**
 * Main hook for managing Kanban board state and operations
 * @param {object} options - Configuration options
 * @returns {object} Kanban board utilities and state
 */
export const useKanban = (options = {}) => {
  const { autoSave = true } = options;
  
  // Storage hook for persistence
  const [persistedData, saveToPersistence, clearPersistence] = useKanbanStorage();
  
  // Local state
  const [boardData, setBoardData] = useState(() => ({
    tasks: persistedData.tasks || {},
    columns: persistedData.columns || {},
    columnOrder: persistedData.columnOrder || [],
    lastModified: persistedData.lastModified || new Date().toISOString()
  }));

  // Auto-save effect
  useEffect(() => {
    if (autoSave) {
      const timeoutId = setTimeout(() => {
        saveToPersistence(boardData);
      }, 1000); // Debounce auto-save by 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [boardData, autoSave, saveToPersistence]);

  /**
   * Update board data and trigger re-render
   * @param {function} updater - State updater function
   */
  const updateBoardData = useCallback((updater) => {
    setBoardData(prevData => {
      const newData = updater(prevData);
      return {
        ...newData,
        lastModified: new Date().toISOString()
      };
    });
  }, []);

  // =============================================================================
  // TASK OPERATIONS
  // =============================================================================

  /**
   * Add new task to column
   * @param {string} columnId - Target column ID
   * @param {object} taskData - Task data
   * @returns {string} New task ID
   */
  const addTask = useCallback((columnId, taskData) => {
    const taskId = generateTaskId();
    const task = TaskFactory.createFromForm({ ...taskData, id: taskId });
    
    const validation = task.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    updateBoardData(prevData => {
      const column = prevData.columns[columnId];
      if (!column) {
        throw new Error(`Column ${columnId} not found`);
      }

      return {
        ...prevData,
        tasks: {
          ...prevData.tasks,
          [taskId]: task.toObject()
        },
        columns: {
          ...prevData.columns,
          [columnId]: {
            ...column,
            taskIds: [...column.taskIds, taskId],
            updatedAt: new Date().toISOString()
          }
        }
      };
    });

    return taskId;
  }, [updateBoardData]);

  /**
   * Update existing task
   * @param {string} taskId - Task ID to update
   * @param {object} updates - Updates to apply
   */
  const updateTask = useCallback((taskId, updates) => {
    updateBoardData(prevData => {
      const existingTask = prevData.tasks[taskId];
      if (!existingTask) {
        throw new Error(`Task ${taskId} not found`);
      }

      const task = TaskType.fromObject(existingTask);
      const updatedTask = task.update(updates);

      return {
        ...prevData,
        tasks: {
          ...prevData.tasks,
          [taskId]: updatedTask.toObject()
        }
      };
    });
  }, [updateBoardData]);

  /**
   * Delete task
   * @param {string} taskId - Task ID to delete
   * @returns {boolean} Success status
   */
  const deleteTask = useCallback((taskId) => {
    if (!window.confirm(MESSAGES.CONFIRM_DELETE_TASK)) {
      return false;
    }

    updateBoardData(prevData => {
      // Find which column contains this task
      let sourceColumnId = null;
      for (const [columnId, column] of Object.entries(prevData.columns)) {
        if (column.taskIds?.includes(taskId)) {
          sourceColumnId = columnId;
          break;
        }
      }

      if (!sourceColumnId) {
        throw new Error(`Task ${taskId} not found in any column`);
      }

      // Remove task from tasks and column
      const newTasks = { ...prevData.tasks };
      delete newTasks[taskId];

      const sourceColumn = prevData.columns[sourceColumnId];
      const newTaskIds = sourceColumn.taskIds.filter(id => id !== taskId);

      return {
        ...prevData,
        tasks: newTasks,
        columns: {
          ...prevData.columns,
          [sourceColumnId]: {
            ...sourceColumn,
            taskIds: newTaskIds,
            updatedAt: new Date().toISOString()
          }
        }
      };
    });

    return true;
  }, [updateBoardData]);

  /**
   * Move task between columns
   * @param {string} taskId - Task ID to move
   * @param {string} targetColumnId - Target column ID
   */
  const moveTask = useCallback((taskId, targetColumnId) => {
    updateBoardData(prevData => {
      // Find source column
      let sourceColumnId = null;
      for (const [columnId, column] of Object.entries(prevData.columns)) {
        if (column.taskIds?.includes(taskId)) {
          sourceColumnId = columnId;
          break;
        }
      }

      if (!sourceColumnId) {
        throw new Error(`Task ${taskId} not found`);
      }

      if (sourceColumnId === targetColumnId) {
        return prevData; // No change needed
      }

      const sourceColumn = prevData.columns[sourceColumnId];
      const targetColumn = prevData.columns[targetColumnId];

      if (!targetColumn) {
        throw new Error(`Target column ${targetColumnId} not found`);
      }

      // Remove from source, add to target
      const newSourceTaskIds = sourceColumn.taskIds.filter(id => id !== taskId);
      const newTargetTaskIds = [...targetColumn.taskIds, taskId];

      return {
        ...prevData,
        columns: {
          ...prevData.columns,
          [sourceColumnId]: {
            ...sourceColumn,
            taskIds: newSourceTaskIds,
            updatedAt: new Date().toISOString()
          },
          [targetColumnId]: {
            ...targetColumn,
            taskIds: newTargetTaskIds,
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
  }, [updateBoardData]);

  // =============================================================================
  // COLUMN OPERATIONS
  // =============================================================================

  /**
   * Add new column
   * @param {object} columnData - Column data
   * @returns {string} New column ID
   */
  const addColumn = useCallback((columnData) => {
    const columnId = generateColumnId();
    const column = ColumnFactory.createFromForm({ 
      ...columnData, 
      id: columnId,
      order: boardData.columnOrder.length
    });
    
    const validation = column.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    updateBoardData(prevData => ({
      ...prevData,
      columns: {
        ...prevData.columns,
        [columnId]: column.toObject()
      },
      columnOrder: [...prevData.columnOrder, columnId]
    }));

    return columnId;
  }, [updateBoardData, boardData.columnOrder.length]);

  /**
   * Update existing column
   * @param {string} columnId - Column ID to update
   * @param {object} updates - Updates to apply
   */
  const updateColumn = useCallback((columnId, updates) => {
    updateBoardData(prevData => {
      const existingColumn = prevData.columns[columnId];
      if (!existingColumn) {
        throw new Error(`Column ${columnId} not found`);
      }

      const column = ColumnType.fromObject(existingColumn);
      const updatedColumn = column.update(updates);

      return {
        ...prevData,
        columns: {
          ...prevData.columns,
          [columnId]: updatedColumn.toObject()
        }
      };
    });
  }, [updateBoardData]);

  /**
   * Delete column
   * @param {string} columnId - Column ID to delete
   * @returns {boolean} Success status
   */
  const deleteColumn = useCallback((columnId) => {
    const column = boardData.columns[columnId];
    if (!column) {
      throw new Error(`Column ${columnId} not found`);
    }

    const hasTasksMessage = column.taskIds?.length > 0 
      ? MESSAGES.CONFIRM_DELETE_COLUMN_WITH_TASKS 
      : MESSAGES.CONFIRM_DELETE_COLUMN;

    if (!window.confirm(hasTasksMessage)) {
      return false;
    }

    updateBoardData(prevData => {
      // Remove tasks in this column
      const newTasks = { ...prevData.tasks };
      column.taskIds?.forEach(taskId => {
        delete newTasks[taskId];
      });

      // Remove column
      const newColumns = { ...prevData.columns };
      delete newColumns[columnId];

      // Remove from column order
      const newColumnOrder = prevData.columnOrder.filter(id => id !== columnId);

      return {
        ...prevData,
        tasks: newTasks,
        columns: newColumns,
        columnOrder: newColumnOrder
      };
    });

    return true;
  }, [updateBoardData, boardData.columns]);

  /**
   * Reorder columns
   * @param {string[]} newColumnOrder - New column order array
   */
  const reorderColumns = useCallback((newColumnOrder) => {
    updateBoardData(prevData => ({
      ...prevData,
      columnOrder: newColumnOrder
    }));
  }, [updateBoardData]);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   * @returns {object|null} Task object or null
   */
  const getTask = useCallback((taskId) => {
    return boardData.tasks[taskId] || null;
  }, [boardData.tasks]);

  /**
   * Get column by ID
   * @param {string} columnId - Column ID
   * @returns {object|null} Column object or null
   */
  const getColumn = useCallback((columnId) => {
    return boardData.columns[columnId] || null;
  }, [boardData.columns]);

  /**
   * Get tasks for a specific column
   * @param {string} columnId - Column ID
   * @returns {object[]} Array of task objects
   */
  const getTasksForColumn = useCallback((columnId) => {
    const column = boardData.columns[columnId];
    if (!column) return [];
    
    return (column.taskIds || [])
      .map(taskId => boardData.tasks[taskId])
      .filter(Boolean);
  }, [boardData.tasks, boardData.columns]);

  /**
   * Get board statistics
   * @returns {object} Board stats
   */
  const getBoardStats = useCallback(() => {
    const totalTasks = Object.keys(boardData.tasks).length;
    const totalColumns = Object.keys(boardData.columns).length;
    
    const tasksByPriority = Object.values(boardData.tasks).reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    const overdueTasks = Object.values(boardData.tasks).filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date();
    }).length;

    return {
      totalTasks,
      totalColumns,
      tasksByPriority,
      overdueTasks,
      lastModified: boardData.lastModified
    };
  }, [boardData]);

  /**
   * Clear all board data
   */
  const clearBoard = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all board data? This cannot be undone.')) {
      updateBoardData(() => ({
        tasks: {},
        columns: {},
        columnOrder: [],
        lastModified: new Date().toISOString()
      }));
      clearPersistence();
    }
  }, [updateBoardData, clearPersistence]);

  /**
   * Import board data
   * @param {object} importData - Data to import
   */
  const importBoardData = useCallback((importData) => {
    if (!importData || !importData.tasks || !importData.columns) {
      throw new Error('Invalid import data structure');
    }

    updateBoardData(() => ({
      ...importData,
      lastModified: new Date().toISOString()
    }));
  }, [updateBoardData]);

  return {
    // State
    boardData,
    
    // Task operations
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    
    // Column operations
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    
    // Utilities
    getTask,
    getColumn,
    getTasksForColumn,
    getBoardStats,
    clearBoard,
    importBoardData,
    
    // Manual persistence control
    saveToStorage: () => saveToPersistence(boardData),
    loadFromStorage: () => {
      setBoardData(persistedData);
    }
  };
};