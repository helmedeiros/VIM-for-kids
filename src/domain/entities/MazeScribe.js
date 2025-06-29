/**
 * Maze Scribe - Mysterious figure inside the Maze of Modes who explains i, ESC, v
 * Cryptic teacher, asks riddles. Cloaked NPC with scroll or parchment.
 */
export class MazeScribe {
  constructor(id, position) {
    this.id = id;
    this.position = position;
    this.type = 'maze_scribe';
    this.scrollUnfurled = false;

    // Core NPC properties
    this.role = 'Teacher of Sacred Modes';
    this.personality = 'Cryptic teacher, asks riddles';
    this.wisdom = 'Explains i, ESC, v transitions';

    // Visual appearance properties
    this.appearance = {
      symbol: '📜',
      alternativeSymbols: ['§', '¤', '⟙', '⟐', '◈'], // Fallbacks for different platforms
      colors: {
        primary: '#DEB887', // Burlywood (aged parchment)
        secondary: '#8B4513', // Saddle Brown (cloak)
        glow: '#FFD700', // Gold (glowing ink)
        ink: '#000080', // Navy (mysterious ink)
      },
      floatingGlyphs: ['i', 'ESC', 'v', ':', '?', '✎', '◈', '⟙'],
      cssClass: 'npc-maze-scribe',
      animationType: 'scroll-unfurl',
    };
  }

  /**
   * Get the visual symbol for this NPC based on current state
   */
  getVisualSymbol() {
    return this.scrollUnfurled ? '📜' : '◎'; // Scroll unfurled or hooded figure
  }

  /**
   * Get alternative symbol for cross-platform compatibility
   */
  getAlternativeSymbol(index = 0) {
    return this.appearance.alternativeSymbols[index] || this.appearance.symbol;
  }

  /**
   * Get a random floating glyph
   */
  getFloatingGlyph() {
    const glyphs = this.appearance.floatingGlyphs;
    return glyphs[Math.floor(Math.random() * glyphs.length)];
  }

  /**
   * Get ink glow intensity based on wisdom sharing
   */
  getInkGlowIntensity() {
    return this.scrollUnfurled ? 0.9 : 0.4;
  }

  /**
   * Unfurl the scroll (when teaching)
   */
  unfurlScroll() {
    this.scrollUnfurled = true;
  }

  /**
   * Get a cryptic riddle about VIM modes
   */
  getRiddle() {
    const riddles = [
      'Three paths diverge... Normal, Insert, Visual. Which do you choose first?',
      'To create, you must enter. To command, you must exit. What am I?',
      'ESC is the key that opens all doors. But which door do you seek?',
      'In the maze of modes, only one path leads to mastery. Find it.',
    ];
    return riddles[Math.floor(Math.random() * riddles.length)];
  }

  /**
   * Get mode wisdom
   */
  getModeWisdom() {
    const wisdom = [
      'Normal mode: where you navigate.',
      'Insert mode: where you create.',
      'Visual mode: where you select.',
      'Command mode: where you command.',
    ];
    return wisdom[Math.floor(Math.random() * wisdom.length)];
  }
}
