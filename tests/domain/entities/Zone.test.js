import { Zone } from '../../../src/domain/entities/Zone.js';
import { ZoneRegistry } from '../../../src/infrastructure/data/zones/ZoneRegistry.js';
import { Gate } from '../../../src/domain/entities/Gate.js';
import { DynamicZoneMap } from '../../../src/domain/entities/DynamicZoneMap.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('Zone', () => {
  let blinkingGrove;

  // Helper function to convert zone-relative coordinates to absolute coordinates
  const getAbsolutePosition = (zoneX, zoneY) => {
    // Use the actual zone dimensions (100x8) for position calculation
    const testMap = new DynamicZoneMap(100, 8);
    return testMap.zoneToAbsolute(zoneX, zoneY);
  };

  beforeEach(() => {
    blinkingGrove = ZoneRegistry.createZone('zone_1');
  });

  describe('Zone Creation', () => {
    test('should create a zone with correct properties', () => {
      expect(blinkingGrove.zoneId).toBe('zone_1');
      expect(blinkingGrove.name).toBe('1. Blinking Grove');
      expect(blinkingGrove.biome).toBe('Forest clearing (bottom left)');
      expect(blinkingGrove.puzzleTheme).toBe('Basic movement, bump-to-talk');
    });

    test('should have correct skill focus', () => {
      expect(blinkingGrove.skillFocus).toEqual(['h', 'j', 'k', 'l']);
    });

    test('should have narration text', () => {
      expect(blinkingGrove.narration).toHaveLength(4);
      expect(blinkingGrove.narration[0]).toContain('Once, the world was clear');
    });

    test('should create a DynamicZoneMap instance', () => {
      expect(blinkingGrove.gameMap).toBeInstanceOf(DynamicZoneMap);
      expect(blinkingGrove.gameMap._zoneWidth).toBe(100);
      expect(blinkingGrove.gameMap._zoneHeight).toBe(8);
    });
  });

  describe('VIM Keys', () => {
    test('should create VIM keys from configuration', () => {
      expect(blinkingGrove.vimKeys).toHaveLength(4);

      const keys = blinkingGrove.vimKeys.map((k) => k.key).sort();
      expect(keys).toEqual(['h', 'j', 'k', 'l']);
    });

    test('should place VIM keys at correct positions', () => {
      const hKey = blinkingGrove.vimKeys.find((k) => k.key === 'h');
      const jKey = blinkingGrove.vimKeys.find((k) => k.key === 'j');
      const kKey = blinkingGrove.vimKeys.find((k) => k.key === 'k');
      const lKey = blinkingGrove.vimKeys.find((k) => k.key === 'l');

      expect(hKey.position).toEqual(getAbsolutePosition(2, 3));
      expect(jKey.position).toEqual(getAbsolutePosition(7, 3));
      expect(kKey.position).toEqual(getAbsolutePosition(14, 3));
      expect(lKey.position).toEqual(getAbsolutePosition(21, 3));
    });

    test('should have descriptive key descriptions', () => {
      const hKey = blinkingGrove.vimKeys.find((k) => k.key === 'h');
      expect(hKey.description).toContain('westward wind');
    });

    test('should collect keys and remove them from available keys', () => {
      const hKey = blinkingGrove.vimKeys.find((k) => k.key === 'h');
      const initialCount = blinkingGrove.vimKeys.length;

      blinkingGrove.collectKey(hKey);

      expect(blinkingGrove.vimKeys).toHaveLength(initialCount - 1);
      expect(blinkingGrove.getCollectedKeysCount()).toBe(1);
      expect(blinkingGrove.getCollectedKeys().has('h')).toBe(true);
    });
  });

  describe('Text Labels', () => {
    test('should create text labels from configuration', () => {
      expect(blinkingGrove.textLabels).toHaveLength(27);

      const textContents = blinkingGrove.textLabels.map((label) => label.text);
      expect(textContents).toContain('H');
      expect(textContents).toContain('e');
      expect(textContents).toContain('l');
      expect(textContents).toContain('o');
      expect(textContents).toContain('w');
      expect(textContents).toContain('!');
    });

    test('should place text labels at correct positions', () => {
      const hLabel = blinkingGrove.textLabels.find((l) => l.text === 'H');
      const eLabel = blinkingGrove.textLabels.find((l) => l.text === 'e');

      expect(hLabel.position).toEqual(getAbsolutePosition(3, 5));
      expect(eLabel.position).toEqual(getAbsolutePosition(4, 5));
    });
  });

  describe('Gate', () => {
    test('should create a gate at correct position', () => {
      expect(blinkingGrove.gate).toBeInstanceOf(Gate);
      expect(blinkingGrove.gate.position).toEqual(getAbsolutePosition(92, 5));
    });

    test('should start with gate closed', () => {
      expect(blinkingGrove.gate.isOpen).toBe(false);
      expect(blinkingGrove.isComplete()).toBe(false);
    });

    test('should open gate when all keys are collected', () => {
      const keys = [...blinkingGrove.vimKeys];

      keys.forEach((key) => {
        blinkingGrove.collectKey(key);
      });

      expect(blinkingGrove.gate.isOpen).toBe(true);
      expect(blinkingGrove.isComplete()).toBe(true);
    });

    test('should not open gate until all keys are collected', () => {
      const keys = [...blinkingGrove.vimKeys];

      // Collect only 3 keys
      for (let i = 0; i < 3; i++) {
        blinkingGrove.collectKey(keys[i]);
      }

      expect(blinkingGrove.gate.isOpen).toBe(false);
      expect(blinkingGrove.isComplete()).toBe(false);
    });
  });

  describe('NPCs', () => {
    test('should store NPC configuration', () => {
      expect(blinkingGrove.npcs).toHaveLength(1);
      expect(blinkingGrove.npcs[0].id).toBe('caret_stone');
    });

    test('should not show NPCs initially', () => {
      const activeNPCs = blinkingGrove.getActiveNPCs();
      expect(activeNPCs).toHaveLength(0);
    });

    test('should show NPCs when conditions are met', () => {
      const keys = [...blinkingGrove.vimKeys];

      keys.forEach((key) => {
        blinkingGrove.collectKey(key);
      });

      const activeNPCs = blinkingGrove.getActiveNPCs();
      expect(activeNPCs).toHaveLength(1);
      expect(activeNPCs[0].id).toBe('caret_stone');
    });

    test('should get NPC dialogue', () => {
      const dialogue = blinkingGrove.getNPCDialogue('caret_stone');
      expect(dialogue).toHaveLength(4);
      expect(dialogue[0]).toContain('Yes... the foundation');
    });

    test('should get NPC position', () => {
      const position = blinkingGrove.getNPCPosition('caret_stone');
      expect(position).toEqual(getAbsolutePosition(90, 5));
    });

    test('should return null for non-existent NPC position', () => {
      const position = blinkingGrove.getNPCPosition('non_existent');
      expect(position).toBeNull();
    });

    test('should return null for NPC without position', () => {
      // Add an NPC without position to test
      blinkingGrove._npcs.push({ id: 'no_position_npc', dialogue: ['Hi'] });
      const position = blinkingGrove.getNPCPosition('no_position_npc');
      expect(position).toBeNull();
    });
  });

  describe('Events', () => {
    test('should store events configuration', () => {
      expect(blinkingGrove.events).toHaveLength(2);

      const introEvent = blinkingGrove.events.find((e) => e.id === 'zone1_intro_lock');
      const unlockEvent = blinkingGrove.events.find((e) => e.id === 'zone1_unlock_gate');

      expect(introEvent).toBeDefined();
      expect(unlockEvent).toBeDefined();
    });

    test('should have correct event triggers', () => {
      const introEvent = blinkingGrove.events.find((e) => e.id === 'zone1_intro_lock');
      const unlockEvent = blinkingGrove.events.find((e) => e.id === 'zone1_unlock_gate');

      expect(introEvent.trigger).toBe('onZoneEnter');
      expect(unlockEvent.trigger).toBe('onVimKeysCollected');
    });
  });

  describe('Cursor Start Position', () => {
    test('should provide cursor start position', () => {
      const startPosition = blinkingGrove.getCursorStartPosition();
      expect(startPosition).toEqual(new Position(7, 10)); // Absolute position for zone-relative (1, 1)
    });
  });

  describe('Zone State', () => {
    test('should track collected keys count', () => {
      expect(blinkingGrove.getCollectedKeysCount()).toBe(0);

      const hKey = blinkingGrove.vimKeys.find((k) => k.key === 'h');
      blinkingGrove.collectKey(hKey);

      expect(blinkingGrove.getCollectedKeysCount()).toBe(1);
    });

    test('should return copy of collected keys', () => {
      const hKey = blinkingGrove.vimKeys.find((k) => k.key === 'h');
      blinkingGrove.collectKey(hKey);

      const collectedKeys1 = blinkingGrove.getCollectedKeys();
      const collectedKeys2 = blinkingGrove.getCollectedKeys();

      expect(collectedKeys1).not.toBe(collectedKeys2); // Different objects
      expect(collectedKeys1).toEqual(collectedKeys2); // Same content
    });
  });

  describe('Zone Factory Pattern', () => {
    test('should create zone using ZoneRegistry', () => {
      const zoneFromRegistry = ZoneRegistry.createZone('zone_1');

      expect(zoneFromRegistry).toBeInstanceOf(Zone);
      expect(zoneFromRegistry.zoneId).toBe('zone_1');
      expect(zoneFromRegistry.name).toBe('1. Blinking Grove');
    });

    test('should get zone configuration without creating instance', () => {
      const config = ZoneRegistry.getZoneConfig('zone_1');

      expect(config.zoneId).toBe('zone_1');
      expect(config.name).toBe('1. Blinking Grove');
      expect(config.skillFocus).toEqual(['h', 'j', 'k', 'l']);
      expect(config.tiles.specialTiles).toHaveLength(4);
    });

    test('should create equivalent zones through registry and direct factory', () => {
      const zoneFromRegistry = ZoneRegistry.createZone('zone_1');
      const configFromRegistry = ZoneRegistry.getZoneConfig('zone_1');

      expect(zoneFromRegistry.zoneId).toBe(configFromRegistry.zoneId);
      expect(zoneFromRegistry.name).toBe(configFromRegistry.name);
      expect(zoneFromRegistry.skillFocus).toEqual(configFromRegistry.skillFocus);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    test('should handle zone with no special tiles', () => {
      const minimalConfig = {
        zoneId: 'minimal_zone',
        name: 'Minimal Zone',
        biome: 'empty',
        skillFocus: [],
        puzzleTheme: 'None',
        narration: [],
        tiles: {},
        npcs: [],
        events: [],
      };

      const zone = new Zone(minimalConfig);

      expect(zone.vimKeys).toEqual([]);
      expect(zone.textLabels).toEqual([]);
      expect(zone.gate).toBeUndefined();
      expect(zone.npcs).toEqual([]);
      expect(zone.events).toEqual([]);
    });

    test('should handle zone with no NPCs or events', () => {
      const simpleConfig = {
        zoneId: 'simple_zone',
        name: 'Simple Zone',
        biome: 'plain',
        skillFocus: ['h'],
        puzzleTheme: 'Basic',
        narration: ['Test'],
        tiles: {
          specialTiles: [{ type: 'vim_key', value: 'h', position: [1, 1] }],
        },
      };

      const zone = new Zone(simpleConfig);

      expect(zone.npcs).toEqual([]);
      expect(zone.events).toEqual([]);
      expect(zone.getActiveNPCs()).toEqual([]);
    });

    test('should handle partial key collection for gate unlock', () => {
      const keys = [...blinkingGrove.vimKeys];

      // Collect keys one by one and check gate remains closed
      for (let i = 0; i < keys.length - 1; i++) {
        blinkingGrove.collectKey(keys[i]);
        expect(blinkingGrove.gate.isOpen).toBe(false);
        expect(blinkingGrove.isComplete()).toBe(false);
      }

      // Collect final key and check gate opens
      blinkingGrove.collectKey(keys[keys.length - 1]);
      expect(blinkingGrove.gate.isOpen).toBe(true);
      expect(blinkingGrove.isComplete()).toBe(true);
    });

    test('should handle collecting the same key multiple times', () => {
      const hKey = blinkingGrove.vimKeys.find((k) => k.key === 'h');
      const initialCount = blinkingGrove.vimKeys.length;

      blinkingGrove.collectKey(hKey);
      const countAfterFirst = blinkingGrove.getCollectedKeysCount();

      // Try to collect same key again (should not change anything)
      try {
        blinkingGrove.collectKey(hKey);
      } catch (error) {
        // Expected if key is no longer in array
      }

      expect(blinkingGrove.getCollectedKeysCount()).toBe(countAfterFirst);
      expect(blinkingGrove.vimKeys).toHaveLength(initialCount - 1);
    });

    test('should handle NPCs without appearance conditions', () => {
      const configWithAlwaysVisibleNPC = {
        zoneId: 'test_zone',
        name: 'Test Zone',
        biome: 'test',
        skillFocus: [],
        puzzleTheme: 'Test',
        narration: [],
        tiles: {},
        npcs: [
          {
            id: 'always_visible',
            dialogue: ['Hello'],
            position: [1, 1],
          },
        ],
        events: [],
      };

      const zone = new Zone(configWithAlwaysVisibleNPC);
      const activeNPCs = zone.getActiveNPCs();

      expect(activeNPCs).toHaveLength(1);
      expect(activeNPCs[0].id).toBe('always_visible');
    });

    test('should return empty array for non-existent NPC dialogue', () => {
      const dialogue = blinkingGrove.getNPCDialogue('non_existent_npc');
      expect(dialogue).toEqual([]);
    });

    test('should handle zone without gate', () => {
      const noGateConfig = {
        zoneId: 'no_gate_zone',
        name: 'No Gate Zone',
        biome: 'open',
        skillFocus: [],
        puzzleTheme: 'Free roam',
        narration: [],
        tiles: {},
        npcs: [],
        events: [],
      };

      const zone = new Zone(noGateConfig);

      expect(zone.gate).toBeUndefined();
      expect(zone.isComplete()).toBeFalsy(); // No gate means falsy (undefined)
    });

    test('should handle zone with complex NPC conditions', () => {
      const complexConfig = {
        zoneId: 'complex_zone',
        name: 'Complex Zone',
        biome: 'complex',
        skillFocus: ['a', 'b'],
        puzzleTheme: 'Multi-step',
        narration: [],
        tiles: {
          specialTiles: [
            { type: 'vim_key', value: 'a', position: [1, 1] },
            { type: 'vim_key', value: 'b', position: [2, 2] },
          ],
        },
        npcs: [
          {
            id: 'partial_npc',
            appearsWhen: { collectedVimKeys: ['a'] },
            dialogue: ['You found A!'],
            position: [3, 3],
          },
          {
            id: 'complete_npc',
            appearsWhen: { collectedVimKeys: ['a', 'b'] },
            dialogue: ['You found both!'],
            position: [4, 4],
          },
        ],
        events: [],
      };

      const zone = new Zone(complexConfig);

      // Initially no NPCs visible
      expect(zone.getActiveNPCs()).toHaveLength(0);

      // Collect first key - should show first NPC
      const aKey = zone.vimKeys.find((k) => k.key === 'a');
      zone.collectKey(aKey);
      expect(zone.getActiveNPCs()).toHaveLength(1);
      expect(zone.getActiveNPCs()[0].id).toBe('partial_npc');

      // Collect second key - should show both NPCs
      const bKey = zone.vimKeys.find((k) => k.key === 'b');
      zone.collectKey(bKey);
      expect(zone.getActiveNPCs()).toHaveLength(2);
    });

    test('should preserve immutability of getter arrays', () => {
      const skillFocus1 = blinkingGrove.skillFocus;
      const skillFocus2 = blinkingGrove.skillFocus;
      const narration1 = blinkingGrove.narration;
      const narration2 = blinkingGrove.narration;

      expect(skillFocus1).not.toBe(skillFocus2); // Different array instances
      expect(skillFocus1).toEqual(skillFocus2); // Same content
      expect(narration1).not.toBe(narration2); // Different array instances
      expect(narration1).toEqual(narration2); // Same content
    });
  });

  describe('Generic Zone Constructor', () => {
    test('should create zone from custom configuration', () => {
      const customConfig = {
        zoneId: 'test_zone',
        name: 'Test Zone',
        biome: 'test_biome',
        skillFocus: ['x'],
        puzzleTheme: 'Test theme',
        narration: ['Test narration'],
        tiles: {
          specialTiles: [{ type: 'vim_key', value: 'x', position: [1, 1] }],
          textLabels: [{ text: 'test', position: [2, 2] }],
          gate: {
            locked: true,
            unlocksWhen: { collectedVimKeys: ['x'] },
            position: [3, 3],
            leadsTo: 'next_zone',
          },
        },
        npcs: [],
        events: [],
      };

      const customZone = new Zone(customConfig);

      expect(customZone.zoneId).toBe('test_zone');
      expect(customZone.name).toBe('Test Zone');
      expect(customZone.vimKeys).toHaveLength(1);
      expect(customZone.vimKeys[0].key).toBe('x');
      expect(customZone.textLabels).toHaveLength(1);
      expect(customZone.textLabels[0].text).toBe('test');
    });

    test('should handle all possible configuration variations', () => {
      const maximalConfig = {
        zoneId: 'maximal_zone',
        name: 'Maximal Zone',
        biome: 'complex_biome',
        skillFocus: ['h', 'j', 'k', 'l', 'w', 'b'],
        puzzleTheme: 'Everything at once',
        narration: ['First line of story', 'Second line of story', 'Third line of story'],
        tiles: {
          tileType: 'special_ground',
          specialTiles: [
            { type: 'vim_key', value: 'h', position: [1, 1] },
            { type: 'vim_key', value: 'j', position: [1, 2] },
            { type: 'vim_key', value: 'k', position: [2, 1] },
            { type: 'vim_key', value: 'l', position: [2, 2] },
            { type: 'vim_key', value: 'w', position: [3, 3] },
            { type: 'vim_key', value: 'b', position: [4, 4] },
          ],
          textLabels: [
            { text: 'Welcome', position: [5, 5] },
            { text: 'to', position: [6, 5] },
            { text: 'the', position: [7, 5] },
            { text: 'zone!', position: [8, 5] },
          ],
          gate: {
            locked: true,
            unlocksWhen: { collectedVimKeys: ['h', 'j', 'k', 'l', 'w', 'b'] },
            position: [10, 10],
            leadsTo: 'final_zone',
          },
        },
        npcs: [
          {
            id: 'guide',
            dialogue: ['Welcome to the zone!', 'Collect all keys to proceed.'],
            position: [0, 0],
          },
          {
            id: 'guardian',
            appearsWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
            dialogue: ['You have learned the basics!', 'Now learn advanced movement.'],
            position: [9, 9],
          },
        ],
        events: [
          {
            id: 'zone_start',
            trigger: 'onZoneEnter',
            actions: [{ type: 'showMessage', text: 'Zone entered!' }],
          },
          {
            id: 'zone_complete',
            trigger: 'onAllKeysCollected',
            actions: [{ type: 'playSound', sound: 'victory' }],
          },
        ],
      };

      const zone = new Zone(maximalConfig);

      expect(zone.zoneId).toBe('maximal_zone');
      expect(zone.skillFocus).toHaveLength(6);
      expect(zone.narration).toHaveLength(3);
      expect(zone.vimKeys).toHaveLength(6);
      expect(zone.textLabels).toHaveLength(4);
      expect(zone.npcs).toHaveLength(2);
      expect(zone.events).toHaveLength(2);
      expect(zone.gate).toBeDefined();
    });
  });
});
