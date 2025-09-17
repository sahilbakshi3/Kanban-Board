// components/KanbanBoard/Modals/AddTaskModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Input, TextArea, Select, Button } from '../../UI/index.js';
import { PRIORITY_LEVELS, PRIORITY_CONFIG, DEFAULT_VALUES } from '../../../utils/constants.js';

export const AddTaskModal = ({ 
  isOpen, 
  onClose, 
  onAddTask, 
  columnId,
  columnTitle = ''
}) => {
  const [formData, setFormData] = useState(DEFAULT_VALUES.TASK);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(DEFAULT_VALUES.TASK);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const priorityOptions = Object.values(PRIORITY_LEVELS).map(level => ({
    value: level,
    label: PRIORITY_CONFIG[level].label
  }));

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Assignee validation
    if (formData.assignee && formData.assignee.length > 50) {
      newErrors.assignee = 'Assignee name must be less than 50 characters';
    }

    // Due date validation
    if (formData.dueDate) {
      const date = new Date(formData.dueDate);
      if (isNaN(date.getTime())) {
        newErrors.dueDate = 'Invalid date format';
      } else if (date < new Date().setHours(0, 0, 0, 0)) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      await onAddTask?.(columnId, formData);
      onClose();
    } catch (error) {
      console.error('Error adding task:', error);
      setErrors({ submit: error.message || 'Failed to add task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add New Task${columnTitle ? ` to ${columnTitle}` : ''}`}
      size="medium"
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        {/* Title */}
        <Input
          label="Task Title"
          value={formData.title}
          onChange={handleChange('title')}
          placeholder="Enter task title"
          error={errors.title}
          required
          autoFocus
        />

        {/* Description */}
        <TextArea
          label="Description"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="Enter task description (optional)"
          rows={3}
          error={errors.description}
        />

        {/* Priority and Assignee Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={formData.priority}
            onChange={handleChange('priority')}
            options={priorityOptions}
            error={errors.priority}
          />
          
          <Input
            label="Assignee"
            value={formData.assignee}
            onChange={handleChange('assignee')}
            placeholder="Enter assignee name (optional)"
            error={errors.assignee}
          />
        </div>

        {/* Due Date */}
        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={handleChange('dueDate')}
          error={errors.dueDate}
          min={new Date().toISOString().split('T')[0]}
        />

        {/* Submit Error */}
        {errors.submit && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {errors.submit}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </Button>
        </div>

        {/* Help text */}
        <div className="text-xs text-gray-500 text-center">
          Press Ctrl+Enter to save quickly
        </div>
      </div>
    </Modal>
  );
};