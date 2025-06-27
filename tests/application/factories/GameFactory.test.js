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
        'No creator registered for game type: unknown-game'
      );
    });

    it('should pass options and dependencies to game creator', async () => {
      const options = { game: 'cursor-before-clickers', level: 'test-level' };

      await gameFactory.createGame(options);

      expect(VimForKidsGame).toHaveBeenCalledWith(options, mockDependencies);
    });
  });

  describe('registerGameCreator', () => {
    it('should register new game creator', async () => {
      const mockCreator = jest.fn().mockResolvedValue({ gameType: 'custom-game' });

      gameFactory.registerGameCreator('custom-game', mockCreator);
      const game = await gameFactory.createGame({ game: 'custom-game' });

      expect(mockCreator).toHaveBeenCalledWith({ game: 'custom-game' }, mockDependencies);
      expect(game.gameType).toBe('custom-game');
    });

    it('should override existing game creator', async () => {
      const mockCreator = jest
        .fn()
        .mockResolvedValue({ gameType: 'custom-cursor-before-clickers' });

      gameFactory.registerGameCreator('cursor-before-clickers', mockCreator);
      const game = await gameFactory.createGame({ game: 'cursor-before-clickers' });

      expect(mockCreator).toHaveBeenCalledWith(
        { game: 'cursor-before-clickers' },
        mockDependencies
      );
      expect(VimForKidsGame).not.toHaveBeenCalled();
      expect(game.gameType).toBe('custom-cursor-before-clickers');
    });
  });

  describe('_determineGameType', () => {
    it('should return default game type when no game specified', () => {
      const result = gameFactory._determineGameType({});
      expect(result).toBe('cursor-before-clickers');
    });

    it('should return specified game type', () => {
      const result = gameFactory._determineGameType({ game: 'cursor-textland' });
      expect(result).toBe('cursor-textland');
    });
  });
});
