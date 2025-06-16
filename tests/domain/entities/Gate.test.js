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

  describe('immutability', () => {
    it('should not allow position to be changed', () => {
      const originalPosition = gate.position;

      expect(() => {
        gate.position = new Position(1, 1);
      }).toThrow();

      expect(gate.position).toEqual(originalPosition);
    });
  });
});
