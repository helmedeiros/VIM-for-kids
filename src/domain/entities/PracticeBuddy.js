/**
 * Practice Buddy - Friendly helper in Playground who cheers you on but doesn't help solve
 * Cheerful, encouraging. Small round sprite with a foam finger or tiny flag.
 */
export class PracticeBuddy {
  constructor(id, position) {
    this.id = id;
    this.position = position;
    this.type = 'practice_buddy';
    this.cheering = false;
    this.enthusiasm = 0.9;
    this.bouncePhase = 0;

    // Core NPC properties
    this.role = 'Cheerleader of Practice';
    this.personality = 'Cheerful, encouraging';
    this.wisdom = 'Provides motivation and celebration, not solutions';

    // Visual appearance properties
    this.appearance = {
      symbol: '🎉',
      alternativeSymbols: ['☺', '◎', '⊕', '◯', '○'], // Happy faces as fallbacks
      colors: {
        primary: '#FF69B4', // Hot Pink (enthusiastic)
        secondary: '#FFD700', // Gold (celebration)
        glow: '#FFFF00', // Yellow (cheerful energy)
        flag: '#32CD32', // Lime Green (victory flag)
        foam: '#FF4500', // Orange Red (foam finger)
      },
      floatingGlyphs: ['!', '★', '✨', '🎈', '🏆', '⭐', '♪', '♫', '◯', '◎'],
      cheerSymbols: ['👏', '🎊', '🎈', '🏆', '⭐', '✨'],
      cssClass: 'npc-practice-buddy',
      animationType: 'happy-bounce',
    };
  }

