import { GameProviderAdapter } from '../../../src/infrastructure/data/GameProviderAdapter.js';
import { Game } from '../../../src/domain/entities/Game.js';
import { GameType } from '../../../src/domain/value-objects/GameType.js';
import { GameRegistry } from '../../../src/infrastructure/data/GameRegistry.js';

describe('GameProviderAdapter', () => {
  let adapter;
  let originalGames;

  beforeEach(() => {
    adapter = new GameProviderAdapter();

    // Store original games to restore later
    originalGames = GameRegistry.getAllGames();

    // Clear registry for testing
    GameRegistry._games.clear();

    // Add test games
    const testGame1 = new Game({
      id: 'test-game-1',
      name: 'Test Game 1',
      description: 'First test game',
      gameType: new GameType(GameType.LEVEL_BASED),
    });

    const testGame2 = new Game({
      id: 'test-game-2',
      name: 'Test Game 2',
      description: 'Second test game',
      gameType: new GameType(GameType.TEXTLAND),
    });

    GameRegistry.registerGame('test-game-1', testGame1);
    GameRegistry.registerGame('test-game-2', testGame2);
  });

  afterEach(() => {
    // Restore original games
    GameRegistry._games.clear();
    originalGames.forEach((game) => {
      GameRegistry.registerGame(game.id, game);
    });
  });

  describe('getAvailableGames', () => {
    it('should return all available games', async () => {
      const games = await adapter.getAvailableGames();

      expect(games).toHaveLength(2);
      expect(games[0]).toBeInstanceOf(Game);
      expect(games[1]).toBeInstanceOf(Game);

      const gameIds = games.map((game) => game.id);
      expect(gameIds).toContain('test-game-1');
      expect(gameIds).toContain('test-game-2');
    });

    it('should return empty array when no games are registered', async () => {
      GameRegistry._games.clear();

      const games = await adapter.getAvailableGames();

      expect(games).toHaveLength(0);
    });
  });

  describe('getGame', () => {
    it('should return specific game by ID', async () => {
      const game = await adapter.getGame('test-game-1');

      expect(game).toBeInstanceOf(Game);
      expect(game.id).toBe('test-game-1');
      expect(game.name).toBe('Test Game 1');
      expect(game.description).toBe('First test game');
      expect(game.gameType.type).toBe(GameType.LEVEL_BASED);
    });

    it('should throw error for non-existent game', async () => {
      await expect(adapter.getGame('non-existent')).rejects.toThrow(
        "Game 'non-existent' not found"
      );
    });
  });

  describe('getDefaultGame', () => {
    it('should return the default game when cursor-before-clickers exists', async () => {
      // Add the expected default game
      const defaultGame = new Game({
        id: 'cursor-before-clickers',
        name: 'Cursor - Before the Clickers',
        description: 'Default test game',
        gameType: new GameType(GameType.LEVEL_BASED),
      });
      GameRegistry.registerGame('cursor-before-clickers', defaultGame);

      const result = await adapter.getDefaultGame();

      expect(result).toBeInstanceOf(Game);
      expect(result.id).toBe('cursor-before-clickers');
    });

    it('should throw error when default game does not exist', async () => {
      // Clear all games so default game doesn't exist
      GameRegistry._games.clear();

      await expect(adapter.getDefaultGame()).rejects.toThrow(
        "Game 'cursor-before-clickers' not found"
      );
    });
  });

  describe('hasGame', () => {
    it('should return true for existing games', async () => {
      expect(await adapter.hasGame('test-game-1')).toBe(true);
      expect(await adapter.hasGame('test-game-2')).toBe(true);
    });

    it('should return false for non-existent games', async () => {
      expect(await adapter.hasGame('non-existent')).toBe(false);
    });
  });
});
