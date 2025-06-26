/**
 * Adapter for browser localStorage operations
 * Implements abstraction for storage operations
 */
export class BrowserStorageAdapter {
  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @returns {string|null} Stored value or null
   */
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
    }
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  /**
   * Clear all items from storage
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
}
