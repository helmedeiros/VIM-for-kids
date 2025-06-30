/**
 * Use case for handling NPC interactions
 * Focused solely on detecting and managing NPC dialogue and interactions
 * Follows Single Responsibility Principle and Hexagonal Architecture
 */
export class NPCInteractionUseCase {
  constructor(gameRenderer, dialogueService = null) {
    this._gameRenderer = gameRenderer;
    this._dialogueService = dialogueService;
  }

  /**
   * Execute NPC interaction check at a specific position
   * @param {Position} position - The position to check for NPCs
   * @param {Object} gameState - Current game state
   * @returns {Object} - Interaction result
   */
  execute(position, gameState) {
    // Check if there are NPCs available in the game state
    if (!gameState.npcs || !Array.isArray(gameState.npcs)) {
      return { interactionOccurred: false, npc: null };
    }

    // Find NPC at the specified position
    const npcAtPosition = this._findNPCAtPosition(position, gameState.npcs);

    if (npcAtPosition) {
      // Trigger dialogue display
      this._displayNPCDialogue(npcAtPosition, gameState);

      return {
        interactionOccurred: true,
        npc: npcAtPosition,
        dialogue: this._getNPCDialogue(npcAtPosition, gameState),
      };
    }

    return { interactionOccurred: false, npc: null };
  }

  /**
   * Find NPC at the specified position
   * @param {Position} position - Position to check
   * @param {Array} npcs - Array of NPCs to search
   * @returns {Object|null} - Found NPC or null
   * @private
   */
  _findNPCAtPosition(position, npcs) {
    return npcs.find((npc) => {
      if (npc.position && Array.isArray(npc.position)) {
        return npc.position[0] === position.x && npc.position[1] === position.y;
      }
      return false;
    });
  }

  /**
   * Get contextual dialogue from NPC
   * @param {Object} npc - The NPC entity
   * @param {Object} gameState - Current game state
   * @returns {Array<string>} - Dialogue lines
   * @private
   */
  _getNPCDialogue(npc, gameState) {
    // Use DialogueService if available for contextual dialogue
    if (this._dialogueService && typeof this._dialogueService.getNPCDialogue === 'function') {
      return this._dialogueService.getNPCDialogue(npc, gameState);
    }

    // Use NPC's own dialogue method if available
    if (typeof npc.getDialogue === 'function') {
      return npc.getDialogue(gameState);
    }

    // Use zone-configured dialogue
    if (npc.dialogue && Array.isArray(npc.dialogue)) {
      return npc.dialogue;
    }

    // Fallback dialogue
    return ['Hello, traveler!', 'Welcome to this realm.'];
  }

  /**
   * Display NPC dialogue using the game renderer
   * @param {Object} npc - The NPC entity
   * @param {Object} gameState - Current game state
   * @private
   */
  _displayNPCDialogue(npc, gameState) {
    const dialogue = this._getNPCDialogue(npc, gameState);

    // Display the dialogue using the renderer
    if (typeof this._gameRenderer.showNPCDialogue === 'function') {
      this._gameRenderer.showNPCDialogue(npc, dialogue, {
        duration: 6000, // 6 seconds for dialogue
      });
    } else {
      // Fallback to basic message display
      const dialogueText = Array.isArray(dialogue) ? dialogue.join('\n\n') : dialogue;
      if (typeof this._gameRenderer.showMessage === 'function') {
        this._gameRenderer.showMessage(dialogueText, {
          type: 'dialogue',
          speaker: npc.name || npc.id || 'NPC',
          duration: 6000,
        });
      }
    }
  }

  /**
   * Handle teaching moments through DialogueService
   * @param {Object} npc - The NPC entity
   * @param {string} skill - The skill being demonstrated
   * @param {Object} gameState - Current game state
   * @returns {string|null} - Teaching message or null
   */
  handleTeachingMoment(npc, skill, gameState) { // eslint-disable-line no-unused-vars
    if (this._dialogueService && typeof this._dialogueService.getTeachingMoment === 'function') {
      return this._dialogueService.getTeachingMoment(npc, skill);
    }
    return null;
  }

  /**
   * Handle milestone celebrations through DialogueService
   * @param {string} milestone - The milestone achieved
   * @param {Array} npcs - Available NPCs for celebration
   * @param {Object} gameState - Current game state
   * @returns {Object|null} - Celebration data or null
   */
  handleMilestoneCelebration(milestone, npcs, gameState) { // eslint-disable-line no-unused-vars
    if (this._dialogueService && typeof this._dialogueService.celebrateMilestone === 'function') {
      return this._dialogueService.celebrateMilestone(milestone, npcs);
    }
    return null;
  }
}
