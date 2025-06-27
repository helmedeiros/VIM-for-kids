/**
 * Level Service - Provides level management functionality
 * Uses Game entities as the source of truth for level configurations
 * Replaces the old LevelConfigurations system
 */
export class LevelService {
  constructor(gameRegistry) {
    this._gameRegistry = gameRegistry;
  }

  /**
   * Get level configuration for a specific game
   * @param {string} gameId - Game identifier
   * @param {string} levelId - Level identifier
   * @returns {Object} Level configuration
   * @throws {Error} If game or level not found
   */
  getLevelConfiguration(gameId, levelId) {
    const game = this._gameRegistry.getGame(gameId);
    return game.getLevelConfiguration(levelId);
  }

  /**
   * Get all level configurations for a game
   * @param {string} gameId - Game identifier
   * @returns {Object[]} Array of level configurations
   */
  getAllLevelConfigurations(gameId) {
    const game = this._gameRegistry.getGame(gameId);
    return game.getAllLevelConfigurations();
  }

  /**
   * Get the first level for a game
   * @param {string} gameId - Game identifier
   * @returns {Object|null} First level configuration
   */
  getFirstLevel(gameId) {
    const game = this._gameRegistry.getGame(gameId);
    return game.getFirstLevel();
  }

  /**
   * Get the first level ID for a game
   * @param {string} gameId - Game identifier
   * @returns {string|null} First level ID
   */
  getFirstLevelId(gameId) {
    const firstLevel = this.getFirstLevel(gameId);
    return firstLevel ? firstLevel.id : null;
  }

  /**
   * Get next level configuration
   * @param {string} gameId - Game identifier
   * @param {string} currentLevelId - Current level ID
   * @returns {Object|null} Next level configuration or null if at last level
   */
  getNextLevel(gameId, currentLevelId) {
    const game = this._gameRegistry.getGame(gameId);
    return game.getNextLevel(currentLevelId);
  }

  /**
   * Check if a level exists in a game
   * @param {string} gameId - Game identifier
   * @param {string} levelId - Level ID to check
   * @returns {boolean} True if level exists
   */
  hasLevel(gameId, levelId) {
    try {
      const game = this._gameRegistry.getGame(gameId);
      return game.supportsLevel(levelId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get total number of levels for a game
   * @param {string} gameId - Game identifier
   * @returns {number} Total level count
   */
  getTotalLevelCount(gameId) {
    const game = this._gameRegistry.getGame(gameId);
    return game.getTotalLevelCount();
  }

  /**
   * Get zones for a specific level in a game
   * @param {string} gameId - Game identifier
   * @param {string} levelId - Level identifier
   * @returns {string[]} Array of zone IDs
   */
  getLevelZones(gameId, levelId) {
    const game = this._gameRegistry.getGame(gameId);
    return game.getLevelZones(levelId);
  }

  /**
   * Check if a level contains a specific zone
   * @param {string} gameId - Game identifier
   * @param {string} levelId - Level identifier
   * @param {string} zoneId - Zone identifier
   * @returns {boolean} True if level contains the zone
   */
  levelHasZone(gameId, levelId, zoneId) {
    const game = this._gameRegistry.getGame(gameId);
    return game.levelHasZone(levelId, zoneId);
  }

  /**
   * Get all available level IDs for a game in order
   * @param {string} gameId - Game identifier
   * @returns {string[]} Array of level IDs
   */
  getAvailableLevelIds(gameId) {
    const game = this._gameRegistry.getGame(gameId);
    return game.getSupportedLevels();
  }

  /**
   * Validate level configuration structure
   * @param {Object} config - Level configuration to validate
   * @returns {boolean} True if valid
   * @throws {Error} If configuration is invalid
   */
  validateLevelConfiguration(config) {
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

  /**
   * Get default level for a game (convenience method)
   * @param {string} gameId - Game identifier
   * @returns {string|null} Default level ID
   */
  getDefaultLevel(gameId) {
    const game = this._gameRegistry.getGame(gameId);
    return game.getDefaultLevel();
  }
}
