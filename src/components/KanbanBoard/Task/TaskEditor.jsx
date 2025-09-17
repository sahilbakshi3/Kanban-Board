// components/KanbanBoard/Task/TaskEditor.jsx
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { PRIORITY_LEVELS, PRIORITY_CONFIG } from '../../../utils/constants.js';
import { toInputDateFormat } from '../../../utils/dateHelpers.js';
import { Input, TextArea, Select, Button } from '../../UI/index.js';

export const TaskEditor = ({ 
  task, 
  onSave, 
  onCancel,
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || PRIORITY_LEVELS.MEDIUM,
    assignee: task.assignee || '',
    dueDate: task.dueDate ? toInputDateFormat(task.dueDate) : ''
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.assignee && formData.assignee.length > 50) {
      newErrors.assignee = 'Assignee name must be less than 50 characters';
    }

    if (formData.dueDate) {
      const date = new Date(formData.dueDate);
      if (isNaN(date.getTime())) {
        newErrors.dueDate = 'Invalid date format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const priorityConfig = PRIORITY_CONFIG[formData.priority] || PRIORITY_CONFIG.medium;

  const editorClasses = `
    p-4 mb-3 bg-white rounded-lg shadow-sm border-l-4 
    ${priorityConfig.borderColor} ${priorityConfig.bgColor}
    ${className}
  `.trim();

  return (
    <div className={editorClasses} onKeyDown={handleKeyDown}>
      <div className="space-y-3">
        {/* Title */}
        <Input
          value={formData.title}
          onChange={handleChange('title')}
          placeholder="Task title"
          error={errors.title}
          required
          className="font-semibold"
          autoFocus
        />

        {/* Description */}
        <TextArea
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="Task description"
          rows={2}
          error={errors.description}
        />

        {/* Priority and Assignee Row */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={formData.priority}
            onChange={handleChange('priority')}
            options={priorityOptions}
            error={errors.priority}
          />
          
          <Input
            value={formData.assignee}
            onChange={handleChange('assignee')}
            placeholder="Assignee"
            error={errors.assignee}
          />
        </div>

        {/* Due Date */}
        <Input
          type="date"
          value={formData.dueDate}
          onChange={handleChange('dueDate')}
          error={errors.dueDate}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            variant="ghost"
            size="small"
            onClick={onCancel}
            className="p-2"
          >
            <X size={14} />
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleSave}
            className="p-2"
          >
            <Check size={14} />
          </Button>
        </div>
      </div>

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-500">
        Press Ctrl+Enter to save, Esc to cancel
      </div>
    </div>
  );
};