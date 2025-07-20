import { Zone } from '../../../src/domain/entities/Zone.js';
import { Gate } from '../../../src/domain/entities/Gate.js';
import { DynamicZoneMap } from '../../../src/domain/entities/DynamicZoneMap.js';
import { Position } from '../../../src/domain/value-objects/Position.js';
import { CollectibleKey } from '../../../src/domain/entities/CollectibleKey.js';

/**
 * Test fixture for Zone testing - independent of any real zone implementation
 */
const createTestZoneConfig = () => ({
  zoneId: 'test_zone',
  name: 'Test Zone',
  biome: 'Test biome',
  skillFocus: ['h', 'j', 'k', 'l'],
  puzzleTheme: 'Test puzzle theme',
  narration: [
    'Test narration line 1',
    'Test narration line 2',
    'Test narration line 3',
    'Test narration line 4',
  ],

  // Simple 10x6 test layout
  tiles: {
    layout: [
      '##########',
      '#........#',
      '#.h.j....#',
      '#........#',
      '#.k.l...G#',
      '##########',
    ],
    legend: {
      '#': 'wall',
      '.': 'path',
      'G': 'gate',
    },
    specialTiles: [
      { position: [2, 2], value: 'h', type: 'vim_key' },
      { position: [4, 2], value: 'j', type: 'vim_key' },
      { position: [2, 4], value: 'k', type: 'vim_key' },
      { position: [4, 4], value: 'l', type: 'vim_key' },
    ],
    textLabels: [
      { position: [6, 2], text: 'H', style: 'normal' },
      { position: [7, 2], text: 'e', style: 'normal' },
      { position: [8, 2], text: 'l', style: 'normal' },
      { position: [6, 3], text: 'l', style: 'normal' },
      { position: [7, 3], text: 'o', style: 'normal' },
      { position: [8, 3], text: '!', style: 'normal' },
    ],
    gate: {
      position: [8, 4],
      locked: true,
      leadsTo: 'test_zone_2',
      unlocksWhen: {
        collectedVimKeys: ['h', 'j', 'k', 'l'],
      },
    },
  },

  npcs: [
    {
      id: 'test_npc',
      position: [6, 4],
      dialogue: [
        'Test dialogue line 1',
        'Test dialogue line 2',
      ],
      appearsWhen: {
        collectedVimKeys: ['h', 'j', 'k', 'l'],
      },
    },
  ],

  events: [
    {
      id: 'test_intro_event',
      trigger: 'onZoneEnter',
      actions: [
        { type: 'showMessage', content: 'Welcome to test zone' },
        { type: 'lockGate', target: 'gate' },
      ],
    },
    {
      id: 'test_unlock_event',
      trigger: 'onVimKeysCollected',
      conditions: {
        collectedKeys: ['h', 'j', 'k', 'l'],
      },
      actions: [
        { type: 'unlockGate', target: 'gate' },
        { type: 'showNPC', target: 'test_npc' },
      ],
    },
  ],

  cursorStartPosition: new Position(1, 1),
});

