import { LevelGameState } from '../../src/application/LevelGameState.js';
import { ZoneRegistryAdapter } from '../../src/infrastructure/data/zones/ZoneRegistryAdapter.js';
import { BlinkingGroveZone } from '../../src/infrastructure/data/zones/BlinkingGroveZone.js';
import { Zone } from '../../src/domain/entities/Zone.js';
import { Position } from '../../src/domain/value-objects/Position.js';

// Mock zone provider for testing multi-zone scenarios
class MockZoneProvider {
  createZone(zoneId) {
    // For testing, we'll create variations of the BlinkingGrove zone
    // with different IDs to simulate multiple zones
    if (zoneId === 'zone_1') {
      return BlinkingGroveZone.create();
    }

    // For zone_2, zone_3, etc., create a modified version
    const baseConfig = BlinkingGroveZone.getConfig();
    const zoneNumber = parseInt(zoneId.slice(-1));
    const modifiedConfig = {
      ...baseConfig,
      id: zoneId,
      name: `Test Zone ${zoneNumber}`,
      // Give each zone a different cursor start position
      cursorStartPosition: new Position(10 + zoneNumber, 10 + zoneNumber),
    };

    // Create Zone instance
    return new Zone(modifiedConfig);
  }
}

describe('LevelGameState', () => {
  let zoneProvider;
  let mockZoneProvider;
  let levelConfig;
  let multiZoneLevelConfig;

  beforeEach(() => {
    zoneProvider = new ZoneRegistryAdapter();
    mockZoneProvider = new MockZoneProvider();

    levelConfig = {
      id: 'level_1',
      name: 'VIM Basics',
      zones: ['zone_1'], // Only zone_1 exists currently
      description: 'Learn fundamental VIM movement and modes',
    };

    multiZoneLevelConfig = {
      id: 'level_multi',
      name: 'Multi-Zone Test Level',
      zones: ['zone_1', 'zone_2', 'zone_3'], // For testing multi-zone logic
      description: 'Test level with multiple zones',
    };
  });

  describe('Constructor', () => {
    test('should require zoneProvider and levelConfig', () => {
      expect(() => new LevelGameState()).toThrow(
        'LevelGameState requires zoneProvider and levelConfig'
      );
      expect(() => new LevelGameState(zoneProvider)).toThrow(
        'LevelGameState requires zoneProvider and levelConfig'
      );
    });

    test('should initialize with first zone of the level', () => {
      const levelState = new LevelGameState(zoneProvider, levelConfig);

      expect(levelState.getCurrentZoneId()).toBe('zone_1');
      expect(levelState.getCurrentZoneIndex()).toBe(0);
      expect(levelState.getCurrentZone()).toBeDefined();
    });

    test('should initialize cursor at first zone start position', () => {
      const levelState = new LevelGameState(zoneProvider, levelConfig);

      expect(levelState.cursor).toBeDefined();
      expect(levelState.cursor.position).toBeDefined();
    });
  });

  describe('Zone Progression', () => {
    test('should progress to next zone when current zone is completed', async () => {
      const levelState = new LevelGameState(mockZoneProvider, multiZoneLevelConfig);

      // Complete zone_1
      const zone1Keys = [...levelState.availableKeys];
      zone1Keys.forEach((key) => levelState.collectKey(key));

      expect(levelState.isCurrentZoneComplete()).toBe(true);

      // Progress to next zone
      await levelState.progressToNextZone();

      expect(levelState.getCurrentZoneId()).toBe('zone_2');
      expect(levelState.getCurrentZoneIndex()).toBe(1);
    });

    test('should not progress if current zone is not complete', async () => {
      const levelState = new LevelGameState(mockZoneProvider, multiZoneLevelConfig);

      expect(levelState.isCurrentZoneComplete()).toBe(false);
      await expect(levelState.progressToNextZone()).rejects.toThrow(
        'Cannot progress: current zone not complete'
      );
    });

    test('should track completed zones', async () => {
      const levelState = new LevelGameState(mockZoneProvider, multiZoneLevelConfig);

      expect(levelState.getCompletedZones()).toEqual([]);

      // Complete zone_1
      const zone1Keys = [...levelState.availableKeys];
      zone1Keys.forEach((key) => levelState.collectKey(key));
      await levelState.progressToNextZone();

      expect(levelState.getCompletedZones()).toContain('zone_1');
    });

    test('should handle progression through all zones in level', async () => {
      const levelState = new LevelGameState(mockZoneProvider, multiZoneLevelConfig);

      // Progress through zone_1 -> zone_2 -> zone_3
      for (let i = 0; i < 3; i++) {
        const keys = [...levelState.availableKeys];
        keys.forEach((key) => levelState.collectKey(key));

        if (i < 2) {
          // Not the last zone
          await levelState.progressToNextZone();
        }
      }

      expect(levelState.getCompletedZones()).toEqual(['zone_1', 'zone_2']);
      expect(levelState.getCurrentZoneId()).toBe('zone_3');
      expect(levelState.isLevelComplete()).toBe(true);
    });
  });

  describe('Level Completion', () => {
    test('should not be complete initially', () => {
      const levelState = new LevelGameState(zoneProvider, levelConfig);

      expect(levelState.isLevelComplete()).toBe(false);
    });

    test('should be complete when all zones are finished', () => {
      const levelState = new LevelGameState(mockZoneProvider, multiZoneLevelConfig);

      // Complete all zones (simulate)
      levelState._completedZones.add('zone_1');
      levelState._completedZones.add('zone_2');
      levelState._currentZoneIndex = 2; // Move to last zone

      // Complete the current (last) zone by collecting all its keys
      const lastZoneKeys = [...levelState.availableKeys];
      lastZoneKeys.forEach((key) => levelState.collectKey(key));

      expect(levelState.isLevelComplete()).toBe(true);
    });

    test('should provide level completion message', () => {
      const levelState = new LevelGameState(mockZoneProvider, multiZoneLevelConfig);

      // Complete all zones
      levelState._completedZones.add('zone_1');
      levelState._completedZones.add('zone_2');
      levelState._currentZoneIndex = 2; // Move to last zone

      // Complete the current (last) zone by collecting all its keys
      const lastZoneKeys = [...levelState.availableKeys];
      lastZoneKeys.forEach((key) => levelState.collectKey(key));

      const message = levelState.getCompletionMessage();
      expect(message).toContain('Multi-Zone Test Level');
      expect(message).toContain('completed');
    });
  });

  describe('Zone Management', () => {
    test('should provide current zone state', () => {
      const levelState = new LevelGameState(zoneProvider, levelConfig);

      const state = levelState.getCurrentState();
      expect(state.currentZone).toBeDefined();
      expect(state.cursor).toBeDefined();
      expect(state.availableKeys).toBeDefined();
      expect(state.levelProgress).toBeDefined();
    });

    test('should handle zone-specific operations', () => {
      const levelState = new LevelGameState(zoneProvider, levelConfig);

      expect(levelState.getTextLabels()).toBeDefined();
      expect(levelState.getGate()).toBeDefined();
      expect(levelState.getNPCs()).toBeDefined();
    });

    test('should reset cursor position when changing zones', async () => {
      const levelState = new LevelGameState(mockZoneProvider, multiZoneLevelConfig);

      const zone1CursorPos = levelState.cursor.position;

      // Complete zone and progress
      const keys = [...levelState.availableKeys];
      keys.forEach((key) => levelState.collectKey(key));
      await levelState.progressToNextZone();

      const zone2CursorPos = levelState.cursor.position;

      // Cursor should be at new zone's start position
      expect(zone2CursorPos).not.toEqual(zone1CursorPos);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid level configurations', () => {
      const invalidConfig = { id: 'invalid', zones: [] };

      expect(() => new LevelGameState(zoneProvider, invalidConfig)).toThrow(
        'Level must contain at least one zone'
      );
    });

    test('should handle non-existent zones in level config', () => {
      const invalidConfig = {
        id: 'level_invalid',
        zones: ['zone_999'],
      };

      expect(() => new LevelGameState(zoneProvider, invalidConfig)).toThrow(
        "Zone 'zone_999' not found in registry"
      );
    });

    test('should handle progression beyond last zone', async () => {
      const singleZoneConfig = {
        id: 'level_single',
        zones: ['zone_1'],
      };

      const levelState = new LevelGameState(zoneProvider, singleZoneConfig);

      // Complete the only zone
      const keys = [...levelState.availableKeys];
      keys.forEach((key) => levelState.collectKey(key));

      await expect(levelState.progressToNextZone()).rejects.toThrow(
        'Cannot progress: already at last zone'
      );
    });
  });

  describe('Level Configuration Flexibility', () => {
    test('should handle different level sizes', () => {
      const twoZoneConfig = {
        id: 'level_2',
        zones: ['zone_1', 'zone_2'],
      };

      const levelState = new LevelGameState(mockZoneProvider, twoZoneConfig);

      expect(levelState.getTotalZones()).toBe(2);
      expect(levelState.getRemainingZones()).toBe(2);
    });

    test('should work with single zone levels', () => {
      const singleZoneConfig = {
        id: 'level_single',
        zones: ['zone_1'],
      };

      const levelState = new LevelGameState(zoneProvider, singleZoneConfig);

      expect(levelState.getTotalZones()).toBe(1);
      expect(levelState.hasNextZone()).toBe(false);
    });
  });
});
