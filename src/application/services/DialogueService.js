/**
 * DialogueService - Manages NPC interactions and conversations
 * Handles contextual dialogue, teaching moments, and progression feedback
 */
export class DialogueService {
  constructor() {
    this.currentDialogue = null;
    this.conversationHistory = new Map();
    this.teachingMoments = new Map();
    this.encouragementTimers = new Map();
  }

  /**
   * Get contextual dialogue for an NPC based on game state
   * @param {Object} npc - The NPC entity
   * @param {Object} gameState - Current game state
   * @returns {Array<string>} - Array of dialogue lines
   */
  getNPCDialogue(npc, gameState = {}) {
    if (!npc) return [];

    // Use NPC's own dialogue method if available
    if (typeof npc.getDialogue === 'function') {
      return npc.getDialogue(gameState);
    }

    // Fallback to zone-configured dialogue
    if (npc.dialogue && Array.isArray(npc.dialogue)) {
      return npc.dialogue;
    }

    // Default dialogue based on NPC type
    return this._getDefaultDialogue(npc, gameState);
  }

  /**
   * Handle teaching moment when player demonstrates a skill
   * @param {Object} npc - The NPC entity providing teaching
   * @param {string} skill - The skill being learned
   * @param {Object} gameState - Current game state
   * @returns {string} - Teaching dialogue
   */
  getTeachingMoment(npc, skill) {
    const teachingKey = `${npc.id}_${skill}`;

    // Avoid repeating the same teaching too often
    if (this.teachingMoments.has(teachingKey)) {
      const lastTime = this.teachingMoments.get(teachingKey);
      if (Date.now() - lastTime < 30000) {
        // 30 second cooldown
        return null;
      }
    }

    this.teachingMoments.set(teachingKey, Date.now());

    // Use NPC-specific teaching methods
    if (npc.type === 'caret_stone' && typeof npc.getMovementTeaching === 'function') {
      return npc.getMovementTeaching(skill);
    }

    if (npc.type === 'maze_scribe' && typeof npc.getModeTeaching === 'function') {
      return npc.getModeTeaching(skill);
    }

    if (npc.type === 'deletion_echo' && typeof npc.getDeletionTeaching === 'function') {
      return npc.getDeletionTeaching(skill);
    }

    if (npc.type === 'insert_scribe' && typeof npc.getInsertionTeaching === 'function') {
      return npc.getInsertionTeaching(skill);
    }

    if (npc.type === 'mirror_sprite' && typeof npc.getSearchTeaching === 'function') {
      return npc.getSearchTeaching(skill);
    }

    if (npc.type === 'practice_buddy' && typeof npc.getSkillCelebration === 'function') {
      return npc.getSkillCelebration(skill);
    }

    // Generic teaching fallback
    return this._getGenericTeaching(skill);
  }

  /**
   * Get encouragement from practice-focused NPCs
   * @param {Object} npc - The NPC providing encouragement
   * @param {string} context - Context for the encouragement
   * @returns {string} - Encouraging message
   */
  getEncouragement(npc, context = 'general') {
    if (!npc) return '';

    if (npc.type === 'practice_buddy') {
      if (typeof npc.getMotivationalSupport === 'function') {
        return npc.getMotivationalSupport(context);
      }
      if (typeof npc.getEncouragement === 'function') {
        return npc.getEncouragement();
      }
    }

    // Other NPCs can provide context-appropriate encouragement
    if (typeof npc.getEncouragement === 'function') {
      return npc.getEncouragement();
    }

    return this._getGenericEncouragement();
  }

  /**
   * Handle milestone celebrations with appropriate NPCs
   * @param {string} milestone - The milestone achieved
   * @param {Array<Object>} availableNPCs - NPCs available for celebration
   * @param {Object} gameState - Current game state
   * @returns {Object} - Celebration dialogue and NPC
   */
  celebrateMilestone(milestone, availableNPCs = []) {
    // Practice Buddy is the primary celebration NPC
    const practiceBuddy = availableNPCs.find((npc) => npc.type === 'practice_buddy');
    if (practiceBuddy && typeof practiceBuddy.getMilestoneCelebration === 'function') {
      return {
        npc: practiceBuddy,
        dialogue: practiceBuddy.getMilestoneCelebration(milestone),
        type: 'celebration',
      };
    }

    // Other NPCs can provide context-appropriate celebrations
    const appropriateNPC = this._findAppropriateNPCForMilestone(milestone, availableNPCs);
    if (appropriateNPC) {
      return {
        npc: appropriateNPC,
        dialogue: this._getContextualCelebration(milestone, appropriateNPC),
        type: 'celebration',
      };
    }

    return null;
  }

  /**
   * Start interactive conversation with an NPC
   * @param {Object} npc - The NPC to converse with
   * @param {Object} gameState - Current game state
   * @returns {Object} - Conversation object
   */
  startConversation(npc, gameState = {}) {
    const dialogue = this.getNPCDialogue(npc, gameState);

    const conversation = {
      npc: npc,
      dialogue: dialogue,
      currentLine: 0,
      isActive: true,
      startTime: Date.now(),
      gameState: { ...gameState },
    };

    this.currentDialogue = conversation;
    this._recordConversation(npc.id, conversation);

    return conversation;
  }

