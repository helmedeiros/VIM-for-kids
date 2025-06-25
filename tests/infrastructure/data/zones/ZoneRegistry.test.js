import { ZoneRegistry } from '../../../../src/infrastructure/data/zones/ZoneRegistry.js';
import { Zone } from '../../../../src/domain/entities/Zone.js';

describe('ZoneRegistry', () => {
  describe('Zone Management', () => {
    test('should create zone by ID', () => {
      const zone = ZoneRegistry.createZone('zone_1');

      expect(zone).toBeInstanceOf(Zone);
      expect(zone.zoneId).toBe('zone_1');
      expect(zone.name).toBe('1. Blinking Grove');
    });

    test('should throw error for non-existent zone', () => {
      expect(() => {
        ZoneRegistry.createZone('zone_999');
      }).toThrow("Zone 'zone_999' not found in registry");
    });

    test('should get zone configuration', () => {
      const config = ZoneRegistry.getZoneConfig('zone_1');

      expect(config.zoneId).toBe('zone_1');
      expect(config.name).toBe('1. Blinking Grove');
      expect(config.skillFocus).toEqual(['h', 'j', 'k', 'l']);
    });

    test('should throw error for non-existent zone config', () => {
      expect(() => {
        ZoneRegistry.getZoneConfig('zone_999');
      }).toThrow("Zone 'zone_999' not found in registry");
    });
  });

  describe('Zone Discovery', () => {
    test('should get available zone IDs', () => {
      const zoneIds = ZoneRegistry.getAvailableZoneIds();

      expect(zoneIds).toContain('zone_1');
      expect(zoneIds).toHaveLength(1); // Only zone_1 for now
    });

    test('should check if zone exists', () => {
      expect(ZoneRegistry.hasZone('zone_1')).toBe(true);
      expect(ZoneRegistry.hasZone('zone_999')).toBe(false);
    });

    test('should get all zone information', () => {
      const zoneInfo = ZoneRegistry.getAllZoneInfo();

      expect(zoneInfo).toHaveLength(1);
      expect(zoneInfo[0]).toEqual({
        zoneId: 'zone_1',
        name: '1. Blinking Grove',
        biome: 'Forest clearing (bottom left)',
        skillFocus: ['h', 'j', 'k', 'l'],
        puzzleTheme: 'Basic movement, bump-to-talk',
      });
    });
  });

  describe('Error Handling & Edge Cases', () => {
    test('should handle null/undefined zone IDs gracefully', () => {
      expect(() => {
        ZoneRegistry.createZone(null);
      }).toThrow("Zone 'null' not found in registry");

      expect(() => {
        ZoneRegistry.createZone(undefined);
      }).toThrow("Zone 'undefined' not found in registry");
    });

    test('should handle empty string zone ID', () => {
      expect(() => {
        ZoneRegistry.createZone('');
      }).toThrow("Zone '' not found in registry");
    });

    test('should handle non-string zone IDs', () => {
      expect(() => {
        ZoneRegistry.createZone(123);
      }).toThrow("Zone '123' not found in registry");

      expect(() => {
        ZoneRegistry.createZone({});
      }).toThrow("Zone '[object Object]' not found in registry");
    });

    test('should check existence of various zone ID formats', () => {
      expect(ZoneRegistry.hasZone('zone_1')).toBe(true);
      expect(ZoneRegistry.hasZone('ZONE_1')).toBe(false);
      expect(ZoneRegistry.hasZone('zone_01')).toBe(false);
      expect(ZoneRegistry.hasZone('1')).toBe(false);
      expect(ZoneRegistry.hasZone(null)).toBe(false);
      expect(ZoneRegistry.hasZone(undefined)).toBe(false);
    });

    test('should handle config retrieval for invalid zones', () => {
      expect(() => {
        ZoneRegistry.getZoneConfig('invalid_zone');
      }).toThrow("Zone 'invalid_zone' not found in registry");

      expect(() => {
        ZoneRegistry.getZoneConfig(null);
      }).toThrow("Zone 'null' not found in registry");
    });
  });

  describe('Registry Structure', () => {
    test('should have consistent zone mapping', () => {
      const zones = ZoneRegistry.getZones();

      expect(zones).toBeInstanceOf(Map);
      expect(zones.size).toBe(1);
      expect(zones.has('zone_1')).toBe(true);
    });

    test('should get fresh zone map each time', () => {
      const zones1 = ZoneRegistry.getZones();
      const zones2 = ZoneRegistry.getZones();

      expect(zones1).not.toBe(zones2); // Different instances
      expect(zones1).toEqual(zones2); // Same content
    });

    test('should have zone map with proper factory references', () => {
      const zones = ZoneRegistry.getZones();
      const blinkingGroveFactory = zones.get('zone_1');

      expect(blinkingGroveFactory).toBeDefined();
      expect(typeof blinkingGroveFactory.create).toBe('function');
      expect(typeof blinkingGroveFactory.getConfig).toBe('function');
    });

    test('should maintain immutable zone list', () => {
      const zoneIds1 = ZoneRegistry.getAvailableZoneIds();
      const zoneIds2 = ZoneRegistry.getAvailableZoneIds();

      expect(zoneIds1).not.toBe(zoneIds2); // Different array instances
      expect(zoneIds1).toEqual(zoneIds2); // Same content

      // Modifying returned array shouldn't affect registry
      zoneIds1.push('modified_zone');
      expect(ZoneRegistry.getAvailableZoneIds()).not.toContain('modified_zone');
    });

    test('should maintain immutable zone info list', () => {
      const zoneInfo1 = ZoneRegistry.getAllZoneInfo();
      const zoneInfo2 = ZoneRegistry.getAllZoneInfo();

      expect(zoneInfo1).not.toBe(zoneInfo2); // Different array instances
      expect(zoneInfo1).toEqual(zoneInfo2); // Same content

      // Modifying returned array shouldn't affect registry
      zoneInfo1[0].name = 'Modified Name';
      expect(ZoneRegistry.getAllZoneInfo()[0].name).toBe('1. Blinking Grove');
    });
  });

  describe('Zone Creation Validation', () => {
    test('should create different zone instances for same ID', () => {
      const zone1 = ZoneRegistry.createZone('zone_1');
      const zone2 = ZoneRegistry.createZone('zone_1');

      expect(zone1).not.toBe(zone2); // Different instances
      expect(zone1.zoneId).toBe(zone2.zoneId); // Same configuration
      expect(zone1.name).toBe(zone2.name);
    });

    test('should create zones with correct factory behavior', () => {
      const zone = ZoneRegistry.createZone('zone_1');

      // Test that the zone has all expected functionality
      expect(zone.vimKeys).toBeDefined();
      expect(zone.textLabels).toBeDefined();
      expect(zone.gate).toBeDefined();
      expect(zone.npcs).toBeDefined();
      expect(zone.events).toBeDefined();
      expect(typeof zone.collectKey).toBe('function');
      expect(typeof zone.getActiveNPCs).toBe('function');
      expect(typeof zone.isComplete).toBe('function');
    });

    test('should get configuration without side effects', () => {
      const config1 = ZoneRegistry.getZoneConfig('zone_1');
      const config2 = ZoneRegistry.getZoneConfig('zone_1');

      expect(config1).toEqual(config2);

      // Modifying one config shouldn't affect the other
      config1.name = 'Modified Name';
      expect(config2.name).toBe('1. Blinking Grove');
    });
  });

  describe('Registry State Consistency', () => {
    test('should maintain consistent state across multiple operations', () => {
      const initialZoneIds = ZoneRegistry.getAvailableZoneIds();
      const initialZoneInfo = ZoneRegistry.getAllZoneInfo();

      // Perform multiple operations
      ZoneRegistry.createZone('zone_1');
      ZoneRegistry.getZoneConfig('zone_1');
      ZoneRegistry.hasZone('zone_1');

      // State should remain consistent
      expect(ZoneRegistry.getAvailableZoneIds()).toEqual(initialZoneIds);
      expect(ZoneRegistry.getAllZoneInfo()).toEqual(initialZoneInfo);
    });

    test('should handle concurrent zone creation requests', () => {
      const zones = [];

      // Simulate concurrent creation
      for (let i = 0; i < 5; i++) {
        zones.push(ZoneRegistry.createZone('zone_1'));
      }

      // All zones should be valid but different instances
      zones.forEach((zone, index) => {
        expect(zone).toBeInstanceOf(Zone);
        expect(zone.zoneId).toBe('zone_1');

        // Compare with other instances
        zones.forEach((otherZone, otherIndex) => {
          if (index !== otherIndex) {
            expect(zone).not.toBe(otherZone);
          }
        });
      });
    });
  });
});
