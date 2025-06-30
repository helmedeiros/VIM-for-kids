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
   * Get cryptic riddles about VIM modes
   * @returns {string} - Random riddle about modes
   */
  getRiddle() {
    const riddles = [
      'Three realms exist in the text realm...',
      'One for moving, one for creating, one for commanding.',
      'i opens the door to creation...',
      'ESC returns you to safety...',
      ': unlocks the power of commands...',
      'Which mode allows the cursor to dance?',
      'Which mode brings forth new text?',
      'Which mode speaks to the editor itself?',
    ];
    return riddles[Math.floor(Math.random() * riddles.length)];
  }

  /**
   * Get mode-specific wisdom
   * @returns {string} - Wisdom about specific VIM modes
   */
  getModeWisdom() {
    const wisdom = [
      'Normal mode: where the cursor is king.',
      'Insert mode: where thoughts become text.',
      'Command mode: where the editor obeys.',
      'ESC is your sanctuary in any storm.',
      'i opens creation, ESC preserves it.',
      'Three modes, infinite possibilities.',
    ];
    return wisdom[Math.floor(Math.random() * wisdom.length)];
  }

  /**
   * Get contextual dialogue based on the player's understanding of modes
   * @param {Object} gameState - Current game state with collected keys
   * @returns {Array<string>} - Array of dialogue lines
   */
  getDialogue(gameState = {}) {
    const collectedKeys = gameState.collectedKeys || new Set();
    const hasInsert = collectedKeys.has('i');
    const hasEscape = collectedKeys.has('ESC');
    const hasCommand = collectedKeys.has(':');
    const hasModes = hasInsert && hasEscape && hasCommand;

    if (!this.scrollUnfurled) {
      return [
        '*The hooded figure looks up from ancient scrolls*',
        'Ah... a seeker approaches.',
        'You wish to understand the Three Sacred Modes?',
        'First... show me you can enter creation.',
        '*Points to the glowing "i" in the distance*',
      ];
    }

    if (!hasInsert) {
      return [
        '*Unfurls an ancient scroll*',
        'Behold the first mystery: INSERT.',
        'Press "i" to enter the realm of creation.',
        'There, your thoughts become reality.',
        this.getRiddle(),
      ];
    }

    if (!hasEscape) {
      return [
        'Good... you have tasted creation.',
        'But how do you return to safety?',
        'ESC is your sanctuary, young one.',
        'It brings you back to Normal mode.',
        'Find it, and you shall be free.',
      ];
    }

    if (!hasCommand) {
      return [
        'Two modes mastered... one remains.',
        'The colon ":" opens the greatest power.',
        "Command mode speaks to the editor's soul.",
        'Seek it in the deepest part of the maze.',
        '*Whispers* :w saves, :q quits, :help reveals all.',
      ];
    }

    if (hasModes) {
      return [
        '*The scroll glows with ancient power*',
        'Magnificent! The Three Modes are yours!',
        'Normal for navigation and precision.',
        'Insert for creation and inspiration.',
        'Command for power and transformation.',
        'The maze yields to your understanding.',
        this.getModeWisdom(),
      ];
    }

    return ['*Continues studying scrolls*', 'The modes await your discovery...', this.getRiddle()];
  }

  /**
   * Get mode-specific teaching when player demonstrates understanding
   * @param {string} mode - The mode being learned (i, ESC, :)
   * @returns {string} - Teaching dialogue for that mode
   */
  getModeTeaching(mode) {
    const teachings = {
      i: 'INSERT mode awakens! Your thoughts flow into text.',
      ESC: 'NORMAL mode embraces you! Safety and navigation return.',
      ':': 'COMMAND mode responds! The editor awaits your instruction.',
      v: 'VISUAL mode emerges! Text bends to your selection.',
    };
    return teachings[mode] || 'Practice the sacred transitions...';
  }

  /**
   * Get cryptic hints when player seems lost
   * @returns {string} - Mysterious hint
   */
  getHint() {
    const hints = [
      '*Points mystically* The answer lies in transition...',
      '*Whispers* Three realms, three keys, one understanding.',
      '*Nods knowingly* Mode is state of mind.',
      '*Traces symbols in air* i-ESC-:, the eternal dance.',
      '*Gazes into distance* Where you are determines what you can do.',
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  }
}
