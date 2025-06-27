// Level configurations are now handled by the Game entity
import { GameRegistry } from '../../infrastructure/data/games/GameRegistry.js';

/**
 * Service responsible for game initialization logic
 * Follows Single Responsibility Principle
 */
export class GameInitializationService {
  constructor(gameFactory, persistenceService, cutsceneService = null, cutsceneRenderer = null) {
    this._gameFactory = gameFactory;
    this._persistenceService = persistenceService;
    this._cutsceneService = cutsceneService;
    this._cutsceneRenderer = cutsceneRenderer;
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

    // Show origin story cutscene if applicable
    await this._showOriginStoryIfNeeded(normalizedOptions.game);

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
   * Show origin story cutscene if conditions are met
   * @param {string} gameId - Game identifier
   * @private
   */
  async _showOriginStoryIfNeeded(gameId) {
    // Skip if cutscene services are not available
    if (!this._cutsceneService || !this._cutsceneRenderer) {
      return;
    }

    try {
      // Check if origin story should be shown
      const shouldShow = await this._cutsceneService.shouldShowOriginStory(gameId);
      if (!shouldShow) {
        return;
      }

      // Get origin story
      const originStory = await this._cutsceneService.getOriginStory(gameId);
      if (!originStory) {
        return;
      }

      // Show cutscene and wait for completion
      await this._cutsceneRenderer.showCutscene(originStory);

      // Mark as shown
      await this._cutsceneService.markOriginStoryAsShown(gameId);
    } catch (error) {
      // Log error but don't prevent game initialization
      console.error('Failed to show origin story cutscene:', error);
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

    const gameId = options.game || 'cursor-before-clickers';

    // Get first level from the game
    let defaultLevel = null;
    try {
      const game = GameRegistry.getGame(gameId);
      const firstLevel = game.getFirstLevel();
      defaultLevel = firstLevel ? firstLevel.id : null;
    } catch (error) {
      // Fallback to level_1 if game not found
      defaultLevel = 'level_1';
    }

    // Set defaults
    return {
      game: gameId,
      level: options.level || defaultLevel,
      ...options,
    };
  }
}
