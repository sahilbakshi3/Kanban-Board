// components/KanbanBoard/Column/Column.jsx
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Task } from '../Task/Task.jsx';
import { Button, Badge, Input } from '../../UI/index.js';
import { COLUMN_HEADER_COLORS } from '../../../utils/constants.js';

export const Column = ({ 
  column, 
  tasks = [], 
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragStart,
  isDraggedOver = false,
  draggedTaskId = null,
  className = ''
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [titleError, setTitleError] = useState('');

  const getHeaderColor = () => {
    const lowerTitle = column.title.toLowerCase();
    return COLUMN_HEADER_COLORS[lowerTitle] || COLUMN_HEADER_COLORS.default;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onDrop?.(taskId, column.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver?.(column.id);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      onDragLeave?.();
    }
  };

  const handleSaveTitle = () => {
    const trimmedTitle = editTitle.trim();
    
    if (!trimmedTitle) {
      setTitleError('Column title is required');
      return;
    }

    if (trimmedTitle.length > 50) {
      setTitleError('Title must be less than 50 characters');
      return;
    }

    onEditColumn?.(column.id, { ...column, title: trimmedTitle });
    setIsEditingTitle(false);
    setTitleError('');
  };

  const handleCancelEdit = () => {
    setEditTitle(column.title);
    setIsEditingTitle(false);
    setTitleError('');
  };

  const handleDeleteColumn = () => {
    const hasTasksMessage = tasks.length > 0 
      ? 'This column contains tasks. Deleting it will also delete all tasks in this column. Are you sure?'
      : 'Are you sure you want to delete this column?';

    if (window.confirm(hasTasksMessage)) {
      onDeleteColumn?.(column.id);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const columnClasses = `
    ${column.color} rounded-lg p-4 min-h-screen w-80 flex-shrink-0 transition-all duration-200
    ${className}
  `.trim();

  const dropZoneClasses = `
    min-h-96 transition-all duration-200 rounded-lg p-2
    ${isDraggedOver ? 'bg-white bg-opacity-70 border-2 border-dashed border-blue-400' : ''}
  `.trim();

  return (
    <div className={columnClasses}>
      {/* Column Header */}
      <div className={`border-t-4 ${getHeaderColor()} bg-white rounded-lg p-4 mb-4 shadow-sm group`}>
        {/* Title Section */}
        <div className="flex items-center justify-between mb-3">
          {isEditingTitle ? (
            <div className="flex items-center space-x-2 flex-1">
              <div className="flex-1">
                <Input
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    if (titleError) setTitleError('');
                  }}
                  onKeyDown={handleKeyDown}
                  error={titleError}
                  className="font-bold text-lg"
                  autoFocus
                />
              </div>
              <Button
                variant="ghost"
                size="small"
                onClick={handleCancelEdit}
                className="p-1"
              >
                <X size={16} />
              </Button>
              <Button
                variant="ghost"
                size="small"
                onClick={handleSaveTitle}
                className="p-1 text-green-600 hover:text-green-700"
              >
                <Check size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <h2 
                className="font-bold text-gray-800 text-lg cursor-pointer hover:text-blue-600 transition-colors truncate"
                onClick={() => setIsEditingTitle(true)}
                title={column.title}
              >
                {column.title}
              </h2>
              <Button
                variant="ghost"
                size="small"
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
              >
                <Edit2 size={14} />
              </Button>
            </div>
          )}
          
          {/* Column Stats and Actions */}
          {!isEditingTitle && (
            <div className="flex items-center space-x-2">
              <Badge variant="default" size="small">
                {tasks.length}
              </Badge>
              <Button
                variant="ghost"
                size="small"
                onClick={handleDeleteColumn}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          )}
        </div>
        
        {/* Add Task Button */}
        <Button 
          variant="ghost"
          size="small"
          onClick={() => onAddTask?.(column.id)}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors w-full justify-start"
        >
          <Plus size={16} className="mr-2" />
          Add task
        </Button>
      </div>

      {/* Tasks Drop Zone */}
      <div
        className={dropZoneClasses}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Tasks */}
        {tasks.map((task) => (
          <Task 
            key={task.id} 
            task={task} 
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onDragStart={onDragStart}
            isDragging={draggedTaskId === task.id}
          />
        ))}
        
        {/* Drop Indicator */}
        {isDraggedOver && (
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-4 mb-3 bg-blue-50 text-center text-gray-500 transition-all duration-200">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Drop task here</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && !isDraggedOver && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-sm">No tasks yet</div>
            <Button 
              variant="ghost"
              size="small"
              onClick={() => onAddTask?.(column.id)}
              className="mt-2 text-xs"
            >
              <Plus size={12} className="mr-1" />
              Add your first task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};