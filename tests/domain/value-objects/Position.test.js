import { Position } from '../../../src/domain/value-objects/Position.js';

describe('Position', () => {
  describe('constructor', () => {
    it('should create a position with valid coordinates', () => {
      const position = new Position(5, 3);

      expect(position.x).toBe(5);
      expect(position.y).toBe(3);
    });

    it('should throw error for non-integer x coordinate', () => {
      expect(() => new Position(5.5, 3)).toThrow('Position coordinates must be integers');
      expect(() => new Position('5', 3)).toThrow('Position coordinates must be integers');
      expect(() => new Position(null, 3)).toThrow('Position coordinates must be integers');
    });

    it('should throw error for non-integer y coordinate', () => {
      expect(() => new Position(5, 3.5)).toThrow('Position coordinates must be integers');
      expect(() => new Position(5, '3')).toThrow('Position coordinates must be integers');
      expect(() => new Position(5, null)).toThrow('Position coordinates must be integers');
    });

    it('should accept negative coordinates', () => {
      const position = new Position(-1, -2);
      expect(position.x).toBe(-1);
      expect(position.y).toBe(-2);
    });

    it('should accept zero coordinates', () => {
      const position = new Position(0, 0);
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });
  });

  describe('equals', () => {
    it('should return true for positions with same coordinates', () => {
      const position1 = new Position(5, 3);
      const position2 = new Position(5, 3);

      expect(position1.equals(position2)).toBe(true);
    });

    it('should return false for positions with different coordinates', () => {
      const position1 = new Position(5, 3);
      const position2 = new Position(6, 3);
      const position3 = new Position(5, 4);

      expect(position1.equals(position2)).toBe(false);
      expect(position1.equals(position3)).toBe(false);
    });

    it('should return false for non-Position objects', () => {
      const position = new Position(5, 3);

      expect(position.equals({ x: 5, y: 3 })).toBe(false);
      expect(position.equals(null)).toBe(false);
      expect(position.equals(undefined)).toBe(false);
    });
  });

  describe('move', () => {
    it('should return new position with delta applied', () => {
      const original = new Position(5, 3);
      const moved = original.move(2, -1);

      expect(moved).toBeInstanceOf(Position);
      expect(moved.x).toBe(7);
      expect(moved.y).toBe(2);
    });

    it('should not modify original position (immutability)', () => {
      const original = new Position(5, 3);
      const moved = original.move(2, -1);

      expect(original.x).toBe(5);
      expect(original.y).toBe(3);
      expect(moved).not.toBe(original);
    });

    it('should handle zero deltas', () => {
      const original = new Position(5, 3);
      const moved = original.move(0, 0);

      expect(moved.x).toBe(5);
      expect(moved.y).toBe(3);
      expect(moved).not.toBe(original);
    });

    it('should handle negative deltas', () => {
      const original = new Position(5, 3);
      const moved = original.move(-2, -1);

      expect(moved.x).toBe(3);
      expect(moved.y).toBe(2);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const position = new Position(5, 3);
      expect(position.toString()).toBe('Position(5, 3)');
    });

    it('should handle negative coordinates in string', () => {
      const position = new Position(-1, -2);
      expect(position.toString()).toBe('Position(-1, -2)');
    });
  });

  describe('immutability', () => {
    it('should not allow modification of x coordinate', () => {
      const position = new Position(5, 3);

      expect(() => {
        position.x = 10;
      }).toThrow();
    });

    it('should not allow modification of y coordinate', () => {
      const position = new Position(5, 3);

      expect(() => {
        position.y = 10;
      }).toThrow();
    });
  });
});
