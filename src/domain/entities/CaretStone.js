/**
 * Caret Stone - A living rune-carved stone that tests your first motion skills (hjkl)
 * Ancient, speaks in short phrases. Small mossy boulder with glowing caret symbols.
 */
export class CaretStone {
  constructor(id, position) {
    this.id = id;
    this.position = position;
    this.type = 'caret_stone';
    this.discovered = false;

    // Core NPC properties
    this.role = 'Guardian of VIM basics';
    this.personality = 'Ancient, speaks in short phrases';
    this.wisdom = 'Tests first motion skills (hjkl)';

    // Visual appearance properties
    this.appearance = {
      symbol: '🗿',
      alternativeSymbols: ['♦', '◆', '▲', '⟐', '◊'], // Fallbacks for different platforms
      colors: {
        primary: '#8FBC8F', // Dark Sea Green (mossy)
        secondary: '#228B22', // Forest Green
        glow: '#00FF7F', // Spring Green (glowing runes)
        dormant: '#696969', // Dim Gray when not active
      },
      floatingGlyphs: ['^', 'h', 'j', 'k', 'l', '⟨⟩', '◇', '⬟'],
      cssClass: 'npc-caret-stone',
      animationType: 'ancient-pulse',
    };
  }

  /**
   * Get the visual symbol for this NPC based on current state
   */
  getVisualSymbol() {
    if (!this.discovered) {
      return '?'; // Hidden until discovered
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
   * Get a random floating glyph
   */
  getFloatingGlyph() {
    const glyphs = this.appearance.floatingGlyphs;
    return glyphs[Math.floor(Math.random() * glyphs.length)];
  }

  /**
   * Get glow intensity based on interaction state
   */
  getGlowIntensity() {
    return this.discovered ? 0.8 : 0.3;
  }

  /**
   * Check if stone is in ancient resting state
   */
  isResting() {
    return !this.discovered;
  }

  /**
   * Discover the stone (activate its glow)
   */
  discover() {
    this.discovered = true;
  }

  /**
   * Get ancient wisdom about VIM motion
   * @returns {string} - Random wisdom about hjkl movement
   */
  getWisdom() {
    const wisdoms = [
      'h... left as the wind blows',
      "j... down into earth's depth",
      "k... up toward sky's height",
      'l... right as rivers flow',
      'Four directions. Ancient paths.',
      'Motion... is the first truth',
      'Cursor moves. World responds.',
      'hjkl... the foundation stones',
    ];
    return wisdoms[Math.floor(Math.random() * wisdoms.length)];
  }

  /**
   * Get contextual dialogue based on the player's progress
   * @param {Object} gameState - Current game state with collected keys
   * @returns {Array<string>} - Array of dialogue lines
   */
  getDialogue(gameState = {}) {
    const collectedKeys = gameState.collectedKeys || new Set();
    const hasBasicMotion = ['h', 'j', 'k', 'l'].every((key) => collectedKeys.has(key));

    if (!this.discovered) {
      return [
        '...',
        'Who... disturbs the stone?',
        'Show me... the ancient ways.',
        'Move with hjkl... prove your worth.',
      ];
    }

    if (!hasBasicMotion) {
      return [
        'Good... you have awakened me.',
        'But your foundation... incomplete.',
        'Find all four directions.',
        'hjkl... the sacred motions.',
      ];
    }

    return [
      'Yes... the foundation is strong.',
      'h left, j down, k up, l right.',
      'You understand the ancient ways.',
      'The paths ahead... await your steps.',
      this.getWisdom(),
    ];
  }

  /**
   * Get interactive teaching dialogue for specific movements
   * @param {string} movement - The movement key being learned
   * @returns {string} - Teaching dialogue for that movement
   */
  getMovementTeaching(movement) {
    const teachings = {
      h: 'h moves left... like the setting sun.',
      j: "j moves down... into the earth's embrace.",
      k: 'k moves up... toward the endless sky.',
      l: 'l moves right... like the rising dawn.',
    };
    return teachings[movement] || 'Practice the four directions...';
  }

  /**
   * Get encouraging dialogue when player shows progress
   * @returns {string} - Encouraging message
   */
  getEncouragement() {
    const encouragements = [
      'The stone remembers your progress.',
      'Ancient paths open before you.',
      'Your cursor grows stronger.',
      'The foundation solidifies.',
      'Motion becomes natural.',
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }
}
