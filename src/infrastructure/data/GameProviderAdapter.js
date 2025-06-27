import { GameProvider } from '../../ports/data/GameProvider.js';
import { GameRegistry } from './GameRegistry.js';

/**
 * Infrastructure adapter that provides game configurations using GameRegistry
 * Implements the GameProvider port
 * Now much simpler thanks to centralized game definitions
 */
export class GameProviderAdapter extends GameProvider {
  async getAvailableGames() {
    return GameRegistry.getAllGames();
  }

  async getGame(gameId) {
    return GameRegistry.getGame(gameId);
  }

  async getDefaultGame() {
    return GameRegistry.getDefaultGame();
  }

  async hasGame(gameId) {
    return GameRegistry.hasGame(gameId);
  }
}
