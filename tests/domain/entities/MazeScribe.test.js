import { MazeScribe } from '../../../src/domain/entities/MazeScribe.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('MazeScribe', () => {
  let mazeScribe;
  const testPosition = new Position(3, 7);

  beforeEach(() => {
    mazeScribe = new MazeScribe('test-scribe', testPosition);
  });

  describe('Constructor', () => {
    test('should create MazeScribe with correct properties', () => {
      expect(mazeScribe.id).toBe('test-scribe');
      expect(mazeScribe.position).toBe(testPosition);
      expect(mazeScribe.type).toBe('maze_scribe');
      expect(mazeScribe.scrollUnfurled).toBe(false);
    });

    test('should have correct role and personality', () => {
      expect(mazeScribe.role).toBe('Teacher of Sacred Modes');
      expect(mazeScribe.personality).toBe('Cryptic teacher, asks riddles');
      expect(mazeScribe.wisdom).toBe('Explains i, ESC, v transitions');
    });

    test('should have visual appearance properties', () => {
      expect(mazeScribe.appearance).toBeDefined();
      expect(mazeScribe.appearance.symbol).toBe('📜');
      expect(mazeScribe.appearance.colors.primary).toBe('#DEB887');
      expect(mazeScribe.appearance.floatingGlyphs).toContain('i');
      expect(mazeScribe.appearance.floatingGlyphs).toContain('ESC');
      expect(mazeScribe.appearance.floatingGlyphs).toContain('v');
    });
  });

  describe('Visual Symbol', () => {
    test('should return hooded figure when scroll not unfurled', () => {
      expect(mazeScribe.getVisualSymbol()).toBe('◎');
    });

    test('should return scroll when unfurled', () => {
      mazeScribe.unfurlScroll();
      expect(mazeScribe.getVisualSymbol()).toBe('📜');
    });
  });

  describe('Alternative Symbols', () => {
    test('should return fallback symbols', () => {
      expect(mazeScribe.getAlternativeSymbol(0)).toBe('§');
      expect(mazeScribe.getAlternativeSymbol(1)).toBe('¤');
      expect(mazeScribe.getAlternativeSymbol(999)).toBe('📜'); // Default fallback
    });
  });

  describe('Floating Glyphs', () => {
    test('should return random floating glyph', () => {
      const glyph = mazeScribe.getFloatingGlyph();
      expect(mazeScribe.appearance.floatingGlyphs).toContain(glyph);
    });

    test('should include mode keys in floating glyphs', () => {
      const glyphs = mazeScribe.appearance.floatingGlyphs;
      expect(glyphs).toContain('i');
      expect(glyphs).toContain('ESC');
      expect(glyphs).toContain('v');
      expect(glyphs).toContain(':');
    });
  });

  describe('Scroll Management', () => {
    test('should track scroll state', () => {
      expect(mazeScribe.scrollUnfurled).toBe(false);

      mazeScribe.unfurlScroll();
      expect(mazeScribe.scrollUnfurled).toBe(true);
    });

    test('should adjust ink glow based on scroll state', () => {
      expect(mazeScribe.getInkGlowIntensity()).toBe(0.4); // Not unfurled

      mazeScribe.unfurlScroll();
      expect(mazeScribe.getInkGlowIntensity()).toBe(0.9); // Unfurled
    });
  });

  describe('Riddles', () => {
    test('should return cryptic riddles', () => {
      const riddle = mazeScribe.getRiddle();
      expect(typeof riddle).toBe('string');
      expect(riddle.length).toBeGreaterThan(0);
    });

    test('should return different riddles on multiple calls', () => {
      const riddles = new Set();
      for (let i = 0; i < 20; i++) {
        riddles.add(mazeScribe.getRiddle());
      }
      expect(riddles.size).toBeGreaterThan(1); // Should get different riddles
    });
  });

  describe('Mode Wisdom', () => {
    test('should return mode wisdom', () => {
      const wisdom = mazeScribe.getModeWisdom();
      expect(typeof wisdom).toBe('string');
      expect(wisdom.length).toBeGreaterThan(0);
    });

    test('should include different modes in wisdom', () => {
      const wisdoms = new Set();
      for (let i = 0; i < 20; i++) {
        wisdoms.add(mazeScribe.getModeWisdom());
      }
      expect(wisdoms.size).toBeGreaterThan(1); // Should get different mode wisdom
    });
  });
});
