import { SelectGameUseCase } from '../../../src/application/use-cases/SelectGameUseCase.js';
import { GameDescriptor } from '../../../src/domain/entities/GameDescriptor.js';
import { GameType } from '../../../src/domain/value-objects/GameType.js';

// Mock GameProvider
class MockGameProvider {
  constructor() {
    this.games = new Map();
    this.defaultGameId = null;
  }

  async getAvailableGames() {
    return Array.from(this.games.values());
  }

  async getGame(gameId) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error(`Game '${gameId}' not found`);
    }
    return game;
  }

  async getDefaultGame() {
    if (!this.defaultGameId) {
      throw new Error('No default game set');
    }
    return this.games.get(this.defaultGameId);
  }

  async hasGame(gameId) {
    return this.games.has(gameId);
  }

  // Test helper methods
  addGame(gameDescriptor) {
    this.games.set(gameDescriptor.id, gameDescriptor);
    if (!this.defaultGameId) {
      this.defaultGameId = gameDescriptor.id;
    }
  }
}

describe('SelectGameUseCase', () => {
  let useCase;
  let mockGameProvider;
  let levelBasedGame;
  let textlandGame;

  beforeEach(() => {
    mockGameProvider = new MockGameProvider();
    useCase = new SelectGameUseCase(mockGameProvider);

    // Setup test games
    levelBasedGame = new GameDescriptor(
      'level-game',
      'Level Game',
      'A level-based game',
      new GameType(GameType.LEVEL_BASED)
    );

    textlandGame = new GameDescriptor(
      'textland-game',
      'Textland Game',
      'A textland game',
      new GameType(GameType.TEXTLAND)
    );

    mockGameProvider.addGame(levelBasedGame);
    mockGameProvider.addGame(textlandGame);
  });

  describe('constructor', () => {
    it('should throw error if no game provider is provided', () => {
      expect(() => {
        new SelectGameUseCase(null);
      }).toThrow('SelectGameUseCase requires a game provider');
    });

    it('should create use case with valid game provider', () => {
      expect(useCase).toBeInstanceOf(SelectGameUseCase);
    });
  });

  describe('getAvailableGames', () => {
    it('should return all available games', async () => {
      const games = await useCase.getAvailableGames();

      expect(games).toHaveLength(2);
      expect(games).toContain(levelBasedGame);
      expect(games).toContain(textlandGame);
    });
  });

  describe('getDefaultGame', () => {
    it('should return the default game', async () => {
      const defaultGame = await useCase.getDefaultGame();

      expect(defaultGame).toBe(levelBasedGame); // First added becomes default
    });
  });

  describe('selectGame', () => {
    it('should return game descriptor and factory for level-based game', async () => {
      const result = await useCase.selectGame('level-game');

      expect(result.gameDescriptor).toBe(levelBasedGame);
      expect(result.gameStateFactory).toBeInstanceOf(Function);
    });

    it('should return game descriptor and factory for textland game', async () => {
      const result = await useCase.selectGame('textland-game');

      expect(result.gameDescriptor).toBe(textlandGame);
      expect(result.gameStateFactory).toBeInstanceOf(Function);
    });

    it('should throw error for non-existent game', async () => {
      await expect(useCase.selectGame('non-existent')).rejects.toThrow(
        "Game 'non-existent' not found"
      );
    });
  });

  describe('isValidGameSelection', () => {
    it('should return true for existing games', async () => {
      expect(await useCase.isValidGameSelection('level-game')).toBe(true);
      expect(await useCase.isValidGameSelection('textland-game')).toBe(true);
    });

    it('should return false for non-existent games', async () => {
      expect(await useCase.isValidGameSelection('non-existent')).toBe(false);
    });
  });

  describe('game state factory creation', () => {
    it('should create different factories for different game types', async () => {
      const levelResult = await useCase.selectGame('level-game');
      const textlandResult = await useCase.selectGame('textland-game');

      // Both should be functions but handle different game types
      expect(levelResult.gameStateFactory).toBeInstanceOf(Function);
      expect(textlandResult.gameStateFactory).toBeInstanceOf(Function);
      expect(levelResult.gameStateFactory).not.toBe(textlandResult.gameStateFactory);
    });
  });
});
