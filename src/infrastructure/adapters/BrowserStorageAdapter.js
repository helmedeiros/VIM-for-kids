/**
 * Storage operations that can be tested in isolation
 * Contains pure logic without browser dependencies
 */
export class StorageOperations {
  /**
   * Validate storage key
   * @param {string} key - Storage key to validate
   * @returns {boolean} True if key is valid
   */
  static isValidKey(key) {
    return typeof key === 'string' && key.trim() !== '';
  }

  /**
   * Validate storage value
   * @param {*} value - Value to validate
   * @returns {boolean} True if value can be stored
   */
  static isValidValue(value) {
    return value !== undefined;
  }

  /**
   * Process storage error and return appropriate response
   * @param {Error} error - Storage error
   * @param {string} operation - Operation that failed
   * @returns {*} Appropriate return value for the operation
   */
  static handleStorageError(error, operation) {
    const message = `Failed to ${operation} localStorage: ${error.message}`;
    // eslint-disable-next-line no-console
    console.warn(message);

    // Return appropriate default values based on operation
    switch (operation) {
      case 'read from':
        return null;
      case 'write to':
      case 'remove from':
      case 'clear':
      default:
        return undefined;
    }
  }
}

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
    if (!StorageOperations.isValidKey(key)) {
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      return StorageOperations.handleStorageError(error, 'read from');
    }
  }

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   */
  setItem(key, value) {
    if (!StorageOperations.isValidKey(key) || !StorageOperations.isValidValue(value)) {
      return;
    }

    try {
      localStorage.setItem(key, value);
    } catch (error) {
      StorageOperations.handleStorageError(error, 'write to');
    }
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    if (!StorageOperations.isValidKey(key)) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      StorageOperations.handleStorageError(error, 'remove from');
    }
  }

  /**
   * Clear all items from storage
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      StorageOperations.handleStorageError(error, 'clear');
    }
  }
}
