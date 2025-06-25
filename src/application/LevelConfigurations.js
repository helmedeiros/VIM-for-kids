/**
 * Level Configuration System
 * Defines the structure and progression for multi-zone levels
 */

export const LEVEL_CONFIGURATIONS = {
  level_1: {
    id: 'level_1',
    name: 'VIM Basics',
    zones: ['zone_1'], // Only zone_1 exists currently
    description: 'Learn fundamental VIM movement commands in the Blinking Grove',
  },

  // Future levels (zones 2-10 need to be implemented)
  level_2: {
    id: 'level_2',
    name: 'Text Manipulation',
    zones: ['zone_2', 'zone_3'],
    description: 'Master VIM modes and word navigation',
  },

  level_3: {
    id: 'level_3',
    name: 'Advanced Movement',
    zones: ['zone_4', 'zone_5', 'zone_6'],
    description: 'Navigate efficiently with advanced movement commands',
  },

  level_4: {
    id: 'level_4',
    name: 'Text Operations',
    zones: ['zone_7', 'zone_8'],
    description: 'Master deletion, copying, and pasting operations',
  },

  level_5: {
    id: 'level_5',
    name: 'Search & Command',
    zones: ['zone_9', 'zone_10'],
    description: 'Find, search, and command like a VIM master',
  },
};

/**
 * Get level configuration by ID
 * @param {string} levelId - The level identifier
 * @returns {Object} Level configuration object
 * @throws {Error} If level not found
 */
export function getLevelConfiguration(levelId) {
  const config = LEVEL_CONFIGURATIONS[levelId];
  if (!config) {
    throw new Error(`Level configuration '${levelId}' not found`);
  }
  return config;
}

/**
 * Get all available level IDs
 * @returns {string[]} Array of level IDs
 */
export function getAvailableLevels() {
  return Object.keys(LEVEL_CONFIGURATIONS);
}

/**
 * Get the first level configuration (for game start)
 * @returns {Object} First level configuration
 */
export function getFirstLevel() {
  return LEVEL_CONFIGURATIONS.level_1;
}

/**
 * Get the next level configuration after completing current level
 * @param {string} currentLevelId - Current level ID
 * @returns {Object|null} Next level configuration or null if no more levels
 */
export function getNextLevel(currentLevelId) {
  const levels = getAvailableLevels();
  const currentIndex = levels.indexOf(currentLevelId);

  if (currentIndex === -1 || currentIndex === levels.length - 1) {
    return null; // No next level
  }

  const nextLevelId = levels[currentIndex + 1];
  return LEVEL_CONFIGURATIONS[nextLevelId];
}

/**
 * Validate level configuration structure
 * @param {Object} config - Level configuration to validate
 * @returns {boolean} True if valid
 * @throws {Error} If configuration is invalid
 */
export function validateLevelConfiguration(config) {
  if (!config.id || typeof config.id !== 'string') {
    throw new Error('Level configuration must have a valid id');
  }

  if (!config.name || typeof config.name !== 'string') {
    throw new Error('Level configuration must have a valid name');
  }

  if (!config.zones || !Array.isArray(config.zones) || config.zones.length === 0) {
    throw new Error('Level configuration must have at least one zone');
  }

  if (!config.description || typeof config.description !== 'string') {
    throw new Error('Level configuration must have a valid description');
  }

  return true;
}
