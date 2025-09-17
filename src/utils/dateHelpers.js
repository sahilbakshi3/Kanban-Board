// utils/dateHelpers.js
/**
 * Format date to short format (e.g., "Jan 15")
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date to full format (e.g., "January 15, 2024")
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateFull = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Check if date is overdue
 * @param {string|Date} dueDate - Due date to check
 * @returns {boolean} Whether date is overdue
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  
  try {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    return due < today;
  } catch (error) {
    console.error('Error checking overdue date:', error);
    return false;
  }
};

/**
 * Check if date is due today
 * @param {string|Date} dueDate - Due date to check
 * @returns {boolean} Whether date is due today
 */
export const isDueToday = (dueDate) => {
  if (!dueDate) return false;
  
  try {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const today = new Date();
    
    return (
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    console.error('Error checking if due today:', error);
    return false;
  }
};

/**
 * Get current ISO date string
 * @returns {string} Current date in ISO format
 */
export const getCurrentISODate = () => {
  return new Date().toISOString();
};

/**
 * Convert date to input value format (YYYY-MM-DD)
 * @param {string|Date} date - Date to convert
 * @returns {string} Date in input format
 */
export const toInputDateFormat = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error converting to input format:', error);
    return '';
  }
};