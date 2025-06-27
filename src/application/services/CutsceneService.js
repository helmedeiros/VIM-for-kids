/**
 * Service responsible for managing cutscene logic
 * Follows Single Responsibility Principle and hexagonal architecture
 */
export class CutsceneService {
  constructor(cutsceneProvider, persistenceService, featureFlags) {
    if (!cutsceneProvider) {
      throw new Error('CutsceneProvider is required');
    }
    if (!persistenceService) {
      throw new Error('PersistenceService is required');
    }
    if (!featureFlags) {
      throw new Error('FeatureFlags is required');
    }

    this._cutsceneProvider = cutsceneProvider;
    this._persistenceService = persistenceService;
    this._featureFlags = featureFlags;
  }

  /**
   * Determine if an origin story should be shown for a game
   * @param {string} gameId - The game identifier
   * @returns {Promise<boolean>} True if the origin story should be shown
   */
  async shouldShowOriginStory(gameId) {
    // Check if feature is enabled
    if (!this._featureFlags.isEnabled('ORIGIN_STORY_CUTSCENES')) {
      return false;
    }

    // Check if game has an origin story
    const hasStory = await this._cutsceneProvider.hasOriginStory(gameId);
    if (!hasStory) {
      return false;
    }

    // Check if story has already been shown
    const cutsceneState = this._persistenceService.getCutsceneState();
    const gameState = cutsceneState[gameId];
    if (gameState && gameState.hasBeenShown) {
      return false;
    }

    return true;
  }

  /**
   * Get origin story for a game
   * @param {string} gameId - The game identifier
   * @returns {Promise<OriginStory|null>} The origin story or null
   */
  async getOriginStory(gameId) {
    return await this._cutsceneProvider.getOriginStory(gameId);
  }

  /**
   * Mark an origin story as shown
   * @param {string} gameId - The game identifier
   */
  async markOriginStoryAsShown(gameId) {
    this._persistenceService.persistCutsceneState(gameId, { hasBeenShown: true });
  }

  /**
   * Reset origin story state for a game
   * @param {string} gameId - The game identifier
   */
  async resetOriginStoryState(gameId) {
    this._persistenceService.persistCutsceneState(gameId, { hasBeenShown: false });
  }

  /**
   * Reset all origin story states (useful for development/testing)
   */
  async resetAllOriginStories() {
    const allStories = await this._cutsceneProvider.getAllOriginStories();
    for (const story of allStories) {
      await this.resetOriginStoryState(story.gameId);
    }
  }

  /**
   * Check if cutscenes are enabled via feature flags
   * @returns {boolean} True if cutscenes are enabled
   */
  isCutsceneFeatureEnabled() {
    return this._featureFlags.isEnabled('ORIGIN_STORY_CUTSCENES');
  }
}
