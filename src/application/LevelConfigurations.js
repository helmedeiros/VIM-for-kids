/**
 * Level Configuration System
 * Defines the structure and progression for multi-zone levels
 */

export const LEVEL_CONFIGURATIONS = {
  level_1: {
    id: 'level_1',
    name: 'VIM Basics',
    zones: ['zone_1'], // Blinking Grove - Basic movement
    description: 'Learn fundamental VIM movement commands in the Blinking Grove',
  },

  // All zones are now implemented and available
  level_2: {
    id: 'level_2',
    name: 'Text Manipulation',
    zones: ['zone_2', 'zone_3'], // Maze of Modes, Swamp of Words
    description: 'Master VIM modes and word navigation',
  },

  level_3: {
    id: 'level_3',
    name: 'Advanced Movement',
    zones: ['zone_4', 'zone_5', 'zone_6'], // Delete Canyon, Field of Insertion, Copy Circle
    description: 'Navigate efficiently with advanced movement commands',
  },

  level_4: {
    id: 'level_4',
    name: 'Text Operations',
    zones: ['zone_7', 'zone_8'], // Search Springs, Command Cavern
    description: 'Master deletion, copying, and pasting operations',
  },

  level_5: {
    id: 'level_5',
    name: 'Search & Command',
    zones: ['zone_9', 'zone_10'], // Playground of Practice, Syntax Temple
    description: 'Find, search, and command like a VIM master',
  },
};

/**
 * Get level configuration by ID
 * @param {string} levelId - Level identifier
 * @returns {Object} Level configuration
 */
export function getLevelConfiguration(levelId) {
  const config = LEVEL_CONFIGURATIONS[levelId];
  if (!config) {
    throw new Error(`Level configuration not found: ${levelId}`);
  }
  return config;
}

/**
 * Get all available level IDs in order
 * @returns {string[]} Array of level IDs
 */
export function getAvailableLevelIds() {
  return Object.keys(LEVEL_CONFIGURATIONS).sort();
}

/**
 * Get all level configurations as an array
 * @returns {Object[]} Array of level configurations
 */
export function getAllLevelConfigurations() {
  return getAvailableLevelIds().map((id) => LEVEL_CONFIGURATIONS[id]);
}

/**
 * Get the first level configuration (for game start)
 * @returns {Object} First level configuration
 */
export function getFirstLevel() {
  const firstLevelId = getAvailableLevelIds()[0];
  return LEVEL_CONFIGURATIONS[firstLevelId];
}

/**
 * Get the first level ID
 * @returns {string} First level ID
 */
export function getFirstLevelId() {
  return getAvailableLevelIds()[0];
}

/**
 * Get next level configuration
 * @param {string} currentLevelId - Current level ID
 * @returns {Object|null} Next level configuration or null if at last level or invalid level
 */
export function getNextLevel(currentLevelId) {
  const levelIds = getAvailableLevelIds();
  const currentIndex = levelIds.indexOf(currentLevelId);

  if (currentIndex === -1) {
    return null; // Invalid level ID
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex >= levelIds.length) {
    return null; // No next level
  }

  return LEVEL_CONFIGURATIONS[levelIds[nextIndex]];
}

/**
 * Check if a level exists
 * @param {string} levelId - Level ID to check
 * @returns {boolean} True if level exists
 */
export function hasLevel(levelId) {
  return Object.prototype.hasOwnProperty.call(LEVEL_CONFIGURATIONS, levelId);
}

/**
 * Get total number of levels
 * @returns {number} Total level count
 */
export function getTotalLevelCount() {
  return getAvailableLevelIds().length;
}

/**
 * Validate level configuration structure
 * @param {Object} config - Level configuration to validate
 * @returns {boolean} True if valid
 * @throws {Error} If configuration is invalid
 */
export function validateLevelConfiguration(config) {
  if (!config || typeof config.id !== 'string' || !config.id.trim()) {
    throw new Error('Level configuration must have a valid id');
  }

  if (!config || typeof config.name !== 'string' || !config.name.trim()) {
    throw new Error('Level configuration must have a valid name');
  }

  if (!config || !Array.isArray(config.zones) || config.zones.length === 0) {
    throw new Error('Level configuration must have at least one zone');
  }

  if (!config || typeof config.description !== 'string' || !config.description.trim()) {
    throw new Error('Level configuration must have a valid description');
  }

  return true;
}