describe('Zone', () => {
  let testZone;

  // Helper function to convert zone-relative coordinates to absolute coordinates
  const getAbsolutePosition = (zoneX, zoneY) => {
    // Use the test zone dimensions (10x6) for position calculation
    const testMap = new DynamicZoneMap(10, 6);
    return testMap.zoneToAbsolute(zoneX, zoneY);
  };

  beforeEach(() => {
    const config = createTestZoneConfig();
    testZone = new Zone(config);
  });

  describe('Zone Creation', () => {
    test('should create a zone with correct properties', () => {
      expect(testZone.zoneId).toBe('test_zone');
      expect(testZone.name).toBe('Test Zone');
      expect(testZone.biome).toBe('Test biome');
      expect(testZone.puzzleTheme).toBe('Test puzzle theme');
    });

    test('should have correct skill focus', () => {
      expect(testZone.skillFocus).toEqual(['h', 'j', 'k', 'l']);
    });

    test('should have narration text', () => {
      expect(testZone.narration).toHaveLength(4);
      expect(testZone.narration[0]).toContain('Test narration line 1');
    });

    test('should create a DynamicZoneMap instance', () => {
      expect(testZone.gameMap).toBeInstanceOf(DynamicZoneMap);
      expect(testZone.gameMap._zoneWidth).toBe(10);
      expect(testZone.gameMap._zoneHeight).toBe(6);
    });
  });

  describe('VIM Keys', () => {
    test('should create VIM keys from configuration', () => {
      expect(testZone.vimKeys).toHaveLength(4);

      const keys = testZone.vimKeys.map((k) => k.key).sort();
      expect(keys).toEqual(['h', 'j', 'k', 'l']);
    });

    test('should place VIM keys at correct positions', () => {
      const hKey = testZone.vimKeys.find((k) => k.key === 'h');
      const jKey = testZone.vimKeys.find((k) => k.key === 'j');
      const kKey = testZone.vimKeys.find((k) => k.key === 'k');
      const lKey = testZone.vimKeys.find((k) => k.key === 'l');

      expect(hKey.position).toEqual(getAbsolutePosition(2, 2));
      expect(jKey.position).toEqual(getAbsolutePosition(4, 2));
      expect(kKey.position).toEqual(getAbsolutePosition(2, 4));
      expect(lKey.position).toEqual(getAbsolutePosition(4, 4));
    });

    test('should have descriptive key descriptions', () => {
      const hKey = testZone.vimKeys.find((k) => k.key === 'h');
      expect(hKey.description).toBeDefined();
      expect(typeof hKey.description).toBe('string');
    });

    test('should collect keys and remove them from available keys', () => {
      const hKey = testZone.vimKeys.find((k) => k.key === 'h');
      const initialCount = testZone.vimKeys.length;

      testZone.collectKey(hKey);

      expect(testZone.vimKeys).toHaveLength(initialCount - 1);
      expect(testZone.getCollectedKeysCount()).toBe(1);
      expect(testZone.getCollectedKeys().has('h')).toBe(true);
    });
  });

  describe('CollectibleKeys', () => {
    let zoneWithCollectibleKeys;

    beforeEach(() => {
      const configWithCollectibleKeys = {
        ...createTestZoneConfig(),
        tiles: {
          ...createTestZoneConfig().tiles,
          specialTiles: [
            ...createTestZoneConfig().tiles.specialTiles,
            { type: 'collectible_key', keyId: 'red_key', name: 'Red Key', color: '#FF0000', position: [1, 1] },
            { type: 'collectible_key', keyId: 'blue_key', name: 'Blue Key', color: '#0000FF', position: [3, 3] },
          ]
        }
      };
      zoneWithCollectibleKeys = new Zone(configWithCollectibleKeys);
    });

    test('should create CollectibleKeys from configuration', () => {
      expect(zoneWithCollectibleKeys.collectibleKeys).toHaveLength(2);

      const keyIds = zoneWithCollectibleKeys.collectibleKeys.map((k) => k.keyId).sort();
      expect(keyIds).toEqual(['blue_key', 'red_key']);
    });

    test('should place CollectibleKeys at correct positions', () => {
      const redKey = zoneWithCollectibleKeys.collectibleKeys.find((k) => k.keyId === 'red_key');
      const blueKey = zoneWithCollectibleKeys.collectibleKeys.find((k) => k.keyId === 'blue_key');

      expect(redKey.position).toEqual(getAbsolutePosition(1, 1));
      expect(blueKey.position).toEqual(getAbsolutePosition(3, 3));
    });

    test('should have correct key properties', () => {
      const redKey = zoneWithCollectibleKeys.collectibleKeys.find((k) => k.keyId === 'red_key');
      expect(redKey.name).toBe('Red Key');
      expect(redKey.color).toBe('#FF0000');
      expect(redKey.type).toBe('collectible_key');
    });

    test('should collect CollectibleKeys and remove them from available keys', () => {
      const redKey = zoneWithCollectibleKeys.collectibleKeys.find((k) => k.keyId === 'red_key');
      const initialCount = zoneWithCollectibleKeys.collectibleKeys.length;

      zoneWithCollectibleKeys.collectKey(redKey);

      expect(zoneWithCollectibleKeys.collectibleKeys).toHaveLength(initialCount - 1);
      expect(zoneWithCollectibleKeys.getCollectedCollectibleKeysCount()).toBe(1);
      expect(zoneWithCollectibleKeys.getCollectedCollectibleKeys().has('red_key')).toBe(true);
    });

    test('should handle mixed VIM keys and CollectibleKeys', () => {
      const redKey = zoneWithCollectibleKeys.collectibleKeys.find((k) => k.keyId === 'red_key');
      const vimKey = zoneWithCollectibleKeys.vimKeys.find((k) => k.key === 'h');

      // Collect both types
      zoneWithCollectibleKeys.collectKey(redKey);
      zoneWithCollectibleKeys.collectKey(vimKey);

      expect(zoneWithCollectibleKeys.getCollectedCollectibleKeysCount()).toBe(1);
      expect(zoneWithCollectibleKeys.getCollectedKeysCount()).toBe(1);
      expect(zoneWithCollectibleKeys.getCollectedCollectibleKeys().has('red_key')).toBe(true);
      expect(zoneWithCollectibleKeys.getCollectedKeys().has('h')).toBe(true);
    });
  });

  describe('Text Labels', () => {
    test('should create text labels from configuration', () => {
      expect(testZone.textLabels).toHaveLength(6);

      const textContents = testZone.textLabels.map((label) => label.text);
      expect(textContents).toContain('H');
      expect(textContents).toContain('e');
      expect(textContents).toContain('l');
      expect(textContents).toContain('o');
      expect(textContents).toContain('!');
    });

    test('should place text labels at correct positions', () => {
      const hLabel = testZone.textLabels.find((l) => l.text === 'H');
      const eLabel = testZone.textLabels.find((l) => l.text === 'e');

      expect(hLabel.position).toEqual(getAbsolutePosition(6, 2));
      expect(eLabel.position).toEqual(getAbsolutePosition(7, 2));
    });
  });

  describe('Gate', () => {
    test('should create a gate at correct position', () => {
      expect(testZone.gate).toBeInstanceOf(Gate);
      expect(testZone.gate.position).toEqual(getAbsolutePosition(8, 4));
    });

    test('should start with gate closed', () => {
      expect(testZone.gate.isOpen).toBe(false);
      expect(testZone.isComplete()).toBe(false);
    });

    test('should open gate when all keys are collected', () => {
      const keys = [...testZone.vimKeys];

      keys.forEach((key) => {
        testZone.collectKey(key);
      });

      expect(testZone.gate.isOpen).toBe(true);
      expect(testZone.isComplete()).toBe(true);
    });

    test('should not open gate until all keys are collected', () => {
      const keys = [...testZone.vimKeys];

      // Collect only 3 keys
      for (let i = 0; i < 3; i++) {
        testZone.collectKey(keys[i]);
      }

      expect(testZone.gate.isOpen).toBe(false);
      expect(testZone.isComplete()).toBe(false);
    });

    test('should open gate when CollectibleKey requirements are met', () => {
      const gateConfig = {
        ...createTestZoneConfig(),
        tiles: {
          ...createTestZoneConfig().tiles,
          specialTiles: [
            { type: 'collectible_key', keyId: 'master_key', name: 'Master Key', color: '#FFD700', position: [1, 1] },
          ],
          gate: {
            position: [8, 4],
            unlocksWhen: { requiredCollectibleKeys: ['master_key'] }
          }
        }
      };
      const zoneWithCollectibleGate = new Zone(gateConfig);

      expect(zoneWithCollectibleGate.gate.isOpen).toBe(false);

      const masterKey = zoneWithCollectibleGate.collectibleKeys.find(k => k.keyId === 'master_key');
      zoneWithCollectibleGate.collectKey(masterKey);

      expect(zoneWithCollectibleGate.gate.isOpen).toBe(true);
      expect(zoneWithCollectibleGate.isComplete()).toBe(true);
    });

    test('should open gate when both VIM key and CollectibleKey requirements are met', () => {
      const gateConfig = {
        ...createTestZoneConfig(),
        tiles: {
          ...createTestZoneConfig().tiles,
          specialTiles: [
            { type: 'vim_key', value: 'h', position: [2, 2] },
            { type: 'collectible_key', keyId: 'special_key', name: 'Special Key', color: '#FF00FF', position: [1, 1] },
          ],
          gate: {
            position: [8, 4],
            unlocksWhen: {
              collectedVimKeys: ['h'],
              requiredCollectibleKeys: ['special_key']
            }
          }
        }
      };
      const zoneWithMixedGate = new Zone(gateConfig);

      expect(zoneWithMixedGate.gate.isOpen).toBe(false);

      // Collect only VIM key - gate should remain closed
      const hKey = zoneWithMixedGate.vimKeys.find(k => k.key === 'h');
      zoneWithMixedGate.collectKey(hKey);
      expect(zoneWithMixedGate.gate.isOpen).toBe(false);

      // Collect CollectibleKey - gate should now open
      const specialKey = zoneWithMixedGate.collectibleKeys.find(k => k.keyId === 'special_key');
      zoneWithMixedGate.collectKey(specialKey);
      expect(zoneWithMixedGate.gate.isOpen).toBe(true);
      expect(zoneWithMixedGate.isComplete()).toBe(true);
    });
  });

  describe('NPCs', () => {
    test('should store NPC configuration', () => {
      expect(testZone.npcs).toHaveLength(1);
      expect(testZone.npcs[0].id).toBe('test_npc');
    });

    test('should not show NPCs initially', () => {
      const activeNPCs = testZone.getActiveNPCs();
      expect(activeNPCs).toHaveLength(0);
    });

    test('should show NPCs when conditions are met', () => {
      const keys = [...testZone.vimKeys];

      keys.forEach((key) => {
        testZone.collectKey(key);
      });

      const activeNPCs = testZone.getActiveNPCs();
      expect(activeNPCs).toHaveLength(1);
      expect(activeNPCs[0].id).toBe('test_npc');
    });

    test('should get NPC dialogue', () => {
      const dialogue = testZone.getNPCDialogue('test_npc');
      expect(dialogue).toHaveLength(2);
      expect(dialogue[0]).toContain('Test dialogue line 1');
    });

    test('should get NPC position', () => {
      const position = testZone.getNPCPosition('test_npc');
      expect(position).toEqual(getAbsolutePosition(6, 4));
    });

    test('should return null for non-existent NPC position', () => {
      const position = testZone.getNPCPosition('non_existent');
      expect(position).toBeNull();
    });

    test('should return null for NPC without position', () => {
      // Add an NPC without position to test
      testZone._npcs.push({ id: 'no_position_npc', dialogue: ['Hi'] });
      const position = testZone.getNPCPosition('no_position_npc');
      expect(position).toBeNull();
    });
  });

  describe('Events', () => {
    test('should store events configuration', () => {
      expect(testZone.events).toHaveLength(2);

      const introEvent = testZone.events.find((e) => e.id === 'test_intro_event');
      const unlockEvent = testZone.events.find((e) => e.id === 'test_unlock_event');

      expect(introEvent).toBeDefined();
      expect(unlockEvent).toBeDefined();
    });

    test('should have correct event triggers', () => {
      const introEvent = testZone.events.find((e) => e.id === 'test_intro_event');
      const unlockEvent = testZone.events.find((e) => e.id === 'test_unlock_event');

      expect(introEvent.trigger).toBe('onZoneEnter');
      expect(unlockEvent.trigger).toBe('onVimKeysCollected');
    });
  });

  describe('Cursor Start Position', () => {
    test('should provide cursor start position', () => {
      const startPosition = testZone.getCursorStartPosition();
      expect(startPosition).toEqual(getAbsolutePosition(1, 1)); // Test position
    });
  });

  describe('Zone State', () => {
    test('should track collected keys count', () => {
      expect(testZone.getCollectedKeysCount()).toBe(0);

      const hKey = testZone.vimKeys.find((k) => k.key === 'h');
      testZone.collectKey(hKey);

      expect(testZone.getCollectedKeysCount()).toBe(1);
    });

    test('should return copy of collected keys', () => {
      const hKey = testZone.vimKeys.find((k) => k.key === 'h');
      testZone.collectKey(hKey);

      const collectedKeys1 = testZone.getCollectedKeys();
      const collectedKeys2 = testZone.getCollectedKeys();

      expect(collectedKeys1).not.toBe(collectedKeys2); // Different objects
      expect(collectedKeys1).toEqual(collectedKeys2); // Same content
    });
  });

  describe('Zone Factory Pattern', () => {
    test('should create zone from configuration object', () => {
      const config = createTestZoneConfig();
      const zone = new Zone(config);

      expect(zone).toBeInstanceOf(Zone);
      expect(zone.zoneId).toBe('test_zone');
      expect(zone.name).toBe('Test Zone');
    });

    test('should create equivalent zones from same configuration', () => {
      const config1 = createTestZoneConfig();
      const config2 = createTestZoneConfig();

      const zone1 = new Zone(config1);
      const zone2 = new Zone(config2);

      expect(zone1.zoneId).toBe(zone2.zoneId);
      expect(zone1.name).toBe(zone2.name);
      expect(zone1.skillFocus).toEqual(zone2.skillFocus);
    });
  });

  describe('Zone Behavior Edge Cases', () => {
    test('should handle collecting the same key multiple times', () => {
      const hKey = testZone.vimKeys.find((k) => k.key === 'h');

      testZone.collectKey(hKey);
      const countAfterFirst = testZone.getCollectedKeysCount();

      // Try to collect same key again
      testZone.collectKey(hKey);
      const countAfterSecond = testZone.getCollectedKeysCount();

      expect(countAfterFirst).toBe(countAfterSecond); // Should not change
    });

    test('should handle zone completion state correctly', () => {
      expect(testZone.isComplete()).toBe(false);

      // Collect all keys
      const keys = [...testZone.vimKeys];
      keys.forEach((key) => {
        testZone.collectKey(key);
      });

      expect(testZone.isComplete()).toBe(true);
    });

    test('should provide immutable key collections', () => {
      const hKey = testZone.vimKeys.find((k) => k.key === 'h');
      testZone.collectKey(hKey);

      const collectedKeys = testZone.getCollectedKeys();
      const originalSize = collectedKeys.size;

      // Try to modify the returned set
      collectedKeys.add('x');

      // Original zone state should be unchanged
      expect(testZone.getCollectedKeys().size).toBe(originalSize);
    });
  });
});
