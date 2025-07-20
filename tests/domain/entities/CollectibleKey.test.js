import { CollectibleKey } from '../../../src/domain/entities/CollectibleKey.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('CollectibleKey', () => {
  let testPosition;

  beforeEach(() => {
    testPosition = new Position(5, 3);
  });

  describe('constructor', () => {
    it('should create a collectible key with valid parameters', () => {
      const key = new CollectibleKey(testPosition, 'red_key', 'Red Key', '#FF0000');

      expect(key.position).toBe(testPosition);
      expect(key.keyId).toBe('red_key');
      expect(key.name).toBe('Red Key');
      expect(key.color).toBe('#FF0000');
      expect(key.type).toBe('collectible_key');
    });

    it('should create a collectible key with default name and color', () => {
      const key = new CollectibleKey(testPosition, 'default_key');

      expect(key.position).toBe(testPosition);
      expect(key.keyId).toBe('default_key');
      expect(key.name).toBe('Key');
      expect(key.color).toBe('#FFD700');
      expect(key.type).toBe('collectible_key');
    });

    it('should throw error if position is not a Position instance', () => {
      expect(() => {
        new CollectibleKey('invalid', 'key1');
      }).toThrow('CollectibleKey position must be a Position instance');

      expect(() => {
        new CollectibleKey(null, 'key1');
      }).toThrow('CollectibleKey position must be a Position instance');

      expect(() => {
        new CollectibleKey({ x: 5, y: 3 }, 'key1');
      }).toThrow('CollectibleKey position must be a Position instance');
    });

    it('should throw error if keyId is not a valid string', () => {
      expect(() => {
        new CollectibleKey(testPosition, '');
      }).toThrow('CollectibleKey keyId must be a non-empty string');

      expect(() => {
        new CollectibleKey(testPosition, null);
      }).toThrow('CollectibleKey keyId must be a non-empty string');

      expect(() => {
        new CollectibleKey(testPosition, 123);
      }).toThrow('CollectibleKey keyId must be a non-empty string');
    });

    it('should throw error if name is not a string', () => {
      expect(() => {
        new CollectibleKey(testPosition, 'key1', 123);
      }).toThrow('CollectibleKey name must be a string');

      expect(() => {
        new CollectibleKey(testPosition, 'key1', null);
      }).toThrow('CollectibleKey name must be a string');
    });

    it('should throw error if color is not a string', () => {
      expect(() => {
        new CollectibleKey(testPosition, 'key1', 'Key', 123);
      }).toThrow('CollectibleKey color must be a string');

      expect(() => {
        new CollectibleKey(testPosition, 'key1', 'Key', null);
      }).toThrow('CollectibleKey color must be a string');
    });
  });

  describe('getters', () => {
    let key;

    beforeEach(() => {
      key = new CollectibleKey(testPosition, 'blue_key', 'Blue Key', '#0000FF');
    });

    it('should return correct position', () => {
      expect(key.position).toBe(testPosition);
    });

    it('should return correct keyId', () => {
      expect(key.keyId).toBe('blue_key');
    });

    it('should return correct name', () => {
      expect(key.name).toBe('Blue Key');
    });

    it('should return correct color', () => {
      expect(key.color).toBe('#0000FF');
    });

    it('should return correct type', () => {
      expect(key.type).toBe('collectible_key');
    });
  });

  describe('equals', () => {
    let key1, key2;

    beforeEach(() => {
      key1 = new CollectibleKey(testPosition, 'test_key', 'Test Key', '#00FF00');
    });

    it('should return true for identical keys', () => {
      key2 = new CollectibleKey(testPosition, 'test_key', 'Test Key', '#00FF00');
      expect(key1.equals(key2)).toBe(true);
    });

    it('should return true for keys with same position and keyId but different name/color', () => {
      key2 = new CollectibleKey(testPosition, 'test_key', 'Different Name', '#FF00FF');
      expect(key1.equals(key2)).toBe(true);
    });

    it('should return false for keys with different positions', () => {
      const differentPosition = new Position(10, 10);
      key2 = new CollectibleKey(differentPosition, 'test_key', 'Test Key', '#00FF00');
      expect(key1.equals(key2)).toBe(false);
    });

    it('should return false for keys with different keyIds', () => {
      key2 = new CollectibleKey(testPosition, 'different_key', 'Test Key', '#00FF00');
      expect(key1.equals(key2)).toBe(false);
    });

    it('should return false when comparing with non-CollectibleKey objects', () => {
      expect(key1.equals('not a key')).toBe(false);
      expect(key1.equals(null)).toBe(false);
      expect(key1.equals(undefined)).toBe(false);
      expect(key1.equals({ position: testPosition, keyId: 'test_key' })).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return correct string representation', () => {
      const key = new CollectibleKey(testPosition, 'my_key', 'My Key', '#FFFFFF');
      const expectedString = `CollectibleKey(my_key) at (${testPosition.x}, ${testPosition.y})`;
      expect(key.toString()).toBe(expectedString);
    });
  });
});
