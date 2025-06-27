/* eslint-env node, jest */
import { jest } from '@jest/globals';
import { GameInitializationService } from '../../../src/application/services/GameInitializationService.js';

// Mock dependencies
const mockGameFactory = {
  createGame: jest.fn(),
};

const mockPersistenceService = {
  persistGameSelection: jest.fn(),
};

const mockCutsceneService = {
  shouldShowOriginStory: jest.fn(),
  getOriginStory: jest.fn(),
  markOriginStoryAsShown: jest.fn(),
};

const mockCutsceneRenderer = {
  showCutscene: jest.fn(),
};

const mockGame = {
  cleanup: jest.fn(),
};

describe('GameInitializationService', () => {
  let gameInitializationService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGameFactory.createGame.mockResolvedValue(mockGame);
    mockCutsceneService.shouldShowOriginStory.mockResolvedValue(false);
    mockCutsceneService.getOriginStory.mockResolvedValue(null);
    mockCutsceneRenderer.showCutscene.mockResolvedValue();
  });

  describe('constructor', () => {
    it('should create service with required dependencies', () => {
      gameInitializationService = new GameInitializationService(
        mockGameFactory,
        mockPersistenceService
      );

      expect(gameInitializationService).toBeDefined();
    });

    it('should create service with cutscene dependencies', () => {
      gameInitializationService = new GameInitializationService(
        mockGameFactory,
        mockPersistenceService,
        mockCutsceneService,
        mockCutsceneRenderer
      );

      expect(gameInitializationService).toBeDefined();
    });
  });

  describe('initializeGame', () => {
    beforeEach(() => {
      gameInitializationService = new GameInitializationService(
        mockGameFactory,
        mockPersistenceService
      );
    });

    it('should initialize game with default options', async () => {
      const game = await gameInitializationService.initializeGame();

      expect(mockGameFactory.createGame).toHaveBeenCalledWith({
        game: 'cursor-before-clickers',
        level: 'level_1',
      });
      expect(game).toBe(mockGame);
    });

    it('should initialize game with custom options', async () => {
      const options = { game: 'custom-game', level: 'custom-level' };
      const game = await gameInitializationService.initializeGame(options);

      expect(mockGameFactory.createGame).toHaveBeenCalledWith(options);
      expect(game).toBe(mockGame);
    });

    it('should handle string level options for backward compatibility', async () => {
      const game = await gameInitializationService.initializeGame('custom-level');

      expect(mockGameFactory.createGame).toHaveBeenCalledWith({
        game: 'cursor-before-clickers',
        level: 'custom-level',
      });
      expect(game).toBe(mockGame);
    });

    it('should cleanup previous game before initializing new one', async () => {
      // Initialize first game
      await gameInitializationService.initializeGame();

      // Initialize second game
      await gameInitializationService.initializeGame();

      expect(mockGame.cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('cutscene integration', () => {
    beforeEach(() => {
      gameInitializationService = new GameInitializationService(
        mockGameFactory,
        mockPersistenceService,
        mockCutsceneService,
        mockCutsceneRenderer
      );
    });

    it('should show origin story cutscene when conditions are met', async () => {
      const mockOriginStory = { gameId: 'test-game', script: ['Test script'] };
      mockCutsceneService.shouldShowOriginStory.mockResolvedValue(true);
      mockCutsceneService.getOriginStory.mockResolvedValue(mockOriginStory);

      await gameInitializationService.initializeGame({ game: 'test-game' });

      expect(mockCutsceneService.shouldShowOriginStory).toHaveBeenCalledWith('test-game');
      expect(mockCutsceneService.getOriginStory).toHaveBeenCalledWith('test-game');
      expect(mockCutsceneRenderer.showCutscene).toHaveBeenCalledWith(mockOriginStory);
      expect(mockCutsceneService.markOriginStoryAsShown).toHaveBeenCalledWith('test-game');
    });

    it('should skip cutscene when shouldShowOriginStory returns false', async () => {
      mockCutsceneService.shouldShowOriginStory.mockResolvedValue(false);

      await gameInitializationService.initializeGame({ game: 'test-game' });

      expect(mockCutsceneService.shouldShowOriginStory).toHaveBeenCalledWith('test-game');
      expect(mockCutsceneService.getOriginStory).not.toHaveBeenCalled();
      expect(mockCutsceneRenderer.showCutscene).not.toHaveBeenCalled();
      expect(mockCutsceneService.markOriginStoryAsShown).not.toHaveBeenCalled();
    });

    it('should skip cutscene when origin story is null', async () => {
      mockCutsceneService.shouldShowOriginStory.mockResolvedValue(true);
      mockCutsceneService.getOriginStory.mockResolvedValue(null);

      await gameInitializationService.initializeGame({ game: 'test-game' });

      expect(mockCutsceneService.shouldShowOriginStory).toHaveBeenCalledWith('test-game');
      expect(mockCutsceneService.getOriginStory).toHaveBeenCalledWith('test-game');
      expect(mockCutsceneRenderer.showCutscene).not.toHaveBeenCalled();
      expect(mockCutsceneService.markOriginStoryAsShown).not.toHaveBeenCalled();
    });

    it('should handle cutscene errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockCutsceneService.shouldShowOriginStory.mockRejectedValue(new Error('Cutscene error'));

      await gameInitializationService.initializeGame({ game: 'test-game' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to show origin story cutscene:',
        expect.any(Error)
      );
      expect(mockGameFactory.createGame).toHaveBeenCalled(); // Game should still be created

      consoleSpy.mockRestore();
    });

    it('should skip cutscenes when services are not available', async () => {
      gameInitializationService = new GameInitializationService(
        mockGameFactory,
        mockPersistenceService,
        null, // No cutscene service
        mockCutsceneRenderer
      );

      await gameInitializationService.initializeGame({ game: 'test-game' });

      expect(mockCutsceneService.shouldShowOriginStory).not.toHaveBeenCalled();
      expect(mockGameFactory.createGame).toHaveBeenCalled();
    });
  });

  describe('getCurrentGame', () => {
    beforeEach(() => {
      gameInitializationService = new GameInitializationService(
        mockGameFactory,
        mockPersistenceService
      );
    });

    it('should return null when no game is initialized', () => {
      const currentGame = gameInitializationService.getCurrentGame();
      expect(currentGame).toBeNull();
    });

    it('should return current game after initialization', async () => {
      await gameInitializationService.initializeGame();
      const currentGame = gameInitializationService.getCurrentGame();
      expect(currentGame).toBe(mockGame);
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      gameInitializationService = new GameInitializationService(
        mockGameFactory,
        mockPersistenceService
      );
    });

    it('should cleanup current game', async () => {
      await gameInitializationService.initializeGame();
      gameInitializationService.cleanup();

      expect(mockGame.cleanup).toHaveBeenCalled();
      expect(gameInitializationService.getCurrentGame()).toBeNull();
    });

    it('should handle cleanup when no game is initialized', () => {
      expect(() => gameInitializationService.cleanup()).not.toThrow();
    });
  });
});
