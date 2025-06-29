import { SyntaxWisp } from '../../../src/domain/entities/SyntaxWisp.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('SyntaxWisp', () => {
  const validPosition = new Position(3, 4);
  const validConcept = 'Advanced VIM concept';

  describe('constructor', () => {
    it('should create a syntax wisp with default parameters', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept);

      expect(wisp.position).toEqual(validPosition);
      expect(wisp.advancedConcept).toBe(validConcept);
      expect(wisp.isOptional).toBe(true);
      expect(wisp.isActivated).toBe(false);
      expect(wisp.name).toBe('Syntax Wisp');
      expect(wisp.description).toBe('Optional lore spirit that explains advanced concepts');
      expect(wisp.etherealLevel).toBeGreaterThanOrEqual(70);
      expect(wisp.etherealLevel).toBeLessThanOrEqual(100);
      expect(typeof wisp.conceptDifficulty).toBe('number');
    });

    it('should create a syntax wisp with custom parameters', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept, false, true);

      expect(wisp.isOptional).toBe(false);
      expect(wisp.isActivated).toBe(true);
    });

    it('should throw error for invalid position', () => {
      expect(() => new SyntaxWisp('invalid', validConcept)).toThrow(
        'SyntaxWisp position must be a Position instance'
      );
    });

    it('should throw error for invalid concept', () => {
      expect(() => new SyntaxWisp(validPosition, '')).toThrow(
        'SyntaxWisp advancedConcept must be a non-empty string'
      );
      expect(() => new SyntaxWisp(validPosition, '   ')).toThrow(
        'SyntaxWisp advancedConcept must be a non-empty string'
      );
      expect(() => new SyntaxWisp(validPosition, 123)).toThrow(
        'SyntaxWisp advancedConcept must be a non-empty string'
      );
    });

    it('should throw error for invalid optional flag', () => {
      expect(() => new SyntaxWisp(validPosition, validConcept, 'invalid')).toThrow(
        'isOptional must be a boolean'
      );
    });

    it('should throw error for invalid activated flag', () => {
      expect(() => new SyntaxWisp(validPosition, validConcept, true, 'invalid')).toThrow(
        'isActivated must be a boolean'
      );
    });
  });

  describe('moveTo', () => {
    it('should return new wisp with new position', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept, false, true);
      const newPosition = new Position(5, 6);
      const newWisp = wisp.moveTo(newPosition);

      expect(newWisp.position).toEqual(newPosition);
      expect(newWisp.advancedConcept).toBe(validConcept);
      expect(newWisp.isOptional).toBe(false);
      expect(newWisp.isActivated).toBe(true);
      expect(newWisp).not.toBe(wisp);
    });

    it('should throw error for invalid position', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept);
      expect(() => wisp.moveTo('invalid')).toThrow('New position must be a Position instance');
    });
  });

  describe('activate', () => {
    it('should return new wisp with activated state', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept, true, false);
      const activatedWisp = wisp.activate();

      expect(activatedWisp.isActivated).toBe(true);
      expect(activatedWisp.position).toEqual(validPosition);
      expect(activatedWisp.advancedConcept).toBe(validConcept);
      expect(activatedWisp.isOptional).toBe(true);
      expect(activatedWisp).not.toBe(wisp);
    });
  });

  describe('deactivate', () => {
    it('should return new wisp with deactivated state', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept, true, true);
      const deactivatedWisp = wisp.deactivate();

      expect(deactivatedWisp.isActivated).toBe(false);
      expect(deactivatedWisp.position).toEqual(validPosition);
      expect(deactivatedWisp.advancedConcept).toBe(validConcept);
      expect(deactivatedWisp.isOptional).toBe(true);
      expect(deactivatedWisp).not.toBe(wisp);
    });
  });

  describe('shareLore', () => {
    it('should share lore when activated', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept, true, true);
      const lore = wisp.shareLore();

      expect(lore).not.toBeNull();
      expect(lore.concept).toBe(validConcept);
      expect(typeof lore.difficulty).toBe('number');
      expect(lore.etherealLevel).toBe(wisp.etherealLevel);
      expect(typeof lore.wisdom).toBe('string');
      expect(lore.wisdom).toContain(validConcept);
    });

    it('should return null when not activated', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept, true, false);
      const lore = wisp.shareLore();

      expect(lore).toBeNull();
    });
  });

  describe('canBeActivatedBy', () => {
    it('should return true for valid player', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept);
      const mockPlayer = { name: 'test player' };

      expect(wisp.canBeActivatedBy(mockPlayer)).toBe(true);
    });

    it('should return false for null or undefined player', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept);

      expect(wisp.canBeActivatedBy(null)).toBe(false);
      expect(wisp.canBeActivatedBy(undefined)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for wisps with same properties', () => {
      const wisp1 = new SyntaxWisp(validPosition, validConcept, true, false);
      const wisp2 = new SyntaxWisp(validPosition, validConcept, false, false);

      // Note: equals doesn't check isOptional, only position, concept, and activation
      expect(wisp1.equals(wisp2)).toBe(true);
    });

    it('should return false for wisps with different positions', () => {
      const wisp1 = new SyntaxWisp(new Position(1, 1), validConcept);
      const wisp2 = new SyntaxWisp(new Position(2, 2), validConcept);

      expect(wisp1.equals(wisp2)).toBe(false);
    });

    it('should return false for wisps with different concepts', () => {
      const wisp1 = new SyntaxWisp(validPosition, 'Concept 1');
      const wisp2 = new SyntaxWisp(validPosition, 'Concept 2');

      expect(wisp1.equals(wisp2)).toBe(false);
    });

    it('should return false for wisps with different activation states', () => {
      const wisp1 = new SyntaxWisp(validPosition, validConcept, true, false);
      const wisp2 = new SyntaxWisp(validPosition, validConcept, true, true);

      expect(wisp1.equals(wisp2)).toBe(false);
    });
  });

  describe('static factory methods', () => {
    it('should create regex wisp', () => {
      const wisp = SyntaxWisp.createRegexWisp(validPosition);

      expect(wisp.position).toEqual(validPosition);
      expect(wisp.advancedConcept).toContain('Regular expressions');
      expect(wisp.advancedConcept).toContain('\\v');
    });

    it('should create macro wisp', () => {
      const wisp = SyntaxWisp.createMacroWisp(validPosition);

      expect(wisp.position).toEqual(validPosition);
      expect(wisp.advancedConcept).toContain('VIM macros');
      expect(wisp.advancedConcept).toContain('qq');
    });

    it('should create buffer wisp', () => {
      const wisp = SyntaxWisp.createBufferWisp(validPosition);

      expect(wisp.position).toEqual(validPosition);
      expect(wisp.advancedConcept).toContain('Buffer mastery');
      expect(wisp.advancedConcept).toContain(':ls');
    });

    it('should create mark wisp', () => {
      const wisp = SyntaxWisp.createMarkWisp(validPosition);

      expect(wisp.position).toEqual(validPosition);
      expect(wisp.advancedConcept).toContain('VIM marks');
      expect(wisp.advancedConcept).toContain('ma');
    });

    it('should create fold wisp', () => {
      const wisp = SyntaxWisp.createFoldWisp(validPosition);

      expect(wisp.position).toEqual(validPosition);
      expect(wisp.advancedConcept).toContain('Text folding');
      expect(wisp.advancedConcept).toContain('zf');
    });
  });

  describe('concept difficulty calculation', () => {
    it('should calculate higher difficulty for complex concepts', () => {
      const complexConcept = 'Advanced regex patterns with macro integration';
      const wisp = new SyntaxWisp(validPosition, complexConcept);

      expect(wisp.conceptDifficulty).toBeGreaterThan(5);
    });

    it('should calculate lower difficulty for simple concepts', () => {
      const simpleConcept = 'Basic text editing';
      const wisp = new SyntaxWisp(validPosition, simpleConcept);

      expect(wisp.conceptDifficulty).toBeLessThanOrEqual(5);
    });
  });

  describe('visual appearance', () => {
    it('should have appearance properties', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept);

      expect(wisp.appearance).toBeDefined();
      expect(wisp.appearance.symbol).toBe('~');
      expect(wisp.appearance.baseColor).toBe('#DDA0DD');
      expect(wisp.appearance.glowColor).toBe('#E6E6FA');
      expect(wisp.appearance.cssClass).toBe('syntax-wisp');
      expect(wisp.appearance.floatingGlyphs).toContain('\\');
      expect(wisp.appearance.floatingGlyphs).toContain('/');
    });

    it('should return dim symbol when not activated', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept, true, false);

      expect(wisp.getVisualSymbol()).toBe('·');
    });

    it('should return wisp symbol when activated', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept, true, true);

      expect(wisp.getVisualSymbol()).toBe('~');
    });

    it('should return random floating glyph', () => {
      const wisp = new SyntaxWisp(validPosition, validConcept);
      const glyph = wisp.getFloatingGlyph();

      expect(wisp.appearance.floatingGlyphs).toContain(glyph);
    });

    it('should calculate ethereal opacity based on activation and level', () => {
      const activatedWisp = new SyntaxWisp(validPosition, validConcept, true, true);
      const deactivatedWisp = new SyntaxWisp(validPosition, validConcept, true, false);

      const activatedOpacity = activatedWisp.getEtherealOpacity();
      const deactivatedOpacity = deactivatedWisp.getEtherealOpacity();

      expect(activatedOpacity).toBeGreaterThan(deactivatedOpacity);
      expect(activatedOpacity).toBeLessThanOrEqual(1.0);
      expect(deactivatedOpacity).toBeLessThanOrEqual(1.0);
    });
  });
});
