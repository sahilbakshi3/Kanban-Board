// services/storage.js
import { LOCAL_STORAGE_KEYS } from '../utils/constants.js';

/**
 * Local storage service for persisting Kanban board data
 */
export class StorageService {
  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to save
   * @returns {boolean} Success status
   */
  static save(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @returns {any|null} Loaded data or null if not found
   */
  static load(key) {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return null;
      }
      return JSON.parse(serializedData);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} Whether localStorage is supported
   */
  static isAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save Kanban board data
   * @param {object} boardData - Board data to save
   * @returns {boolean} Success status
   */
  static saveBoardData(boardData) {
    return this.save(LOCAL_STORAGE_KEYS.KANBAN_DATA, {
      ...boardData,
      lastSaved: new Date().toISOString()
    });
  }

  /**
   * Load Kanban board data
   * @returns {object|null} Board data or null
   */
  static loadBoardData() {
    const data = this.load(LOCAL_STORAGE_KEYS.KANBAN_DATA);
    if (!data) return null;

    // Validate structure
    if (!data.tasks || !data.columns || !Array.isArray(data.columnOrder)) {
      console.warn('Invalid board data structure in localStorage');
      return null;
    }

    return data;
  }

  /**
   * Save user preferences
   * @param {object} preferences - User preferences
   * @returns {boolean} Success status
   */
  static saveUserPreferences(preferences) {
    return this.save(LOCAL_STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  /**
   * Load user preferences
   * @returns {object|null} User preferences or null
   */
  static loadUserPreferences() {
    return this.load(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
  }

  /**
   * Clear all Kanban data
   * @returns {boolean} Success status
   */
  static clearAllData() {
    try {
      this.remove(LOCAL_STORAGE_KEYS.KANBAN_DATA);
      this.remove(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  /**
   * Get storage usage information
   * @returns {object} Storage usage stats
   */
  static getStorageInfo() {
    if (!this.isAvailable()) {
      return { available: false };
    }

    try {
      const boardData = localStorage.getItem(LOCAL_STORAGE_KEYS.KANBAN_DATA);
      const preferences = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
      
      return {
        available: true,
        boardDataSize: boardData ? boardData.length : 0,
        preferencesSize: preferences ? preferences.length : 0,
        totalSize: (boardData?.length || 0) + (preferences?.length || 0),
        lastSaved: this.loadBoardData()?.lastSaved || null
      };
    } catch (error) {
      return { available: true, error: error.message };
    }
  }
}

/**
 * Auto-save functionality
 */
export class AutoSaveService {
  constructor(saveCallback, interval = 30000) { // 30 seconds default
    this.saveCallback = saveCallback;
    this.interval = interval;
    this.timeoutId = null;
    this.enabled = true;
  }

  /**
   * Schedule auto-save
   */
  schedule() {
    if (!this.enabled) return;

    this.cancel(); // Cancel existing timeout
    
    this.timeoutId = setTimeout(() => {
      if (this.saveCallback && typeof this.saveCallback === 'function') {
        this.saveCallback();
      }
    }, this.interval);
  }

  /**
   * Cancel scheduled auto-save
   */
  cancel() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Enable auto-save
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable auto-save
   */
  disable() {
    this.enabled = false;
    this.cancel();
  }

  /**
   * Set new interval
   * @param {number} interval - New interval in milliseconds
   */
  setInterval(interval) {
    this.interval = interval;
  }

  /**
   * Cleanup
   */
  destroy() {
    this.cancel();
    this.enabled = false;
    this.saveCallback = null;
  }
}

/**
 * Export/Import functionality
 */
export class ImportExportService {
  /**
   * Export board data to JSON
   * @param {object} boardData - Board data to export
   * @returns {string} JSON string
   */
  static exportToJSON(boardData) {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: boardData
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import board data from JSON
   * @param {string} jsonString - JSON string to import
   * @returns {object} Import result with success status and data/error
   */
  static importFromJSON(jsonString) {
    try {
      const importData = JSON.parse(jsonString);
      
      // Validate structure
      if (!importData.data || !importData.data.tasks || !importData.data.columns) {
        return {
          success: false,
          error: 'Invalid file format: Missing required data structure'
        };
      }

      return {
        success: true,
        data: importData.data,
        version: importData.version,
        exportedAt: importData.exportedAt
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid JSON format: ' + error.message
      };
    }
  }

  /**
   * Download data as JSON file
   * @param {object} boardData - Board data to download
   * @param {string} filename - Filename for download
   */
  static downloadAsJSON(boardData, filename = 'kanban-board.json') {
    const jsonString = this.exportToJSON(boardData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}