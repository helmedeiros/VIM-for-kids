/* eslint-env node, jest */
import { GameRegistry } from '../../../src/infrastructure/data/GameRegistry.js';
import { Game } from '../../../src/domain/entities/Game.js';

describe('GameRegistry', () => {
  beforeEach(() => {
    GameRegistry.reset();
  });

  describe('getGames', () => {
    it('should return a Map of game definitions', () => {
      const games = GameRegistry.getGames();
      expect(games).toBeInstanceOf(Map);
      expect(games.size).toBeGreaterThan(0);
    });

    it('should contain cursor-before-clickers game', () => {
      const games = GameRegistry.getGames();
      expect(games.has('cursor-before-clickers')).toBe(true);
    });
  });

  describe('getGame', () => {
    it('should return the correct game', () => {
      const game = GameRegistry.getGame('cursor-before-clickers');
      expect(game).toBeInstanceOf(Game);
      expect(game.id).toBe('cursor-before-clickers');
    });

    it('should throw error for non-existent game', () => {
      expect(() => GameRegistry.getGame('non-existent')).toThrow("Game 'non-existent' not found");
    });
  });

  describe('getAllGames', () => {
    it('should return array of all games', () => {
      const games = GameRegistry.getAllGames();
      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBe(2);
      expect(games.every((game) => game instanceof Game)).toBe(true);
    });
  });

  describe('hasGame', () => {
    it('should return true for existing games', () => {
      expect(GameRegistry.hasGame('cursor-before-clickers')).toBe(true);
    });

    it('should return false for non-existing games', () => {
      expect(GameRegistry.hasGame('non-existent')).toBe(false);
    });
  });
});
