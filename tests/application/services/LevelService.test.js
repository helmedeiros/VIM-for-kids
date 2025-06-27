/* eslint-env node, jest */
import { LevelService } from '../../../src/application/services/LevelService.js';
import { GameRegistry } from '../../../src/infrastructure/data/GameRegistry.js';

describe('LevelService', () => {
  let levelService;

  beforeEach(() => {
    GameRegistry.reset();
    levelService = new LevelService(GameRegistry);
  });

  describe('getLevelConfiguration', () => {
    it('should return level configuration for valid game and level', () => {
      const level = levelService.getLevelConfiguration('cursor-before-clickers', 'level_1');

      expect(level).toEqual({
        id: 'level_1',
        name: 'VIM Basics',
        zones: ['zone_1'],
        description: 'Learn fundamental VIM movement commands in the Blinking Grove',
      });
    });

    it('should throw error for invalid game', () => {
      expect(() => levelService.getLevelConfiguration('invalid-game', 'level_1')).toThrow(
        "Game 'invalid-game' not found"
      );
    });

    it('should throw error for invalid level', () => {
      expect(() => levelService.getLevelConfiguration('cursor-before-clickers', 'invalid')).toThrow(
        "Level 'invalid' not found in game 'cursor-before-clickers'"
      );
    });
  });

  describe('getAllLevelConfigurations', () => {
    it('should return all level configurations for a game', () => {
      const levels = levelService.getAllLevelConfigurations('cursor-before-clickers');

      expect(levels).toHaveLength(5);
      expect(levels[0].id).toBe('level_1');
      expect(levels[0].name).toBe('VIM Basics');
      expect(levels[4].id).toBe('level_5');
      expect(levels[4].name).toBe('Search & Command');
    });

    it('should return empty array for textland game', () => {
      const levels = levelService.getAllLevelConfigurations('cursor-textland');

      expect(levels).toEqual([]);
    });
  });

  describe('getFirstLevel', () => {
    it('should return first level for level-based game', () => {
      const firstLevel = levelService.getFirstLevel('cursor-before-clickers');

      expect(firstLevel.id).toBe('level_1');
      expect(firstLevel.name).toBe('VIM Basics');
    });

    it('should return null for textland game', () => {
      const firstLevel = levelService.getFirstLevel('cursor-textland');

      expect(firstLevel).toBeNull();
    });
  });

  describe('getFirstLevelId', () => {
    it('should return first level ID for level-based game', () => {
      const firstLevelId = levelService.getFirstLevelId('cursor-before-clickers');

      expect(firstLevelId).toBe('level_1');
    });

    it('should return null for textland game', () => {
      const firstLevelId = levelService.getFirstLevelId('cursor-textland');

      expect(firstLevelId).toBeNull();
    });
  });

  describe('getNextLevel', () => {
    it('should return next level configuration', () => {
      const nextLevel = levelService.getNextLevel('cursor-before-clickers', 'level_1');

      expect(nextLevel.id).toBe('level_2');
      expect(nextLevel.name).toBe('Text Manipulation');
    });

    it('should return null for last level', () => {
      const nextLevel = levelService.getNextLevel('cursor-before-clickers', 'level_5');

      expect(nextLevel).toBeNull();
    });

    it('should return null for invalid level', () => {
      const nextLevel = levelService.getNextLevel('cursor-before-clickers', 'invalid');

      expect(nextLevel).toBeNull();
    });
  });

  describe('hasLevel', () => {
    it('should return true for valid level', () => {
      expect(levelService.hasLevel('cursor-before-clickers', 'level_1')).toBe(true);
      expect(levelService.hasLevel('cursor-before-clickers', 'level_5')).toBe(true);
    });

    it('should return false for invalid level', () => {
      expect(levelService.hasLevel('cursor-before-clickers', 'invalid')).toBe(false);
    });

    it('should return false for invalid game', () => {
      expect(levelService.hasLevel('invalid-game', 'level_1')).toBe(false);
    });

    it('should return false for textland game levels', () => {
      expect(levelService.hasLevel('cursor-textland', 'level_1')).toBe(false);
    });
  });

  describe('getTotalLevelCount', () => {
    it('should return correct count for level-based game', () => {
      const count = levelService.getTotalLevelCount('cursor-before-clickers');

      expect(count).toBe(5);
    });

    it('should return 0 for textland game', () => {
      const count = levelService.getTotalLevelCount('cursor-textland');

      expect(count).toBe(0);
    });
  });

  describe('getLevelZones', () => {
    it('should return zones for level', () => {
      const zones = levelService.getLevelZones('cursor-before-clickers', 'level_2');

      expect(zones).toEqual(['zone_2', 'zone_3']);
    });

    it('should return single zone for level_1', () => {
      const zones = levelService.getLevelZones('cursor-before-clickers', 'level_1');

      expect(zones).toEqual(['zone_1']);
    });
  });

  describe('levelHasZone', () => {
    it('should return true when level has zone', () => {
      expect(levelService.levelHasZone('cursor-before-clickers', 'level_1', 'zone_1')).toBe(true);
      expect(levelService.levelHasZone('cursor-before-clickers', 'level_2', 'zone_2')).toBe(true);
      expect(levelService.levelHasZone('cursor-before-clickers', 'level_2', 'zone_3')).toBe(true);
    });

    it('should return false when level does not have zone', () => {
      expect(levelService.levelHasZone('cursor-before-clickers', 'level_1', 'zone_2')).toBe(false);
    });
  });

  describe('getAvailableLevelIds', () => {
    it('should return all level IDs for level-based game', () => {
      const levelIds = levelService.getAvailableLevelIds('cursor-before-clickers');

      expect(levelIds).toEqual(['level_1', 'level_2', 'level_3', 'level_4', 'level_5']);
    });

    it('should return empty array for textland game', () => {
      const levelIds = levelService.getAvailableLevelIds('cursor-textland');

      expect(levelIds).toEqual([]);
    });
  });

  describe('getDefaultLevel', () => {
    it('should return default level for level-based game', () => {
      const defaultLevel = levelService.getDefaultLevel('cursor-before-clickers');

      expect(defaultLevel).toBe('level_1');
    });

    it('should return null for textland game', () => {
      const defaultLevel = levelService.getDefaultLevel('cursor-textland');

      expect(defaultLevel).toBeNull();
    });
  });

  describe('validateLevelConfiguration', () => {
    it('should validate valid level configuration', () => {
      const validConfig = {
        id: 'test_level',
        name: 'Test Level',
        zones: ['zone_1'],
        description: 'A test level',
      };

      expect(levelService.validateLevelConfiguration(validConfig)).toBe(true);
    });

    it('should throw error for missing id', () => {
      const invalidConfig = {
        name: 'Test Level',
        zones: ['zone_1'],
        description: 'A test level',
      };

      expect(() => levelService.validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have a valid id'
      );
    });

    it('should throw error for missing name', () => {
      const invalidConfig = {
        id: 'test_level',
        zones: ['zone_1'],
        description: 'A test level',
      };

      expect(() => levelService.validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have a valid name'
      );
    });

    it('should throw error for missing zones', () => {
      const invalidConfig = {
        id: 'test_level',
        name: 'Test Level',
        description: 'A test level',
      };

      expect(() => levelService.validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have at least one zone'
      );
    });

    it('should throw error for empty zones array', () => {
      const invalidConfig = {
        id: 'test_level',
        name: 'Test Level',
        zones: [],
        description: 'A test level',
      };

      expect(() => levelService.validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have at least one zone'
      );
    });

    it('should throw error for missing description', () => {
      const invalidConfig = {
        id: 'test_level',
        name: 'Test Level',
        zones: ['zone_1'],
      };

      expect(() => levelService.validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have a valid description'
      );
    });
  });
});
