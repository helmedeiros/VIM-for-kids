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
   * Get wisdom based on current state
   */
  getWisdom() {
    const ancientWisdom = [
      'Movement... the first truth.',
      'h j k l... the sacred four.',
      'Direction... guides the way.',
      'Ancient paths... remember all.',
    ];
    return ancientWisdom[Math.floor(Math.random() * ancientWisdom.length)];
  }
}
