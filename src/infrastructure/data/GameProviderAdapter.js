import { GameProvider } from '../../ports/data/GameProvider.js';
import { GameDescriptor } from '../../domain/entities/GameDescriptor.js';
import { GameRegistry } from './GameRegistry.js';

/**
 * Infrastructure adapter that provides game configurations using GameRegistry
 * Implements the GameProvider port
 * Now much simpler thanks to centralized game definitions
 */
export class GameProviderAdapter extends GameProvider {
  async getAvailableGames() {
    return GameRegistry.getAllGames().map((game) => this._toGameDescriptor(game));
  }

  async getGame(gameId) {
    const game = GameRegistry.getGame(gameId);
    return this._toGameDescriptor(game);
  }

  async getDefaultGame() {
    const game = GameRegistry.getDefaultGame();
    return this._toGameDescriptor(game);
  }

  async hasGame(gameId) {
    return GameRegistry.hasGame(gameId);
  }

  /**
   * Convert Game entity to GameDescriptor instance
   * @private
   */
  _toGameDescriptor(game) {
    return new GameDescriptor(game.id, game.name, game.description, game.gameType);
  }
}
