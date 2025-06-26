import { MazeOfModesZone } from '../../../../src/infrastructure/data/zones/MazeOfModesZone.js';
import { Zone } from '../../../../src/domain/entities/Zone.js';

describe('MazeOfModesZone', () => {
  describe('create', () => {
    it('should create a valid zone instance', () => {
      const zone = MazeOfModesZone.create();

      expect(zone).toBeInstanceOf(Zone);
      expect(zone.zoneId).toBe('zone_2');
      expect(zone.name).toBe('2. Maze of Modes');
      expect(zone.biome).toBe('Stone labyrinth');
      expect(zone.puzzleTheme).toBe('Switching between Normal, Insert, Visual');
    });

    it('should have correct skill focus', () => {
      const zone = MazeOfModesZone.create();

      expect(zone.skillFocus).toContain('i');
      expect(zone.skillFocus).toContain('ESC');
      expect(zone.skillFocus).toContain(':');
    });

    it('should have VIM keys', () => {
      const zone = MazeOfModesZone.create();

      expect(zone.vimKeys).toBeDefined();
      expect(Array.isArray(zone.vimKeys)).toBe(true);
      expect(zone.vimKeys.length).toBeGreaterThan(0);
    });

    it('should have a game map', () => {
      const zone = MazeOfModesZone.create();

      expect(zone.gameMap).toBeDefined();
      expect(zone.gameMap.width).toBeGreaterThan(0);
      expect(zone.gameMap.height).toBeGreaterThan(0);
    });

    it('should have a gate', () => {
      const zone = MazeOfModesZone.create();

      expect(zone.gate).toBeDefined();
      expect(zone.gate.isOpen).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return zone configuration', () => {
      const config = MazeOfModesZone.getConfig();

      expect(config.zoneId).toBe('zone_2');
      expect(config.name).toBe('2. Maze of Modes');
      expect(config.biome).toBe('Stone labyrinth');
      expect(config.puzzleTheme).toBe('Switching between Normal, Insert, Visual');
    });

    it('should have skill focus', () => {
      const config = MazeOfModesZone.getConfig();

      expect(config.skillFocus).toBeDefined();
      expect(Array.isArray(config.skillFocus)).toBe(true);
      expect(config.skillFocus.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should not throw errors during creation', () => {
      expect(() => MazeOfModesZone.create()).not.toThrow();
      expect(() => MazeOfModesZone.getConfig()).not.toThrow();
    });
  });
});
