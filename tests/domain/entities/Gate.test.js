import { Gate } from '../../../src/domain/entities/Gate.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('Gate', () => {
  let gate;
  const testPosition = new Position(8, 5);

  beforeEach(() => {
    gate = new Gate(testPosition);
  });

  describe('initialization', () => {
    it('should create gate with position', () => {
      expect(gate.position).toEqual(testPosition);
    });

    it('should start in closed state', () => {
      expect(gate.isOpen).toBe(false);
    });

    it('should have gate type', () => {
      expect(gate.type).toBe('gate');
    });

    it('should throw error if position is not a Position object', () => {
      expect(() => {
        new Gate('invalid position');
      }).toThrow('Position must be a valid Position object');
    });

    it('should throw error if position is null', () => {
      expect(() => {
        new Gate(null);
      }).toThrow('Position must be a valid Position object');
    });

    it('should throw error if position is undefined', () => {
      expect(() => {
        new Gate(undefined);
      }).toThrow('Position must be a valid Position object');
    });
  });

  describe('open and close functionality', () => {
    it('should be able to open the gate', () => {
      gate.open();
      expect(gate.isOpen).toBe(true);
    });

    it('should be able to close the gate', () => {
      gate.open();
      gate.close();
      expect(gate.isOpen).toBe(false);
    });

    it('should remain closed when already closed', () => {
      expect(gate.isOpen).toBe(false);
      gate.close();
      expect(gate.isOpen).toBe(false);
    });

    it('should remain open when already open', () => {
      gate.open();
      expect(gate.isOpen).toBe(true);
      gate.open();
      expect(gate.isOpen).toBe(true);
    });
  });

  describe('walkability', () => {
    it('should not be walkable when closed', () => {
      expect(gate.isWalkable()).toBe(false);
    });

    it('should be walkable when open', () => {
      gate.open();
      expect(gate.isWalkable()).toBe(true);
    });
  });

  describe('equals method', () => {
    it('should return true for identical gates', () => {
      const otherGate = new Gate(testPosition);
      expect(gate.equals(otherGate)).toBe(true);
    });

    it('should return true for gates with same position and same open state', () => {
      const otherGate = new Gate(testPosition);
      gate.open();
      otherGate.open();
      expect(gate.equals(otherGate)).toBe(true);
    });

    it('should return false for gates with different positions', () => {
      const otherPosition = new Position(10, 10);
      const otherGate = new Gate(otherPosition);
      expect(gate.equals(otherGate)).toBe(false);
    });

    it('should return false for gates with same position but different open state', () => {
      const otherGate = new Gate(testPosition);
      gate.open();
      expect(gate.equals(otherGate)).toBe(false);
    });

    it('should return false when comparing with non-Gate object', () => {
      expect(gate.equals('not a gate')).toBe(false);
    });

    it('should return false when comparing with null', () => {
      expect(gate.equals(null)).toBe(false);
    });
  });

  describe('toString method', () => {
    it('should return correct string representation when closed', () => {
      const expectedString = `Gate at (${testPosition.x}, ${testPosition.y}) - Closed`;
      expect(gate.toString()).toBe(expectedString);
    });

    it('should return correct string representation when open', () => {
      gate.open();
      const expectedString = `Gate at (${testPosition.x}, ${testPosition.y}) - Open`;
      expect(gate.toString()).toBe(expectedString);
    });
  });

  describe('immutability', () => {
    it('should not allow position to be changed', () => {
      const originalPosition = gate.position;

      expect(() => {
        gate.position = new Position(1, 1);
      }).toThrow();

      expect(gate.position).toEqual(originalPosition);
    });

    it('should not allow type to be changed', () => {
      const originalType = gate.type;

      expect(() => {
        gate.type = 'different type';
      }).toThrow();

      expect(gate.type).toBe(originalType);
    });
  });
});
