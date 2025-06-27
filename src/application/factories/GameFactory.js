import { GameRegistry } from '../../infrastructure/data/games/GameRegistry.js';

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
    const game = GameRegistry.getGame(gameId);

    return await game.createGame(options, this._dependencies);
  }

  /**
   * Register a new game (delegates to GameRegistry)
   * @param {string} gameId - Game identifier
   * @param {Game} game - Game instance
   */
  registerGame(gameId, game) {
    GameRegistry.registerGame(gameId, game);
  }

  /**
   * Get all available games
   * @returns {Game[]} Array of games
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
