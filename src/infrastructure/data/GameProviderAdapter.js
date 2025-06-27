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
    return GameRegistry.getAllGames().map(
      (def) => new GameDescriptor(def.id, def.name, def.description, def.gameType)
    );
  }

  async getGame(gameId) {
    const def = GameRegistry.getGame(gameId);
    return new GameDescriptor(def.id, def.name, def.description, def.gameType);
  }

  async getDefaultGame() {
    const def = GameRegistry.getDefaultGame();
    return new GameDescriptor(def.id, def.name, def.description, def.gameType);
  }

  async hasGame(gameId) {
    return GameRegistry.hasGame(gameId);
  }
}
