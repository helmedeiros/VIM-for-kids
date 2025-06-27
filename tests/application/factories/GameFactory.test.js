import { GameFactory } from '../../../src/application/factories/GameFactory.js';
import { VimForKidsGame } from '../../../src/VimForKidsGame.js';

// Mock the VimForKidsGame
jest.mock('../../../src/VimForKidsGame.js');

describe('GameFactory', () => {
  let gameFactory;
  let mockDependencies;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDependencies = {
      renderer: {},
      inputHandler: {},
      gameProvider: {},
    };
    gameFactory = new GameFactory(mockDependencies);
  });

  describe('Constructor', () => {
    it('should create instance with default dependencies', () => {
      const factory = new GameFactory();
      expect(factory).toBeInstanceOf(GameFactory);
    });

    it('should create instance with provided dependencies', () => {
      const factory = new GameFactory(mockDependencies);
      expect(factory).toBeInstanceOf(GameFactory);
    });
  });

  describe('createGame', () => {
    it('should create cursor-before-clickers game by default', async () => {
      VimForKidsGame.mockImplementation(() => ({ gameType: 'cursor-before-clickers' }));

      const game = await gameFactory.createGame({});

      expect(VimForKidsGame).toHaveBeenCalledWith({}, mockDependencies);
      expect(game.gameType).toBe('cursor-before-clickers');
    });

    it('should create cursor-before-clickers game when specified', async () => {
      VimForKidsGame.mockImplementation(() => ({ gameType: 'cursor-before-clickers' }));

      const game = await gameFactory.createGame({ game: 'cursor-before-clickers' });

      expect(VimForKidsGame).toHaveBeenCalledWith(
        { game: 'cursor-before-clickers' },
        mockDependencies
      );
      expect(game.gameType).toBe('cursor-before-clickers');
    });

    it('should create cursor-textland game when specified', async () => {
      VimForKidsGame.mockImplementation(() => ({ gameType: 'cursor-textland' }));

      const game = await gameFactory.createGame({ game: 'cursor-textland' });

      expect(VimForKidsGame).toHaveBeenCalledWith({ game: 'cursor-textland' }, mockDependencies);
      expect(game.gameType).toBe('cursor-textland');
    });

    it('should throw error for unknown game type', async () => {
      await expect(gameFactory.createGame({ game: 'unknown-game' })).rejects.toThrow(
        "Game 'unknown-game' not found"
      );
    });

    it('should pass options and dependencies to game creator', async () => {
      const options = { game: 'cursor-before-clickers', level: 'test-level' };

      await gameFactory.createGame(options);

      expect(VimForKidsGame).toHaveBeenCalledWith(options, mockDependencies);
    });
  });

  describe('getAvailableGames', () => {
    it('should return all available games from registry', () => {
      const games = gameFactory.getAvailableGames();

      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBe(2);
      expect(games.some((game) => game.id === 'cursor-before-clickers')).toBe(true);
      expect(games.some((game) => game.id === 'cursor-textland')).toBe(true);
    });
  });

  describe('supportsGame', () => {
    it('should return true for supported games', () => {
      expect(gameFactory.supportsGame('cursor-before-clickers')).toBe(true);
      expect(gameFactory.supportsGame('cursor-textland')).toBe(true);
    });

    it('should return false for unsupported games', () => {
      expect(gameFactory.supportsGame('non-existent')).toBe(false);
    });
  });
});
