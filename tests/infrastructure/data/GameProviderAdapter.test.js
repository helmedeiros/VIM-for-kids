import { GameProviderAdapter } from '../../../src/infrastructure/data/GameProviderAdapter.js';
import { GameDescriptor } from '../../../src/domain/entities/GameDescriptor.js';
import { GameType } from '../../../src/domain/value-objects/GameType.js';

describe('GameProviderAdapter', () => {
  let gameProvider;

  beforeEach(() => {
    gameProvider = new GameProviderAdapter();
  });

  describe('getAvailableGames', () => {
    it('should return all available games', async () => {
      const games = await gameProvider.getAvailableGames();

      expect(games).toHaveLength(2);
      expect(games[0]).toBeInstanceOf(GameDescriptor);
      expect(games[1]).toBeInstanceOf(GameDescriptor);
    });

    it('should return games with correct IDs', async () => {
      const games = await gameProvider.getAvailableGames();
      const gameIds = games.map((game) => game.id);

      expect(gameIds).toContain('cursor-before-clickers');
      expect(gameIds).toContain('cursor-textland');
    });
  });

  describe('getGame', () => {
    it('should return the correct game for cursor-before-clickers', async () => {
      const game = await gameProvider.getGame('cursor-before-clickers');

      expect(game.id).toBe('cursor-before-clickers');
      expect(game.name).toBe('Cursor - Before the Clickers');
      expect(game.gameType.isLevelBased()).toBe(true);
    });

    it('should return the correct game for cursor-textland', async () => {
      const game = await gameProvider.getGame('cursor-textland');

      expect(game.id).toBe('cursor-textland');
      expect(game.name).toBe('Cursor and the Textland');
      expect(game.gameType.isTextland()).toBe(true);
    });

    it('should throw error for non-existent game', async () => {
      await expect(gameProvider.getGame('non-existent')).rejects.toThrow(
        "Game 'non-existent' not found"
      );
    });
  });

  describe('getDefaultGame', () => {
    it('should return cursor-before-clickers as default', async () => {
      const defaultGame = await gameProvider.getDefaultGame();

      expect(defaultGame.id).toBe('cursor-before-clickers');
      expect(defaultGame.name).toBe('Cursor - Before the Clickers');
    });
  });

  describe('hasGame', () => {
    it('should return true for existing games', async () => {
      expect(await gameProvider.hasGame('cursor-before-clickers')).toBe(true);
      expect(await gameProvider.hasGame('cursor-textland')).toBe(true);
    });

    it('should return false for non-existent games', async () => {
      expect(await gameProvider.hasGame('non-existent')).toBe(false);
    });
  });

  describe('game properties', () => {
    it('should have proper game descriptions', async () => {
      const levelBasedGame = await gameProvider.getGame('cursor-before-clickers');
      const textlandGame = await gameProvider.getGame('cursor-textland');

      expect(levelBasedGame.description).toContain('Journey through mystical zones');
      expect(textlandGame.description).toContain('free-form textual world');
    });

    it('should have correct game types', async () => {
      const levelBasedGame = await gameProvider.getGame('cursor-before-clickers');
      const textlandGame = await gameProvider.getGame('cursor-textland');

      expect(levelBasedGame.gameType.type).toBe(GameType.LEVEL_BASED);
      expect(textlandGame.gameType.type).toBe(GameType.TEXTLAND);
    });
  });
});
