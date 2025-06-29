/**
 * Practice Buddy - Friendly helper in Playground who cheers you on but doesn't help solve
 * Cheerful, encouraging. Small round sprite with a foam finger or tiny flag.
 */
export class PracticeBuddy {
  constructor(id, position) {
    this.id = id;
    this.position = position;
    this.type = 'practice_buddy';
    this.cheering = false;
    this.enthusiasm = 0.9;
    this.bouncePhase = 0;

    // Core NPC properties
    this.role = 'Cheerleader of Practice';
    this.personality = 'Cheerful, encouraging';
    this.wisdom = 'Provides motivation and celebration, not solutions';

    // Visual appearance properties
    this.appearance = {
      symbol: '🎉',
      alternativeSymbols: ['☺', '◎', '⊕', '◯', '○'], // Happy faces as fallbacks
      colors: {
        primary: '#FF69B4', // Hot Pink (enthusiastic)
        secondary: '#FFD700', // Gold (celebration)
        glow: '#FFFF00', // Yellow (cheerful energy)
        flag: '#32CD32', // Lime Green (victory flag)
        foam: '#FF4500', // Orange Red (foam finger)
      },
      floatingGlyphs: ['!', '★', '✨', '🎈', '🏆', '⭐', '♪', '♫', '◯', '◎'],
      cheerSymbols: ['👏', '🎊', '🎈', '🏆', '⭐', '✨'],
      cssClass: 'npc-practice-buddy',
      animationType: 'happy-bounce',
    };
  }

  /**
   * Get the visual symbol for this NPC based on current state
   */
  getVisualSymbol() {
    if (this.cheering) {
      // Cycle through celebration symbols when cheering
      const cheerIcons = ['🎉', '🎊', '⭐', '✨'];
      return cheerIcons[this.bouncePhase % cheerIcons.length];
    }
    return this.appearance.symbol;
  }

  /**
   * Get alternative symbol for cross-platform compatibility
   */
  getAlternativeSymbol(index = 0) {
    return this.appearance.alternativeSymbols[index] || this.appearance.symbol;
  }

  /**
   * Get a random floating glyph (includes cheer symbols when cheering)
   */
  getFloatingGlyph() {
    const allGlyphs = this.cheering
      ? [...this.appearance.floatingGlyphs, ...this.appearance.cheerSymbols]
      : this.appearance.floatingGlyphs;
    return allGlyphs[Math.floor(Math.random() * allGlyphs.length)];
  }

  /**
   * Get enthusiasm level (affects bounce intensity)
   */
  getEnthusiasmLevel() {
    return this.enthusiasm + (this.cheering ? 0.1 : 0);
  }

  /**
   * Update bounce phase (call periodically for animation)
   */
  updateBounce() {
    this.bouncePhase = (this.bouncePhase + 1) % 100;
  }

  /**
   * Start cheering (triggered by player achievements)
   */
  startCheering() {
    this.cheering = true;
    this.enthusiasm = Math.min(1.0, this.enthusiasm + 0.05);
  }

  /**
   * Stop cheering (return to normal encouragement)
   */
  stopCheering() {
    this.cheering = false;
  }

  /**
   * Get encouraging cheer
   */
  getCheer() {
    const cheers = [
      'Great job! Keep it up! 🎉',
      "You're doing amazing! ⭐",
      'Practice makes perfect! 💪',
      "That's the spirit! 🎊",
      "You've got this! 🏆",
      'Fantastic progress! ✨',
      'Keep practicing! 🎈',
      "You're getting better! 👏",
    ];
    return cheers[Math.floor(Math.random() * cheers.length)];
  }

  /**
   * Get general encouragement
   */
  getEncouragement() {
    const encouragements = [
      'Remember, every expert was once a beginner!',
      'The more you practice, the stronger you become!',
      'Every keystroke builds your muscle memory!',
      "Don't give up - you're closer than you think!",
      'Practice is the path to mastery!',
      "You're building VIM superpowers! ⚡",
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  /**
   * Get celebration for achievements
   */
  getCelebration() {
    const celebrations = [
      '🎉 AMAZING! You mastered that skill! 🎉',
      '⭐ INCREDIBLE! Your VIM powers grow! ⭐',
      '🏆 OUTSTANDING! Practice pays off! 🏆',
      "✨ BRILLIANT! You're becoming a VIM wizard! ✨",
      '🎊 SPECTACULAR! That was perfect! 🎊',
    ];
    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }
}
