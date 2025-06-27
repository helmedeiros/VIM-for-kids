import { CutsceneStory } from '../../domain/value-objects/CutsceneStory.js';

/**
 * Service responsible for managing cutscene logic
 * Follows Single Responsibility Principle and hexagonal architecture
 * Enhanced to support multi-level cutscenes (game, level, zone)
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

  // New multi-level cutscene methods

  /**
   * Determine if a cutscene story should be shown
   * @param {string} gameId - The game identifier
   * @param {string} type - Story type: 'game', 'level', or 'zone'
   * @param {string|null} levelId - Level identifier (required for level and zone types)
   * @param {string|null} zoneId - Zone identifier (required for zone type)
   * @returns {Promise<boolean>} True if the cutscene story should be shown
   */
  async shouldShowCutsceneStory(gameId, type, levelId = null, zoneId = null) {
    try {
      // Check if feature is enabled
      if (!this._featureFlags.isEnabled('ORIGIN_STORY_CUTSCENES')) {
        return false;
      }

      // Validate cutscene type
      if (!['game', 'level', 'zone'].includes(type)) {
        return false;
      }

      // Check if game has the cutscene story
      const hasStory = await this._cutsceneProvider.hasCutsceneStory(gameId, type, levelId, zoneId);
      if (!hasStory) {
        return false;
      }

      // Create story identifier for persistence
      const identifier = this._createStoryIdentifier(gameId, type, levelId, zoneId);

      // Check if story has already been shown
      const cutsceneState = this._persistenceService.getCutsceneState();
      const storyState = cutsceneState[identifier];
      if (storyState && storyState.hasBeenShown) {
        return false;
      }

      return true;
    } catch (error) {
      // Graceful error handling - if anything fails, don't show cutscene
      return false;
    }
  }

  /**
   * Get cutscene story
   * @param {string} gameId - The game identifier
   * @param {string} type - Story type: 'game', 'level', or 'zone'
   * @param {string|null} levelId - Level identifier (required for level and zone types)
   * @param {string|null} zoneId - Zone identifier (required for zone type)
   * @returns {Promise<Object|null>} The cutscene story data or null
   */
  async getCutsceneStory(gameId, type, levelId = null, zoneId = null) {
    return await this._cutsceneProvider.getCutsceneStory(gameId, type, levelId, zoneId);
  }

  /**
   * Mark a cutscene story as shown
   * @param {string} gameId - The game identifier
   * @param {string} type - Story type: 'game', 'level', or 'zone'
   * @param {string|null} levelId - Level identifier (required for level and zone types)
   * @param {string|null} zoneId - Zone identifier (required for zone type)
   */
  async markCutsceneStoryAsShown(gameId, type, levelId = null, zoneId = null) {
    try {
      const identifier = this._createStoryIdentifier(gameId, type, levelId, zoneId);
      this._persistenceService.persistCutsceneState(identifier, { hasBeenShown: true });
    } catch (error) {
      // Graceful error handling - persistence failures shouldn't break the game
      console.warn('Failed to mark cutscene story as shown:', error);
    }
  }

  /**
   * Reset cutscene story state
   * @param {string} gameId - The game identifier
   * @param {string} type - Story type: 'game', 'level', or 'zone'
   * @param {string|null} levelId - Level identifier (required for level and zone types)
   * @param {string|null} zoneId - Zone identifier (required for zone type)
   */
  async resetCutsceneStoryState(gameId, type, levelId = null, zoneId = null) {
    const identifier = this._createStoryIdentifier(gameId, type, levelId, zoneId);
    this._persistenceService.persistCutsceneState(identifier, { hasBeenShown: false });
  }

  /**
   * Get all cutscene stories
   * @returns {Promise<Array>} Array of all cutscene stories
   */
  async getAllCutsceneStories() {
    return await this._cutsceneProvider.getAllCutsceneStories();
  }

  /**
   * Get cutscene stories for a specific game
   * @param {string} gameId - The game identifier
   * @returns {Promise<Array>} Array of cutscene stories for the game
   */
  async getCutsceneStoriesForGame(gameId) {
    return await this._cutsceneProvider.getCutsceneStoriesForGame(gameId);
  }

  /**
   * Get cutscene stories for a specific level
   * @param {string} gameId - The game identifier
   * @param {string} levelId - The level identifier
   * @returns {Promise<Array>} Array of cutscene stories for the level
   */
  async getCutsceneStoriesForLevel(gameId, levelId) {
    return await this._cutsceneProvider.getCutsceneStoriesForLevel(gameId, levelId);
  }

  /**
   * Get cutscene stories for a specific zone
   * @param {string} gameId - The game identifier
   * @param {string} levelId - The level identifier
   * @param {string} zoneId - The zone identifier
   * @returns {Promise<Array>} Array of cutscene stories for the zone
   */
  async getCutsceneStoriesForZone(gameId, levelId, zoneId) {
    return await this._cutsceneProvider.getCutsceneStoriesForZone(gameId, levelId, zoneId);
  }

  /**
   * Reset all cutscene story states (useful for development/testing)
   */
  async resetAllCutsceneStories() {
    const allStories = await this._cutsceneProvider.getAllCutsceneStories();
    for (const storyData of allStories) {
      if (storyData.identifier) {
        this._persistenceService.persistCutsceneState(storyData.identifier, {
          hasBeenShown: false,
        });
      }
    }
  }

  // Legacy origin story methods (backward compatibility)

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

  // Private helper methods

  /**
   * Create a story identifier for persistence
   * @param {string} gameId - The game identifier
   * @param {string} type - Story type: 'game', 'level', or 'zone'
   * @param {string|null} levelId - Level identifier
   * @param {string|null} zoneId - Zone identifier
   * @returns {string} The story identifier
   * @private
   */
  _createStoryIdentifier(gameId, type, levelId, zoneId) {
    try {
      // Use the same identifier logic as CutsceneStory
      const tempStory = new CutsceneStory(gameId, type, levelId, zoneId, ['temp']);
      return tempStory.identifier;
    } catch (error) {
      // Fallback to simple concatenation if CutsceneStory creation fails
      let identifier = `${gameId}:${type}`;
      if (levelId) identifier += `:${levelId}`;
      if (zoneId) identifier += `:${zoneId}`;
      return identifier;
    }
  }
}
