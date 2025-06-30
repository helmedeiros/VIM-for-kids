import { MirrorSprite } from '../../../src/domain/entities/MirrorSprite.js';

describe('MirrorSprite', () => {
  let mirrorSprite;

  beforeEach(() => {
    mirrorSprite = new MirrorSprite('sprite-1', { x: 3, y: 3 });
  });

  describe('Constructor', () => {
    it('should create MirrorSprite with correct properties', () => {
      expect(mirrorSprite.id).toBe('sprite-1');
      expect(mirrorSprite.position).toEqual({ x: 3, y: 3 });
      expect(mirrorSprite.type).toBe('mirror_sprite');
      expect(mirrorSprite.reflecting).toBe(true);
      expect(mirrorSprite.visibility).toBe(0.8);
      expect(mirrorSprite.shimmerPhase).toBe(0);
      expect(mirrorSprite.role).toBe('Guardian of Search Mysteries');
      expect(mirrorSprite.personality).toBe('Whispers hints, vanishes quickly');
      expect(mirrorSprite.wisdom).toBe('Guides search and navigation (/, ?, n, N)');
    });

    it('should have correct visual appearance properties', () => {
      expect(mirrorSprite.appearance.symbol).toBe('💧');
      expect(mirrorSprite.appearance.alternativeSymbols).toContain('◊');
      expect(mirrorSprite.appearance.colors.primary).toBe('#C0C0C0');
      expect(mirrorSprite.appearance.floatingGlyphs).toContain('/');
      expect(mirrorSprite.appearance.reflectionSymbols).toContain('⟡');
    });
  });

  describe('Visual Symbol', () => {
    it('should return nearly invisible symbol when visibility is very low', () => {
      mirrorSprite.visibility = 0.2;
      expect(mirrorSprite.getVisualSymbol()).toBe('·');
    });

    it('should return main symbol when not reflecting', () => {
      mirrorSprite.reflecting = false;
      mirrorSprite.visibility = 0.8;
      expect(mirrorSprite.getVisualSymbol()).toBe('💧');
    });

    it('should return shimmer symbols when reflecting', () => {
      mirrorSprite.reflecting = true;
      mirrorSprite.visibility = 0.8;
      mirrorSprite.shimmerPhase = 0;
      const symbol = mirrorSprite.getVisualSymbol();
      expect(['💧', '◊', '◇']).toContain(symbol);
    });

    it('should cycle through shimmer symbols based on phase', () => {
      mirrorSprite.reflecting = true;
      mirrorSprite.visibility = 0.8;

      mirrorSprite.shimmerPhase = 0;
      const symbol1 = mirrorSprite.getVisualSymbol();

      mirrorSprite.shimmerPhase = 1;
      const symbol2 = mirrorSprite.getVisualSymbol();

      mirrorSprite.shimmerPhase = 2;
      const symbol3 = mirrorSprite.getVisualSymbol();

      expect(['💧', '◊', '◇']).toContain(symbol1);
      expect(['💧', '◊', '◇']).toContain(symbol2);
      expect(['💧', '◊', '◇']).toContain(symbol3);
    });
  });

  describe('Alternative Symbols', () => {
    it('should return alternative symbols by index', () => {
      expect(mirrorSprite.getAlternativeSymbol(0)).toBe('◊');
      expect(mirrorSprite.getAlternativeSymbol(1)).toBe('◇');
      expect(mirrorSprite.getAlternativeSymbol(2)).toBe('⟐');
    });

    it('should return main symbol for invalid index', () => {
      expect(mirrorSprite.getAlternativeSymbol(99)).toBe('💧');
    });
  });

  describe('Floating Glyphs', () => {
    it('should return regular glyphs when not reflecting', () => {
      mirrorSprite.reflecting = false;
      const glyph = mirrorSprite.getFloatingGlyph();
      expect([...mirrorSprite.appearance.floatingGlyphs]).toContain(glyph);
    });

    it('should return extended glyphs when reflecting', () => {
      mirrorSprite.reflecting = true;
      const glyph = mirrorSprite.getFloatingGlyph();
      const allGlyphs = [
        ...mirrorSprite.appearance.floatingGlyphs,
        ...mirrorSprite.appearance.reflectionSymbols,
      ];
      expect(allGlyphs).toContain(glyph);
    });
  });

  describe('Shimmer Intensity', () => {
    it('should return low intensity when not reflecting', () => {
      mirrorSprite.reflecting = false;
      expect(mirrorSprite.getShimmerIntensity()).toBe(0.2);
    });

    it('should return calculated intensity when reflecting', () => {
      mirrorSprite.reflecting = true;
      mirrorSprite.shimmerPhase = 0;
      const intensity = mirrorSprite.getShimmerIntensity();
      expect(intensity).toBeGreaterThanOrEqual(0.2);
      expect(intensity).toBeLessThanOrEqual(0.8);
    });
  });

  describe('Shimmer Phase Update', () => {
    it('should increment shimmer phase', () => {
      mirrorSprite.shimmerPhase = 5;
      mirrorSprite.updateShimmer();
      expect(mirrorSprite.shimmerPhase).toBe(6);
    });

    it('should wrap shimmer phase at 100', () => {
      mirrorSprite.shimmerPhase = 99;
      mirrorSprite.updateShimmer();
      expect(mirrorSprite.shimmerPhase).toBe(0);
    });
  });

  describe('Visibility Management', () => {
    it('should decrease visibility when starting to vanish', () => {
      mirrorSprite.visibility = 0.8;
      mirrorSprite.startVanishing();
      expect(mirrorSprite.visibility).toBeCloseTo(0.7, 5);
      expect(mirrorSprite.reflecting).toBe(false);
    });

    it('should not go below minimum visibility when vanishing', () => {
      mirrorSprite.visibility = 0.05;
      mirrorSprite.startVanishing();
      expect(mirrorSprite.visibility).toBe(0.1);
    });

    it('should increase visibility when becoming visible', () => {
      mirrorSprite.visibility = 0.5;
      mirrorSprite.becomeVisible();
      expect(mirrorSprite.visibility).toBe(0.7);
      expect(mirrorSprite.reflecting).toBe(true);
    });

    it('should not exceed maximum visibility', () => {
      mirrorSprite.visibility = 0.95;
      mirrorSprite.becomeVisible();
      expect(mirrorSprite.visibility).toBe(1.0);
    });
  });

  describe('Vanishing Check', () => {
    it('should indicate vanishing when visibility is very low', () => {
      mirrorSprite.visibility = 0.1;
      expect(mirrorSprite.shouldVanish()).toBe(true);
    });

    it('should not indicate vanishing when visibility is adequate', () => {
      mirrorSprite.visibility = 0.5;
      expect(mirrorSprite.shouldVanish()).toBe(false);
    });
  });

  describe('Whispers', () => {
    it('should return random whispered hints', () => {
      const whisper1 = mirrorSprite.getWhisper();
      expect(typeof whisper1).toBe('string');
      expect(whisper1.length).toBeGreaterThan(0);

      const whisper2 = mirrorSprite.getWhisper();
      expect(typeof whisper2).toBe('string');
    });
  });

  describe('Reflections', () => {
    it('should return mystical guidance', () => {
      const reflection = mirrorSprite.getReflection();
      expect(typeof reflection).toBe('string');
      expect(reflection.length).toBeGreaterThan(0);
    });
  });

  describe('Search Wisdom', () => {
    it('should return search wisdom', () => {
      const wisdom = mirrorSprite.getSearchWisdom();
      expect(typeof wisdom).toBe('string');
      expect(wisdom.length).toBeGreaterThan(0);
      expect(wisdom).toContain('~');
    });
  });

  describe('Search Riddles', () => {
    it('should return mystical riddles', () => {
      const riddle = mirrorSprite.getSearchRiddle();
      expect(typeof riddle).toBe('string');
      expect(riddle.length).toBeGreaterThan(0);
      expect(riddle).toContain('~');
    });
  });

  describe('Dialogue - Not Reflecting State', () => {
    it('should return introduction when not reflecting', () => {
      mirrorSprite.reflecting = false;
      const gameState = { collectedKeys: new Set() };
      const dialogue = mirrorSprite.getDialogue(gameState);

      expect(dialogue).toContain("*A shimmering figure appears at the water's edge*");
      expect(dialogue).toContain('~ I am reflection, I am search ~');
    });
  });

  describe('Dialogue - Missing Keys', () => {
    beforeEach(() => {
      mirrorSprite.reflecting = true;
    });

    it('should guide for missing "/" key', () => {
      const gameState = { collectedKeys: new Set() };
      const dialogue = mirrorSprite.getDialogue(gameState);

      expect(dialogue).toContain('~ The slash "/" carries you forward ~');
      expect(dialogue).toContain('~ Like a river flowing toward tomorrow ~');
    });

    it('should guide for missing "?" key when "/" is collected', () => {
      const gameState = { collectedKeys: new Set(['/']) };
      const dialogue = mirrorSprite.getDialogue(gameState);

      expect(dialogue.join(' ')).toContain('question mark');
      expect(dialogue.join(' ')).toContain('behind');
    });

    it('should guide for missing "n" key when "/" and "?" are collected', () => {
      const gameState = { collectedKeys: new Set(['/', '?']) };
      const dialogue = mirrorSprite.getDialogue(gameState);

      expect(dialogue.join(' ')).toContain('"n"');
      expect(dialogue.join(' ')).toContain('continues');
    });

    it('should guide for missing "N" key when "/", "?", "n" are collected', () => {
      const gameState = { collectedKeys: new Set(['/', '?', 'n']) };
      const dialogue = mirrorSprite.getDialogue(gameState);

      expect(dialogue.join(' ')).toContain('"N"');
      expect(dialogue.join(' ')).toContain('reverses');
    });
  });

  describe('Dialogue - All Keys Collected', () => {
    it('should celebrate when all search keys are collected', () => {
      mirrorSprite.reflecting = true;
      const gameState = { collectedKeys: new Set(['/', '?', 'n', 'N']) };
      const dialogue = mirrorSprite.getDialogue(gameState);

      expect(dialogue.join(' ')).toContain('Four Searches flow as one');
      expect(dialogue.join(' ')).toContain('mastered');
    });
  });

  describe('Dialogue - Default Cases', () => {
    it('should return default dialogue for empty gameState', () => {
      mirrorSprite.reflecting = true;
      const dialogue = mirrorSprite.getDialogue();

      expect(dialogue).toContain('~ The slash "/" carries you forward ~');
    });

    it('should return continuing dialogue for partial progress', () => {
      mirrorSprite.reflecting = true;
      const gameState = { collectedKeys: new Set(['x']) };
      const dialogue = mirrorSprite.getDialogue(gameState);

      expect(dialogue).toContain('~ The slash "/" carries you forward ~');
    });
  });

  describe('Search Teaching', () => {
    it('should return specific teaching for "/"', () => {
      const teaching = mirrorSprite.getSearchTeaching('/');
      expect(teaching).toContain('slash');
      expect(teaching).toContain('forward');
    });

    it('should return specific teaching for "?"', () => {
      const teaching = mirrorSprite.getSearchTeaching('?');
      expect(teaching).toContain('question');
      expect(teaching).toContain('backward');
    });

    it('should return specific teaching for "n"', () => {
      const teaching = mirrorSprite.getSearchTeaching('n');
      expect(teaching).toContain('Next');
      expect(teaching).toContain('forward');
    });

    it('should return specific teaching for "N"', () => {
      const teaching = mirrorSprite.getSearchTeaching('N');
      expect(teaching).toContain('Previous');
      expect(teaching).toContain('backward');
    });

    it('should return default teaching for unknown search', () => {
      const teaching = mirrorSprite.getSearchTeaching('z');
      expect(teaching).toContain('Practice the flow of search');
    });
  });

  describe('Philosophy of Search', () => {
    it('should return philosophical wisdom', () => {
      const philosophy = mirrorSprite.getPhilosophyOfSearch();
      expect(typeof philosophy).toBe('string');
      expect(philosophy.length).toBeGreaterThan(0);
    });
  });

  describe('Vanishing Message', () => {
    it('should return vanishing message', () => {
      const message = mirrorSprite.getVanishingMessage();
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });
});
