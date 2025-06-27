/**
 * CutsceneProvider Port
 * Defines the interface for cutscene data access
 * Supports game, level, and zone-level cutscenes
 * Part of the hexagonal architecture - port for domain to access cutscene data
 */
export class CutsceneProvider {
  /**
   * Get a cutscene story by game, type, and optional level/zone identifiers
   * @param {string} gameId - Game identifier
   * @param {string} type - Story type: 'game', 'level', or 'zone'
   * @param {string|null} levelId - Level identifier (required for level and zone types)
   * @param {string|null} zoneId - Zone identifier (required for zone type)
   * @returns {Promise<CutsceneStory|null>} The cutscene story or null if not found
   */
  // eslint-disable-next-line no-unused-vars
  async getCutsceneStory(gameId, type, levelId = null, zoneId = null) {
    throw new Error('Abstract method must be implemented');
  }

  /**
   * Check if a cutscene story exists
   * @param {string} gameId - Game identifier
   * @param {string} type - Story type: 'game', 'level', or 'zone'
   * @param {string|null} levelId - Level identifier (required for level and zone types)
   * @param {string|null} zoneId - Zone identifier (required for zone type)
   * @returns {Promise<boolean>} True if the story exists
   */
  // eslint-disable-next-line no-unused-vars
  async hasCutsceneStory(gameId, type, levelId = null, zoneId = null) {
    throw new Error('Abstract method must be implemented');
  }

  /**
   * Get all available cutscene stories
   * @returns {Promise<CutsceneStory[]>} Array of all cutscene stories
   */
  async getAllCutsceneStories() {
    throw new Error('Abstract method must be implemented');
  }

  /**
   * Get all cutscene stories for a specific game
   * @param {string} gameId - Game identifier
   * @returns {Promise<CutsceneStory[]>} Array of cutscene stories for the game
   */
  // eslint-disable-next-line no-unused-vars
  async getCutsceneStoriesForGame(gameId) {
    throw new Error('Abstract method must be implemented');
  }

  /**
   * Get all cutscene stories for a specific level (includes level and zone stories)
   * @param {string} gameId - Game identifier
   * @param {string} levelId - Level identifier
   * @returns {Promise<CutsceneStory[]>} Array of cutscene stories for the level
   */
  // eslint-disable-next-line no-unused-vars
  async getCutsceneStoriesForLevel(gameId, levelId) {
    throw new Error('Abstract method must be implemented');
  }

  /**
   * Get all cutscene stories for a specific zone
   * @param {string} gameId - Game identifier
   * @param {string} levelId - Level identifier
   * @param {string} zoneId - Zone identifier
   * @returns {Promise<CutsceneStory[]>} Array of cutscene stories for the zone
   */
  // eslint-disable-next-line no-unused-vars
  async getCutsceneStoriesForZone(gameId, levelId, zoneId) {
    throw new Error('Abstract method must be implemented');
  }

  // Legacy methods for backward compatibility - deprecated
  // These will be removed in future versions

  /**
   * @deprecated Use getCutsceneStory(gameId, 'game') instead
   */
  // eslint-disable-next-line no-unused-vars
  async getOriginStory(gameId) {
    throw new Error('CutsceneProvider.getOriginStory must be implemented');
  }

  /**
   * @deprecated Use hasCutsceneStory(gameId, 'game') instead
   */
  // eslint-disable-next-line no-unused-vars
  async hasOriginStory(gameId) {
    throw new Error('CutsceneProvider.hasOriginStory must be implemented');
  }

  /**
   * @deprecated Use getCutsceneStoriesForGame(gameId) and filter by type 'game' instead
   */
  async getAllOriginStories() {
    throw new Error('CutsceneProvider.getAllOriginStories must be implemented');
  }
}
