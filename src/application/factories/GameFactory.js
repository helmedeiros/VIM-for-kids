import { VimForKidsGame } from '../../VimForKidsGame.js';

/**
 * Factory for creating game instances
 * Follows Open/Closed Principle - extensible without modification
 */
export class GameFactory {
  constructor(dependencies = {}) {
    this._dependencies = dependencies;
    this._gameCreators = new Map();
    this._setupDefaultCreators();
  }

  /**
   * Create a game instance
   * @param {Object} options - Game creation options
   * @returns {Object} Game instance
   */
  async createGame(options) {
    const gameType = this._determineGameType(options);
    const creator = this._gameCreators.get(gameType);

    if (!creator) {
      throw new Error(`No creator registered for game type: ${gameType}`);
    }

    return await creator(options, this._dependencies);
  }

  /**
   * Register a new game creator
   * @param {string} gameType - Game type identifier
   * @param {Function} creator - Creator function
   */
  registerGameCreator(gameType, creator) {
    this._gameCreators.set(gameType, creator);
  }

  /**
   * Setup default game creators
   * @private
   */
  _setupDefaultCreators() {
    // Level-based game creator
    this.registerGameCreator('cursor-before-clickers', async (options, dependencies) => {
      return new VimForKidsGame(options, dependencies);
    });

    // Textland game creator
    this.registerGameCreator('cursor-textland', async (options, dependencies) => {
      return new VimForKidsGame(options, dependencies);
    });
  }

  /**
   * Determine game type from options
   * @private
   */
  _determineGameType(options) {
    return options.game || 'cursor-before-clickers';
  }
}
