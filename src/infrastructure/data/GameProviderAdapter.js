import { GameProvider } from '../../ports/data/GameProvider.js';
import { GameDescriptor } from '../../domain/entities/GameDescriptor.js';
import { GameType } from '../../domain/value-objects/GameType.js';

/**
 * Infrastructure adapter that provides game configurations
 * Implements the GameProvider port
 */
export class GameProviderAdapter extends GameProvider {
  constructor() {
    super();
    this._games = this._initializeGames();
  }

  async getAvailableGames() {
    return Array.from(this._games.values());
  }

  async getGame(gameId) {
    const game = this._games.get(gameId);
    if (!game) {
      throw new Error(`Game '${gameId}' not found`);
    }
    return game;
  }

  async getDefaultGame() {
    // Return "Cursor - Before the Clickers" as default
    return this._games.get('cursor-before-clickers');
  }

  async hasGame(gameId) {
    return this._games.has(gameId);
  }

  /**
   * Initialize the available games
   * @private
   */
  _initializeGames() {
    const games = new Map();

    // Game 1: "Cursor - Before the Clickers" (Level-based game)
    games.set(
      'cursor-before-clickers',
      new GameDescriptor(
        'cursor-before-clickers',
        'Cursor - Before the Clickers',
        'Journey through mystical zones collecting VIM keys and mastering movement commands. A structured adventure through different VIM learning environments.',
        new GameType(GameType.LEVEL_BASED)
      )
    );

    // Game 2: "Cursor and the Textland" (Open exploration game)
    games.set(
      'cursor-textland',
      new GameDescriptor(
        'cursor-textland',
        'Cursor and the Textland',
        'Explore a free-form textual world where you can practice basic VIM movements in an open environment. Perfect for experimenting with commands.',
        new GameType(GameType.TEXTLAND)
      )
    );

    return games;
  }
}
