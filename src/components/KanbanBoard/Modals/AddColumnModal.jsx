// components/KanbanBoard/Modals/AddColumnModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../UI/index.js';
import { COLUMN_COLORS, DEFAULT_VALUES } from '../../../utils/constants.js';

export const AddColumnModal = ({ 
  isOpen, 
  onClose, 
  onAddColumn 
}) => {
  const [formData, setFormData] = useState(DEFAULT_VALUES.COLUMN);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(DEFAULT_VALUES.COLUMN);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleColorSelect = (colorValue) => {
    setFormData(prev => ({ ...prev, color: colorValue }));
    if (errors.color) {
      setErrors(prev => ({ ...prev, color: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Column title is required';
    } else if (formData.title.length > 50) {
      newErrors.title = 'Title must be less than 50 characters';
    }

    // Color validation
    if (!COLUMN_COLORS.some(c => c.value === formData.color)) {
      newErrors.color = 'Please select a valid color';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      await onAddColumn?.(formData);
      onClose();
    } catch (error) {
      console.error('Error adding column:', error);
      setErrors({ submit: error.message || 'Failed to add column' });
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
      title="Add New Column"
      size="medium"
    >
      <div className="space-y-6" onKeyDown={handleKeyDown}>
        {/* Column Title */}
        <Input
          label="Column Title"
          value={formData.title}
          onChange={handleChange('title')}
          placeholder="Enter column title (e.g., To Do, In Progress, Done)"
          error={errors.title}
          required
          autoFocus
        />

        {/* Color Selection */}
        <div className="space-y-3">
          <div className="block text-sm font-medium text-gray-700">
            Column Color
            <span className="text-red-500 ml-1">*</span>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {COLUMN_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleColorSelect(color.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105
                  ${formData.color === color.value 
                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className={`w-full h-6 rounded-md ${color.preview} mb-2`} />
                <div className="text-xs font-medium text-gray-700">
                  {color.label}
                </div>
              </button>
            ))}
          </div>
          
          {errors.color && (
            <p className="text-sm text-red-600">{errors.color}</p>
          )}
        </div>

        {/* Preview */}
        {formData.title && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Preview</div>
            <div className={`${formData.color} rounded-lg p-3 border-l-4 border-gray-400`}>
              <div className="bg-white rounded p-2 shadow-sm">
                <div className="font-semibold text-gray-800">{formData.title}</div>
                <div className="text-xs text-gray-500 mt-1">0 tasks</div>
              </div>
            </div>
          </div>
        )}

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
            {isSubmitting ? 'Adding...' : 'Add Column'}
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