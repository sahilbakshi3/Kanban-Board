// components/KanbanBoard/index.jsx
import React, { useState } from 'react';
import { Plus, Download, Upload, Trash2 } from 'lucide-react';
import { Column } from './Column/Column.jsx';
import { AddTaskModal } from './Modals/AddTaskModal.jsx';
import { AddColumnModal } from './Modals/AddColumnModal.jsx';
import { Button, LoadingSpinner } from '../UI/index.js';
import { useKanban } from '../../hooks/useKanban.js';
import { useDragDrop } from '../../hooks/useDragDrop.js';
import { StorageService, ImportExportService } from '../../services/storage.js';

export const KanbanBoard = ({ className = '' }) => {
  // Kanban state management
  const {
    boardData,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    updateColumn,
    deleteColumn,
    getBoardStats,
    clearBoard,
    importBoardData,
    saveToStorage
  } = useKanban({ autoSave: true });

  // Drag and drop state
  const {
    draggedItem: draggedTaskId,
    draggedOverTarget: draggedOverColumn,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragging,
    isDraggedOver
  } = useDragDrop();

  // Modal state
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Get board statistics
  const stats = getBoardStats();

  // Drag and drop handlers
  const handleTaskDragStart = (taskId) => {
    handleDragStart(taskId, 'task');
  };

  const handleTaskDrop = (taskId, targetColumnId) => {
    handleDrop((taskId, targetColumnId) => {
      moveTask(taskId, targetColumnId);
    }, taskId, targetColumnId);
  };

  // Modal handlers
  const openAddTaskModal = (columnId) => {
    setSelectedColumnId(columnId);
    setIsAddTaskModalOpen(true);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setSelectedColumnId(null);
  };

  const openAddColumnModal = () => {
    setIsAddColumnModalOpen(true);
  };

  const closeAddColumnModal = () => {
    setIsAddColumnModalOpen(false);
  };

  // CRUD handlers
  const handleAddTask = async (columnId, taskData) => {
    try {
      await addTask(columnId, taskData);
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  };

  const handleEditTask = async (taskId, updatedData) => {
    try {
      await updateTask(taskId, updatedData);
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const handleAddColumn = async (columnData) => {
    try {
      await addColumn(columnData);
    } catch (error) {
      console.error('Failed to add column:', error);
      throw error;
    }
  };

  const handleEditColumn = async (columnId, updatedData) => {
    try {
      await updateColumn(columnId, updatedData);
    } catch (error) {
      console.error('Failed to update column:', error);
      throw error;
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      await deleteColumn(columnId);
    } catch (error) {
      console.error('Failed to delete column:', error);
      throw error;
    }
  };

  // Import/Export handlers
  const handleExport = () => {
    try {
      const filename = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
      ImportExportService.downloadAsJSON(boardData, filename);
    } catch (error) {
      console.error('Failed to export board:', error);
      alert('Failed to export board data');
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = ImportExportService.importFromJSON(e.target.result);
        if (result.success) {
          if (window.confirm('This will replace your current board. Are you sure?')) {
            importBoardData(result.data);
          }
        } else {
          alert('Import failed: ' + result.error);
        }
      } catch (error) {
        console.error('Failed to import board:', error);
        alert('Failed to import board data');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const selectedColumn = selectedColumnId ? boardData.columns[selectedColumnId] : null;

  const boardClasses = `
    min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50
    ${className}
  `.trim();

  return (
    <div className={boardClasses}>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title and Stats */}
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Dynamic Kanban Board
              </h1>
              <p className="text-gray-600 mb-2">
                Create, edit, and organize your workflow with full CRUD operations
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{stats.totalColumns} columns</span>
                <span>{stats.totalTasks} tasks</span>
                {stats.overdueTasks > 0 && (
                  <span className="text-red-600 font-medium">
                    {stats.overdueTasks} overdue
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Import */}
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="medium">
                  <Upload size={16} className="mr-2" />
                  Import
                </Button>
              </div>

              {/* Export */}
              <Button
                variant="outline"
                size="medium"
                onClick={handleExport}
                disabled={stats.totalTasks === 0}
              >
                <Download size={16} className="mr-2" />
                Export
              </Button>

              {/* Clear Board */}
              <Button
                variant="danger"
                size="medium"
                onClick={clearBoard}
                disabled={stats.totalTasks === 0 && stats.totalColumns === 0}
              >
                <Trash2 size={16} className="mr-2" />
                Clear
              </Button>

              {/* Add Column */}
              <Button
                variant="primary"
                size="medium"
                onClick={openAddColumnModal}
              >
                <Plus size={16} className="mr-2" />
                Add Column
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="large" />
          </div>
        )}

        {/* Board Content */}
        {!isLoading && (
          <>
            {boardData.columnOrder.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="text-gray-400 mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-600">
                    No columns yet
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Start by creating your first column to organize your tasks. 
                    You can add columns like "To Do", "In Progress", "Review", and "Done".
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="large"
                  onClick={openAddColumnModal}
                >
                  <Plus size={20} className="mr-2" />
                  Create First Column
                </Button>
              </div>
            ) : (
              /* Board Columns */
              <div className="flex space-x-6 overflow-x-auto pb-6">
                {boardData.columnOrder.map(columnId => {
                  const column = boardData.columns[columnId];
                  if (!column) return null;

                  const columnTasks = (column.taskIds || [])
                    .map(taskId => boardData.tasks[taskId])
                    .filter(Boolean);

                  return (
                    <Column
                      key={columnId}
                      column={column}
                      tasks={columnTasks}
                      onAddTask={openAddTaskModal}
                      onEditColumn={handleEditColumn}
                      onDeleteColumn={handleDeleteColumn}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onDrop={handleTaskDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDragStart={handleTaskDragStart}
                      isDraggedOver={isDraggedOver(columnId)}
                      draggedTaskId={draggedTaskId}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        onAddTask={handleAddTask}
        columnId={selectedColumnId}
        columnTitle={selectedColumn?.title}
      />

      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={closeAddColumnModal}
        onAddColumn={handleAddColumn}
      />
    </div>
  );
};

export default KanbanBoard;