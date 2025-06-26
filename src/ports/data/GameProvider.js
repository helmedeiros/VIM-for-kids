/**
 * Port interface for game selection and management
 * Defines the contract for game providers
 */
export class GameProvider {
  /**
   * Get all available games
   * @returns {Promise<GameDescriptor[]>} Array of game descriptors
   */
  async getAvailableGames() {
    throw new Error('Method getAvailableGames must be implemented');
  }

  /**
   * Get a specific game by ID
   * @param {string} gameId - The game identifier
   * @returns {Promise<GameDescriptor>} The game descriptor
   */
  async getGame(gameId) {
    // eslint-disable-line no-unused-vars
    throw new Error('Method getGame must be implemented');
  }

  /**
   * Get the default game
   * @returns {Promise<GameDescriptor>} The default game descriptor
   */
  async getDefaultGame() {
    throw new Error('Method getDefaultGame must be implemented');
  }

  /**
   * Check if a game exists
   * @param {string} gameId - The game identifier
   * @returns {Promise<boolean>} True if game exists
   */
  async hasGame(gameId) {
    // eslint-disable-line no-unused-vars
    throw new Error('Method hasGame must be implemented');
  }
}
