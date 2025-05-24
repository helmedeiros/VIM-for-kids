import { VimKey } from '../../../src/domain/entities/VimKey.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('VimKey', () => {
    describe('constructor', () => {
    it('should create VimKey with valid parameters', () => {
      const position = new Position(3, 4);
      const vimKey = new VimKey(position, 'h', 'Move left');

      expect(vimKey.key).toBe('h');
      expect(vimKey.description).toBe('Move left');
      expect(vimKey.position).toBe(position);
    });

    it('should throw error for non-single character key', () => {
      const position = new Position(3, 4);

      expect(() => new VimKey(position, '', 'Description')).toThrow('VimKey key must be a single character string');
      expect(() => new VimKey(position, 'ab', 'Description')).toThrow('VimKey key must be a single character string');
    });

    it('should throw error for non-string key', () => {
      const position = new Position(3, 4);

      expect(() => new VimKey(position, null, 'Description')).toThrow('VimKey key must be a single character string');
      expect(() => new VimKey(position, 123, 'Description')).toThrow('VimKey key must be a single character string');
      expect(() => new VimKey(position, {}, 'Description')).toThrow('VimKey key must be a single character string');
    });

    it('should throw error for non-string description', () => {
      const position = new Position(3, 4);

      expect(() => new VimKey(position, 'h', null)).toThrow('VimKey description must be a string');
      expect(() => new VimKey(position, 'h', 123)).toThrow('VimKey description must be a string');
      expect(() => new VimKey(position, 'h', {})).toThrow('VimKey description must be a string');
    });

    it('should throw error for non-Position position', () => {
      expect(() => new VimKey({ x: 3, y: 4 }, 'h', 'Description')).toThrow('VimKey position must be a Position instance');
      expect(() => new VimKey(null, 'h', 'Description')).toThrow('VimKey position must be a Position instance');
      expect(() => new VimKey('position', 'h', 'Description')).toThrow('VimKey position must be a Position instance');
    });
  });

    describe('equals', () => {
    it('should return true for VimKeys with same properties', () => {
      const position1 = new Position(3, 4);
      const position2 = new Position(3, 4);
      const key1 = new VimKey(position1, 'h', 'Move left');
      const key2 = new VimKey(position2, 'h', 'Move left');

      expect(key1.equals(key2)).toBe(true);
    });

    it('should return false for VimKeys with different keys', () => {
      const position = new Position(3, 4);
      const key1 = new VimKey(position, 'h', 'Move left');
      const key2 = new VimKey(position, 'j', 'Move left');

      expect(key1.equals(key2)).toBe(false);
    });

    it('should return false for VimKeys with different positions', () => {
      const position1 = new Position(3, 4);
      const position2 = new Position(4, 5);
      const key1 = new VimKey(position1, 'h', 'Move left');
      const key2 = new VimKey(position2, 'h', 'Move left');

      expect(key1.equals(key2)).toBe(false);
    });

    it('should return false for non-VimKey objects', () => {
      const position = new Position(3, 4);
      const vimKey = new VimKey(position, 'h', 'Move left');

      expect(vimKey.equals({ key: 'h', description: 'Move left', position })).toBe(false);
      expect(vimKey.equals(null)).toBe(false);
      expect(vimKey.equals(undefined)).toBe(false);
      expect(vimKey.equals('string')).toBe(false);
    });
  });

    describe('property immutability', () => {
    it('should have immutable key property', () => {
      const vimKey = new VimKey(new Position(3, 4), 'h', 'Move left');

      expect(() => {
        vimKey.key = 'j';
      }).toThrow();
    });

    it('should have immutable description property', () => {
      const vimKey = new VimKey(new Position(3, 4), 'h', 'Move left');

      expect(() => {
        vimKey.description = 'New description';
      }).toThrow();
    });

    it('should have immutable position property', () => {
      const vimKey = new VimKey(new Position(3, 4), 'h', 'Move left');

      expect(() => {
        vimKey.position = new Position(5, 6);
      }).toThrow();
    });
  });
});
