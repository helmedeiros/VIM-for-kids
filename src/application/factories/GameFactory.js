import { GameRegistry } from '../../infrastructure/data/GameRegistry.js';

/**
 * Factory for creating game instances using the centralized GameRegistry
 * Follows Open/Closed Principle - extensible without modification
 * Now much simpler thanks to the unified game definition system
 */
export class GameFactory {
  constructor(dependencies = {}) {
    this._dependencies = dependencies;
  }

  /**
   * Create a game instance using GameRegistry
   * @param {Object} options - Game creation options
   * @returns {Object} Game instance
   */
  async createGame(options) {
    const gameId = this._determineGameId(options);
    const gameDefinition = GameRegistry.getGame(gameId);

    return await gameDefinition.createGame(options, this._dependencies);
  }

  /**
   * Register a new game creator (delegates to GameRegistry)
   * @param {string} gameId - Game identifier
   * @param {GameDefinition} gameDefinition - Game definition
   */
  registerGame(gameId, gameDefinition) {
    GameRegistry.registerGame(gameId, gameDefinition);
  }

  /**
   * Get all available games
   * @returns {GameDefinition[]} Array of game definitions
   */
  getAvailableGames() {
    return GameRegistry.getAllGames();
  }

  /**
   * Check if a game is supported
   * @param {string} gameId - Game identifier
   * @returns {boolean} True if game is supported
   */
  supportsGame(gameId) {
    return GameRegistry.hasGame(gameId);
  }

  /**
   * Determine game ID from options
   * @private
   */
  _determineGameId(options) {
    return options.game || GameRegistry.getDefaultGame().id;
  }
}
