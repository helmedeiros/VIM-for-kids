import { GameProvider } from '../../../src/ports/data/GameProvider.js';

describe('GameProvider', () => {
  let gameProvider;

  beforeEach(() => {
    gameProvider = new GameProvider();
  });

  describe('Constructor', () => {
    it('should create an instance of GameProvider', () => {
      expect(gameProvider).toBeInstanceOf(GameProvider);
    });
  });

  describe('getAvailableGames', () => {
    it('should throw error when not implemented', async () => {
      await expect(gameProvider.getAvailableGames()).rejects.toThrow(
        'Method getAvailableGames must be implemented'
      );
    });
  });

  describe('getGame', () => {
    it('should throw error when not implemented', async () => {
      await expect(gameProvider.getGame('test-game')).rejects.toThrow(
        'Method getGame must be implemented'
      );
    });
  });

  describe('getDefaultGame', () => {
    it('should throw error when not implemented', async () => {
      await expect(gameProvider.getDefaultGame()).rejects.toThrow(
        'Method getDefaultGame must be implemented'
      );
    });
  });

  describe('hasGame', () => {
    it('should throw error when not implemented', async () => {
      await expect(gameProvider.hasGame('test-game')).rejects.toThrow(
        'Method hasGame must be implemented'
      );
    });
  });
});
