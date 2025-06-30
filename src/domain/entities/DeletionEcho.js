/**
 * Deletion Echo - Zone 4 ghost that haunts deletion puzzles
 * Spooky, murmurs warnings. Ghostly glitch silhouette with broken text floating off them.
 */
export class DeletionEcho {
  constructor(id, position) {
    this.id = id;
    this.position = position;
    this.type = 'deletion_echo';
    this.haunting = false;
    this.corruptionLevel = 0.6;

    // Core NPC properties
    this.role = 'Guardian of Deleted Text';
    this.personality = 'Spooky, murmurs warnings';
    this.wisdom = 'Haunts deletion puzzles with broken syntax';

    // Visual appearance properties
    this.appearance = {
      symbol: '👻',
      alternativeSymbols: ['▓', '▒', '░', '≈', '~'], // Glitch patterns as fallbacks
      colors: {
        primary: '#2F4F4F', // Dark Slate Gray (ghostly)
        secondary: '#696969', // Dim Gray (shadows)
        glow: '#FF6347', // Tomato (corruption glow)
        corruption: '#8B0000', // Dark Red (deleted text)
        glitch: '#FF4500', // Orange Red (glitch effect)
      },
      floatingGlyphs: ['x', 'dd', 'D', 'dw', '✗', '▓', '▒', '≈', '~', '⚠'],
      brokenText: ['er#or', 'c0rru*t', 'del##ed', 'br@ken', '##null##'],
      cssClass: 'npc-deletion-echo',
      animationType: 'ghost-glitch',
    };
  }

