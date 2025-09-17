// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage.js';

/**
 * Custom hook for localStorage with React state synchronization
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value if nothing in storage
 * @returns {[any, function, function]} [value, setValue, clearValue]
 */
export const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = StorageService.load(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      StorageService.save(key, valueToStore);
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  };

  // Clear value from both state and localStorage
  const clearValue = () => {
    try {
      setStoredValue(initialValue);
      StorageService.remove(key);
    } catch (error) {
      console.error(`Error clearing ${key} from localStorage:`, error);
    }
  };

  return [storedValue, setValue, clearValue];
};

/**
 * Hook for Kanban board data persistence
 * @returns {[object, function, function]} [boardData, saveBoardData, clearBoardData]
 */
export const useKanbanStorage = () => {
  const [boardData, setBoardData, clearBoardData] = useLocalStorage('kanban_board_data', {
    tasks: {},
    columns: {},
    columnOrder: []
  });

  const saveBoardData = (data) => {
    const dataWithTimestamp = {
      ...data,
      lastSaved: new Date().toISOString()
    };
    setBoardData(dataWithTimestamp);
  };

  return [boardData, saveBoardData, clearBoardData];
};

/**
 * Hook for user preferences persistence
 * @returns {[object, function, function]} [preferences, setPreferences, clearPreferences]
 */
export const usePreferences = () => {
  const defaultPreferences = {
    theme: 'light',
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    showTaskCount: true,
    compactMode: false,
    animations: true
  };

  const [preferences, setPreferences, clearPreferences] = useLocalStorage(
    'kanban_user_preferences',
    defaultPreferences
  );

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  return [preferences, updatePreference, setPreferences, clearPreferences];
};

/**
 * Hook for managing storage info and cleanup
 * @returns {object} Storage utilities and info
 */
export const useStorageInfo = () => {
  const [storageInfo, setStorageInfo] = useState(null);

  const refreshStorageInfo = () => {
    const info = StorageService.getStorageInfo();
    setStorageInfo(info);
  };

  const clearAllData = () => {
    const success = StorageService.clearAllData();
    if (success) {
      refreshStorageInfo();
    }
    return success;
  };

  useEffect(() => {
    refreshStorageInfo();
  }, []);

  return {
    storageInfo,
    refreshStorageInfo,
    clearAllData,
    isAvailable: StorageService.isAvailable()
  };
};