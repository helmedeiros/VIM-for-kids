import { SyntaxTempleZone } from '../../../../src/infrastructure/data/zones/SyntaxTempleZone.js';
import { Zone } from '../../../../src/domain/entities/Zone.js';

describe('SyntaxTempleZone', () => {
  describe('create', () => {
    it('should create a valid zone instance', () => {
      const zone = SyntaxTempleZone.create();

      expect(zone).toBeInstanceOf(Zone);
      expect(zone.zoneId).toBeTruthy();
      expect(zone.name).toBeTruthy();
      expect(zone.biome).toBeTruthy();
      expect(zone.puzzleTheme).toBeTruthy();
    });

    it('should have skill focus', () => {
      const zone = SyntaxTempleZone.create();

      expect(zone.skillFocus).toBeDefined();
      expect(Array.isArray(zone.skillFocus)).toBe(true);
    });

    it('should have VIM keys', () => {
      const zone = SyntaxTempleZone.create();

      expect(zone.vimKeys).toBeDefined();
      expect(Array.isArray(zone.vimKeys)).toBe(true);
    });

    it('should have a game map', () => {
      const zone = SyntaxTempleZone.create();

      expect(zone.gameMap).toBeDefined();
      expect(zone.gameMap.width).toBeGreaterThan(0);
      expect(zone.gameMap.height).toBeGreaterThan(0);
    });

    it('should have a gate', () => {
      const zone = SyntaxTempleZone.create();

      expect(zone.gate).toBeDefined();
    });
  });

  describe('getConfig', () => {
    it('should return zone configuration', () => {
      const config = SyntaxTempleZone.getConfig();

      expect(config.zoneId).toBeTruthy();
      expect(config.name).toBeTruthy();
      expect(config.biome).toBeTruthy();
      expect(config.puzzleTheme).toBeTruthy();
    });

    it('should have skill focus', () => {
      const config = SyntaxTempleZone.getConfig();

      expect(config.skillFocus).toBeDefined();
      expect(Array.isArray(config.skillFocus)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should not throw errors during creation', () => {
      expect(() => SyntaxTempleZone.create()).not.toThrow();
      expect(() => SyntaxTempleZone.getConfig()).not.toThrow();
    });
  });
});
