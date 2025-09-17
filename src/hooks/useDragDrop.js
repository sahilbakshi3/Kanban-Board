// hooks/useDragDrop.js
import { useState, useCallback } from 'react';
import { DRAG_TYPES } from '../utils/constants.js';

/**
 * Custom hook for managing drag and drop state and operations
 * @returns {object} Drag and drop utilities
 */
export const useDragDrop = () => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverTarget, setDraggedOverTarget] = useState(null);
  const [dragType, setDragType] = useState(null);

  /**
   * Handle drag start
   * @param {string} itemId - ID of item being dragged
   * @param {string} type - Type of item (task/column)
   */
  const handleDragStart = useCallback((itemId, type = DRAG_TYPES.TASK) => {
    setDraggedItem(itemId);
    setDragType(type);
  }, []);

  /**
   * Handle drag over target
   * @param {string} targetId - ID of drop target
   */
  const handleDragOver = useCallback((targetId) => {
    setDraggedOverTarget(targetId);
  }, []);

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback(() => {
    setDraggedOverTarget(null);
  }, []);

  /**
   * Handle drop and cleanup
   * @param {function} onDrop - Callback function to handle the drop
   * @param {string} itemId - ID of dropped item
   * @param {string} targetId - ID of drop target
   */
  const handleDrop = useCallback((onDrop, itemId, targetId) => {
    if (onDrop && typeof onDrop === 'function') {
      onDrop(itemId, targetId, dragType);
    }
    
    // Cleanup drag state
    setDraggedItem(null);
    setDraggedOverTarget(null);
    setDragType(null);
  }, [dragType]);

  /**
   * Reset all drag state
   */
  const resetDragState = useCallback(() => {
    setDraggedItem(null);
    setDraggedOverTarget(null);
    setDragType(null);
  }, []);

  /**
   * Check if item is being dragged
   * @param {string} itemId - Item ID to check
   * @returns {boolean} Whether item is being dragged
   */
  const isDragging = useCallback((itemId) => {
    return draggedItem === itemId;
  }, [draggedItem]);

  /**
   * Check if target is being dragged over
   * @param {string} targetId - Target ID to check
   * @returns {boolean} Whether target is being dragged over
   */
  const isDraggedOver = useCallback((targetId) => {
    return draggedOverTarget === targetId;
  }, [draggedOverTarget]);

  return {
    // State
    draggedItem,
    draggedOverTarget,
    dragType,
    
    // Actions
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState,
    
    // Utilities
    isDragging,
    isDraggedOver
  };
};

/**
 * Custom hook for HTML5 drag and drop events
 * @param {object} options - Configuration options
 * @returns {object} Event handlers and utilities
 */
export const useHTML5DragDrop = (options = {}) => {
  const {
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    dragType = DRAG_TYPES.TASK,
    transferFormat = 'text/plain'
  } = options;

  /**
   * Create drag start event handler
   * @param {string} itemId - ID of item to drag
   * @returns {function} Event handler
   */
  const createDragStartHandler = useCallback((itemId) => {
    return (event) => {
      event.dataTransfer.setData(transferFormat, itemId);
      event.dataTransfer.effectAllowed = 'move';
      
      if (onDragStart) {
        onDragStart(itemId, dragType);
      }
    };
  }, [onDragStart, dragType, transferFormat]);

  /**
   * Create drag end event handler
   * @returns {function} Event handler
   */
  const createDragEndHandler = useCallback(() => {
    return (event) => {
      if (onDragEnd) {
        onDragEnd();
      }
    };
  }, [onDragEnd]);

  /**
   * Create drag over event handler
   * @param {string} targetId - ID of drop target
   * @returns {function} Event handler
   */
  const createDragOverHandler = useCallback((targetId) => {
    return (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      
      if (onDragOver) {
        onDragOver(targetId);
      }
    };
  }, [onDragOver]);

  /**
   * Create drag leave event handler
   * @param {string} targetId - ID of drop target
   * @returns {function} Event handler
   */
  const createDragLeaveHandler = useCallback((targetId) => {
    return (event) => {
      // Only trigger if actually leaving the target (not entering child)
      if (!event.currentTarget.contains(event.relatedTarget)) {
        if (onDragLeave) {
          onDragLeave(targetId);
        }
      }
    };
  }, [onDragLeave]);

  /**
   * Create drop event handler
   * @param {string} targetId - ID of drop target
   * @returns {function} Event handler
   */
  const createDropHandler = useCallback((targetId) => {
    return (event) => {
      event.preventDefault();
      
      const itemId = event.dataTransfer.getData(transferFormat);
      if (itemId && onDrop) {
        onDrop(itemId, targetId);
      }
    };
  }, [onDrop, transferFormat]);

  return {
    createDragStartHandler,
    createDragEndHandler,
    createDragOverHandler,
    createDragLeaveHandler,
    createDropHandler
  };
};

/**
 * Hook for managing drag and drop with validation
 * @param {object} validation - Validation functions
 * @returns {object} Enhanced drag drop utilities
 */
export const useValidatedDragDrop = (validation = {}) => {
  const baseDragDrop = useDragDrop();
  
  const {
    canDrag = () => true,
    canDrop = () => true,
    onInvalidDrop = () => {}
  } = validation;

  /**
   * Enhanced drag start with validation
   */
  const handleDragStart = useCallback((itemId, type) => {
    if (canDrag(itemId, type)) {
      baseDragDrop.handleDragStart(itemId, type);
    }
  }, [baseDragDrop.handleDragStart, canDrag]);

  /**
   * Enhanced drop with validation
   */
  const handleDrop = useCallback((onDrop, itemId, targetId) => {
    if (canDrop(itemId, targetId, baseDragDrop.dragType)) {
      baseDragDrop.handleDrop(onDrop, itemId, targetId);
    } else {
      onInvalidDrop(itemId, targetId, baseDragDrop.dragType);
      baseDragDrop.resetDragState();
    }
  }, [baseDragDrop, canDrop, onInvalidDrop]);

  return {
    ...baseDragDrop,
    handleDragStart,
    handleDrop
  };
};