/* eslint-env node, jest */
import { TextlandExplorationZone } from '../../../../src/infrastructure/data/zones/TextlandExplorationZone.js';

describe('TextlandExplorationZone', () => {
  let zoneInstance;
  let zoneConfig;

  beforeEach(() => {
    zoneInstance = TextlandExplorationZone.create();
    zoneConfig = TextlandExplorationZone.getConfig();
  });

  describe('create', () => {
    it('should create zone configuration', () => {
      expect(zoneConfig).toBeDefined();
      expect(zoneConfig.zoneId).toBe('textland_exploration');
      expect(zoneConfig.name).toBe('Textland Exploration Area');
    });

    it('should have correct basic properties', () => {
      expect(zoneConfig.biome).toBe('Open plains with scattered elements');
      expect(zoneConfig.skillFocus).toEqual(['h', 'j', 'k', 'l']);
      expect(zoneConfig.puzzleTheme).toBe('Free exploration and movement practice');
    });

    it('should have narration text', () => {
      expect(zoneConfig.narration).toHaveLength(4);
      expect(zoneConfig.narration[0]).toBe('Welcome to the Textland!');
      expect(zoneConfig.narration[1]).toContain('free exploration area');
      expect(zoneConfig.narration[3]).toContain('enjoy exploring');
    });
  });

  describe('zone instance', () => {
    it('should have game map', () => {
      expect(zoneInstance.gameMap).toBeDefined();
      expect(zoneInstance.gameMap.width).toBeGreaterThan(12); // DynamicZoneMap creates larger maps
      expect(zoneInstance.gameMap.height).toBeGreaterThan(8);
    });

    it('should have VIM keys in correct positions', () => {
      const vimKeys = zoneInstance.vimKeys;

      expect(vimKeys).toHaveLength(4);

      const keys = vimKeys.map((key) => key.key);
      expect(keys).toContain('h');
      expect(keys).toContain('j');
      expect(keys).toContain('k');
      expect(keys).toContain('l');
    });

    it('should have text labels', () => {
      const textLabels = zoneInstance.textLabels;

      expect(textLabels).toHaveLength(2);
      expect(textLabels[0].text).toBe('Textland Exploration');
      expect(textLabels[1].text).toBe('Practice area - explore freely!');
    });

    it('should have no gate (undefined)', () => {
      expect(zoneInstance.gate).toBeUndefined();
    });

    it('should have cursor start position', () => {
      const startPosition = zoneInstance.getCursorStartPosition();
      expect(startPosition).toBeDefined();
      // Position will be offset by DynamicZoneMap centering
      expect(startPosition.x).toBeGreaterThan(3);
      expect(startPosition.y).toBeGreaterThan(3);
    });
  });

  describe('zone features', () => {
    it('should have no NPCs for simple exploration', () => {
      expect(zoneConfig.npcs).toEqual([]);
    });

    it('should have simple events', () => {
      expect(zoneConfig.events).toHaveLength(1);
      expect(zoneConfig.events[0].trigger).toBe('allKeysCollected');
      expect(zoneConfig.events[0].action).toBe('showMessage');
      expect(zoneConfig.events[0].message).toContain('Great! You collected all the keys');
    });
  });
});
