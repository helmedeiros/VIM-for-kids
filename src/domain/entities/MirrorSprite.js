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

  /**
   * Get mystical hints about search patterns
   * @returns {string} - Cryptic wisdom about searching
   */
  getSearchWisdom() {
    const wisdom = [
      '~ Patterns flow like water currents ~',
      '~ Forward and backward, the search flows ~',
      '~ / seeks ahead, ? seeks behind ~',
      '~ n continues, N reverses the find ~',
      '~ What you seek, seeks you in return ~',
      '~ Reflection reveals hidden truth ~',
      '~ The answer ripples through the text ~',
    ];
    return wisdom[Math.floor(Math.random() * wisdom.length)];
  }

  /**
   * Get shimmering riddles about navigation
   * @returns {string} - Mystical riddles about search
   */
  getSearchRiddle() {
    const riddles = [
      '~ What moves forward but can go back? ~',
      '~ What finds without being found? ~',
      '~ What question seeks its own answer? ~',
      '~ Which symbol looks ahead in time? ~',
      '~ Which symbol peers into the past? ~',
      '~ What continues without beginning? ~',
    ];
    return riddles[Math.floor(Math.random() * riddles.length)];
  }

  /**
   * Get contextual dialogue based on player's search mastery
   * @param {Object} gameState - Current game state with collected keys
   * @returns {Array<string>} - Array of dialogue lines
   */
  getDialogue(gameState = {}) {
    const collectedKeys = gameState.collectedKeys || new Set();
    const hasForward = collectedKeys.has('/');
    const hasBackward = collectedKeys.has('?');
    const hasNext = collectedKeys.has('n');
    const hasPrevious = collectedKeys.has('N');
    const hasSearches = hasForward && hasBackward && hasNext && hasPrevious;

    if (!this.reflecting) {
      return [
        "*A shimmering figure appears at the water's edge*",
        '~ I am reflection, I am search ~',
        '~ You seek what lies hidden in text? ~',
        '*Ripples spread across the surface*',
        '~ First, learn to look forward... ~',
      ];
    }

    if (!hasForward) {
      return [
        '*Gestures gracefully toward the flowing water*',
        '~ The slash "/" carries you forward ~',
        '~ Like a river flowing toward tomorrow ~',
        '*Water sparkles with anticipation*',
        '~ Find the forward search, seeker... ~',
        this.getSearchWisdom(),
      ];
    }

    if (!hasBackward) {
      return [
        '*Shimmers with pleased radiance*',
        '~ Forward you have learned, but what of the past? ~',
        '~ The question mark "?" looks behind ~',
        "~ Like moonlight on water's memory ~",
        '*Reflection shows glimpses of yesterday*',
        '~ Seek the backward search... ~',
      ];
    }

    if (!hasNext) {
      return [
        '*Ripples dance with growing excitement*',
        '~ Two directions mastered! But searching finds once... ~',
        '~ "n" continues the pattern forward ~',
        '~ Next, next, always next ~',
        '*Shows multiple reflections of the same pattern*',
        '~ Find continuation, young seeker... ~',
      ];
    }

    if (!hasPrevious) {
      return [
        '*Water surface glows with ethereal light*',
        '~ So close to mastery! One mystery remains... ~',
        '~ Capital "N" reverses the journey ~',
        '~ Previous, previous, always previous ~',
        '*Reflections flow backward through time*',
        '~ Complete the circle of search... ~',
      ];
    }

    if (hasSearches) {
      return [
        '*The water becomes crystal clear, revealing all truths*',
        '~ Perfect harmony! The Four Searches flow as one! ~',
        '~ "/" forward, "?" backward, "n" next, "N" previous ~',
        '*All reflections align in perfect symmetry*',
        '~ You have mastered the dance of pattern and text ~',
        '~ The springs sing your victory! ~',
        '*Begins to fade with satisfied smile*',
        this.getSearchWisdom(),
      ];
    }

    return [
      "*Continues shimmering at the water's edge*",
      '~ The patterns call to you... ~',
      this.getSearchRiddle(),
    ];
  }

  /**
   * Get search-specific teaching when player demonstrates understanding
   * @param {string} search - The search command being learned
   * @returns {string} - Mystical teaching for that command
   */
  getSearchTeaching(search) {
    const teachings = {
      '/': "~ *Shimmers forward* The slash opens tomorrow's door... ~",
      '?': "~ *Reflects backward* The question peers into yesterday's secrets... ~",
      n: '~ *Ripples continue* Next carries the pattern forward in time... ~',
      N: '~ *Current reverses* Previous flows the pattern backward through space... ~',
    };
    return teachings[search] || '~ *Whispers* Practice the flow of search... ~';
  }

  /**
   * Get ethereal wisdom about finding and seeking
   * @returns {string} - Philosophical insights about search
   */
  getPhilosophyOfSearch() {
    const philosophy = [
      'To search is to hope for discovery.',
      'What you seek often seeks you.',
      'Patterns exist before we find them.',
      'The journey of search is the destination.',
      'In reflection, all answers become clear.',
      'True search requires both question and direction.',
    ];
    return philosophy[Math.floor(Math.random() * philosophy.length)];
  }

  /**
   * Get warning about vanishing (Mirror Sprite\'s mysterious nature)
   * @returns {string} - Fleeting goodbye message
   */
  getVanishingMessage() {
    const messages = [
      '~ *Fading* Like ripples, I must fade... ~',
      '~ *Shimmering away* Search well, remember me in reflections... ~',
      '~ *Becoming transparent* The water calls me home... ~',
      '~ *Dissolving* Find me in every search you make... ~',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
