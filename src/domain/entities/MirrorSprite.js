/**
 * Mirror Sprite - Appears near Search Springs for /, ?, n, N commands
 * Whispers hints, vanishes quickly. Tiny water spirit, silvery or blue, shimmering like a reflection.
 */
export class MirrorSprite {
  constructor(id, position) {
    this.id = id;
    this.position = position;
    this.type = 'mirror_sprite';
    this.reflecting = true;
    this.visibility = 0.8;
    this.shimmerPhase = 0;

    // Core NPC properties
    this.role = 'Guardian of Search Mysteries';
    this.personality = 'Whispers hints, vanishes quickly';
    this.wisdom = 'Guides search and navigation (/, ?, n, N)';

    // Visual appearance properties
    this.appearance = {
      symbol: '💧',
      alternativeSymbols: ['◊', '◇', '⟐', '◈', '~'], // Crystalline shapes as fallbacks
      colors: {
        primary: '#C0C0C0', // Silver (water spirit)
        secondary: '#4682B4', // Steel Blue (deep water)
        glow: '#E0FFFF', // Light Cyan (shimmering)
        reflection: '#B0E0E6', // Powder Blue (reflection)
        vanish: '#F0F8FF', // Alice Blue (fading)
      },
      floatingGlyphs: ['/', '?', 'n', 'N', '◊', '~', '≈', '⟨', '⟩', '∴'],
      reflectionSymbols: ['⟡', '◈', '◊', '⟐', '≈'],
      cssClass: 'npc-mirror-sprite',
      animationType: 'water-shimmer',
    };
  }

  /**
   * Get the visual symbol for this NPC based on current state
   */
  getVisualSymbol() {
    if (this.visibility < 0.3) {
      return '·'; // Nearly invisible
    }
    if (this.reflecting) {
      // Shimmer between water drop and reflection symbols
      const shimmerSymbols = ['💧', '◊', '◇'];
      return shimmerSymbols[this.shimmerPhase % shimmerSymbols.length];
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
   * Get a random floating glyph (includes reflection symbols when reflecting)
   */
  getFloatingGlyph() {
    const allGlyphs = this.reflecting
      ? [...this.appearance.floatingGlyphs, ...this.appearance.reflectionSymbols]
      : this.appearance.floatingGlyphs;
    return allGlyphs[Math.floor(Math.random() * allGlyphs.length)];
  }

  /**
   * Get shimmer intensity based on reflection state
   */
  getShimmerIntensity() {
    return this.reflecting ? 0.5 + Math.sin(this.shimmerPhase * 0.1) * 0.3 : 0.2;
  }

  /**
   * Update shimmer phase (call periodically for animation)
   */
  updateShimmer() {
    this.shimmerPhase = (this.shimmerPhase + 1) % 100;
  }

  /**
   * Start fading away (vanishing behavior)
   */
  startVanishing() {
    this.visibility = Math.max(0.1, this.visibility - 0.1);
    this.reflecting = false;
  }

  /**
   * Become more visible (when player approaches or needs guidance)
   */
  becomeVisible() {
    this.visibility = Math.min(1.0, this.visibility + 0.2);
    this.reflecting = true;
  }

  /**
   * Check if sprite should vanish (based on visibility)
   */
  shouldVanish() {
    return this.visibility < 0.2;
  }

  /**
   * Get whispered hint about search commands
   */
  getWhisper() {
    const whispers = [
      '*ripples* ...search forward with /...',
      '*shimmers* ...search backward with ?...',
      '*reflects* ...find next with n...',
      '*sparkles* ...find previous with N...',
      '*whispers* ...patterns in the water reveal all...',
    ];
    return whispers[Math.floor(Math.random() * whispers.length)];
  }

  /**
   * Get mystical guidance about search patterns
   */
  getReflection() {
    const reflections = [
      'The water shows what you seek...',
      'Forward and backward, the truth flows...',
      'Every search creates ripples...',
      'The pattern you seek reflects in all waters...',
    ];
    return reflections[Math.floor(Math.random() * reflections.length)];
  }
}
