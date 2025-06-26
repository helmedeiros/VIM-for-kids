/* eslint-env node, jest */
import { jest } from '@jest/globals';
import { GameInitializationService } from '../../../src/application/services/GameInitializationService.js';

describe('GameInitializationService', () => {
  let gameFactory;
  let persistenceService;
  let service;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      cleanup: jest.fn(),
    };

    gameFactory = {
      createGame: jest.fn().mockResolvedValue(mockGame),
    };

    persistenceService = {
      persistGameSelection: jest.fn(),
    };

    service = new GameInitializationService(gameFactory, persistenceService);
  });

  describe('constructor', () => {
    it('should create service with dependencies', () => {
      expect(service).toBeInstanceOf(GameInitializationService);
      expect(service._gameFactory).toBe(gameFactory);
      expect(service._persistenceService).toBe(persistenceService);
      expect(service._currentGame).toBeNull();
    });
  });

  describe('initializeGame', () => {
    it('should initialize game with normalized options', async () => {
      const options = { game: 'cursor-textland' };
      const result = await service.initializeGame(options);

      expect(gameFactory.createGame).toHaveBeenCalledWith({
        game: 'cursor-textland',
        level: 'level_1',
      });
      expect(result).toBe(mockGame);
      expect(service._currentGame).toBe(mockGame);
    });

    it('should handle string options for backward compatibility', async () => {
      const result = await service.initializeGame('level_2');

      expect(gameFactory.createGame).toHaveBeenCalledWith({
        game: 'cursor-before-clickers',
        level: 'level_2',
      });
      expect(result).toBe(mockGame);
    });

    it('should cleanup previous game before initializing new one', async () => {
      const firstGame = { cleanup: jest.fn() };
      const secondGame = { cleanup: jest.fn() };

      gameFactory.createGame.mockResolvedValueOnce(firstGame).mockResolvedValueOnce(secondGame);

      await service.initializeGame({ game: 'game1' });
      expect(service._currentGame).toBe(firstGame);

      await service.initializeGame({ game: 'game2' });
      expect(firstGame.cleanup).toHaveBeenCalled();
      expect(service._currentGame).toBe(secondGame);
    });

    it('should use default options when none provided', async () => {
      await service.initializeGame();

      expect(gameFactory.createGame).toHaveBeenCalledWith({
        game: 'cursor-before-clickers',
        level: 'level_1',
      });
    });
  });

  describe('getCurrentGame', () => {
    it('should return null when no game is initialized', () => {
      expect(service.getCurrentGame()).toBeNull();
    });

    it('should return current game after initialization', async () => {
      await service.initializeGame();
      expect(service.getCurrentGame()).toBe(mockGame);
    });
  });

  describe('cleanup', () => {
    it('should cleanup current game and reset to null', async () => {
      await service.initializeGame();
      expect(service._currentGame).toBe(mockGame);

      service.cleanup();
      expect(mockGame.cleanup).toHaveBeenCalled();
      expect(service._currentGame).toBeNull();
    });

    it('should handle cleanup when no current game', () => {
      expect(() => service.cleanup()).not.toThrow();
    });
  });
});