  /**
   * Get the visual symbol for this NPC based on current state
   */
  getVisualSymbol() {
    if (this.haunting) {
      // Glitch between symbols when actively haunting
      const glitchSymbols = ['👻', '▓', '▒', '░'];
      return glitchSymbols[Math.floor(Math.random() * glitchSymbols.length)];
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
   * Get a random floating glyph (including broken text)
   */
  getFloatingGlyph() {
    const allGlyphs = [...this.appearance.floatingGlyphs, ...this.appearance.brokenText];
    return allGlyphs[Math.floor(Math.random() * allGlyphs.length)];
  }

  /**
   * Get corruption intensity (affects visual glitching)
   */
  getCorruptionIntensity() {
    return this.corruptionLevel + (this.haunting ? 0.3 : 0);
  }

  /**
   * Start haunting (increase corruption and activity)
   */
  startHaunting() {
    this.haunting = true;
    this.corruptionLevel = Math.min(1.0, this.corruptionLevel + 0.2);
  }

  /**
   * Stop haunting (reduce activity but keep some corruption)
   */
  stopHaunting() {
    this.haunting = false;
    this.corruptionLevel = Math.max(0.3, this.corruptionLevel - 0.1);
  }

  /**
   * Get spooky warnings about deletion
   * @returns {string} - Random warning about the power of deletion
   */
  getWarning() {
    const warnings = [
      '*whispers* Deletion cannot be undone...',
      '*echoes* Every character remembers being erased...',
      '*murmurs* x cuts... dd slices... D severs...',
      '*warns* Use deletion wisely, young cursor...',
      '*hisses* The canyon remembers all lost text...',
      '*moans* Broken syntax haunts these walls...',
      '*sighs* With great power comes great... responsibility.',
    ];
    return warnings[Math.floor(Math.random() * warnings.length)];
  }

  /**
   * Get ghostly murmurs with broken text effects
   * @returns {string} - Corrupted murmurs
   */
  getMurmur() {
    const murmurs = [
      '*whispers* d3l3t10n... h@unts th3 c@ny0n...',
      '*echoes* x... f0r pr3c1s10n... dd f0r... dest7uct10n...',
      '*murmurs* D t@k3s... 3v3ryth1ng t0... th3 3nd...',
      '*moans* dw... w0rds d1s@pp3@r... 1nt0 v01d...',
      '*sighs* Br0k3n... t3xt... fl0@ts h3r3... f0r3v3r...',
      '*warns* B3 c@r3ful... wh@t y0u... 3r@s3...',
    ];
    return murmurs[Math.floor(Math.random() * murmurs.length)];
  }

  /**
   * Get contextual dialogue based on player's deletion mastery
   * @param {Object} gameState - Current game state with collected keys
   * @returns {Array<string>} - Array of dialogue lines
   */
  getDialogue(gameState = {}) {
    const collectedKeys = gameState.collectedKeys || new Set();
    const hasX = collectedKeys.has('x');
    const hasDD = collectedKeys.has('dd');
    const hasD = collectedKeys.has('D');
    const hasDW = collectedKeys.has('dw');
    const hasDeletions = hasX && hasDD && hasD && hasDW;

    if (!this.haunting) {
      return [
        '*A ghostly figure materializes from the canyon mist*',
        '*echoes* Whooo... disturbs the deleted text?',
        'I am the Echo... of all that was erased...',
        '*whispers* You seek the power of deletion?',
        '*warns* Be careful what you wish for...',
      ];
    }

    if (!hasX) {
      return [
        '*floats closer with corruption trailing*',
        'Begin with precision... single character death.',
        'x marks the spot... where text shall fall.',
        '*points with ghostly finger* Find it in the rubble.',
        this.getWarning(),
      ];
    }

    if (!hasDD) {
      return [
        '*glitches briefly* Good... but think bigger.',
        'dd... the line destroyer... entire rows vanish.',
        '*shows broken text fragments* See how lines crumble?',
        'Find the power... to erase complete thoughts.',
        this.getMurmur(),
      ];
    }

    if (!hasD) {
      return [
        '*corruption intensifies* You learn quickly...',
        'But what of... partial destruction?',
        "D takes all... from cursor to line's end.",
        '*demonstrates with broken syntax* Like this... but real.',
        'Seek the capital... in the deepest shadows.',
      ];
    }

    if (!hasDW) {
      return [
        '*phases between visible and glitch*',
        'One power remains... word by word.',
        'dw... deletes entire words... thoughts disappear.',
        '*whispers urgently* Words are dangerous things.',
        'Find this final piece... complete the destruction.',
      ];
    }

    if (hasDeletions) {
      return [
        '*The corruption clears, revealing a clearer ghost*',
        'You have mastered... the Four Deletions.',
        'x for precision, dd for lines, D for ends, dw for words.',
        '*nods approvingly* The canyon recognizes your power.',
        'But remember... *fading* ...with deletion comes responsibility.',
        '*one final whisper* Create wisely... what you can destroy.',
        this.getWarning(),
      ];
    }

    return [
      '*continues haunting the canyon*',
      'The deleted text... calls to you...',
      this.getMurmur(),
    ];
  }

  /**
   * Get deletion-specific teaching when player uses commands
   * @param {string} deletion - The deletion command being learned
   * @returns {string} - Teaching dialogue for that command
   */
  getDeletionTeaching(deletion) {
    const teachings = {
      x: '*flickers* x cuts the character beneath your cursor... precise death.',
      dd: '*glitches* dd erases the entire line... complete destruction.',
      D: '*corrupts* D deletes from cursor to line end... partial annihilation.',
      dw: '*phases* dw removes whole words... thoughts vanish into void.',
    };
    return teachings[deletion] || '*whispers* Practice deletion... carefully...';
  }

  /**
   * Get ominous advice about text editing responsibility
   * @returns {string} - Wise but spooky advice
   */
  getWisdomOfDeletion() {
    const wisdom = [
      'Creation and destruction... two sides of one coin.',
      'Every deleted character... had a purpose once.',
      'The power to erase... requires wisdom to preserve.',
      'Delete with intention... not from anger.',
      'The canyon remembers... what was lost.',
      'Great editors... know when NOT to delete.',
    ];
    return wisdom[Math.floor(Math.random() * wisdom.length)];
  }
}
