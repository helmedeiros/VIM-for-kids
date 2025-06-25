import { ZoneProvider } from '../../../src/ports/data/ZoneProvider.js';

describe('ZoneProvider Port', () => {
  describe('Interface Contract', () => {
    test('should throw error when createZone is not implemented', () => {
      const provider = new ZoneProvider();

      expect(() => {
        provider.createZone('zone_1');
      }).toThrow('ZoneProvider.createZone must be implemented');
    });

    test('should throw error when getZoneConfig is not implemented', () => {
      const provider = new ZoneProvider();

      expect(() => {
        provider.getZoneConfig('zone_1');
      }).toThrow('ZoneProvider.getZoneConfig must be implemented');
    });

    test('should throw error when getAvailableZoneIds is not implemented', () => {
      const provider = new ZoneProvider();

      expect(() => {
        provider.getAvailableZoneIds();
      }).toThrow('ZoneProvider.getAvailableZoneIds must be implemented');
    });

    test('should throw error when hasZone is not implemented', () => {
      const provider = new ZoneProvider();

      expect(() => {
        provider.hasZone('zone_1');
      }).toThrow('ZoneProvider.hasZone must be implemented');
    });

    test('should throw error when getAllZoneInfo is not implemented', () => {
      const provider = new ZoneProvider();

      expect(() => {
        provider.getAllZoneInfo();
      }).toThrow('ZoneProvider.getAllZoneInfo must be implemented');
    });
  });

  describe('Port Interface Design', () => {
    test('should be a class that can be extended', () => {
      expect(ZoneProvider).toBeInstanceOf(Function);
      expect(ZoneProvider.prototype).toBeDefined();
    });

    test('should have all required methods defined', () => {
      const provider = new ZoneProvider();

      expect(typeof provider.createZone).toBe('function');
      expect(typeof provider.getZoneConfig).toBe('function');
      expect(typeof provider.getAvailableZoneIds).toBe('function');
      expect(typeof provider.hasZone).toBe('function');
      expect(typeof provider.getAllZoneInfo).toBe('function');
    });
  });
});
