// components/KanbanBoard/Task/Task.jsx
import React, { useState } from 'react';
import { Edit2, Trash2, User, Calendar, GripVertical } from 'lucide-react';
import { PRIORITY_CONFIG } from '../../../utils/constants.js';
import { formatDateShort, isOverdue, isDueToday } from '../../../utils/dateHelpers.js';
import { Badge } from '../../UI/index.js';
import { TaskEditor } from './TaskEditor.jsx';

export const Task = ({ 
  task, 
  onEdit, 
  onDelete, 
  onDragStart, 
  isDragging = false,
  className = '' 
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(task.id);
  };

  const handleEdit = (updatedData) => {
    onEdit?.(task.id, updatedData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete?.(task.id);
    }
  };

  const getDueDateStyle = () => {
    if (!task.dueDate) return '';
    
    if (isOverdue(task.dueDate)) {
      return 'text-red-600 font-semibold';
    } else if (isDueToday(task.dueDate)) {
      return 'text-orange-600 font-semibold';
    }
    return 'text-gray-500';
  };

  if (isEditing) {
    return (
      <TaskEditor
        task={task}
        onSave={handleEdit}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const taskClasses = `
    p-4 mb-3 bg-white rounded-lg shadow-sm border-l-4 transition-all duration-200 
    hover:shadow-md cursor-move group
    ${priorityConfig.borderColor} ${priorityConfig.bgColor}
    ${isDragging ? 'opacity-50 transform rotate-2 scale-105 shadow-lg' : 'hover:scale-102'}
    ${className}
  `.trim();

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={taskClasses}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center flex-1 min-w-0">
          <GripVertical 
            size={14} 
            className="text-gray-400 mr-2 flex-shrink-0" 
          />
          <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
            {task.title}
          </h3>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
            title="Edit task"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded"
            title="Delete task"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      
      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 ml-6">
          {task.description}
        </p>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between ml-6">
        {/* Priority Badge */}
        <Badge 
          variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}
          size="small"
        >
          {task.priority}
        </Badge>
        
        {/* Assignee and Due Date */}
        <div className="flex items-center space-x-2 text-xs">
          {task.assignee && (
            <div className="flex items-center text-gray-500">
              <User size={12} className="mr-1" />
              <span className="truncate max-w-16" title={task.assignee}>
                {task.assignee.split(' ')[0]}
              </span>
            </div>
          )}
          
          {task.dueDate && (
            <div className={`flex items-center ${getDueDateStyle()}`}>
              <Calendar size={12} className="mr-1" />
              <span title={task.dueDate}>
                {formatDateShort(task.dueDate)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Overdue indicator */}
      {task.dueDate && isOverdue(task.dueDate) && (
        <div className="mt-2 ml-6">
          <Badge variant="danger" size="small">
            Overdue
          </Badge>
        </div>
      )}
      
      {/* Due today indicator */}
      {task.dueDate && isDueToday(task.dueDate) && !isOverdue(task.dueDate) && (
        <div className="mt-2 ml-6">
          <Badge variant="warning" size="small">
            Due Today
          </Badge>
        </div>
      )}
    </div>
  );
};