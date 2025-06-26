import {
  LEVEL_CONFIGURATIONS,
  getLevelConfiguration,
  getAvailableLevelIds,
  getFirstLevel,
  getNextLevel,
  validateLevelConfiguration,
} from '../../src/application/LevelConfigurations.js';

describe('LevelConfigurations', () => {
  describe('LEVEL_CONFIGURATIONS', () => {
    test('should contain all expected levels', () => {
      expect(LEVEL_CONFIGURATIONS).toHaveProperty('level_1');
      expect(LEVEL_CONFIGURATIONS).toHaveProperty('level_2');
      expect(LEVEL_CONFIGURATIONS).toHaveProperty('level_3');
      expect(LEVEL_CONFIGURATIONS).toHaveProperty('level_4');
      expect(LEVEL_CONFIGURATIONS).toHaveProperty('level_5');
    });

    test('should have properly structured level configurations', () => {
      Object.values(LEVEL_CONFIGURATIONS).forEach((config) => {
        expect(config).toHaveProperty('id');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('zones');
        expect(config).toHaveProperty('description');
        expect(Array.isArray(config.zones)).toBe(true);
        expect(config.zones.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getLevelConfiguration', () => {
    test('should return level configuration for valid level ID', () => {
      const config = getLevelConfiguration('level_1');
      expect(config).toEqual(LEVEL_CONFIGURATIONS.level_1);
    });

    test('should throw error for invalid level ID', () => {
      expect(() => getLevelConfiguration('invalid_level')).toThrow(
        'Level configuration not found: invalid_level'
      );
    });

    test('should throw error for null level ID', () => {
      expect(() => getLevelConfiguration(null)).toThrow('Level configuration not found: null');
    });
  });

  describe('getAvailableLevelIds', () => {
    test('should return array of all level IDs', () => {
      const levels = getAvailableLevelIds();
      expect(levels).toEqual(['level_1', 'level_2', 'level_3', 'level_4', 'level_5']);
    });

    test('should return array with correct length', () => {
      const levels = getAvailableLevelIds();
      expect(levels).toHaveLength(5);
    });
  });

  describe('getFirstLevel', () => {
    test('should return level_1 configuration', () => {
      const firstLevel = getFirstLevel();
      expect(firstLevel).toEqual(LEVEL_CONFIGURATIONS.level_1);
    });
  });

  describe('getNextLevel', () => {
    test('should return next level for valid current level', () => {
      const nextLevel = getNextLevel('level_1');
      expect(nextLevel).toEqual(LEVEL_CONFIGURATIONS.level_2);
    });

    test('should return level_3 after level_2', () => {
      const nextLevel = getNextLevel('level_2');
      expect(nextLevel).toEqual(LEVEL_CONFIGURATIONS.level_3);
    });

    test('should return null for last level', () => {
      const nextLevel = getNextLevel('level_5');
      expect(nextLevel).toBeNull();
    });

    test('should return null for invalid level ID', () => {
      const nextLevel = getNextLevel('invalid_level');
      expect(nextLevel).toBeNull();
    });

    test('should return null for null level ID', () => {
      const nextLevel = getNextLevel(null);
      expect(nextLevel).toBeNull();
    });
  });

  describe('validateLevelConfiguration', () => {
    test('should return true for valid configuration', () => {
      const validConfig = {
        id: 'test_level',
        name: 'Test Level',
        zones: ['zone_1'],
        description: 'A test level',
      };
      expect(validateLevelConfiguration(validConfig)).toBe(true);
    });

    test('should throw error for missing id', () => {
      const invalidConfig = {
        name: 'Test Level',
        zones: ['zone_1'],
        description: 'A test level',
      };
      expect(() => validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have a valid id'
      );
    });

    test('should throw error for non-string id', () => {
      const invalidConfig = {
        id: 123,
        name: 'Test Level',
        zones: ['zone_1'],
        description: 'A test level',
      };
      expect(() => validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have a valid id'
      );
    });

    test('should throw error for missing name', () => {
      const invalidConfig = {
        id: 'test_level',
        zones: ['zone_1'],
        description: 'A test level',
      };
      expect(() => validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have a valid name'
      );
    });

    test('should throw error for non-string name', () => {
      const invalidConfig = {
        id: 'test_level',
        name: 123,
        zones: ['zone_1'],
        description: 'A test level',
      };
      expect(() => validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have a valid name'
      );
    });

    test('should throw error for missing zones', () => {
      const invalidConfig = {
        id: 'test_level',
        name: 'Test Level',
        description: 'A test level',
      };
      expect(() => validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have at least one zone'
      );
    });

    test('should throw error for non-array zones', () => {
      const invalidConfig = {
        id: 'test_level',
        name: 'Test Level',
        zones: 'zone_1',
        description: 'A test level',
      };
      expect(() => validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have at least one zone'
      );
    });

    test('should throw error for empty zones array', () => {
      const invalidConfig = {
        id: 'test_level',
        name: 'Test Level',
        zones: [],
        description: 'A test level',
      };
      expect(() => validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have at least one zone'
      );
    });

    test('should throw error for missing description', () => {
      const invalidConfig = {
        id: 'test_level',
        name: 'Test Level',
        zones: ['zone_1'],
      };
      expect(() => validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have a valid description'
      );
    });

    test('should throw error for non-string description', () => {
      const invalidConfig = {
        id: 'test_level',
        name: 'Test Level',
        zones: ['zone_1'],
        description: 123,
      };
      expect(() => validateLevelConfiguration(invalidConfig)).toThrow(
        'Level configuration must have a valid description'
      );
    });
  });
});