  /**
   * Advance conversation to next line
   * @returns {Object|null} - Next dialogue line or null if finished
   */
  advanceConversation() {
    if (!this.currentDialogue || !this.currentDialogue.isActive) {
      return null;
    }

    this.currentDialogue.currentLine++;

    if (this.currentDialogue.currentLine >= this.currentDialogue.dialogue.length) {
      this.endConversation();
      return null;
    }

    return {
      text: this.currentDialogue.dialogue[this.currentDialogue.currentLine],
      line: this.currentDialogue.currentLine,
      total: this.currentDialogue.dialogue.length,
    };
  }

  /**
   * End current conversation
   */
  endConversation() {
    if (this.currentDialogue) {
      this.currentDialogue.isActive = false;
      this.currentDialogue.endTime = Date.now();
    }
    this.currentDialogue = null;
  }

  /**
   * Get conversation progress
   * @returns {Object|null} - Current conversation progress
   */
  getConversationProgress() {
    if (!this.currentDialogue || !this.currentDialogue.isActive) {
      return null;
    }

    return {
      npc: this.currentDialogue.npc,
      currentText: this.currentDialogue.dialogue[this.currentDialogue.currentLine],
      progress: this.currentDialogue.currentLine + 1,
      total: this.currentDialogue.dialogue.length,
      isFinished: this.currentDialogue.currentLine >= this.currentDialogue.dialogue.length - 1,
    };
  }

  /**
   * Check if player has talked to specific NPC recently
   * @param {string} npcId - The NPC ID to check
   * @param {number} timeWindow - Time window in milliseconds (default 5 minutes)
   * @returns {boolean} - Whether player talked to NPC recently
   */
  hasRecentConversation(npcId, timeWindow = 300000) {
    if (!this.conversationHistory.has(npcId)) {
      return false;
    }

    const conversations = this.conversationHistory.get(npcId);
    const latestConversation = conversations[conversations.length - 1];

    return Date.now() - latestConversation.startTime < timeWindow;
  }

  /**
   * Get default dialogue for NPCs without custom dialogue methods
   * @private
   */
  _getDefaultDialogue(npc) {
    const genericDialogues = {
      caret_spirit: [
        'Welcome, young cursor.',
        'The four directions await your mastery.',
        'Practice hjkl until they become instinct.',
      ],
      syntax_wisp: [
        'Mysterious forces flow through this text...',
        'Learn well, and syntax will obey your will.',
      ],
      bug_king: [
        'FOOLISH CURSOR! You dare challenge me?',
        'My corruption will overwhelm your skills!',
      ],
    };

    return (
      genericDialogues[npc.id] ||
      genericDialogues[npc.type] || [
        'Hello, traveler.',
        'May your journey through VIM be enlightening.',
      ]
    );
  }

  /**
   * Get generic teaching for skills
   * @private
   */
  _getGenericTeaching(skill) {
    const teachings = {
      h: 'h moves left - practice until it feels natural.',
      j: 'j moves down - let your finger find the rhythm.',
      k: 'k moves up - reach for efficiency.',
      l: 'l moves right - flow like reading text.',
      i: 'i enters insert mode - creation begins.',
      ESC: 'ESC returns to normal mode - your safe harbor.',
      x: 'x deletes character - precision is key.',
      dd: 'dd deletes line - powerful but careful.',
      '/': '/ searches forward - find what you seek.',
      '?': '? searches backward - explore the past.',
    };

    return teachings[skill] || `Well done with ${skill}! Keep practicing.`;
  }

  /**
   * Get generic encouragement
   * @private
   */
  _getGenericEncouragement() {
    const encouragements = [
      "Keep practicing! You're making great progress.",
      'Every keystroke builds your expertise.',
      'VIM mastery comes with persistence.',
      "You're developing excellent muscle memory!",
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  /**
   * Find appropriate NPC for milestone celebration
   * @private
   */
  _findAppropriateNPCForMilestone(milestone, npcs) {
    const milestoneNPCMap = {
      basic_movement: ['caret_spirit', 'caret_stone'],
      mode_switching: ['maze_scribe', 'mode_guardian'],
      text_editing: ['insert_scribe', 'scribe_poet'],
      deletion_mastery: ['deletion_echo'],
      search_mastery: ['mirror_sprite', 'reflection_spirit'],
      final_mastery: ['bug_king', 'victory_spirit'],
    };

    const appropriateTypes = milestoneNPCMap[milestone] || [];
    return npcs.find(
      (npc) => appropriateTypes.includes(npc.id) || appropriateTypes.includes(npc.type)
    );
  }

  /**
   * Get contextual celebration based on milestone and NPC
   * @private
   */
  _getContextualCelebration(milestone, npc) {
    // Each NPC type provides unique celebration style
    if (npc.type === 'caret_stone') {
      return 'Ancient paths... acknowledge your growth.';
    }
    if (npc.type === 'maze_scribe') {
      return '*Unfurls celebratory scroll* Your mastery is recorded in the annals!';
    }
    if (npc.type === 'deletion_echo') {
      return '*Corruption clears briefly* Even the deleted text... celebrates your skill.';
    }

    return 'Excellent work! Your skills continue to grow.';
  }

  /**
   * Record conversation in history
   * @private
   */
  _recordConversation(npcId, conversation) {
    if (!this.conversationHistory.has(npcId)) {
      this.conversationHistory.set(npcId, []);
    }

    this.conversationHistory.get(npcId).push({
      startTime: conversation.startTime,
      dialogue: conversation.dialogue,
      gameState: conversation.gameState,
    });

    // Keep only last 5 conversations per NPC to manage memory
    const conversations = this.conversationHistory.get(npcId);
    if (conversations.length > 5) {
      conversations.shift();
    }
  }
}
