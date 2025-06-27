import { StorageOperations } from '../../../src/infrastructure/adapters/BrowserStorageAdapter.js';

describe('StorageOperations', () => {
  describe('isValidKey', () => {
    it('should return true for valid string keys', () => {
      expect(StorageOperations.isValidKey('valid-key')).toBe(true);
      expect(StorageOperations.isValidKey('gameState')).toBe(true);
      expect(StorageOperations.isValidKey('user_preferences')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(StorageOperations.isValidKey('')).toBe(false);
    });

    it('should return false for whitespace-only strings', () => {
      expect(StorageOperations.isValidKey('   ')).toBe(false);
      expect(StorageOperations.isValidKey('\t')).toBe(false);
      expect(StorageOperations.isValidKey('\n')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(StorageOperations.isValidKey(null)).toBe(false);
      expect(StorageOperations.isValidKey(undefined)).toBe(false);
      expect(StorageOperations.isValidKey(123)).toBe(false);
      expect(StorageOperations.isValidKey({})).toBe(false);
      expect(StorageOperations.isValidKey([])).toBe(false);
    });
  });

  describe('isValidValue', () => {
    it('should return true for valid values', () => {
      expect(StorageOperations.isValidValue('string')).toBe(true);
      expect(StorageOperations.isValidValue('')).toBe(true);
      expect(StorageOperations.isValidValue(0)).toBe(true);
      expect(StorageOperations.isValidValue(false)).toBe(true);
      expect(StorageOperations.isValidValue(null)).toBe(true);
      expect(StorageOperations.isValidValue({})).toBe(true);
      expect(StorageOperations.isValidValue([])).toBe(true);
    });

    it('should return false for undefined', () => {
      expect(StorageOperations.isValidValue(undefined)).toBe(false);
    });
  });

  describe('handleStorageError', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log warning with proper message format', () => {
      const error = new Error('Storage is full');

      StorageOperations.handleStorageError(error, 'write to');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to write to localStorage: Storage is full');
    });

    it('should return null for read operations', () => {
      const error = new Error('Access denied');

      const result = StorageOperations.handleStorageError(error, 'read from');

      expect(result).toBeNull();
    });

    it('should return undefined for write operations', () => {
      const error = new Error('Storage is full');

      const result = StorageOperations.handleStorageError(error, 'write to');

      expect(result).toBeUndefined();
    });

    it('should return undefined for remove operations', () => {
      const error = new Error('Access denied');

      const result = StorageOperations.handleStorageError(error, 'remove from');

      expect(result).toBeUndefined();
    });

    it('should return undefined for clear operations', () => {
      const error = new Error('Access denied');

      const result = StorageOperations.handleStorageError(error, 'clear');

      expect(result).toBeUndefined();
    });

    it('should return undefined for unknown operations', () => {
      const error = new Error('Unknown error');

      const result = StorageOperations.handleStorageError(error, 'unknown');

      expect(result).toBeUndefined();
    });

    it('should handle errors with different message types', () => {
      const error1 = new Error('String error');
      const error2 = { message: 'Object error' };

      StorageOperations.handleStorageError(error1, 'read from');
      StorageOperations.handleStorageError(error2, 'write to');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to read from localStorage: String error');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to write to localStorage: Object error');
    });
  });
});
