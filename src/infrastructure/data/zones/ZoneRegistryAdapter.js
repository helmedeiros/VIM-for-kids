import { ZoneProvider } from '../../../ports/data/ZoneProvider.js';
import { ZoneRegistry } from './ZoneRegistry.js';

/**
 * Infrastructure adapter that implements ZoneProvider port
 * This allows the application layer to access zones through the port interface
 */
export class ZoneRegistryAdapter extends ZoneProvider {
  /**
   * Create a zone instance by its ID
   * @param {string} zoneId - The zone identifier (e.g., 'zone_1')
   * @returns {Zone} The created zone instance
   */
  createZone(zoneId) {
    return ZoneRegistry.createZone(zoneId);
  }

  /**
   * Get zone configuration without creating an instance
   * @param {string} zoneId - The zone identifier (e.g., 'zone_1')
   * @returns {Object} The zone configuration object
   */
  getZoneConfig(zoneId) {
    return ZoneRegistry.getZoneConfig(zoneId);
  }

  /**
   * Get list of all available zone IDs
   * @returns {string[]} Array of zone IDs
   */
  getAvailableZoneIds() {
    return ZoneRegistry.getAvailableZoneIds();
  }

  /**
   * Check if a zone exists
   * @param {string} zoneId - The zone identifier to check
   * @returns {boolean} True if zone exists
   */
  hasZone(zoneId) {
    return ZoneRegistry.hasZone(zoneId);
  }

  /**
   * Get information about all zones
   * @returns {Object[]} Array of zone info objects
   */
  getAllZoneInfo() {
    return ZoneRegistry.getAllZoneInfo();
  }
}
