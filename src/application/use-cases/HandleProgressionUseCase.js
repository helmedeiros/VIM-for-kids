/**
 * Use case for handling zone and level progression
 * Separated from movement to follow Single Responsibility Principle
 * Enhanced to support cutscenes during progression
 */
export class HandleProgressionUseCase {
  constructor(
    gameState,
    gameRenderer,
    gameInstance = null,
    cutsceneService = null,
    cutsceneRenderer = null
  ) {
    this._gameState = gameState;
    this._gameRenderer = gameRenderer;
    this._gameInstance = gameInstance; // For level transitions
    this._cutsceneService = cutsceneService; // For progression cutscenes
    this._cutsceneRenderer = cutsceneRenderer; // For rendering cutscenes
  }

  /**
   * Check and execute progression based on current game state
   * @returns {Object} Progression result with type and details
   */
  async execute() {
    // Check if progression should happen (only if game state supports it)
    if (typeof this._gameState.executeProgression !== 'function') {
      return { type: 'none', reason: 'progression_not_supported' };
    }

    const progressionResult = await this._gameState.executeProgression();

    switch (progressionResult.type) {
      case 'zone':
        await this._handleZoneProgression(progressionResult.newZoneId);
        break;
      case 'level':
        await this._handleLevelProgression(progressionResult.nextLevelId);
        break;
      case 'none':
        // No progression needed
        break;
      default:
        console.warn(`Unknown progression type: ${progressionResult.type}`);
    }

    return progressionResult;
  }

  /**
   * Check if progression should occur based on current state
   * @returns {boolean} True if progression should happen
   */
  shouldExecuteProgression() {
    if (
      typeof this._gameState.shouldProgressToNextZone !== 'function' ||
      typeof this._gameState.shouldProgressToNextLevel !== 'function'
    ) {
      return false;
    }

    return (
      this._gameState.shouldProgressToNextZone() || this._gameState.shouldProgressToNextLevel()
    );
  }

  /**
   * Handle zone progression (moving to next zone in same level)
   * @private
   */
  async _handleZoneProgression(newZoneId) {
    // Check if there's a cutscene for this zone
    const gameId = this._getGameId();
    const levelId = this._getCurrentLevelId();

    if (await this._shouldShowZoneCutscene(gameId, levelId, newZoneId)) {
      await this._showZoneCutscene(gameId, levelId, newZoneId);
    }

    // Show zone progression message
    if (this._gameRenderer.showMessage) {
      this._gameRenderer.showMessage(`Progressing to ${newZoneId}...`);
    }

    // The zone has already been loaded by executeProgression
    // Just need to re-render with new state
    this._gameRenderer.render(this._gameState.getCurrentState());
  }

  /**
   * Handle level progression (moving to next level)
   * @private
   */
  async _handleLevelProgression(nextLevelId) {
    // Check if there's a cutscene for this level
    const gameId = this._getGameId();

    if (await this._shouldShowLevelCutscene(gameId, nextLevelId)) {
      await this._showLevelCutscene(gameId, nextLevelId);
    }

    // Show level progression message
    if (this._gameRenderer.showMessage) {
      this._gameRenderer.showMessage(`Level Complete! Progressing to ${nextLevelId}...`);
    } else {
      // Fallback to alert if showMessage is not available
      alert(`Level Complete! Progressing to ${nextLevelId}...`);
    }

    // Trigger level transition through the game instance
    this._triggerLevelTransition(nextLevelId);
  }

  /**
   * Trigger level transition with proper delay and fallback handling
   * @private
   */
  _triggerLevelTransition(nextLevelId) {
    setTimeout(async () => {
      try {
        if (this._gameInstance && typeof this._gameInstance.transitionToLevel === 'function') {
          await this._gameInstance.transitionToLevel(nextLevelId);
        } else if (
          window.vimForKidsGame &&
          typeof window.vimForKidsGame.transitionToLevel === 'function'
        ) {
          await window.vimForKidsGame.transitionToLevel(nextLevelId);
        } else {
          // Fallback: reload page with new level parameter
          this._fallbackLevelTransition(nextLevelId);
        }
      } catch (error) {
        console.error('Error during level transition:', error);
        // Fallback on error
        this._fallbackLevelTransition(nextLevelId);
      }
    }, 2000); // 2 second delay to show the message
  }

