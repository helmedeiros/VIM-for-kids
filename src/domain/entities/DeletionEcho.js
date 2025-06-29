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
   * Get a spooky warning about deletions
   */
  getWarning() {
    const warnings = [
      'Beware... deleted text never forgets...',
      'x marks the spot... where characters die...',
      'dd will devour... entire lines whole...',
      'D destroys... from cursor to end...',
      'What you delete... echoes forever...',
    ];
    return warnings[Math.floor(Math.random() * warnings.length)];
  }

  /**
   * Get ghostly murmur
   */
  getMurmur() {
    const murmurs = [
      '*whispers* ...deleted... forever...',
      '*echoes* ...cannot undo... the void...',
      '*moans* ...broken syntax... everywhere...',
      '*sighs* ...remember what was lost...',
    ];
    return murmurs[Math.floor(Math.random() * murmurs.length)];
  }
}
