// utils/constants.js
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const PRIORITY_CONFIG = {
  [PRIORITY_LEVELS.LOW]: {
    label: 'Low',
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    badgeBg: 'bg-green-100'
  },
  [PRIORITY_LEVELS.MEDIUM]: {
    label: 'Medium',
    borderColor: 'border-l-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    badgeBg: 'bg-yellow-100'
  },
  [PRIORITY_LEVELS.HIGH]: {
    label: 'High',
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    badgeBg: 'bg-red-100'
  }
};

export const COLUMN_COLORS = [
  { value: 'bg-gray-100', label: 'Gray', preview: 'bg-gray-200' },
  { value: 'bg-blue-50', label: 'Blue', preview: 'bg-blue-200' },
  { value: 'bg-green-50', label: 'Green', preview: 'bg-green-200' },
  { value: 'bg-yellow-50', label: 'Yellow', preview: 'bg-yellow-200' },
  { value: 'bg-purple-50', label: 'Purple', preview: 'bg-purple-200' },
  { value: 'bg-pink-50', label: 'Pink', preview: 'bg-pink-200' },
  { value: 'bg-indigo-50', label: 'Indigo', preview: 'bg-indigo-200' }
];

export const COLUMN_HEADER_COLORS = {
  'to do': 'border-t-slate-500',
  'in progress': 'border-t-blue-500',
  'review': 'border-t-yellow-500',
  'done': 'border-t-green-500',
  'testing': 'border-t-purple-500',
  'blocked': 'border-t-red-500',
  'default': 'border-t-gray-500'
};

export const DRAG_TYPES = {
  TASK: 'task',
  COLUMN: 'column'
};

export const LOCAL_STORAGE_KEYS = {
  KANBAN_DATA: 'kanban_board_data',
  USER_PREFERENCES: 'kanban_user_preferences'
};

export const ANIMATION_DURATIONS = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 500
};

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280
};

export const MAX_LIMITS = {
  TASK_TITLE_LENGTH: 100,
  TASK_DESCRIPTION_LENGTH: 500,
  COLUMN_TITLE_LENGTH: 50,
  ASSIGNEE_NAME_LENGTH: 50,
  MAX_COLUMNS_PER_BOARD: 10,
  MAX_TASKS_PER_COLUMN: 100
};

export const DEFAULT_VALUES = {
  TASK_PRIORITY: PRIORITY_LEVELS.MEDIUM,
  COLUMN_COLOR: 'bg-gray-100',
  TASK: {
    title: '',
    description: '',
    priority: PRIORITY_LEVELS.MEDIUM,
    assignee: '',
    dueDate: ''
  },
  COLUMN: {
    title: '',
    color: 'bg-gray-100'
  }
};

export const MESSAGES = {
  CONFIRM_DELETE_TASK: 'Are you sure you want to delete this task?',
  CONFIRM_DELETE_COLUMN: 'Are you sure you want to delete this column?',
  CONFIRM_DELETE_COLUMN_WITH_TASKS: 'This column contains tasks. Deleting it will also delete all tasks in this column. Are you sure?',
  EMPTY_BOARD_TITLE: 'No columns yet',
  EMPTY_BOARD_DESCRIPTION: 'Start by creating your first column to organize your tasks',
  TASK_TITLE_REQUIRED: 'Task title is required',
  COLUMN_TITLE_REQUIRED: 'Column title is required'
};