// utils/idGenerator.js
/**
 * Generate a unique ID using timestamp and random string
 * @returns {string} Unique identifier
 */
export const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return `id-${timestamp}-${randomStr}`;
};

/**
 * Generate a task ID with specific prefix
 * @returns {string} Task identifier
 */
export const generateTaskId = () => {
  return `task-${generateId()}`;
};

/**
 * Generate a column ID with specific prefix
 * @returns {string} Column identifier
 */
export const generateColumnId = () => {
  return `column-${generateId()}`;
};

/**
 * Validate if ID format is correct
 * @param {string} id - ID to validate
 * @returns {boolean} Whether ID is valid
 */
export const isValidId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^(id|task|column)-\w+-\w+$/.test(id);
};