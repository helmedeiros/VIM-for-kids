import { DeletionEcho } from '../../../src/domain/entities/DeletionEcho.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('DeletionEcho', () => {
  let deletionEcho;
  const testPosition = new Position(2, 8);

  beforeEach(() => {
    deletionEcho = new DeletionEcho('test-echo', testPosition);
  });

  describe('Constructor', () => {
    test('should create DeletionEcho with correct properties', () => {
      expect(deletionEcho.id).toBe('test-echo');
      expect(deletionEcho.position).toBe(testPosition);
      expect(deletionEcho.type).toBe('deletion_echo');
      expect(deletionEcho.haunting).toBe(false);
      expect(deletionEcho.corruptionLevel).toBe(0.6);
    });

    test('should have correct role and personality', () => {
      expect(deletionEcho.role).toBe('Guardian of Deleted Text');
      expect(deletionEcho.personality).toBe('Spooky, murmurs warnings');
      expect(deletionEcho.wisdom).toBe('Haunts deletion puzzles with broken syntax');
    });

    test('should have visual appearance properties', () => {
      expect(deletionEcho.appearance).toBeDefined();
      expect(deletionEcho.appearance.symbol).toBe('👻');
      expect(deletionEcho.appearance.colors.primary).toBe('#2F4F4F');
      expect(deletionEcho.appearance.floatingGlyphs).toContain('x');
      expect(deletionEcho.appearance.floatingGlyphs).toContain('dd');
      expect(deletionEcho.appearance.brokenText).toContain('er#or');
    });
  });

  describe('Visual Symbol', () => {
    test('should return main symbol when not haunting', () => {
      expect(deletionEcho.getVisualSymbol()).toBe('👻');
    });

    test('should return glitch symbols when haunting', () => {
      deletionEcho.startHaunting();
      const symbol = deletionEcho.getVisualSymbol();
      expect(['👻', '▓', '▒', '░']).toContain(symbol);
    });
  });

  describe('Alternative Symbols', () => {
    test('should return fallback symbols', () => {
      expect(deletionEcho.getAlternativeSymbol(0)).toBe('▓');
      expect(deletionEcho.getAlternativeSymbol(1)).toBe('▒');
      expect(deletionEcho.getAlternativeSymbol(999)).toBe('👻'); // Default fallback
    });
  });

  describe('Floating Glyphs', () => {
    test('should return random floating glyph including broken text', () => {
      const glyph = deletionEcho.getFloatingGlyph();
      const allGlyphs = [
        ...deletionEcho.appearance.floatingGlyphs,
        ...deletionEcho.appearance.brokenText,
      ];
      expect(allGlyphs).toContain(glyph);
    });

    test('should include deletion keys in floating glyphs', () => {
      const glyphs = deletionEcho.appearance.floatingGlyphs;
      expect(glyphs).toContain('x');
      expect(glyphs).toContain('dd');
      expect(glyphs).toContain('D');
      expect(glyphs).toContain('dw');
    });
  });

  describe('Haunting Management', () => {
    test('should track haunting state', () => {
      expect(deletionEcho.haunting).toBe(false);

      deletionEcho.startHaunting();
      expect(deletionEcho.haunting).toBe(true);
      expect(deletionEcho.corruptionLevel).toBe(0.8); // Increased by 0.2

      deletionEcho.stopHaunting();
      expect(deletionEcho.haunting).toBe(false);
      expect(deletionEcho.corruptionLevel).toBeCloseTo(0.7, 1); // Decreased by 0.1
    });

    test('should cap corruption level at 1.0', () => {
      deletionEcho.corruptionLevel = 0.9;
      deletionEcho.startHaunting();
      expect(deletionEcho.corruptionLevel).toBe(1.0); // Capped at max
    });

    test('should have minimum corruption level of 0.3', () => {
      deletionEcho.corruptionLevel = 0.3;
      deletionEcho.stopHaunting();
      expect(deletionEcho.corruptionLevel).toBe(0.3); // Capped at min
    });
  });

  describe('Corruption Intensity', () => {
    test('should return base corruption when not haunting', () => {
      expect(deletionEcho.getCorruptionIntensity()).toBe(0.6);
    });

    test('should add bonus when haunting', () => {
      deletionEcho.startHaunting();
      expect(deletionEcho.getCorruptionIntensity()).toBe(1.1); // 0.8 base + 0.3 bonus
    });
  });

  describe('Warnings', () => {
    test('should return spooky warnings', () => {
      const warning = deletionEcho.getWarning();
      expect(typeof warning).toBe('string');
      expect(warning.length).toBeGreaterThan(0);
    });

    test('should return different warnings on multiple calls', () => {
      const warnings = new Set();
      for (let i = 0; i < 20; i++) {
        warnings.add(deletionEcho.getWarning());
      }
      expect(warnings.size).toBeGreaterThan(1); // Should get different warnings
    });
  });

  describe('Murmurs', () => {
    test('should return ghostly murmurs', () => {
      const murmur = deletionEcho.getMurmur();
      expect(typeof murmur).toBe('string');
      expect(murmur.length).toBeGreaterThan(0);
      expect(murmur).toMatch(/\*.*\*/); // Should contain *whispers* or similar
    });

    test('should return different murmurs on multiple calls', () => {
      const murmurs = new Set();
      for (let i = 0; i < 20; i++) {
        murmurs.add(deletionEcho.getMurmur());
      }
      expect(murmurs.size).toBeGreaterThan(1); // Should get different murmurs
    });
  });

  describe('Dialogue System', () => {
    test('should provide initial dialogue when not haunting', () => {
      deletionEcho.haunting = false;
      const dialogue = deletionEcho.getDialogue();

      expect(dialogue).toContain('*A ghostly figure materializes from the canyon mist*');
      expect(dialogue).toContain('I am the Echo... of all that was erased...');
      expect(dialogue).toContain('*whispers* You seek the power of deletion?');
    });

    test('should guide player to learn x key when missing', () => {
      deletionEcho.startHaunting();
      const gameState = { collectedKeys: new Set() };
      const dialogue = deletionEcho.getDialogue(gameState);

      expect(dialogue).toContain('Begin with precision... single character death.');
      expect(dialogue).toContain('x marks the spot... where text shall fall.');
    });

    test('should guide player to learn dd key when x is learned but dd is missing', () => {
      deletionEcho.startHaunting();
      const gameState = { collectedKeys: new Set(['x']) };
      const dialogue = deletionEcho.getDialogue(gameState);

      expect(dialogue).toContain('dd... the line destroyer... entire rows vanish.');
      expect(dialogue).toContain('Find the power... to erase complete thoughts.');
    });

    test('should guide player to learn D key when x and dd are learned but D is missing', () => {
      deletionEcho.startHaunting();
      const gameState = { collectedKeys: new Set(['x', 'dd']) };
      const dialogue = deletionEcho.getDialogue(gameState);

      expect(dialogue).toContain('But what of... partial destruction?');
      expect(dialogue).toContain("D takes all... from cursor to line's end.");
      expect(dialogue).toContain('Seek the capital... in the deepest shadows.');
    });

    test('should guide player to learn dw key when x, dd, and D are learned but dw is missing', () => {
      deletionEcho.startHaunting();
      const gameState = { collectedKeys: new Set(['x', 'dd', 'D']) };
      const dialogue = deletionEcho.getDialogue(gameState);

      expect(dialogue).toContain('One power remains... word by word.');
      expect(dialogue).toContain('dw... deletes entire words... thoughts disappear.');
      expect(dialogue).toContain('Find this final piece... complete the destruction.');
    });

    test('should provide mastery dialogue when all deletion keys are learned', () => {
      deletionEcho.startHaunting();
      const gameState = { collectedKeys: new Set(['x', 'dd', 'D', 'dw']) };
      const dialogue = deletionEcho.getDialogue(gameState);

      expect(dialogue).toContain('You have mastered... the Four Deletions.');
      expect(dialogue).toContain('x for precision, dd for lines, D for ends, dw for words.');
      expect(dialogue).toContain('*nods approvingly* The canyon recognizes your power.');
      expect(dialogue).toContain('But remember... *fading* ...with deletion comes responsibility.');
    });

    test('should handle missing gameState gracefully', () => {
      deletionEcho.startHaunting();
      const dialogue = deletionEcho.getDialogue();

      // Should default to the !hasX branch
      expect(dialogue).toContain('Begin with precision... single character death.');
    });

    test('should handle empty gameState gracefully', () => {
      deletionEcho.startHaunting();
      const dialogue = deletionEcho.getDialogue({});

      // Should default to the !hasX branch
      expect(dialogue).toContain('Begin with precision... single character death.');
    });
  });
});
