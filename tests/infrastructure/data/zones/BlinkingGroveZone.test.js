import { BlinkingGroveZone } from '../../../../src/infrastructure/data/zones/BlinkingGroveZone.js';
import { Zone } from '../../../../src/domain/entities/Zone.js';
import { DynamicZoneMap } from '../../../../src/domain/entities/DynamicZoneMap.js';

describe('BlinkingGroveZone', () => {
  describe('Factory Methods', () => {
    test('should create zone instance with create()', () => {
      const zone = BlinkingGroveZone.create();

      expect(zone).toBeInstanceOf(Zone);
      expect(zone.zoneId).toBe('zone_1');
      expect(zone.name).toBe('1. Blinking Grove');
    });

    test('should return configuration object with getConfig()', () => {
      const config = BlinkingGroveZone.getConfig();

      expect(config).toBeInstanceOf(Object);
      expect(config.zoneId).toBe('zone_1');
      expect(config.name).toBe('1. Blinking Grove');
      expect(config.biome).toBe('Forest clearing (bottom left)');
    });

    test('should create different zone instances each time', () => {
      const zone1 = BlinkingGroveZone.create();
      const zone2 = BlinkingGroveZone.create();

      expect(zone1).not.toBe(zone2); // Different instances
      expect(zone1.zoneId).toBe(zone2.zoneId); // Same configuration
    });

    test('should return same configuration object structure', () => {
      const config1 = BlinkingGroveZone.getConfig();
      const config2 = BlinkingGroveZone.getConfig();

      expect(config1).toEqual(config2);
      // Note: They might be different instances depending on implementation
    });
  });

  describe('Zone Configuration Validation', () => {
    test('should have correct zone metadata', () => {
      const config = BlinkingGroveZone.getConfig();

      expect(config.zoneId).toBe('zone_1');
      expect(config.name).toBe('1. Blinking Grove');
      expect(config.biome).toBe('Forest clearing (bottom left)');
      expect(config.skillFocus).toEqual(['h', 'j', 'k', 'l']);
      expect(config.puzzleTheme).toBe('Basic movement, bump-to-talk');
    });

    test('should have correct narration structure', () => {
      const config = BlinkingGroveZone.getConfig();

      expect(config.narration).toBeInstanceOf(Array);
      expect(config.narration).toHaveLength(4);
      expect(config.narration[0]).toContain('Once, the world was clear');
      expect(config.narration[2]).toContain('Hello, Cursor');
    });

    test('should have correct VIM keys configuration', () => {
      const config = BlinkingGroveZone.getConfig();

      expect(config.tiles.specialTiles).toHaveLength(4);

      const keys = config.tiles.specialTiles.map((tile) => tile.value).sort();
      expect(keys).toEqual(['h', 'j', 'k', 'l']);

      const positions = config.tiles.specialTiles.map((tile) => tile.position);
      expect(positions).toContainEqual([3, 3]); // h key
      expect(positions).toContainEqual([3, 4]); // j key
      expect(positions).toContainEqual([4, 3]); // k key
      expect(positions).toContainEqual([4, 4]); // l key
    });

    test('should have correct text labels configuration', () => {
      const config = BlinkingGroveZone.getConfig();

      expect(config.tiles.textLabels).toHaveLength(2);
      expect(config.tiles.textLabels[0]).toEqual({ text: 'Hello', position: [6, 5] });
      expect(config.tiles.textLabels[1]).toEqual({ text: 'world!', position: [6, 6] });
    });

    test('should have correct gate configuration', () => {
      const config = BlinkingGroveZone.getConfig();

      expect(config.tiles.gate).toBeDefined();
      expect(config.tiles.gate.locked).toBe(true);
      expect(config.tiles.gate.position).toEqual([8, 5]);
      expect(config.tiles.gate.leadsTo).toBe('zone_2');
      expect(config.tiles.gate.unlocksWhen.collectedVimKeys).toEqual(['h', 'j', 'k', 'l']);
    });

    test('should have correct NPC configuration', () => {
      const config = BlinkingGroveZone.getConfig();

      expect(config.npcs).toHaveLength(1);

      const caretStone = config.npcs[0];
      expect(caretStone.id).toBe('caret_stone');
      expect(caretStone.position).toEqual([6, 3]);
      expect(caretStone.appearsWhen.collectedVimKeys).toEqual(['h', 'j', 'k', 'l']);
      expect(caretStone.dialogue).toHaveLength(4);
      expect(caretStone.dialogue[0]).toContain('Very good, oh Shadowy One');
    });

    test('should have correct events configuration', () => {
      const config = BlinkingGroveZone.getConfig();

      expect(config.events).toHaveLength(2);

      const introEvent = config.events.find((e) => e.id === 'zone1_intro_lock');
      const unlockEvent = config.events.find((e) => e.id === 'zone1_unlock_gate');

      expect(introEvent).toBeDefined();
      expect(introEvent.trigger).toBe('onZoneEnter');
      expect(introEvent.actions).toHaveLength(2);

      expect(unlockEvent).toBeDefined();
      expect(unlockEvent.trigger).toBe('onVimKeysCollected');
      expect(unlockEvent.conditions.collectedKeys).toEqual(['h', 'j', 'k', 'l']);
    });
  });

  describe('Zone Instance Behavior', () => {
    let zone;

    beforeEach(() => {
      zone = BlinkingGroveZone.create();
    });

    test('should create functional zone with all components', () => {
      expect(zone.vimKeys).toHaveLength(4);
      expect(zone.textLabels).toHaveLength(2);
      expect(zone.gate).toBeDefined();
      expect(zone.npcs).toHaveLength(1);
      expect(zone.events).toHaveLength(2);
    });

    test('should have correct cursor start position', () => {
      const startPosition = zone.getCursorStartPosition();
      // Create a test DynamicZoneMap to get the expected absolute position
      const testMap = new DynamicZoneMap(12, 8);
      const expectedPosition = testMap.zoneToAbsolute(2, 2);
      expect(startPosition).toEqual(expectedPosition);
    });

    test('should have gate initially closed', () => {
      expect(zone.gate.isOpen).toBe(false);
      expect(zone.isComplete()).toBe(false);
    });

    test('should show no active NPCs initially', () => {
      const activeNPCs = zone.getActiveNPCs();
      expect(activeNPCs).toHaveLength(0);
    });

    test('should collect all keys and complete zone', () => {
      const keys = [...zone.vimKeys];

      keys.forEach((key) => {
        zone.collectKey(key);
      });

      expect(zone.getCollectedKeysCount()).toBe(4);
      expect(zone.gate.isOpen).toBe(true);
      expect(zone.isComplete()).toBe(true);

      const activeNPCs = zone.getActiveNPCs();
      expect(activeNPCs).toHaveLength(1);
      expect(activeNPCs[0].id).toBe('caret_stone');
    });

    test('should have correct key descriptions', () => {
      const hKey = zone.vimKeys.find((k) => k.key === 'h');
      const jKey = zone.vimKeys.find((k) => k.key === 'j');
      const kKey = zone.vimKeys.find((k) => k.key === 'k');
      const lKey = zone.vimKeys.find((k) => k.key === 'l');

      expect(hKey.description).toContain('westward wind');
      expect(jKey.description).toContain('earthward root');
      expect(kKey.description).toContain('skyward branch');
      expect(lKey.description).toContain('eastward sun');
    });
  });

  describe('Configuration Consistency', () => {
    test('should have consistent skill focus and VIM keys', () => {
      const config = BlinkingGroveZone.getConfig();
      const zone = BlinkingGroveZone.create();

      const configKeys = config.skillFocus.sort();
      const zoneKeys = zone.vimKeys.map((k) => k.key).sort();

      expect(configKeys).toEqual(zoneKeys);
    });

    test('should have consistent gate unlock conditions', () => {
      const config = BlinkingGroveZone.getConfig();
      const zone = BlinkingGroveZone.create();

      const configUnlockKeys = config.tiles.gate.unlocksWhen.collectedVimKeys.sort();
      const zoneSkillFocus = zone.skillFocus.sort();

      expect(configUnlockKeys).toEqual(zoneSkillFocus);
      expect(zone.gate).toBeDefined(); // Use the zone variable
    });

    test('should have consistent NPC appearance conditions', () => {
      const config = BlinkingGroveZone.getConfig();
      const zone = BlinkingGroveZone.create();

      const npcCondition = config.npcs[0].appearsWhen.collectedVimKeys.sort();
      const gateCondition = config.tiles.gate.unlocksWhen.collectedVimKeys.sort();
      const zoneNPCs = zone.npcs;

      expect(npcCondition).toEqual(gateCondition);
      expect(zoneNPCs).toHaveLength(1); // Use the zone variable
    });
  });
});
