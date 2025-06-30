import { PracticeBuddy } from '../../../src/domain/entities/PracticeBuddy.js';

describe('PracticeBuddy', () => {
  let practiceBuddy;

  beforeEach(() => {
    practiceBuddy = new PracticeBuddy('buddy-1', { x: 2, y: 2 });
  });

  describe('Constructor', () => {
    it('should create PracticeBuddy with correct properties', () => {
      expect(practiceBuddy.id).toBe('buddy-1');
      expect(practiceBuddy.position).toEqual({ x: 2, y: 2 });
      expect(practiceBuddy.type).toBe('practice_buddy');
      expect(practiceBuddy.cheering).toBe(false);
      expect(practiceBuddy.enthusiasm).toBe(0.9);
      expect(practiceBuddy.bouncePhase).toBe(0);
      expect(practiceBuddy.role).toBe('Cheerleader of Practice');
      expect(practiceBuddy.personality).toBe('Cheerful, encouraging');
      expect(practiceBuddy.wisdom).toBe('Provides motivation and celebration, not solutions');
    });

    it('should have correct visual appearance properties', () => {
      expect(practiceBuddy.appearance.symbol).toBe('🎉');
      expect(practiceBuddy.appearance.alternativeSymbols).toContain('☺');
      expect(practiceBuddy.appearance.colors.primary).toBe('#FF69B4');
      expect(practiceBuddy.appearance.floatingGlyphs).toContain('!');
      expect(practiceBuddy.appearance.cheerSymbols).toContain('👏');
    });
  });

  describe('Visual Symbol', () => {
    it('should return main symbol when not cheering', () => {
      practiceBuddy.cheering = false;
      expect(practiceBuddy.getVisualSymbol()).toBe('🎉');
    });

    it('should cycle through celebration symbols when cheering', () => {
      practiceBuddy.cheering = true;

      practiceBuddy.bouncePhase = 0;
      const symbol1 = practiceBuddy.getVisualSymbol();

      practiceBuddy.bouncePhase = 1;
      const symbol2 = practiceBuddy.getVisualSymbol();

      practiceBuddy.bouncePhase = 2;
      const symbol3 = practiceBuddy.getVisualSymbol();

      expect(['🎉', '🎊', '⭐', '✨']).toContain(symbol1);
      expect(['🎉', '🎊', '⭐', '✨']).toContain(symbol2);
      expect(['🎉', '🎊', '⭐', '✨']).toContain(symbol3);
    });
  });

  describe('Alternative Symbols', () => {
    it('should return alternative symbols by index', () => {
      expect(practiceBuddy.getAlternativeSymbol(0)).toBe('☺');
      expect(practiceBuddy.getAlternativeSymbol(1)).toBe('◎');
      expect(practiceBuddy.getAlternativeSymbol(2)).toBe('⊕');
    });

    it('should return main symbol for invalid index', () => {
      expect(practiceBuddy.getAlternativeSymbol(99)).toBe('🎉');
    });
  });

  describe('Floating Glyphs', () => {
    it('should return regular glyphs when not cheering', () => {
      practiceBuddy.cheering = false;
      const glyph = practiceBuddy.getFloatingGlyph();
      expect([...practiceBuddy.appearance.floatingGlyphs]).toContain(glyph);
    });

    it('should return extended glyphs when cheering', () => {
      practiceBuddy.cheering = true;
      const glyph = practiceBuddy.getFloatingGlyph();
      const allGlyphs = [
        ...practiceBuddy.appearance.floatingGlyphs,
        ...practiceBuddy.appearance.cheerSymbols,
      ];
      expect(allGlyphs).toContain(glyph);
    });
  });

  describe('Enthusiasm Level', () => {
    it('should return base enthusiasm when not cheering', () => {
      practiceBuddy.cheering = false;
      practiceBuddy.enthusiasm = 0.8;
      expect(practiceBuddy.getEnthusiasmLevel()).toBe(0.8);
    });

    it('should return boosted enthusiasm when cheering', () => {
      practiceBuddy.cheering = true;
      practiceBuddy.enthusiasm = 0.8;
      expect(practiceBuddy.getEnthusiasmLevel()).toBe(0.9);
    });
  });

  describe('Bounce Phase Update', () => {
    it('should increment bounce phase', () => {
      practiceBuddy.bouncePhase = 5;
      practiceBuddy.updateBounce();
      expect(practiceBuddy.bouncePhase).toBe(6);
    });

    it('should wrap bounce phase at 100', () => {
      practiceBuddy.bouncePhase = 99;
      practiceBuddy.updateBounce();
      expect(practiceBuddy.bouncePhase).toBe(0);
    });
  });

  describe('Cheering State Management', () => {
    it('should start cheering and increase enthusiasm', () => {
      practiceBuddy.enthusiasm = 0.8;
      practiceBuddy.startCheering();
      expect(practiceBuddy.cheering).toBe(true);
      expect(practiceBuddy.enthusiasm).toBeCloseTo(0.85, 5);
    });

    it('should cap enthusiasm at 1.0 when starting cheering', () => {
      practiceBuddy.enthusiasm = 0.98;
      practiceBuddy.startCheering();
      expect(practiceBuddy.enthusiasm).toBe(1.0);
    });

    it('should stop cheering but maintain enthusiasm', () => {
      practiceBuddy.cheering = true;
      practiceBuddy.enthusiasm = 1.0;
      practiceBuddy.stopCheering();
      expect(practiceBuddy.cheering).toBe(false);
      expect(practiceBuddy.enthusiasm).toBe(1.0);
    });
  });

  describe('Cheers', () => {
    it('should return random encouraging cheers', () => {
      const cheer1 = practiceBuddy.getCheer();
      expect(typeof cheer1).toBe('string');
      expect(cheer1.length).toBeGreaterThan(0);

      const cheer2 = practiceBuddy.getCheer();
      expect(typeof cheer2).toBe('string');
    });
  });

  describe('Encouragement', () => {
    it('should return general encouragement messages', () => {
      const encouragement = practiceBuddy.getEncouragement();
      expect(typeof encouragement).toBe('string');
      expect(encouragement.length).toBeGreaterThan(0);
    });
  });

  describe('Celebration', () => {
    it('should return celebration messages', () => {
      const celebration = practiceBuddy.getCelebration();
      expect(typeof celebration).toBe('string');
      expect(celebration.length).toBeGreaterThan(0);
    });
  });

  describe('Skill Celebration', () => {
    it('should return specific celebration for movement keys', () => {
      expect(practiceBuddy.getSkillCelebration('h')).toContain('Left movement mastered!');
      expect(practiceBuddy.getSkillCelebration('j')).toContain('Down motion perfected!');
      expect(practiceBuddy.getSkillCelebration('k')).toContain('Up movement conquered!');
      expect(practiceBuddy.getSkillCelebration('l')).toContain('Right movement nailed!');
    });

    it('should return specific celebration for word navigation', () => {
      expect(practiceBuddy.getSkillCelebration('w')).toContain('Word jumping achieved!');
      expect(practiceBuddy.getSkillCelebration('b')).toContain('Backward word mastery!');
      expect(practiceBuddy.getSkillCelebration('e')).toContain('End-of-word precision!');
    });

    it('should return specific celebration for editing commands', () => {
      expect(practiceBuddy.getSkillCelebration('x')).toContain('Character deletion!');
      expect(practiceBuddy.getSkillCelebration('dd')).toContain('Line deletion mastery!');
      expect(practiceBuddy.getSkillCelebration('yy')).toContain('Line copying champion!');
      expect(practiceBuddy.getSkillCelebration('p')).toContain('Paste perfection!');
    });

    it('should return specific celebration for insert commands', () => {
      expect(practiceBuddy.getSkillCelebration('i')).toContain('Insert mode magic!');
      expect(practiceBuddy.getSkillCelebration('a')).toContain('Append mastery!');
    });

    it('should return specific celebration for search commands', () => {
      expect(practiceBuddy.getSkillCelebration('/')).toContain('Search forward genius!');
      expect(practiceBuddy.getSkillCelebration('?')).toContain('Backward search expert!');
    });

    it('should return specific celebration for file commands', () => {
      expect(practiceBuddy.getSkillCelebration(':w')).toContain('Save command champion!');
      expect(practiceBuddy.getSkillCelebration(':q')).toContain('Quit command mastery!');
    });

    it('should return default celebration for unknown skill', () => {
      const celebration = practiceBuddy.getSkillCelebration('unknown');
      expect(celebration).toBe('🎉 Awesome skill demonstration!');
    });
  });

  describe('Dialogue - Not Cheering State', () => {
    it('should return introduction when not cheering', () => {
      practiceBuddy.cheering = false;
      const gameState = { collectedKeys: new Set() };
      const dialogue = practiceBuddy.getDialogue(gameState);

      expect(dialogue).toContain('🎉 Hey there, superstar! Welcome to Practice Central!');
      expect(dialogue).toContain("I'm your Practice Buddy - here to cheer you on!");
    });
  });

  describe('Dialogue - Based on Skill Count', () => {
    beforeEach(() => {
      practiceBuddy.cheering = true;
    });

    it('should provide beginner guidance when skillCount is 0', () => {
      const gameState = { collectedKeys: new Set() };
      const dialogue = practiceBuddy.getDialogue(gameState);

      expect(dialogue).toContain("🌟 Everyone starts somewhere, and you're starting great!");
      expect(dialogue).toContain('Try moving around with h, j, k, l first!');
    });

    it('should celebrate early progress when skillCount <= 5', () => {
      const gameState = { collectedKeys: new Set(['h', 'j', 'k']) };
      const dialogue = practiceBuddy.getDialogue(gameState);

      expect(dialogue).toContain('🚀 Look at you go! Those first skills are solid!');
      expect(dialogue).toContain("You've mastered 3 skills already!");
    });

    it('should show growing confidence when skillCount <= 10', () => {
      const gameState = { collectedKeys: new Set(['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x']) };
      const dialogue = practiceBuddy.getDialogue(gameState);

      expect(dialogue).toContain("⚡ WOW! You're really getting the hang of this!");
      expect(dialogue).toContain("8 skills conquered! You're on a roll!");
    });

    it('should express pride when skillCount <= 15', () => {
      const keys = ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x', 'dd', 'yy', 'p', 'i', 'a'];
      const gameState = { collectedKeys: new Set(keys) };
      const dialogue = practiceBuddy.getDialogue(gameState);

      expect(dialogue).toContain("🏆 INCREDIBLE! You're becoming a true expert!");
      expect(dialogue).toContain("13 skills mastered! I'm so proud!");
    });

    it('should celebrate mastery when skillCount > 15', () => {
      const keys = Array.from({ length: 20 }, (_, i) => `skill${i}`);
      const gameState = { collectedKeys: new Set(keys) };
      const dialogue = practiceBuddy.getDialogue(gameState);

      expect(dialogue).toContain('🌟 LEGENDARY STATUS ACHIEVED! 🌟');
      expect(dialogue).toContain("20 skills perfected! You're absolutely amazing!");
    });
  });

  describe('Dialogue - Edge Cases', () => {
    it('should handle empty gameState', () => {
      practiceBuddy.cheering = true;
      const dialogue = practiceBuddy.getDialogue();

      expect(dialogue).toContain("🌟 Everyone starts somewhere, and you're starting great!");
    });

    it('should handle gameState without collectedKeys', () => {
      practiceBuddy.cheering = true;
      const dialogue = practiceBuddy.getDialogue({});

      expect(dialogue).toContain("🌟 Everyone starts somewhere, and you're starting great!");
    });
  });

  describe('Practice Tips', () => {
    it('should return helpful practice tips', () => {
      const tip = practiceBuddy.getPracticeTip();
      expect(typeof tip).toBe('string');
      expect(tip.length).toBeGreaterThan(0);
      expect(tip).toContain('Tip:');
    });
  });

  describe('Motivational Support', () => {
    it('should return specific support for movement challenges', () => {
      const support = practiceBuddy.getMotivationalSupport('movement');
      expect(support).toContain('Movement takes practice!');
      expect(support).toContain('hjkl');
    });

    it('should return specific support for mode switching challenges', () => {
      const support = practiceBuddy.getMotivationalSupport('modes');
      expect(support).toContain('Mode switching is tricky');
      expect(support).toContain('rhythm');
    });

    it('should return specific support for deletion challenges', () => {
      const support = practiceBuddy.getMotivationalSupport('deletion');
      expect(support).toContain('Deletion power is scary');
      expect(support).toContain('practice makes perfect');
    });

    it('should return specific support for insertion challenges', () => {
      const support = practiceBuddy.getMotivationalSupport('insertion');
      expect(support).toContain('Text creation is an art form');
      expect(support).toContain('artist');
    });

    it('should return specific support for search challenges', () => {
      const support = practiceBuddy.getMotivationalSupport('search');
      expect(support).toContain('Search patterns unlock');
      expect(support).toContain('mysteries');
    });

    it('should return specific support for complex challenges', () => {
      const support = practiceBuddy.getMotivationalSupport('complex');
      expect(support).toContain('Complex commands are just simple ones combined');
    });

    it('should return specific support for speed challenges', () => {
      const support = practiceBuddy.getMotivationalSupport('speed');
      expect(support).toContain('Speed comes with time');
      expect(support).toContain('accuracy first');
    });

    it('should return specific support for confidence challenges', () => {
      const support = practiceBuddy.getMotivationalSupport('confidence');
      expect(support).toContain('Believe in yourself');
      expect(support).toContain('progress');
    });

    it('should return default support for unknown challenges', () => {
      const support = practiceBuddy.getMotivationalSupport('unknown');
      expect(support).toContain("Whatever challenge you're facing, I believe in you!");
    });
  });

  describe('Milestone Celebration', () => {
    it('should celebrate first key milestone', () => {
      const celebration = practiceBuddy.getMilestoneCelebration('first_key');
      expect(celebration).toContain('FIRST KEY COLLECTED!');
    });

    it('should celebrate basic movement milestone', () => {
      const celebration = practiceBuddy.getMilestoneCelebration('basic_movement');
      expect(celebration).toContain('MOVEMENT MASTERED!');
    });

    it('should celebrate mode switching milestone', () => {
      const celebration = practiceBuddy.getMilestoneCelebration('mode_switching');
      expect(celebration).toContain('MODE MASTER!');
    });

    it('should celebrate text editing milestone', () => {
      const celebration = practiceBuddy.getMilestoneCelebration('text_editing');
      expect(celebration).toContain('EDITING EXPERT!');
    });

    it('should celebrate advanced commands milestone', () => {
      const celebration = practiceBuddy.getMilestoneCelebration('advanced_commands');
      expect(celebration).toContain('COMMAND CHAMPION!');
    });

    it('should celebrate zone completion milestone', () => {
      const celebration = practiceBuddy.getMilestoneCelebration('zone_completion');
      expect(celebration).toContain('ZONE CONQUERED!');
    });

    it('should celebrate final mastery milestone', () => {
      const celebration = practiceBuddy.getMilestoneCelebration('final_mastery');
      expect(celebration).toContain('VIM ROYALTY!');
    });

    it('should return default celebration for unknown milestone', () => {
      const celebration = practiceBuddy.getMilestoneCelebration('unknown');
      expect(celebration).toBe('🎉 AMAZING ACHIEVEMENT! Keep up the fantastic work!');
    });
  });
});
