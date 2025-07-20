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

    it('should create gate with unlock conditions', () => {
      const unlockConditions = {
        collectedVimKeys: ['h', 'j'],
        requiredCollectibleKeys: ['red_key', 'blue_key']
      };
      const gateWithConditions = new Gate(testPosition, unlockConditions);

      expect(gateWithConditions.unlockConditions).toEqual(unlockConditions);
    });

    it('should create gate with empty unlock conditions by default', () => {
      expect(gate.unlockConditions).toEqual({});
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

    it('should return true for gates with same position, open state, and unlock conditions', () => {
      const unlockConditions = { collectedVimKeys: ['h'], requiredCollectibleKeys: ['red_key'] };
      const gate1 = new Gate(testPosition, unlockConditions);
      const gate2 = new Gate(testPosition, unlockConditions);
      expect(gate1.equals(gate2)).toBe(true);
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

    it('should return false for gates with different unlock conditions', () => {
      const unlockConditions1 = { collectedVimKeys: ['h'] };
      const unlockConditions2 = { collectedVimKeys: ['j'] };
      const gate1 = new Gate(testPosition, unlockConditions1);
      const gate2 = new Gate(testPosition, unlockConditions2);
      expect(gate1.equals(gate2)).toBe(false);
    });

    it('should return false when comparing with non-Gate object', () => {
      expect(gate.equals('not a gate')).toBe(false);
    });

    it('should return false when comparing with null', () => {
      expect(gate.equals(null)).toBe(false);
    });
  });

  describe('canUnlock method', () => {
    it('should return false for gate with no unlock conditions', () => {
      const result = gate.canUnlock(new Set(['h', 'j']), new Set(['red_key']));
      expect(result).toBe(false);
    });

    it('should return true when all VIM key requirements are met', () => {
      const unlockConditions = { collectedVimKeys: ['h', 'j'] };
      const gateWithConditions = new Gate(testPosition, unlockConditions);

      const collectedVimKeys = new Set(['h', 'j', 'k']);
      const result = gateWithConditions.canUnlock(collectedVimKeys, new Set());

      expect(result).toBe(true);
    });

    it('should return false when VIM key requirements are not met', () => {
      const unlockConditions = { collectedVimKeys: ['h', 'j', 'k'] };
      const gateWithConditions = new Gate(testPosition, unlockConditions);

      const collectedVimKeys = new Set(['h', 'j']); // missing 'k'
      const result = gateWithConditions.canUnlock(collectedVimKeys, new Set());

      expect(result).toBe(false);
    });

    it('should return true when all CollectibleKey requirements are met', () => {
      const unlockConditions = { requiredCollectibleKeys: ['red_key', 'blue_key'] };
      const gateWithConditions = new Gate(testPosition, unlockConditions);

      const collectedCollectibleKeys = new Set(['red_key', 'blue_key', 'green_key']);
      const result = gateWithConditions.canUnlock(new Set(), collectedCollectibleKeys);

      expect(result).toBe(true);
    });

    it('should return false when CollectibleKey requirements are not met', () => {
      const unlockConditions = { requiredCollectibleKeys: ['red_key', 'blue_key'] };
      const gateWithConditions = new Gate(testPosition, unlockConditions);

      const collectedCollectibleKeys = new Set(['red_key']); // missing 'blue_key'
      const result = gateWithConditions.canUnlock(new Set(), collectedCollectibleKeys);

      expect(result).toBe(false);
    });

    it('should return true when both VIM key and CollectibleKey requirements are met', () => {
      const unlockConditions = {
        collectedVimKeys: ['h'],
        requiredCollectibleKeys: ['red_key']
      };
      const gateWithConditions = new Gate(testPosition, unlockConditions);

      const collectedVimKeys = new Set(['h', 'j']);
      const collectedCollectibleKeys = new Set(['red_key', 'blue_key']);
      const result = gateWithConditions.canUnlock(collectedVimKeys, collectedCollectibleKeys);

      expect(result).toBe(true);
    });

    it('should return false when only VIM key requirements are met but CollectibleKey requirements are not', () => {
      const unlockConditions = {
        collectedVimKeys: ['h'],
        requiredCollectibleKeys: ['red_key']
      };
      const gateWithConditions = new Gate(testPosition, unlockConditions);

      const collectedVimKeys = new Set(['h', 'j']);
      const collectedCollectibleKeys = new Set(['blue_key']); // missing 'red_key'
      const result = gateWithConditions.canUnlock(collectedVimKeys, collectedCollectibleKeys);

      expect(result).toBe(false);
    });

    it('should handle empty requirements gracefully', () => {
      const unlockConditions = {
        collectedVimKeys: [],
        requiredCollectibleKeys: []
      };
      const gateWithConditions = new Gate(testPosition, unlockConditions);

      const result = gateWithConditions.canUnlock(new Set(), new Set());

      expect(result).toBe(true);
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
