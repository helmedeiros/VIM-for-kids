/**
 * Use case for game selection and management
 */
export class SelectGameUseCase {
  constructor(gameProvider) {
    if (!gameProvider) {
      throw new Error('SelectGameUseCase requires a game provider');
    }
    this._gameProvider = gameProvider;
  }

  /**
   * Get all available games for selection
   * @returns {Promise<Game[]>} Available games
   */
  async getAvailableGames() {
    return await this._gameProvider.getAvailableGames();
  }

  /**
   * Get the default game
   * @returns {Promise<Game>} Default game entity
   */
  async getDefaultGame() {
    return await this._gameProvider.getDefaultGame();
  }

  /**
   * Select a specific game by ID
   * @param {string} gameId - The game to select
   * @returns {Promise<{game: Game, gameStateFactory: Function}>}
   */
  async selectGame(gameId) {
    const game = await this._gameProvider.getGame(gameId);
    const gameStateFactory = this._createGameStateFactory(game);

    return {
      game,
      gameStateFactory,
    };
  }

  /**
   * Check if a game selection is valid
   * @param {string} gameId - The game ID to validate
   * @returns {Promise<boolean>} True if valid
   */
  async isValidGameSelection(gameId) {
    return await this._gameProvider.hasGame(gameId);
  }

  /**
   * Create appropriate game state factory based on game type
   * @private
   */
  _createGameStateFactory(game) {
    const gameType = game.gameType;

    if (gameType.isLevelBased()) {
      return async (zoneProvider, levelConfig) => {
        // Import dynamically to avoid circular dependencies
        const { LevelGameState } = await import('../LevelGameState.js');
        return new LevelGameState(zoneProvider, levelConfig);
      };
    } else if (gameType.isTextland()) {
      return async () => {
        // Import dynamically to avoid circular dependencies
        const { GameState } = await import('../GameState.js');
        return new GameState();
      };
    } else {
      throw new Error(`Unsupported game type: ${gameType.type}`);
    }
  }
}
