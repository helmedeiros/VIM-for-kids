import { GameDescriptor } from '../../../src/domain/entities/GameDescriptor.js';
import { GameType } from '../../../src/domain/value-objects/GameType.js';

describe('GameDescriptor', () => {
  describe('constructor', () => {
    it('should create a game descriptor with all required properties', () => {
      const gameType = new GameType(GameType.LEVEL_BASED);
      const descriptor = new GameDescriptor(
        'test-game',
        'Test Game',
        'A test game description',
        gameType
      );

      expect(descriptor.id).toBe('test-game');
      expect(descriptor.name).toBe('Test Game');
      expect(descriptor.description).toBe('A test game description');
      expect(descriptor.gameType).toBe(gameType);
    });

    it('should throw error if id is missing', () => {
      const gameType = new GameType(GameType.LEVEL_BASED);

      expect(() => {
        new GameDescriptor(null, 'Test Game', 'Description', gameType);
      }).toThrow('GameDescriptor requires id, name, description, and gameType');
    });

    it('should throw error if name is missing', () => {
      const gameType = new GameType(GameType.LEVEL_BASED);

      expect(() => {
        new GameDescriptor('test-game', null, 'Description', gameType);
      }).toThrow('GameDescriptor requires id, name, description, and gameType');
    });

    it('should throw error if description is missing', () => {
      const gameType = new GameType(GameType.LEVEL_BASED);

      expect(() => {
        new GameDescriptor('test-game', 'Test Game', null, gameType);
      }).toThrow('GameDescriptor requires id, name, description, and gameType');
    });

    it('should throw error if gameType is missing', () => {
      expect(() => {
        new GameDescriptor('test-game', 'Test Game', 'Description', null);
      }).toThrow('GameDescriptor requires id, name, description, and gameType');
    });
  });

  describe('equals', () => {
    it('should return true for identical game descriptors', () => {
      const gameType = new GameType(GameType.LEVEL_BASED);
      const descriptor1 = new GameDescriptor('test', 'Test', 'Description', gameType);
      const descriptor2 = new GameDescriptor('test', 'Test', 'Description', gameType);

      expect(descriptor1.equals(descriptor2)).toBe(true);
    });

    it('should return false for different game descriptors', () => {
      const gameType = new GameType(GameType.LEVEL_BASED);
      const descriptor1 = new GameDescriptor('test1', 'Test1', 'Description1', gameType);
      const descriptor2 = new GameDescriptor('test2', 'Test2', 'Description2', gameType);

      expect(descriptor1.equals(descriptor2)).toBe(false);
    });

    it('should return false when comparing with non-GameDescriptor', () => {
      const gameType = new GameType(GameType.LEVEL_BASED);
      const descriptor = new GameDescriptor('test', 'Test', 'Description', gameType);

      expect(descriptor.equals({})).toBe(false);
      expect(descriptor.equals(null)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string representation', () => {
      const gameType = new GameType(GameType.LEVEL_BASED);
      const descriptor = new GameDescriptor('test-game', 'Test Game', 'Description', gameType);

      expect(descriptor.toString()).toBe('GameDescriptor(test-game, Test Game)');
    });
  });
});
