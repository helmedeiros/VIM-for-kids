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
   * Get poetic verses about text creation
   * @returns {string} - Random poetic wisdom about insertion
   */
  getPoetry() {
    const poems = [
      'Where cursor rests, let words take flight,\n    With "i" before and "a" behind so bright.',
      'Above with "O", below with "o",\n    Four gates through which new verses flow.',
      'Insert before, append behind,\n    Open lines where thoughts unwind.',
      'The quill remembers every stroke,\n    From silence into words we spoke.',
      'Creation starts with single key,\n    "i" unlocks what\'s meant to be.',
      "In insertion's gentle art,\n    Every keystroke plays its part.",
    ];
    return poems[Math.floor(Math.random() * poems.length)];
  }

  /**
   * Get contextual dialogue based on player's insertion mastery
   * @param {Object} gameState - Current game state with collected keys
   * @returns {Array<string>} - Array of dialogue lines
   */
  getDialogue(gameState = {}) {
    const collectedKeys = gameState.collectedKeys || new Set();
    const hasI = collectedKeys.has('i');
    const hasA = collectedKeys.has('a');
    const hasO = collectedKeys.has('o');
    const hasCapitalO = collectedKeys.has('O');
    const hasInsertions = hasI && hasA && hasO && hasCapitalO;

    if (!this.writing) {
      return [
        '*A figure in bright robes looks up from writing*',
        'Ah, a fellow seeker of the written word!',
        "I am the Insert Scribe, keeper of creation's keys.",
        '*Dips quill in shimmering ink*',
        'Tell me, do you know the Four Sacred Insertions?',
      ];
    }

    if (!hasI) {
      return [
        '*Begins writing with flowing script*',
        'First, learn the gentlest entry: "i"',
        'Insert before the cursor rests,\n    Like morning dew on printed text.',
        '*Points quill toward glowing letter* Seek it there.',
        this.getPoetry(),
      ];
    }

    if (!hasA) {
      return [
        '*Nods approvingly as ink flows*',
        'Excellent! But creation has more forms...',
        '"a" appends, it follows through,\n    Behind the cursor, words renew.',
        '*Demonstrates with graceful strokes*',
        'Find append, and double your power.',
      ];
    }

    if (!hasO) {
      return [
        '*Smiles as parchment fills with text*',
        'Your foundation grows stronger!',
        'But what of breathing room? New space?',
        '"o" opens lines below with grace,\n    Creating space for thoughts to grow.',
        '*Gestures toward the field* It blooms nearby.',
      ];
    }

    if (!hasCapitalO) {
      return [
        '*Quill dances with inspired energy*',
        'One final mystery remains above...',
        '"O" opens lines where none existed,\n    Above the cursor, dreams assisted.',
        '*Points upward with golden ink*',
        'Seek the capital, complete the dance.',
      ];
    }

    if (hasInsertions) {
      return [
        '*Sets down quill with satisfied flourish*',
        'Magnificent! The Four Insertions sing in harmony!',
        '"i" before, "a" after, "o" below, "O" above,\n    Like cardinal directions, but for love of words.',
        '*Scrolls glow with completed verses*',
        'You have mastered the art of creation!',
        'Text flows like poetry through your fingers.',
        this.getPoetry(),
      ];
    }

    return [
      '*Continues writing beautiful script*',
      'The words await your guidance...',
      this.getPoetry(),
    ];
  }

  /**
   * Get insertion-specific teaching when player demonstrates understanding
   * @param {string} insertion - The insertion command being learned
   * @returns {string} - Poetic teaching for that command
   */
  getInsertionTeaching(insertion) {
    const teachings = {
      i: '*Quill glows* INSERT awakens! Before the cursor, creation flows.',
      a: '*Ink shimmers* APPEND embraces! After cursor, text grows.',
      o: '*Parchment rustles* OPEN below! New lines bloom like flowers.',
      O: '*Script illuminates* OPEN above! Space for thoughts like towers.',
    };
    return teachings[insertion] || '*Writes gracefully* Practice the sacred insertions...';
  }

  /**
   * Get encouraging verses when player shows creativity
   * @returns {string} - Encouraging poetic message
   */
  getEncouragement() {
    const encouragements = [
      'Your creativity flows like a river!',
      'Each insertion is a work of art.',
      'Text dances beneath your guidance.',
      'The field responds to your inspiration.',
      'Words bloom where you plant them.',
      'Creation is the highest calling.',
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  /**
   * Get advice about thoughtful text creation
   * @returns {string} - Wisdom about writing and editing
   */
  getCreativeWisdom() {
    const wisdom = [
      'Good writing starts with good insertion.',
      'Know where to place each word, each thought.',
      'Before, after, above, below - position matters.',
      'The cursor is your compass in the text.',
      'Insertion is intention made manifest.',
      'Every great text began with a single "i".',
    ];
    return wisdom[Math.floor(Math.random() * wisdom.length)];
  }
}
