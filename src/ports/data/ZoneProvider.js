/**
 * Port interface for zone data management
 * This allows the application layer to access zones without depending on infrastructure
 */
export class ZoneProvider {
  /**
   * Create a zone instance by its ID
   * @param {string} zoneId - The zone identifier (e.g., 'zone_1')
   * @returns {Zone} The created zone instance
   */
  createZone(zoneId) {
    // eslint-disable-line no-unused-vars
    throw new Error('ZoneProvider.createZone must be implemented');
  }

  /**
   * Get zone configuration without creating an instance
   * @param {string} zoneId - The zone identifier (e.g., 'zone_1')
   * @returns {Object} The zone configuration object
   */
  getZoneConfig(zoneId) {
    // eslint-disable-line no-unused-vars
    throw new Error('ZoneProvider.getZoneConfig must be implemented');
  }

  /**
   * Get list of all available zone IDs
   * @returns {string[]} Array of zone IDs
   */
  getAvailableZoneIds() {
    throw new Error('ZoneProvider.getAvailableZoneIds must be implemented');
  }

  /**
   * Check if a zone exists
   * @param {string} zoneId - The zone identifier to check
   * @returns {boolean} True if zone exists
   */
  hasZone(zoneId) {
    // eslint-disable-line no-unused-vars
    throw new Error('ZoneProvider.hasZone must be implemented');
  }

  /**
   * Get information about all zones
   * @returns {Object[]} Array of zone info objects
   */
  getAllZoneInfo() {
    throw new Error('ZoneProvider.getAllZoneInfo must be implemented');
  }
}
