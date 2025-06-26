/**
 * Service responsible for game initialization logic
 * Follows Single Responsibility Principle
 */
export class GameInitializationService {
  constructor(gameFactory, persistenceService) {
    this._gameFactory = gameFactory;
    this._persistenceService = persistenceService;
    this._currentGame = null;
  }

  /**
   * Initialize a new game with given options
   * @param {Object} options - Game initialization options
   * @returns {Object} The initialized game instance
   */
  async initializeGame(options = {}) {
    // Cleanup previous game
    if (this._currentGame) {
      this._currentGame.cleanup();
    }

    // Normalize options
    const normalizedOptions = this._normalizeOptions(options);

    // Create game instance
    this._currentGame = await this._gameFactory.createGame(normalizedOptions);

    return this._currentGame;
  }

  /**
   * Get current game instance
   * @returns {Object|null} Current game or null
   */
  getCurrentGame() {
    return this._currentGame;
  }

  /**
   * Cleanup current game
   */
  cleanup() {
    if (this._currentGame) {
      this._currentGame.cleanup();
      this._currentGame = null;
    }
  }

  /**
   * Normalize initialization options
   * @private
   */
  _normalizeOptions(options) {
    // Handle backward compatibility - if options is a string, treat it as level
    if (typeof options === 'string') {
      options = { level: options };
    }

    // Set defaults
    return {
      game: options.game || 'cursor-before-clickers',
      level: options.level || 'level_1',
      ...options,
    };
  }
}
