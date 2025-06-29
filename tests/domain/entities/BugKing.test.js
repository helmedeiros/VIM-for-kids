import { BugKing } from '../../../src/domain/entities/BugKing.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('BugKing', () => {
  const validPosition = new Position(5, 5);

  describe('constructor', () => {
    it('should create a bug king with default parameters', () => {
      const bugKing = new BugKing(validPosition);

      expect(bugKing.position).toEqual(validPosition);
      expect(bugKing.corruptionLevel).toBe(100);
      expect(bugKing.isDefeated).toBe(false);
      expect(bugKing.name).toBe('The Bug King');
      expect(bugKing.description).toBe('The final enemy who corrupts logic and overwrites order');
      expect(bugKing.corruptionRadius).toBe(2);
      expect(bugKing.vulnerabilities).toEqual(['clean-code', 'proper-syntax', 'vim-mastery']);
    });

    it('should create a bug king with custom parameters', () => {
      const bugKing = new BugKing(validPosition, 50, true);

      expect(bugKing.corruptionLevel).toBe(50);
      expect(bugKing.isDefeated).toBe(true);
    });

    it('should throw error for invalid position', () => {
      expect(() => new BugKing('invalid')).toThrow('BugKing position must be a Position instance');
    });

    it('should throw error for invalid corruption level', () => {
      expect(() => new BugKing(validPosition, -1)).toThrow(
        'Corruption level must be a number between 0 and 100'
      );
      expect(() => new BugKing(validPosition, 101)).toThrow(
        'Corruption level must be a number between 0 and 100'
      );
      expect(() => new BugKing(validPosition, 'invalid')).toThrow(
        'Corruption level must be a number between 0 and 100'
      );
    });

    it('should throw error for invalid defeated state', () => {
      expect(() => new BugKing(validPosition, 50, 'invalid')).toThrow(
        'isDefeated must be a boolean'
      );
    });
  });

  describe('moveTo', () => {
    it('should return new bug king with new position when not defeated', () => {
      const bugKing = new BugKing(validPosition, 50, false);
      const newPosition = new Position(6, 6);
      const newBugKing = bugKing.moveTo(newPosition);

      expect(newBugKing.position).toEqual(newPosition);
      expect(newBugKing.corruptionLevel).toBe(50);
      expect(newBugKing.isDefeated).toBe(false);
      expect(newBugKing).not.toBe(bugKing);
    });

    it('should throw error when trying to move defeated bug king', () => {
      const bugKing = new BugKing(validPosition, 0, true);
      expect(() => bugKing.moveTo(new Position(6, 6))).toThrow('Cannot move a defeated Bug King');
    });

    it('should throw error for invalid position', () => {
      const bugKing = new BugKing(validPosition);
      expect(() => bugKing.moveTo('invalid')).toThrow('New position must be a Position instance');
    });
  });

  describe('takeDamage', () => {
    it('should reduce corruption level by default amount', () => {
      const bugKing = new BugKing(validPosition, 50);
      const damagedBugKing = bugKing.takeDamage();

      expect(damagedBugKing.corruptionLevel).toBe(40);
      expect(damagedBugKing.isDefeated).toBe(false);
    });

    it('should reduce corruption level by custom amount', () => {
      const bugKing = new BugKing(validPosition, 50);
      const damagedBugKing = bugKing.takeDamage(25);

      expect(damagedBugKing.corruptionLevel).toBe(25);
      expect(damagedBugKing.isDefeated).toBe(false);
    });

    it('should defeat bug king when corruption reaches zero', () => {
      const bugKing = new BugKing(validPosition, 10);
      const damagedBugKing = bugKing.takeDamage(15);

      expect(damagedBugKing.corruptionLevel).toBe(0);
      expect(damagedBugKing.isDefeated).toBe(true);
    });

    it('should not change defeated bug king', () => {
      const bugKing = new BugKing(validPosition, 0, true);
      const damagedBugKing = bugKing.takeDamage(10);

      expect(damagedBugKing).toBe(bugKing);
    });
  });

  describe('spreadCorruption', () => {
    it('should return corrupted positions within radius', () => {
      const bugKing = new BugKing(new Position(5, 5));
      const corruptedPositions = bugKing.spreadCorruption();

      expect(corruptedPositions.length).toBeGreaterThan(0);

      // Check that all positions are within corruption radius
      corruptedPositions.forEach((pos) => {
        const distance = Math.abs(pos.x - 5) + Math.abs(pos.y - 5);
        expect(distance).toBeLessThanOrEqual(2);
      });
    });

    it('should return empty array when defeated', () => {
      const bugKing = new BugKing(validPosition, 0, true);
      const corruptedPositions = bugKing.spreadCorruption();

      expect(corruptedPositions).toEqual([]);
    });
  });

  describe('getCorruptionMessage', () => {
    it('should return corruption message when not defeated', () => {
      const bugKing = new BugKing(validPosition, 50);
      const message = bugKing.getCorruptionMessage();

      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });

    it('should return restoration message when defeated', () => {
      const bugKing = new BugKing(validPosition, 0, true);
      const message = bugKing.getCorruptionMessage();

      expect(message).toBe('Order has been restored. The corruption lifts like morning mist.');
    });
  });

  describe('getDefeatMessage', () => {
    it('should return defeat message', () => {
      const bugKing = new BugKing(validPosition);
      const message = bugKing.getDefeatMessage();

      expect(message).toBe(
        'The Bug King dissolves into clean, commented code. Order is restored to the digital realm.'
      );
    });
  });

  describe('isPositionCorrupted', () => {
    it('should return true for corrupted positions', () => {
      const bugKing = new BugKing(new Position(5, 5));
      const nearbyPosition = new Position(4, 5); // Within corruption radius

      expect(bugKing.isPositionCorrupted(nearbyPosition)).toBe(true);
    });

    it('should return false for positions outside corruption radius', () => {
      const bugKing = new BugKing(new Position(5, 5));
      const farPosition = new Position(10, 10); // Outside corruption radius

      expect(bugKing.isPositionCorrupted(farPosition)).toBe(false);
    });

    it('should return false for any position when defeated', () => {
      const bugKing = new BugKing(new Position(5, 5), 0, true);
      const nearbyPosition = new Position(4, 5);

      expect(bugKing.isPositionCorrupted(nearbyPosition)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for bug kings with same properties', () => {
      const bugKing1 = new BugKing(validPosition, 50, false);
      const bugKing2 = new BugKing(validPosition, 50, false);

      expect(bugKing1.equals(bugKing2)).toBe(true);
    });

    it('should return false for bug kings with different positions', () => {
      const bugKing1 = new BugKing(new Position(1, 1), 50);
      const bugKing2 = new BugKing(new Position(2, 2), 50);

      expect(bugKing1.equals(bugKing2)).toBe(false);
    });

    it('should return false for bug kings with different corruption levels', () => {
      const bugKing1 = new BugKing(validPosition, 50);
      const bugKing2 = new BugKing(validPosition, 60);

      expect(bugKing1.equals(bugKing2)).toBe(false);
    });

    it('should return false for bug kings with different defeated states', () => {
      const bugKing1 = new BugKing(validPosition, 50, false);
      const bugKing2 = new BugKing(validPosition, 50, true);

      expect(bugKing1.equals(bugKing2)).toBe(false);
    });
  });

  describe('createFinalBoss', () => {
    it('should create a final boss with full corruption', () => {
      const boss = BugKing.createFinalBoss(validPosition);

      expect(boss.position).toEqual(validPosition);
      expect(boss.corruptionLevel).toBe(100);
      expect(boss.isDefeated).toBe(false);
    });
  });

  describe('visual appearance', () => {
    it('should have appearance properties', () => {
      const bugKing = new BugKing(validPosition);

      expect(bugKing.appearance).toBeDefined();
      expect(bugKing.appearance.symbol).toBe('♛');
      expect(bugKing.appearance.baseColor).toBe('#8B0000');
      expect(bugKing.appearance.glowColor).toBe('#DC143C');
      expect(bugKing.appearance.cssClass).toBe('bug-king');
      expect(bugKing.appearance.floatingGlyphs).toContain('⚠');
      expect(bugKing.appearance.floatingGlyphs).toContain('!');
    });

    it('should return peace symbol when defeated', () => {
      const bugKing = new BugKing(validPosition, 0, true);

      expect(bugKing.getVisualSymbol()).toBe('☮');
    });

    it('should return king symbol when not defeated', () => {
      const bugKing = new BugKing(validPosition, 100, false);

      expect(bugKing.getVisualSymbol()).toBe('♛');
    });

    it('should return sparkles when defeated for floating glyph', () => {
      const bugKing = new BugKing(validPosition, 0, true);

      expect(bugKing.getFloatingGlyph()).toBe('✨');
    });

    it('should return random corruption glyph when not defeated', () => {
      const bugKing = new BugKing(validPosition, 100, false);
      const glyph = bugKing.getFloatingGlyph();

      expect(bugKing.appearance.floatingGlyphs).toContain(glyph);
    });

    it('should calculate corruption intensity based on corruption level', () => {
      const fullCorruption = new BugKing(validPosition, 100);
      const halfCorruption = new BugKing(validPosition, 50);
      const noCorruption = new BugKing(validPosition, 0);

      expect(fullCorruption.getCorruptionIntensity()).toBe(10);
      expect(halfCorruption.getCorruptionIntensity()).toBe(5);
      expect(noCorruption.getCorruptionIntensity()).toBe(0);
    });
  });
});
