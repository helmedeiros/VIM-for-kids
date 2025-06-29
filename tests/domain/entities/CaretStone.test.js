import { CaretStone } from '../../../src/domain/entities/CaretStone.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('CaretStone', () => {
  let caretStone;
  const testPosition = new Position(5, 5);

  beforeEach(() => {
    caretStone = new CaretStone('test-stone', testPosition);
  });

  describe('Constructor', () => {
    test('should create CaretStone with correct properties', () => {
      expect(caretStone.id).toBe('test-stone');
      expect(caretStone.position).toBe(testPosition);
      expect(caretStone.type).toBe('caret_stone');
      expect(caretStone.discovered).toBe(false);
    });

    test('should have correct role and personality', () => {
      expect(caretStone.role).toBe('Guardian of VIM basics');
      expect(caretStone.personality).toBe('Ancient, speaks in short phrases');
      expect(caretStone.wisdom).toBe('Tests first motion skills (hjkl)');
    });

    test('should have visual appearance properties', () => {
      expect(caretStone.appearance).toBeDefined();
      expect(caretStone.appearance.symbol).toBe('🗿');
      expect(caretStone.appearance.colors.primary).toBe('#8FBC8F');
      expect(caretStone.appearance.floatingGlyphs).toContain('h');
      expect(caretStone.appearance.floatingGlyphs).toContain('j');
      expect(caretStone.appearance.floatingGlyphs).toContain('k');
      expect(caretStone.appearance.floatingGlyphs).toContain('l');
    });
  });

  describe('Visual Symbol', () => {
    test('should return "?" when not discovered', () => {
      expect(caretStone.getVisualSymbol()).toBe('?');
    });

    test('should return main symbol when discovered', () => {
      caretStone.discover();
      expect(caretStone.getVisualSymbol()).toBe('🗿');
    });
  });

  describe('Alternative Symbols', () => {
    test('should return fallback symbols', () => {
      expect(caretStone.getAlternativeSymbol(0)).toBe('♦');
      expect(caretStone.getAlternativeSymbol(1)).toBe('◆');
      expect(caretStone.getAlternativeSymbol(999)).toBe('🗿'); // Default fallback
    });
  });

  describe('Floating Glyphs', () => {
    test('should return random floating glyph', () => {
      const glyph = caretStone.getFloatingGlyph();
      expect(caretStone.appearance.floatingGlyphs).toContain(glyph);
    });

    test('should include motion keys in floating glyphs', () => {
      const glyphs = caretStone.appearance.floatingGlyphs;
      expect(glyphs).toContain('h');
      expect(glyphs).toContain('j');
      expect(glyphs).toContain('k');
      expect(glyphs).toContain('l');
      expect(glyphs).toContain('^');
    });
  });

  describe('State Management', () => {
    test('should track discovery state', () => {
      expect(caretStone.isResting()).toBe(true);
      expect(caretStone.discovered).toBe(false);

      caretStone.discover();

      expect(caretStone.isResting()).toBe(false);
      expect(caretStone.discovered).toBe(true);
    });

    test('should adjust glow intensity based on state', () => {
      expect(caretStone.getGlowIntensity()).toBe(0.3); // Not discovered

      caretStone.discover();
      expect(caretStone.getGlowIntensity()).toBe(0.8); // Discovered
    });
  });

  describe('Wisdom', () => {
    test('should return ancient wisdom', () => {
      const wisdom = caretStone.getWisdom();
      expect(typeof wisdom).toBe('string');
      expect(wisdom.length).toBeGreaterThan(0);
    });

    test('should return different wisdom on multiple calls', () => {
      const wisdoms = new Set();
      for (let i = 0; i < 20; i++) {
        wisdoms.add(caretStone.getWisdom());
      }
      expect(wisdoms.size).toBeGreaterThan(1); // Should get different wisdom
    });
  });
});
