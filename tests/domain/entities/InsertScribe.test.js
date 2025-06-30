import { InsertScribe } from '../../../src/domain/entities/InsertScribe.js';

describe('InsertScribe', () => {
  let insertScribe;

  beforeEach(() => {
    insertScribe = new InsertScribe('scribe-1', { x: 5, y: 5 });
  });

  describe('Constructor', () => {
    it('should create InsertScribe with correct properties', () => {
      expect(insertScribe.id).toBe('scribe-1');
      expect(insertScribe.position).toEqual({ x: 5, y: 5 });
      expect(insertScribe.type).toBe('insert_scribe');
      expect(insertScribe.writing).toBe(false);
      expect(insertScribe.inspiration).toBe(0.7);
      expect(insertScribe.role).toBe('Master of Text Creation');
      expect(insertScribe.personality).toBe('Helpful, poetic');
      expect(insertScribe.wisdom).toBe('Guides insertion and line creation (i, a, o, O)');
    });

    it('should have correct visual appearance properties', () => {
      expect(insertScribe.appearance.symbol).toBe('✏️');
      expect(insertScribe.appearance.alternativeSymbols).toContain('✎');
      expect(insertScribe.appearance.colors.primary).toBe('#4169E1');
      expect(insertScribe.appearance.floatingGlyphs).toContain('i');
      expect(insertScribe.appearance.poeticSymbols).toContain('♪');
    });
  });

  describe('Visual Symbol', () => {
    it('should return main symbol when not writing', () => {
      insertScribe.writing = false;
      expect(insertScribe.getVisualSymbol()).toBe('✏️');
    });

    it('should return writing symbols when writing', () => {
      insertScribe.writing = true;
      const symbol = insertScribe.getVisualSymbol();
      expect(['✏️', '✎', '✍']).toContain(symbol);
    });
  });

  describe('Alternative Symbols', () => {
    it('should return alternative symbols by index', () => {
      expect(insertScribe.getAlternativeSymbol(0)).toBe('✎');
      expect(insertScribe.getAlternativeSymbol(1)).toBe('✍');
      expect(insertScribe.getAlternativeSymbol(2)).toBe('✒');
    });

    it('should return main symbol for invalid index', () => {
      expect(insertScribe.getAlternativeSymbol(99)).toBe('✏️');
    });
  });

  describe('Floating Glyphs', () => {
    it('should return regular glyphs when not writing', () => {
      insertScribe.writing = false;
      const glyph = insertScribe.getFloatingGlyph();
      expect([...insertScribe.appearance.floatingGlyphs]).toContain(glyph);
    });

    it('should return extended glyphs when writing', () => {
      insertScribe.writing = true;
      const glyph = insertScribe.getFloatingGlyph();
      const allGlyphs = [
        ...insertScribe.appearance.floatingGlyphs,
        ...insertScribe.appearance.poeticSymbols,
      ];
      expect(allGlyphs).toContain(glyph);
    });
  });

  describe('Inspiration Level', () => {
    it('should return base inspiration when not writing', () => {
      insertScribe.writing = false;
      insertScribe.inspiration = 0.5;
      expect(insertScribe.getInspirationLevel()).toBe(0.5);
    });

    it('should return boosted inspiration when writing', () => {
      insertScribe.writing = true;
      insertScribe.inspiration = 0.5;
      expect(insertScribe.getInspirationLevel()).toBe(0.7);
    });
  });

  describe('Writing State Management', () => {
    it('should start writing and increase inspiration', () => {
      insertScribe.inspiration = 0.5;
      insertScribe.startWriting();
      expect(insertScribe.writing).toBe(true);
      expect(insertScribe.inspiration).toBe(0.6);
    });

    it('should cap inspiration at 1.0 when starting writing', () => {
      insertScribe.inspiration = 0.95;
      insertScribe.startWriting();
      expect(insertScribe.inspiration).toBe(1.0);
    });

    it('should stop writing but maintain inspiration', () => {
      insertScribe.writing = true;
      insertScribe.inspiration = 0.8;
      insertScribe.stopWriting();
      expect(insertScribe.writing).toBe(false);
      expect(insertScribe.inspiration).toBe(0.8);
    });
  });

  describe('Poetry', () => {
    it('should return random poetic verses', () => {
      const poetry1 = insertScribe.getPoetry();
      expect(typeof poetry1).toBe('string');
      expect(poetry1.length).toBeGreaterThan(0);

      // Test multiple calls to ensure randomness works
      const poetry2 = insertScribe.getPoetry();
      expect(typeof poetry2).toBe('string');
    });
  });

  describe('Dialogue - No Writing State', () => {
    it('should return introduction when not writing', () => {
      insertScribe.writing = false;
      const gameState = { collectedKeys: new Set() };
      const dialogue = insertScribe.getDialogue(gameState);

      expect(dialogue).toContain('*A figure in bright robes looks up from writing*');
      expect(dialogue).toContain("I am the Insert Scribe, keeper of creation's keys.");
    });
  });

  describe('Dialogue - Missing Keys', () => {
    beforeEach(() => {
      insertScribe.writing = true;
    });

    it('should guide for missing "i" key', () => {
      const gameState = { collectedKeys: new Set() };
      const dialogue = insertScribe.getDialogue(gameState);

      expect(dialogue).toContain('First, learn the gentlest entry: "i"');
      expect(dialogue.join(' ')).toContain('Insert before the cursor rests,');
    });

    it('should guide for missing "a" key when "i" is collected', () => {
      const gameState = { collectedKeys: new Set(['i']) };
      const dialogue = insertScribe.getDialogue(gameState);

      expect(dialogue.join(' ')).toContain('"a" appends, it follows through,');
      expect(dialogue).toContain('Find append, and double your power.');
    });

    it('should guide for missing "o" key when "i" and "a" are collected', () => {
      const gameState = { collectedKeys: new Set(['i', 'a']) };
      const dialogue = insertScribe.getDialogue(gameState);

      expect(dialogue).toContain('But what of breathing room? New space?');
      expect(dialogue.join(' ')).toContain('"o" opens lines below with grace,');
    });

    it('should guide for missing "O" key when "i", "a", "o" are collected', () => {
      const gameState = { collectedKeys: new Set(['i', 'a', 'o']) };
      const dialogue = insertScribe.getDialogue(gameState);

      expect(dialogue).toContain('One final mystery remains above...');
      expect(dialogue.join(' ')).toContain('"O" opens lines where none existed,');
    });
  });

  describe('Dialogue - All Keys Collected', () => {
    it('should celebrate when all insertion keys are collected', () => {
      insertScribe.writing = true;
      const gameState = { collectedKeys: new Set(['i', 'a', 'o', 'O']) };
      const dialogue = insertScribe.getDialogue(gameState);

      expect(dialogue).toContain('Magnificent! The Four Insertions sing in harmony!');
      expect(dialogue.join(' ')).toContain('"i" before, "a" after, "o" below, "O" above,');
      expect(dialogue).toContain('You have mastered the art of creation!');
    });
  });

  describe('Dialogue - Default Cases', () => {
    it('should return default dialogue for empty gameState', () => {
      insertScribe.writing = true;
      const dialogue = insertScribe.getDialogue();

      expect(dialogue).toContain('First, learn the gentlest entry: "i"');
    });

    it('should return continuing dialogue for partial progress', () => {
      insertScribe.writing = true;
      // Test case with some keys but not matching exact conditions
      const gameState = { collectedKeys: new Set(['x']) };
      const dialogue = insertScribe.getDialogue(gameState);

      expect(dialogue).toContain('First, learn the gentlest entry: "i"');
    });
  });

  describe('Insertion Teaching', () => {
    it('should return specific teaching for "i"', () => {
      const teaching = insertScribe.getInsertionTeaching('i');
      expect(teaching).toContain('INSERT awakens!');
      expect(teaching).toContain('Before the cursor, creation flows.');
    });

    it('should return specific teaching for "a"', () => {
      const teaching = insertScribe.getInsertionTeaching('a');
      expect(teaching).toContain('APPEND embraces!');
      expect(teaching).toContain('After cursor, text grows.');
    });

    it('should return specific teaching for "o"', () => {
      const teaching = insertScribe.getInsertionTeaching('o');
      expect(teaching).toContain('OPEN below!');
      expect(teaching).toContain('New lines bloom like flowers.');
    });

    it('should return specific teaching for "O"', () => {
      const teaching = insertScribe.getInsertionTeaching('O');
      expect(teaching).toContain('OPEN above!');
      expect(teaching).toContain('Space for thoughts like towers.');
    });

    it('should return default teaching for unknown insertion', () => {
      const teaching = insertScribe.getInsertionTeaching('z');
      expect(teaching).toContain('Practice the sacred insertions...');
    });
  });

  describe('Encouragement', () => {
    it('should return encouraging messages', () => {
      const encouragement = insertScribe.getEncouragement();
      expect(typeof encouragement).toBe('string');
      expect(encouragement.length).toBeGreaterThan(0);
    });
  });

  describe('Creative Wisdom', () => {
    it('should return creative wisdom', () => {
      const wisdom = insertScribe.getCreativeWisdom();
      expect(typeof wisdom).toBe('string');
      expect(wisdom.length).toBeGreaterThan(0);
    });
  });
});
