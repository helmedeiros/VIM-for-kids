/**
 * Insert Scribe - NPC scribe guiding insert & append keys (i, a, o, O)
 * Helpful, poetic. Bright robed figure with feather quill and scrolls that animate when they talk.
 */
export class InsertScribe {
  constructor(id, position) {
    this.id = id;
    this.position = position;
    this.type = 'insert_scribe';
    this.writing = false;
    this.inspiration = 0.7;

    // Core NPC properties
    this.role = 'Master of Text Creation';
    this.personality = 'Helpful, poetic';
    this.wisdom = 'Guides insertion and line creation (i, a, o, O)';

    // Visual appearance properties
    this.appearance = {
      symbol: '✏️',
      alternativeSymbols: ['✎', '✍', '✒', '⊕', '◎'], // Writing implements as fallbacks
      colors: {
        primary: '#4169E1', // Royal Blue (bright robes)
        secondary: '#FFD700', // Gold (feather quill)
        glow: '#87CEEB', // Sky Blue (creative energy)
        ink: '#191970', // Midnight Blue (flowing ink)
        parchment: '#FFF8DC', // Cornsilk (scroll background)
      },
      floatingGlyphs: ['i', 'a', 'o', 'O', '✎', '✍', '◊', '⟨', '⟩', '§'],
      poeticSymbols: ['♪', '♫', '✨', '◈', '❋', '✦'],
      cssClass: 'npc-insert-scribe',
      animationType: 'quill-flow',
    };
  }

  /**
   * Get the visual symbol for this NPC based on current state
   */
  getVisualSymbol() {
    if (this.writing) {
      // Alternate between quill and flowing symbols when writing
      const writingSymbols = ['✏️', '✎', '✍'];
      return writingSymbols[Math.floor(Math.random() * writingSymbols.length)];
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
   * Get a random floating glyph (including poetic symbols)
   */
  getFloatingGlyph() {
    const allGlyphs = this.writing
      ? [...this.appearance.floatingGlyphs, ...this.appearance.poeticSymbols]
      : this.appearance.floatingGlyphs;
    return allGlyphs[Math.floor(Math.random() * allGlyphs.length)];
  }

  /**
   * Get creative inspiration level (affects visual flow)
   */
  getInspirationLevel() {
    return this.inspiration + (this.writing ? 0.2 : 0);
  }

  /**
   * Start writing (increase inspiration and visual activity)
   */
  startWriting() {
    this.writing = true;
    this.inspiration = Math.min(1.0, this.inspiration + 0.1);
  }

  /**
   * Stop writing (maintain inspiration)
   */
  stopWriting() {
    this.writing = false;
  }

  /**
   * Get poetic wisdom about insertion
   */
  getPoetry() {
    const poems = [
      'i before the cursor, gentle and true,\na after the cursor, adding anew.',
      'o opens below with graceful line,\nO opens above, structure divine.',
      'Insert mode flows like rivers of ink,\nText appears wherever you think.',
      "Four ways to enter creation's door,\ni, a, o, O - the sacred four.",
    ];
    return poems[Math.floor(Math.random() * poems.length)];
  }

  /**
   * Get helpful guidance about insertion commands
   */
  getGuidance() {
    const guidance = [
      'i - Insert before cursor, where text flows in',
      'a - Append after cursor, where thoughts extend',
      'o - Open new line below, creating space to grow',
      'O - Open new line above, lifting ideas thereof',
      'Master these four, and text will flow like poetry',
    ];
    return guidance[Math.floor(Math.random() * guidance.length)];
  }
}
