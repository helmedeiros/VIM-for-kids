/* eslint-env node, jest */
import { GameDefinition } from '../../../src/domain/entities/GameDefinition.js';
import { GameType } from '../../../src/domain/value-objects/GameType.js';

describe('GameDefinition', () => {
  let mockFactory;
  let validConfig;

  beforeEach(() => {
    mockFactory = jest.fn().mockResolvedValue({ gameInstance: 'test' });
    validConfig = {
      id: 'test-game',
      name: 'Test Game',
      description: 'A test game for unit testing',
      gameType: new GameType(GameType.LEVEL_BASED),
      factory: mockFactory,
    };
  });

  describe('Constructor', () => {
    it('should create a valid game definition with minimal config', () => {
      const gameDefinition = new GameDefinition(validConfig);

      expect(gameDefinition.id).toBe('test-game');
      expect(gameDefinition.name).toBe('Test Game');
      expect(gameDefinition.description).toBe('A test game for unit testing');
      expect(gameDefinition.gameType).toBe(validConfig.gameType);
      expect(gameDefinition.factory).toBe(mockFactory);
    });

    it('should create a game definition with extended config', () => {
      const extendedConfig = {
        ...validConfig,
        defaultLevel: 'level_1',
        supportedLevels: ['level_1', 'level_2'],
        features: { cutscenes: true },
        ui: { showLevelSelector: true },
        cutscenes: { hasOriginStory: true },
        persistence: { saveProgress: true },
      };

      const gameDefinition = new GameDefinition(extendedConfig);

      expect(gameDefinition.defaultLevel).toBe('level_1');
      expect(gameDefinition.supportedLevels).toEqual(['level_1', 'level_2']);
      expect(gameDefinition.features).toEqual({ cutscenes: true });
      expect(gameDefinition.ui).toEqual({ showLevelSelector: true });
      expect(gameDefinition.cutscenes).toEqual({ hasOriginStory: true });
      expect(gameDefinition.persistence).toEqual({ saveProgress: true });
    });

    it('should throw error when config is missing', () => {
      expect(() => new GameDefinition()).toThrow('GameDefinition requires configuration object');
    });

    it('should throw error when id is missing', () => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig.id;

      expect(() => new GameDefinition(invalidConfig)).toThrow('GameDefinition requires a valid id');
    });

    it('should throw error when name is missing', () => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig.name;

      expect(() => new GameDefinition(invalidConfig)).toThrow(
        'GameDefinition requires a valid name'
      );
    });

    it('should throw error when description is missing', () => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig.description;

      expect(() => new GameDefinition(invalidConfig)).toThrow(
        'GameDefinition requires a valid description'
      );
    });

    it('should throw error when gameType is missing', () => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig.gameType;

      expect(() => new GameDefinition(invalidConfig)).toThrow(
        'GameDefinition requires a valid gameType'
      );
    });

    it('should throw error when factory is missing', () => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig.factory;

      expect(() => new GameDefinition(invalidConfig)).toThrow(
        'GameDefinition requires a factory function'
      );
    });

    it('should throw error when factory is not a function', () => {
      const invalidConfig = { ...validConfig, factory: 'not-a-function' };

      expect(() => new GameDefinition(invalidConfig)).toThrow(
        'GameDefinition requires a factory function'
      );
    });
  });

  describe('supportsLevels', () => {
    it('should return true for level-based games', () => {
      const gameDefinition = new GameDefinition(validConfig);

      expect(gameDefinition.supportsLevels()).toBe(true);
    });

    it('should return false for textland games', () => {
      const textlandConfig = {
        ...validConfig,
        gameType: new GameType(GameType.TEXTLAND),
      };
      const gameDefinition = new GameDefinition(textlandConfig);

      expect(gameDefinition.supportsLevels()).toBe(false);
    });
  });

  describe('hasFeature', () => {
    it('should return true for enabled features', () => {
      const configWithFeatures = {
        ...validConfig,
        features: { cutscenes: true, multiplayer: false },
      };
      const gameDefinition = new GameDefinition(configWithFeatures);

      expect(gameDefinition.hasFeature('cutscenes')).toBe(true);
    });

    it('should return false for disabled features', () => {
      const configWithFeatures = {
        ...validConfig,
        features: { cutscenes: true, multiplayer: false },
      };
      const gameDefinition = new GameDefinition(configWithFeatures);

      expect(gameDefinition.hasFeature('multiplayer')).toBe(false);
    });

    it('should return false for non-existent features', () => {
      const gameDefinition = new GameDefinition(validConfig);

      expect(gameDefinition.hasFeature('nonExistent')).toBe(false);
    });
  });

  describe('getUIConfig', () => {
    it('should return UI configuration', () => {
      const configWithUI = {
        ...validConfig,
        ui: { showLevelSelector: true, theme: 'dark' },
      };
      const gameDefinition = new GameDefinition(configWithUI);

      const uiConfig = gameDefinition.getUIConfig();

      expect(uiConfig).toEqual({ showLevelSelector: true, theme: 'dark' });
    });

    it('should return copy of UI config to prevent mutation', () => {
      const configWithUI = {
        ...validConfig,
        ui: { showLevelSelector: true },
      };
      const gameDefinition = new GameDefinition(configWithUI);

      const uiConfig = gameDefinition.getUIConfig();
      uiConfig.showLevelSelector = false;

      expect(gameDefinition.getUIConfig().showLevelSelector).toBe(true);
    });

    it('should return empty object when no UI config provided', () => {
      const gameDefinition = new GameDefinition(validConfig);

      expect(gameDefinition.getUIConfig()).toEqual({});
    });
  });

  describe('getCutsceneConfig', () => {
    it('should return cutscene configuration', () => {
      const configWithCutscenes = {
        ...validConfig,
        cutscenes: { hasOriginStory: true, hasLevelTransitions: false },
      };
      const gameDefinition = new GameDefinition(configWithCutscenes);

      const cutsceneConfig = gameDefinition.getCutsceneConfig();

      expect(cutsceneConfig).toEqual({ hasOriginStory: true, hasLevelTransitions: false });
    });

    it('should return empty object when no cutscene config provided', () => {
      const gameDefinition = new GameDefinition(validConfig);

      expect(gameDefinition.getCutsceneConfig()).toEqual({});
    });
  });

  describe('getPersistenceConfig', () => {
    it('should return persistence configuration', () => {
      const configWithPersistence = {
        ...validConfig,
        persistence: { saveProgress: true, saveKeys: false },
      };
      const gameDefinition = new GameDefinition(configWithPersistence);

      const persistenceConfig = gameDefinition.getPersistenceConfig();

      expect(persistenceConfig).toEqual({ saveProgress: true, saveKeys: false });
    });

    it('should return empty object when no persistence config provided', () => {
      const gameDefinition = new GameDefinition(validConfig);

      expect(gameDefinition.getPersistenceConfig()).toEqual({});
    });
  });

  describe('getDefaultLevel', () => {
    it('should return default level when provided', () => {
      const configWithLevel = {
        ...validConfig,
        defaultLevel: 'level_1',
      };
      const gameDefinition = new GameDefinition(configWithLevel);

      expect(gameDefinition.getDefaultLevel()).toBe('level_1');
    });

    it('should return null when no default level provided', () => {
      const gameDefinition = new GameDefinition(validConfig);

      expect(gameDefinition.getDefaultLevel()).toBeNull();
    });
  });

  describe('supportsLevel', () => {
    it('should return true for supported levels in level-based games', () => {
      const configWithLevels = {
        ...validConfig,
        supportedLevels: ['level_1', 'level_2'],
      };
      const gameDefinition = new GameDefinition(configWithLevels);

      expect(gameDefinition.supportsLevel('level_1')).toBe(true);
      expect(gameDefinition.supportsLevel('level_2')).toBe(true);
    });

    it('should return false for unsupported levels in level-based games', () => {
      const configWithLevels = {
        ...validConfig,
        supportedLevels: ['level_1', 'level_2'],
      };
      const gameDefinition = new GameDefinition(configWithLevels);

      expect(gameDefinition.supportsLevel('level_3')).toBe(false);
    });

    it('should return false for any level in non-level-based games', () => {
      const textlandConfig = {
        ...validConfig,
        gameType: new GameType(GameType.TEXTLAND),
        supportedLevels: ['level_1'],
      };
      const gameDefinition = new GameDefinition(textlandConfig);

      expect(gameDefinition.supportsLevel('level_1')).toBe(false);
    });
  });

  describe('getSupportedLevels', () => {
    it('should return copy of supported levels array', () => {
      const configWithLevels = {
        ...validConfig,
        supportedLevels: ['level_1', 'level_2'],
      };
      const gameDefinition = new GameDefinition(configWithLevels);

      const supportedLevels = gameDefinition.getSupportedLevels();

      expect(supportedLevels).toEqual(['level_1', 'level_2']);

      // Verify it's a copy
      supportedLevels.push('level_3');
      expect(gameDefinition.getSupportedLevels()).toEqual(['level_1', 'level_2']);
    });

    it('should return empty array when no levels provided', () => {
      const gameDefinition = new GameDefinition(validConfig);

      expect(gameDefinition.getSupportedLevels()).toEqual([]);
    });
  });

  describe('createGame', () => {
    it('should call factory with options and dependencies', async () => {
      const gameDefinition = new GameDefinition(validConfig);
      const options = { level: 'level_1' };
      const dependencies = { renderer: 'mock' };

      const result = await gameDefinition.createGame(options, dependencies);

      expect(mockFactory).toHaveBeenCalledWith(options, dependencies);
      expect(result).toEqual({ gameInstance: 'test' });
    });

    it('should call factory with empty objects when no parameters provided', async () => {
      const gameDefinition = new GameDefinition(validConfig);

      await gameDefinition.createGame();

      expect(mockFactory).toHaveBeenCalledWith({}, {});
    });
  });

  describe('toGameDescriptor', () => {
    it('should return GameDescriptor-compatible object', () => {
      const gameDefinition = new GameDefinition(validConfig);

      const descriptor = gameDefinition.toGameDescriptor();

      expect(descriptor).toEqual({
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game for unit testing',
        gameType: validConfig.gameType,
      });
    });
  });

  describe('equals', () => {
    it('should return true for identical game definitions', () => {
      const gameDefinition1 = new GameDefinition(validConfig);
      const gameDefinition2 = new GameDefinition(validConfig);

      expect(gameDefinition1.equals(gameDefinition2)).toBe(true);
    });

    it('should return false for different game definitions', () => {
      const gameDefinition1 = new GameDefinition(validConfig);
      const differentConfig = { ...validConfig, id: 'different-game' };
      const gameDefinition2 = new GameDefinition(differentConfig);

      expect(gameDefinition1.equals(gameDefinition2)).toBe(false);
    });

    it('should return false when comparing with non-GameDefinition', () => {
      const gameDefinition = new GameDefinition(validConfig);

      expect(gameDefinition.equals({})).toBe(false);
      expect(gameDefinition.equals(null)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string representation', () => {
      const gameDefinition = new GameDefinition(validConfig);

      expect(gameDefinition.toString()).toBe('GameDefinition(test-game, Test Game)');
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
      };
      const gameDefinition = new GameDefinition(extendedConfig);

      const json = gameDefinition.toJSON();

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
      });
    });
  });
});
