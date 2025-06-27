/**
 * Port interface for cutscene data providers
 * Defines the contract for retrieving origin story cutscenes
 * Part of the hexagonal architecture - this is a port that adapters will implement
 */
export class CutsceneProvider {
  /**
   * Get origin story for a specific game
   * @param {string} gameId - The game identifier
   * @returns {Promise<OriginStory|null>} The origin story or null if not found
   */
  async getOriginStory(gameId) {
    // eslint-disable-line no-unused-vars
    throw new Error('CutsceneProvider.getOriginStory must be implemented');
  }

  /**
   * Check if a game has an origin story
   * @param {string} gameId - The game identifier
   * @returns {Promise<boolean>} True if the game has an origin story
   */
  async hasOriginStory(gameId) {
    // eslint-disable-line no-unused-vars
    throw new Error('CutsceneProvider.hasOriginStory must be implemented');
  }

  /**
   * Get all available origin stories
   * @returns {Promise<OriginStory[]>} Array of all origin stories
   */
  async getAllOriginStories() {
    throw new Error('CutsceneProvider.getAllOriginStories must be implemented');
  }
}
