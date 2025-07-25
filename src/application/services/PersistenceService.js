// Level configurations are now handled by the LevelService and Game entities

/**
 * Service responsible for game state persistence
 * Follows Single Responsibility Principle and Dependency Inversion Principle
 */
export class PersistenceService {
  constructor(urlAdapter, storageAdapter) {
    this._urlAdapter = urlAdapter;
    this._storageAdapter = storageAdapter;
  }

  /**
   * Get game configuration from persistence sources
   * Priority: URL > localStorage > default
   * @returns {Object} Game configuration
   */
  getGameConfiguration() {
    const gameParam = this._urlAdapter.getParameter('game');
    const levelParam = this._urlAdapter.getParameter('level');

    // Check URL parameter first
    if (gameParam) {
      // Store in localStorage for persistence
      this._storageAdapter.setItem('selectedGame', gameParam);
      return {
        game: gameParam,
        level: levelParam || this._getDefaultLevelForGame(gameParam),
      };
    }

    // Fallback to localStorage
    const storedGame = this._storageAdapter.getItem('selectedGame');
    if (storedGame) {
      return {
        game: storedGame,
        level: levelParam || this._getDefaultLevelForGame(storedGame),
      };
    }

    // Default configuration
    return {
      game: 'cursor-before-clickers',
      level: levelParam || 'level_1',
    };
  }

  /**
   * Persist game selection
   * @param {string} gameId - Game identifier
   * @param {string} level - Level identifier (optional)
   */
  persistGameSelection(gameId, level = null) {
    // Store in localStorage
    this._storageAdapter.setItem('selectedGame', gameId);

    // Update URL without page reload
    this._urlAdapter.setParameter('game', gameId);

    if (level && gameId === 'cursor-before-clickers') {
      this._urlAdapter.setParameter('level', level);
    } else {
      // Remove level parameter for non-level games
      this._urlAdapter.removeParameter('level');
    }

    this._urlAdapter.updateURL();
  }

  /**
   * Get cutscene state from storage
   * @returns {Object} Cutscene state object where keys are game IDs
   */
  getCutsceneState() {
    try {
      const stateString = this._storageAdapter.getItem('cutsceneState');
      return stateString ? JSON.parse(stateString) : {};
    } catch (error) {
      // Return empty object if parsing fails
      return {};
    }
  }

  /**
   * Persist cutscene state for a specific game
   * @param {string} gameId - Game identifier
   * @param {Object} state - Cutscene state for the game
   */
  persistCutsceneState(gameId, state) {
    const currentState = this.getCutsceneState();
    currentState[gameId] = state;
    this._storageAdapter.setItem('cutsceneState', JSON.stringify(currentState));
  }

  /**
   * Clear all cutscene state (useful for testing/reset)
   */
  clearCutsceneState() {
    this._storageAdapter.removeItem('cutsceneState');
  }

  /**
   * Get default level for a game using GameRegistry
   * @private
   */
  _getDefaultLevelForGame(gameId) {
    try {
      // Use dynamic import to avoid circular dependencies
      import('../../infrastructure/data/games/GameRegistry.js').then(({ GameRegistry }) => {
        const game = GameRegistry.getGame(gameId);
        const firstLevel = game.getFirstLevel();
        return firstLevel ? firstLevel.id : null;
      });
    } catch (error) {
      // Fallback for now
      return gameId === 'cursor-before-clickers' ? 'level_1' : null;
    }

    // Synchronous fallback
    return gameId === 'cursor-before-clickers' ? 'level_1' : null;
  }
}
