import { BlinkingGroveZone } from './BlinkingGroveZone.js';
import { MazeOfModesZone } from './MazeOfModesZone.js';
import { SwampOfWordsZone } from './SwampOfWordsZone.js';
import { DeleteCanyonZone } from './DeleteCanyonZone.js';
import { FieldOfInsertionZone } from './FieldOfInsertionZone.js';
import { CopyCircleZone } from './CopyCircleZone.js';
import { SearchSpringsZone } from './SearchSpringsZone.js';
import { CommandCavernZone } from './CommandCavernZone.js';
import { PlaygroundOfPracticeZone } from './PlaygroundOfPracticeZone.js';
import { SyntaxTempleZone } from './SyntaxTempleZone.js';

/**
 * Central registry for all zone factories
 * Makes it easy to access and manage the 10 zones in the adventure
 */
export class ZoneRegistry {
  static getZones() {
    return new Map([
      ['zone_1', BlinkingGroveZone],
      ['zone_2', MazeOfModesZone],
      ['zone_3', SwampOfWordsZone],
      ['zone_4', DeleteCanyonZone],
      ['zone_5', FieldOfInsertionZone],
      ['zone_6', CopyCircleZone],
      ['zone_7', SearchSpringsZone],
      ['zone_8', CommandCavernZone],
      ['zone_9', PlaygroundOfPracticeZone],
      ['zone_10', SyntaxTempleZone],
    ]);
  }

  /**
   * Create a zone instance by its ID
   * @param {string} zoneId - The zone identifier (e.g., 'zone_1')
   * @returns {Zone} The created zone instance
   */
  static createZone(zoneId) {
    const zones = this.getZones();
    const ZoneFactory = zones.get(zoneId);
    if (!ZoneFactory) {
      throw new Error(`Zone '${zoneId}' not found in registry`);
    }
    return ZoneFactory.create();
  }

  /**
   * Get zone configuration without creating an instance
   * @param {string} zoneId - The zone identifier (e.g., 'zone_1')
   * @returns {Object} The zone configuration object
   */
  static getZoneConfig(zoneId) {
    const zones = this.getZones();
    const ZoneFactory = zones.get(zoneId);
    if (!ZoneFactory) {
      throw new Error(`Zone '${zoneId}' not found in registry`);
    }
    return ZoneFactory.getConfig();
  }

  /**
   * Get list of all available zone IDs
   * @returns {string[]} Array of zone IDs
   */
  static getAvailableZoneIds() {
    const zones = this.getZones();
    return Array.from(zones.keys());
  }

  /**
   * Check if a zone exists in the registry
   * @param {string} zoneId - The zone identifier to check
   * @returns {boolean} True if zone exists
   */
  static hasZone(zoneId) {
    const zones = this.getZones();
    return zones.has(zoneId);
  }

  /**
   * Get information about all zones
   * @returns {Object[]} Array of zone info objects
   */
  static getAllZoneInfo() {
    const zones = this.getZones();
    return Array.from(zones.entries()).map(([zoneId, ZoneFactory]) => {
      const config = ZoneFactory.getConfig();
      return {
        zoneId,
        name: config.name,
        biome: config.biome,
        skillFocus: config.skillFocus,
        puzzleTheme: config.puzzleTheme,
      };
    });
  }
}
