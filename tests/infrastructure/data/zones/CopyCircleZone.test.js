import { CopyCircleZone } from '../../../../src/infrastructure/data/zones/CopyCircleZone.js';
import { Zone } from '../../../../src/domain/entities/Zone.js';

describe('CopyCircleZone', () => {
  describe('create', () => {
    it('should create a valid zone instance', () => {
      const zone = CopyCircleZone.create();

      expect(zone).toBeInstanceOf(Zone);
      expect(zone.zoneId).toBeTruthy();
      expect(zone.name).toBeTruthy();
      expect(zone.biome).toBeTruthy();
      expect(zone.puzzleTheme).toBeTruthy();
    });

    it('should have skill focus', () => {
      const zone = CopyCircleZone.create();

      expect(zone.skillFocus).toBeDefined();
      expect(Array.isArray(zone.skillFocus)).toBe(true);
    });

    it('should have VIM keys', () => {
      const zone = CopyCircleZone.create();

      expect(zone.vimKeys).toBeDefined();
      expect(Array.isArray(zone.vimKeys)).toBe(true);
    });

    it('should have a game map', () => {
      const zone = CopyCircleZone.create();

      expect(zone.gameMap).toBeDefined();
      expect(zone.gameMap.width).toBeGreaterThan(0);
      expect(zone.gameMap.height).toBeGreaterThan(0);
    });

    it('should have a gate', () => {
      const zone = CopyCircleZone.create();

      expect(zone.gate).toBeDefined();
    });
  });

  describe('getConfig', () => {
    it('should return zone configuration', () => {
      const config = CopyCircleZone.getConfig();

      expect(config.zoneId).toBeTruthy();
      expect(config.name).toBeTruthy();
      expect(config.biome).toBeTruthy();
      expect(config.puzzleTheme).toBeTruthy();
    });

    it('should have skill focus', () => {
      const config = CopyCircleZone.getConfig();

      expect(config.skillFocus).toBeDefined();
      expect(Array.isArray(config.skillFocus)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should not throw errors during creation', () => {
      expect(() => CopyCircleZone.create()).not.toThrow();
      expect(() => CopyCircleZone.getConfig()).not.toThrow();
    });
  });
});
