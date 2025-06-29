import { CaretSpirit } from '../../../src/domain/entities/CaretSpirit.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('CaretSpirit', () => {
  const validPosition = new Position(3, 4);
  const validKnowledge = 'Test VIM knowledge';

  describe('constructor', () => {
    it('should create a caret spirit with valid parameters', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge);

      expect(spirit.position).toEqual(validPosition);
      expect(spirit.knowledge).toBe(validKnowledge);
      expect(spirit.isDiscovered).toBe(false);
      expect(spirit.name).toBe('Caret Spirit');
      expect(spirit.description).toBe('Guardian of VIM knowledge scattered across the land');
      expect(spirit.wisdomLevel).toBeGreaterThanOrEqual(50);
      expect(spirit.wisdomLevel).toBeLessThanOrEqual(100);
    });

    it('should create a caret spirit with custom discovery state', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge, true);
      expect(spirit.isDiscovered).toBe(true);
    });

    it('should throw error for invalid position', () => {
      expect(() => new CaretSpirit('invalid', validKnowledge)).toThrow(
        'CaretSpirit position must be a Position instance'
      );
    });

    it('should throw error for invalid knowledge', () => {
      expect(() => new CaretSpirit(validPosition, '')).toThrow(
        'CaretSpirit knowledge must be a non-empty string'
      );
      expect(() => new CaretSpirit(validPosition, '   ')).toThrow(
        'CaretSpirit knowledge must be a non-empty string'
      );
      expect(() => new CaretSpirit(validPosition, 123)).toThrow(
        'CaretSpirit knowledge must be a non-empty string'
      );
    });

    it('should throw error for invalid discovery state', () => {
      expect(() => new CaretSpirit(validPosition, validKnowledge, 'invalid')).toThrow(
        'isDiscovered must be a boolean'
      );
    });
  });

  describe('moveTo', () => {
    it('should return new spirit with new position', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge, true);
      const newPosition = new Position(5, 6);
      const newSpirit = spirit.moveTo(newPosition);

      expect(newSpirit.position).toEqual(newPosition);
      expect(newSpirit.knowledge).toBe(validKnowledge);
      expect(newSpirit.isDiscovered).toBe(true);
      expect(newSpirit).not.toBe(spirit);
    });

    it('should throw error for invalid position', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge);
      expect(() => spirit.moveTo('invalid')).toThrow('New position must be a Position instance');
    });
  });

  describe('discover', () => {
    it('should return new spirit with discovered state', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge, false);
      const discoveredSpirit = spirit.discover();

      expect(discoveredSpirit.isDiscovered).toBe(true);
      expect(discoveredSpirit.position).toEqual(validPosition);
      expect(discoveredSpirit.knowledge).toBe(validKnowledge);
      expect(discoveredSpirit).not.toBe(spirit);
    });
  });

  describe('shareKnowledge', () => {
    it('should share knowledge when discovered', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge, true);
      const sharedKnowledge = spirit.shareKnowledge();

      expect(sharedKnowledge.wisdom).toBe(validKnowledge);
      expect(sharedKnowledge.level).toBe(spirit.wisdomLevel);
      expect(sharedKnowledge.spirit).toBe('Caret Spirit');
    });

    it('should throw error when not discovered', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge, false);
      expect(() => spirit.shareKnowledge()).toThrow(
        'Cannot share knowledge with an undiscovered CaretSpirit'
      );
    });
  });

  describe('equals', () => {
    it('should return true for spirits with same position and knowledge', () => {
      const spirit1 = new CaretSpirit(validPosition, validKnowledge, false);
      const spirit2 = new CaretSpirit(validPosition, validKnowledge, true);

      expect(spirit1.equals(spirit2)).toBe(true);
    });

    it('should return false for spirits with different positions', () => {
      const spirit1 = new CaretSpirit(new Position(1, 1), validKnowledge);
      const spirit2 = new CaretSpirit(new Position(2, 2), validKnowledge);

      expect(spirit1.equals(spirit2)).toBe(false);
    });

    it('should return false for spirits with different knowledge', () => {
      const spirit1 = new CaretSpirit(validPosition, 'Knowledge 1');
      const spirit2 = new CaretSpirit(validPosition, 'Knowledge 2');

      expect(spirit1.equals(spirit2)).toBe(false);
    });
  });

  describe('static factory methods', () => {
    it('should create VIM movement guardian', () => {
      const spirit = CaretSpirit.createVimMovementGuardian(validPosition);

      expect(spirit.position).toEqual(validPosition);
      expect(spirit.knowledge).toContain('sacred movement keys');
      expect(spirit.knowledge).toContain('h moves left');
    });

    it('should create VIM command guardian', () => {
      const spirit = CaretSpirit.createVimCommandGuardian(validPosition);

      expect(spirit.position).toEqual(validPosition);
      expect(spirit.knowledge).toContain('Beyond movement lies power');
      expect(spirit.knowledge).toContain('i for insert');
    });

    it('should create VIM edit guardian', () => {
      const spirit = CaretSpirit.createVimEditGuardian(validPosition);

      expect(spirit.position).toEqual(validPosition);
      expect(spirit.knowledge).toContain('Transform text with purpose');
      expect(spirit.knowledge).toContain('dd to delete');
    });
  });

  describe('visual appearance', () => {
    it('should have appearance properties', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge);

      expect(spirit.appearance).toBeDefined();
      expect(spirit.appearance.symbol).toBe('🔥');
      expect(spirit.appearance.baseColor).toBe('#40E0D0');
      expect(spirit.appearance.glowColor).toBe('#E0FFFF');
      expect(spirit.appearance.accentColor).toBe('#87CEEB');
      expect(spirit.appearance.cssClass).toBe('caret-spirit');
      expect(spirit.appearance.alternativeSymbols).toContain('♦');
      expect(spirit.appearance.floatingGlyphs).toContain(':');
      expect(spirit.appearance.floatingGlyphs).toContain('h');
      expect(spirit.appearance.floatingGlyphs).toContain('^');
    });

    it('should return mystery symbol when not discovered', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge, false);

      expect(spirit.getVisualSymbol()).toBe('?');
    });

    it('should return flame symbol when discovered', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge, true);

      expect(spirit.getVisualSymbol()).toBe('🔥');
    });

    it('should return alternative symbols for fallback', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge, true);

      expect(spirit.getAlternativeSymbol(0)).toBe('♦');
      expect(spirit.getAlternativeSymbol(1)).toBe('◆');
      expect(spirit.getAlternativeSymbol(2)).toBe('▲');
    });

    it('should return mystery symbol for alternatives when not discovered', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge, false);

      expect(spirit.getAlternativeSymbol()).toBe('?');
    });

    it('should return random floating glyph', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge);
      const glyph = spirit.getFloatingGlyph();

      expect(spirit.appearance.floatingGlyphs).toContain(glyph);
    });

    it('should calculate glow intensity based on wisdom level', () => {
      const spirit = new CaretSpirit(validPosition, validKnowledge);
      const intensity = spirit.getGlowIntensity();

      expect(intensity).toBeGreaterThanOrEqual(5); // Min wisdom is 50
      expect(intensity).toBeLessThanOrEqual(10); // Max wisdom is 100
      expect(typeof intensity).toBe('number');
    });
  });
});
