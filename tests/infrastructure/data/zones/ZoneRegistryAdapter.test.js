import { ZoneRegistryAdapter } from '../../../../src/infrastructure/data/zones/ZoneRegistryAdapter.js';
import { ZoneProvider } from '../../../../src/ports/data/ZoneProvider.js';
import { Zone } from '../../../../src/domain/entities/Zone.js';

describe('ZoneRegistryAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new ZoneRegistryAdapter();
  });

  describe('Port Implementation', () => {
    test('should extend ZoneProvider port', () => {
      expect(adapter).toBeInstanceOf(ZoneProvider);
    });

    test('should implement all ZoneProvider methods', () => {
      expect(typeof adapter.createZone).toBe('function');
      expect(typeof adapter.getZoneConfig).toBe('function');
      expect(typeof adapter.getAvailableZoneIds).toBe('function');
      expect(typeof adapter.hasZone).toBe('function');
      expect(typeof adapter.getAllZoneInfo).toBe('function');
    });
  });

  describe('Zone Creation', () => {
    test('should create zone instance through adapter', () => {
      const zone = adapter.createZone('zone_1');

      expect(zone).toBeInstanceOf(Zone);
      expect(zone.zoneId).toBe('zone_1');
      expect(zone.name).toBe('1. Blinking Grove');
    });

    test('should throw error for non-existent zone', () => {
      expect(() => {
        adapter.createZone('zone_999');
      }).toThrow("Zone 'zone_999' not found in registry");
    });
  });

  describe('Zone Configuration', () => {
    test('should get zone configuration through adapter', () => {
      const config = adapter.getZoneConfig('zone_1');

      expect(config.zoneId).toBe('zone_1');
      expect(config.name).toBe('1. Blinking Grove');
      expect(config.skillFocus).toEqual(['h', 'j', 'k', 'l']);
    });

    test('should throw error for non-existent zone config', () => {
      expect(() => {
        adapter.getZoneConfig('zone_999');
      }).toThrow("Zone 'zone_999' not found in registry");
    });
  });

  describe('Zone Discovery', () => {
    test('should get available zone IDs through adapter', () => {
      const zoneIds = adapter.getAvailableZoneIds();

      expect(zoneIds).toContain('zone_1');
      expect(zoneIds).toHaveLength(10);
    });

    test('should check zone existence through adapter', () => {
      expect(adapter.hasZone('zone_1')).toBe(true);
      expect(adapter.hasZone('zone_999')).toBe(false);
    });

    test('should get all zone information through adapter', () => {
      const zoneInfo = adapter.getAllZoneInfo();

      expect(zoneInfo).toHaveLength(10);
      expect(zoneInfo[0]).toEqual({
        zoneId: 'zone_1',
        name: '1. Blinking Grove',
        biome: 'Forest clearing (bottom left)',
        skillFocus: ['h', 'j', 'k', 'l'],
        puzzleTheme: 'Basic movement, bump-to-talk',
      });
      expect(zoneInfo[9]).toEqual({
        zoneId: 'zone_10',
        name: '10. The Syntax Temple',
        biome: 'Coastal ruins, golden gates',
        skillFocus: ['all_vim_skills'],
        puzzleTheme: 'Apply all skills to save Textland',
      });
    });
  });

  describe('Adapter Behavior', () => {
    test('should delegate to ZoneRegistry correctly', () => {
      // Test that adapter behaves identically to direct ZoneRegistry usage
      const zoneFromAdapter = adapter.createZone('zone_1');
      const configFromAdapter = adapter.getZoneConfig('zone_1');

      expect(zoneFromAdapter.zoneId).toBe(configFromAdapter.zoneId);
      expect(zoneFromAdapter.name).toBe(configFromAdapter.name);
      expect(zoneFromAdapter.skillFocus).toEqual(configFromAdapter.skillFocus);
    });

    test('should maintain consistency across multiple calls', () => {
      const zone1 = adapter.createZone('zone_1');
      const zone2 = adapter.createZone('zone_1');

      expect(zone1).not.toBe(zone2); // Different instances
      expect(zone1.zoneId).toBe(zone2.zoneId); // Same configuration
      expect(zone1.name).toBe(zone2.name);
    });

    test('should handle error scenarios properly', () => {
      expect(() => adapter.createZone(null)).toThrow();
      expect(() => adapter.createZone(undefined)).toThrow();
      expect(() => adapter.createZone('')).toThrow();
      expect(() => adapter.getZoneConfig(null)).toThrow();
      expect(adapter.hasZone(null)).toBe(false);
      expect(adapter.hasZone(undefined)).toBe(false);
    });
  });

  describe('Architecture Compliance', () => {
    test('should not expose internal ZoneRegistry implementation', () => {
      // The adapter should not leak internal implementation details
      expect(adapter.getZones).toBeUndefined();
      expect(adapter._registry).toBeUndefined();
    });

    test('should provide clean port interface', () => {
      // All methods should be available and functional
      const methods = [
        'createZone',
        'getZoneConfig',
        'getAvailableZoneIds',
        'hasZone',
        'getAllZoneInfo',
      ];

      methods.forEach((method) => {
        expect(typeof adapter[method]).toBe('function');
      });
    });
  });
});
