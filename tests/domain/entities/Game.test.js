/* eslint-env node, jest */
import { Game } from '../../../src/domain/entities/Game.js';
import { GameType } from '../../../src/domain/value-objects/GameType.js';

describe('Game', () => {
  let mockFactory;
  let validConfig;

  beforeEach(() => {
    mockFactory = jest.fn().mockResolvedValue({ gameInstance: 'test' });
    validConfig = {
      id: 'test-game',
      name: 'Test Game',
      description: 'A test game for unit testing',
      gameType: new GameType(GameType.LEVEL_BASED),
    };
  });

  describe('Constructor', () => {
    it('should create a valid game with minimal config', () => {
      const game = new Game(validConfig);

      expect(game.id).toBe('test-game');
      expect(game.name).toBe('Test Game');
      expect(game.description).toBe('A test game for unit testing');
      expect(game.gameType).toBe(validConfig.gameType);
      expect(game.factory).toBeNull();
    });

    it('should create a game with extended config', () => {
      const extendedConfig = {
        ...validConfig,
        defaultLevel: 'level_1',
        supportedLevels: ['level_1', 'level_2'],
        features: { cutscenes: true },
        ui: { showLevelSelector: true },
        cutscenes: { hasOriginStory: true },
        persistence: { saveProgress: true },
        factory: mockFactory,
      };

      const game = new Game(extendedConfig);

      expect(game.defaultLevel).toBe('level_1');
      expect(game.supportedLevels).toEqual(['level_1', 'level_2']);
      expect(game.features).toEqual({ cutscenes: true });
      expect(game.ui).toEqual({ showLevelSelector: true });
      expect(game.cutscenes).toEqual({ hasOriginStory: true });
      expect(game.persistence).toEqual({ saveProgress: true });
      expect(game.factory).toBe(mockFactory);
    });

    it('should throw error when config is missing', () => {
      expect(() => new Game()).toThrow('Game requires configuration object');
    });

    it('should throw error when id is missing', () => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig.id;

      expect(() => new Game(invalidConfig)).toThrow('Game requires a valid id');
    });

    it('should throw error when name is missing', () => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig.name;

      expect(() => new Game(invalidConfig)).toThrow('Game requires a valid name');
    });

    it('should throw error when description is missing', () => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig.description;

      expect(() => new Game(invalidConfig)).toThrow('Game requires a valid description');
    });

    it('should throw error when gameType is missing', () => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig.gameType;

      expect(() => new Game(invalidConfig)).toThrow('Game requires a valid gameType');
    });
  });

  describe('supportsLevels', () => {
    it('should return true for level-based games', () => {
      const game = new Game(validConfig);

      expect(game.supportsLevels()).toBe(true);
    });

    it('should return false for textland games', () => {
      const textlandConfig = {
        ...validConfig,
        gameType: new GameType(GameType.TEXTLAND),
      };
      const game = new Game(textlandConfig);

      expect(game.supportsLevels()).toBe(false);
    });
  });

  describe('hasFeature', () => {
    it('should return true for enabled features', () => {
      const configWithFeatures = {
        ...validConfig,
        features: { cutscenes: true, multiplayer: false },
      };
      const game = new Game(configWithFeatures);

      expect(game.hasFeature('cutscenes')).toBe(true);
    });

    it('should return false for disabled features', () => {
      const configWithFeatures = {
        ...validConfig,
        features: { cutscenes: true, multiplayer: false },
      };
      const game = new Game(configWithFeatures);

      expect(game.hasFeature('multiplayer')).toBe(false);
    });

    it('should return false for non-existent features', () => {
      const game = new Game(validConfig);

      expect(game.hasFeature('nonExistent')).toBe(false);
    });
  });

  describe('createGame', () => {
    it('should call factory with options and dependencies', async () => {
      const configWithFactory = { ...validConfig, factory: mockFactory };
      const game = new Game(configWithFactory);
      const options = { level: 'level_1' };
      const dependencies = { renderer: 'mock' };

      const result = await game.createGame(options, dependencies);

      expect(mockFactory).toHaveBeenCalledWith(options, dependencies);
      expect(result).toEqual({ gameInstance: 'test' });
    });

    it('should throw error when no factory is configured', async () => {
      const game = new Game(validConfig);

      await expect(game.createGame()).rejects.toThrow(
        "Game 'test-game' has no factory configured for game creation"
      );
    });
  });

  describe('canCreateInstances', () => {
    it('should return true when factory is configured', () => {
      const configWithFactory = { ...validConfig, factory: mockFactory };
      const game = new Game(configWithFactory);

      expect(game.canCreateInstances()).toBe(true);
    });

    it('should return false when no factory is configured', () => {
      const game = new Game(validConfig);

      expect(game.canCreateInstances()).toBe(false);
    });
  });

  describe('toDescriptor', () => {
    it('should return basic game descriptor', () => {
      const game = new Game(validConfig);

      const descriptor = game.toDescriptor();

      expect(descriptor).toEqual({
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game for unit testing',
        gameType: validConfig.gameType,
      });
    });
  });

  describe('equals', () => {
    it('should return true for identical games', () => {
      const game1 = new Game(validConfig);
      const game2 = new Game(validConfig);

      expect(game1.equals(game2)).toBe(true);
    });

    it('should return false for different games', () => {
      const game1 = new Game(validConfig);
      const differentConfig = { ...validConfig, id: 'different-game' };
      const game2 = new Game(differentConfig);

      expect(game1.equals(game2)).toBe(false);
    });

    it('should return false when comparing with non-Game', () => {
      const game = new Game(validConfig);

      expect(game.equals({})).toBe(false);
      expect(game.equals(null)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string representation', () => {
      const game = new Game(validConfig);

      expect(game.toString()).toBe('Game(test-game, Test Game)');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const extendedConfig = {
        ...validConfig,
        defaultLevel: 'level_1',
        supportedLevels: ['level_1', 'level_2'],
        features: { cutscenes: true },
        ui: { showLevelSelector: true },
        cutscenes: { hasOriginStory: true },
        persistence: { saveProgress: true },
        factory: mockFactory,
      };
      const game = new Game(extendedConfig);

      const json = game.toJSON();

      expect(json).toEqual({
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game for unit testing',
        gameType: 'level_based',
        defaultLevel: 'level_1',
        supportedLevels: ['level_1', 'level_2'],
        features: { cutscenes: true },
        ui: { showLevelSelector: true },
        cutscenes: { hasOriginStory: true },
        persistence: { saveProgress: true },
        canCreateInstances: true,
      });
    });
  });

  describe('fromDescriptor', () => {
    it('should create Game from descriptor object', () => {
      const descriptor = {
        id: 'desc-game',
        name: 'Descriptor Game',
        description: 'Game from descriptor',
        gameType: new GameType(GameType.TEXTLAND),
      };

      const game = Game.fromDescriptor(descriptor);

      expect(game.id).toBe('desc-game');
      expect(game.name).toBe('Descriptor Game');
      expect(game.description).toBe('Game from descriptor');
      expect(game.gameType).toBe(descriptor.gameType);
      expect(game.factory).toBeNull();
      expect(game.features).toEqual({});
    });
  });
});