  /**
   * Get the visual symbol for this NPC based on current state
   */
  getVisualSymbol() {
    if (this.cheering) {
      // Cycle through celebration symbols when cheering
      const cheerIcons = ['🎉', '🎊', '⭐', '✨'];
      return cheerIcons[this.bouncePhase % cheerIcons.length];
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
   * Get a random floating glyph (includes cheer symbols when cheering)
   */
  getFloatingGlyph() {
    const allGlyphs = this.cheering
      ? [...this.appearance.floatingGlyphs, ...this.appearance.cheerSymbols]
      : this.appearance.floatingGlyphs;
    return allGlyphs[Math.floor(Math.random() * allGlyphs.length)];
  }

  /**
   * Get enthusiasm level (affects bounce intensity)
   */
  getEnthusiasmLevel() {
    return this.enthusiasm + (this.cheering ? 0.1 : 0);
  }

  /**
   * Update bounce phase (call periodically for animation)
   */
  updateBounce() {
    this.bouncePhase = (this.bouncePhase + 1) % 100;
  }

  /**
   * Start cheering (triggered by player achievements)
   */
  startCheering() {
    this.cheering = true;
    this.enthusiasm = Math.min(1.0, this.enthusiasm + 0.05);
  }

  /**
   * Stop cheering (return to normal encouragement)
   */
  stopCheering() {
    this.cheering = false;
  }

  /**
   * Get encouraging cheer
   */
  getCheer() {
    const cheers = [
      'Great job! Keep it up! 🎉',
      "You're doing amazing! ⭐",
      'Practice makes perfect! 💪',
      "That's the spirit! 🎊",
      "You've got this! 🏆",
      'Fantastic progress! ✨',
      'Keep practicing! 🎈',
      "You're getting better! 👏",
    ];
    return cheers[Math.floor(Math.random() * cheers.length)];
  }

  /**
   * Get general encouragement
   */
  getEncouragement() {
    const encouragements = [
      'Remember, every expert was once a beginner!',
      'The more you practice, the stronger you become!',
      'Every keystroke builds your muscle memory!',
      "Don't give up - you're closer than you think!",
      'Practice is the path to mastery!',
      "You're building VIM superpowers! ⚡",
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  /**
   * Get celebration for achievements
   */
  getCelebration() {
    const celebrations = [
      '🎉 AMAZING! You mastered that skill! 🎉',
      '⭐ INCREDIBLE! Your VIM powers grow! ⭐',
      '🏆 OUTSTANDING! Practice pays off! 🏆',
      "✨ BRILLIANT! You're becoming a VIM wizard! ✨",
      '🎊 SPECTACULAR! That was perfect! 🎊',
    ];
    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }

  /**
   * Get skill-specific celebration
   * @param {string} skill - The VIM skill being practiced
   * @returns {string} - Celebratory message for that skill
   */
  getSkillCelebration(skill) {
    const celebrations = {
      h: '🎉 Left movement mastered! Smooth as silk!',
      j: "🎊 Down motion perfected! You're diving deep!",
      k: '✨ Up movement conquered! Reaching for the stars!',
      l: '⚡ Right movement nailed! Moving forward with power!',
      w: "🚀 Word jumping achieved! You're flying through text!",
      b: '🏃‍♂️ Backward word mastery! Reversing like a pro!',
      e: '🎯 End-of-word precision! Perfect targeting!',
      x: '✂️ Character deletion! Clean and precise!',
      dd: '🗑️ Line deletion mastery! Boom, gone!',
      yy: '📋 Line copying champion! Copy-paste hero!',
      p: '📄 Paste perfection! Text placement expert!',
      i: '✏️ Insert mode magic! Text creation wizard!',
      a: '📝 Append mastery! Adding with finesse!',
      '/': '🔍 Search forward genius! Pattern finder!',
      '?': '🔎 Backward search expert! Time traveling searcher!',
      ':w': '💾 Save command champion! Data protector!',
      ':q': '🚪 Quit command mastery! Clean exits!',
    };
    return celebrations[skill] || '🎉 Awesome skill demonstration!';
  }

  /**
   * Get contextual dialogue based on player's overall progress
   * @param {Object} gameState - Current game state with collected keys and progress
   * @returns {Array<string>} - Array of dialogue lines
   */
  getDialogue(gameState = {}) {
    const collectedKeys = gameState.collectedKeys || new Set();
    const skillCount = collectedKeys.size;

    if (!this.cheering) {
      return [
        '🎉 Hey there, superstar! Welcome to Practice Central!',
        "I'm your Practice Buddy - here to cheer you on!",
        '*Bounces with excitement*',
        "Ready to show me what you've learned?",
        'Every skill you practice makes you stronger! 💪',
      ];
    }

    if (skillCount === 0) {
      return [
        "🌟 Everyone starts somewhere, and you're starting great!",
        'Try moving around with h, j, k, l first!',
        "Don't worry about perfection - practice makes progress!",
        "*Cheers enthusiastically* You've got this, champion!",
        this.getEncouragement(),
      ];
    }

    if (skillCount <= 5) {
      return [
        '🚀 Look at you go! Those first skills are solid!',
        `You've mastered ${skillCount} skills already!`,
        'The foundation is looking strong!',
        '*Does a little victory dance*',
        "Keep exploring - there's so much more to discover!",
        this.getEncouragement(),
      ];
    }

    if (skillCount <= 10) {
      return [
        "⚡ WOW! You're really getting the hang of this!",
        `${skillCount} skills conquered! You're on a roll!`,
        'I love seeing your confidence grow!',
        '*Jumps up and down with joy*',
        "You're becoming a real VIM warrior!",
        this.getEncouragement(),
      ];
    }

    if (skillCount <= 15) {
      return [
        "🏆 INCREDIBLE! You're becoming a true expert!",
        `${skillCount} skills mastered! I'm so proud!`,
        'Your finger movements are getting so smooth!',
        '*Throws confetti in celebration*',
        "You're ready for advanced challenges now!",
        this.getEncouragement(),
      ];
    }

    // High skill count - near mastery
    return [
      '🌟 LEGENDARY STATUS ACHIEVED! 🌟',
      `${skillCount} skills perfected! You're absolutely amazing!`,
      "I've watched you grow from beginner to master!",
      '*Explodes with pride and joy*',
      "You're ready to face any text editing challenge!",
      'The playground celebrates your mastery!',
      this.getEncouragement(),
    ];
  }

  /**
   * Get practice tips and helpful advice
   * @returns {string} - Helpful practice tip
   */
  getPracticeTip() {
    const tips = [
      '💡 Tip: Practice in small chunks - muscle memory takes time!',
      '🎯 Tip: Focus on accuracy first, speed comes naturally!',
      '🧠 Tip: Try to think in VIM motions, not individual keystrokes!',
      '⚡ Tip: Combine commands for super-efficient editing!',
      "🔄 Tip: Repetition builds confidence - don't give up!",
      '🎪 Tip: Make practice fun - enjoy the learning journey!',
      "💪 Tip: Every expert was once a beginner - you're doing great!",
      '🌟 Tip: Mistakes are learning opportunities in disguise!',
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  /**
   * Get motivational message based on specific challenges
   * @param {string} challenge - Type of challenge player is facing
   * @returns {string} - Motivational support message
   */
  getMotivationalSupport(challenge) {
    const support = {
      movement: '🏃‍♂️ Movement takes practice! Every great editor started with hjkl!',
      modes: "🔄 Mode switching is tricky at first - you'll get the rhythm!",
      deletion: '✂️ Deletion power is scary but useful - practice makes perfect!',
      insertion: "✏️ Text creation is an art form - you're becoming an artist!",
      search: '🔍 Search patterns unlock text mysteries - keep exploring!',
      complex: '🧩 Complex commands are just simple ones combined - you can do it!',
      speed: '⚡ Speed comes with time - focus on accuracy first!',
      confidence: '💫 Believe in yourself - I can see your progress!',
    };
    return support[challenge] || "🌟 Whatever challenge you're facing, I believe in you!";
  }

  /**
   * Get celebration for major milestones
   * @param {string} milestone - The milestone achieved
   * @returns {string} - Major celebration message
   */
  getMilestoneCelebration(milestone) {
    const celebrations = {
      first_key: '🎊 FIRST KEY COLLECTED! The journey begins!',
      basic_movement: '🚀 MOVEMENT MASTERED! You can navigate like a pro!',
      mode_switching: "🔄 MODE MASTER! You control the editor's reality!",
      text_editing: '✏️ EDITING EXPERT! Text bends to your will!',
      advanced_commands: "⚡ COMMAND CHAMPION! You've unlocked true power!",
      zone_completion: '🏆 ZONE CONQUERED! Another realm yields to your skill!',
      final_mastery: '👑 VIM ROYALTY! You are the ultimate text editing champion!',
    };
    return celebrations[milestone] || '🎉 AMAZING ACHIEVEMENT! Keep up the fantastic work!';
  }
}
