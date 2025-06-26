import { getFirstLevelId } from '../LevelConfigurations.js';

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
      level: levelParam || getFirstLevelId(),
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
   * Get default level for a game type
   * @private
   */
  _getDefaultLevelForGame(gameId) {
    return gameId === 'cursor-before-clickers' ? getFirstLevelId() : null;
  }
}