  /**
   * Fallback level transition using URL parameter
   * @private
   */
  _fallbackLevelTransition(nextLevelId) {
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('level', nextLevelId);
    window.location.href = currentUrl.toString();
  }

  /**
   * Check if game is complete
   * @returns {boolean} True if game is complete
   */
  isGameComplete() {
    return typeof this._gameState.isGameComplete === 'function' && this._gameState.isGameComplete();
  }

  /**
   * Get current progression status
   * @returns {Object} Status object with progression information
   */
  getProgressionStatus() {
    if (
      typeof this._gameState.shouldProgressToNextZone !== 'function' ||
      typeof this._gameState.shouldProgressToNextLevel !== 'function'
    ) {
      return {
        type: 'none',
        canProgressToZone: false,
        canProgressToLevel: false,
        isGameComplete: false,
      };
    }

    const canProgressToZone = this._gameState.shouldProgressToNextZone();
    const canProgressToLevel = this._gameState.shouldProgressToNextLevel();
    const isGameComplete = this.isGameComplete();

    let type = 'none';
    if (canProgressToLevel) {
      type = 'level';
    } else if (canProgressToZone) {
      type = 'zone';
    }

    return {
      type,
      canProgressToZone,
      canProgressToLevel,
      isGameComplete,
      currentZone: this._gameState.getCurrentZoneId ? this._gameState.getCurrentZoneId() : null,
      currentLevel: this._gameState._levelConfig ? this._gameState._levelConfig.id : null,
    };
  }

  /**
   * Check if zone cutscene should be shown
   * @private
   */
  async _shouldShowZoneCutscene(gameId, levelId, zoneId) {
    if (!this._cutsceneService) {
      return false;
    }

    try {
      return await this._cutsceneService.shouldShowCutsceneStory(gameId, 'zone', levelId, zoneId);
    } catch (error) {
      console.warn('Error checking zone cutscene:', error);
      return false;
    }
  }

  /**
   * Check if level cutscene should be shown
   * @private
   */
  async _shouldShowLevelCutscene(gameId, levelId) {
    if (!this._cutsceneService) {
      return false;
    }

    try {
      return await this._cutsceneService.shouldShowCutsceneStory(gameId, 'level', levelId);
    } catch (error) {
      console.warn('Error checking level cutscene:', error);
      return false;
    }
  }

  /**
   * Show zone cutscene
   * @private
   */
  async _showZoneCutscene(gameId, levelId, zoneId) {
    if (!this._cutsceneService || !this._cutsceneRenderer) {
      return;
    }

    try {
      const cutsceneStory = await this._cutsceneService.getCutsceneStory(
        gameId,
        'zone',
        levelId,
        zoneId
      );
      if (cutsceneStory) {
        await this._cutsceneRenderer.showCutscene(cutsceneStory);
        await this._cutsceneService.markCutsceneStoryAsShown(gameId, 'zone', levelId, zoneId);
      }
    } catch (error) {
      console.warn('Error showing zone cutscene:', error);
    }
  }

  /**
   * Show level cutscene
   * @private
   */
  async _showLevelCutscene(gameId, levelId) {
    if (!this._cutsceneService || !this._cutsceneRenderer) {
      return;
    }

    try {
      const cutsceneStory = await this._cutsceneService.getCutsceneStory(gameId, 'level', levelId);
      if (cutsceneStory) {
        await this._cutsceneRenderer.showCutscene(cutsceneStory);
        await this._cutsceneService.markCutsceneStoryAsShown(gameId, 'level', levelId);
      }
    } catch (error) {
      console.warn('Error showing level cutscene:', error);
    }
  }

  /**
   * Get current game ID
   * @private
   */
  _getGameId() {
    // Try to get game ID from game state or fallback to default
    if (this._gameState.getGameId && typeof this._gameState.getGameId === 'function') {
      return this._gameState.getGameId();
    }

    // Fallback to default game
    return 'cursor-before-clickers';
  }

  /**
   * Get current level ID
   * @private
   */
  _getCurrentLevelId() {
    // Try to get level ID from game state
    if (this._gameState._levelConfig && this._gameState._levelConfig.id) {
      return this._gameState._levelConfig.id;
    }

    // Fallback to level_1
    return 'level_1';
  }
}
