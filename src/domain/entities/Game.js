/**
 * Domain entity representing a complete game
 * Unified entity that serves as both descriptor and definition
 * Follows Domain-Driven Design principles with rich behavior
 */
export class Game {
  constructor(config) {
    if (!config) {
      throw new Error('Game requires configuration object');
    }

    // Core game properties (always required)
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.gameType = config.gameType;

    // Extended game configuration (optional with defaults)
    this.defaultLevel = config.defaultLevel || null;
    this.supportedLevels = config.supportedLevels || [];
    this.levels = config.levels || {};
    this.features = config.features || {};
    this.ui = config.ui || {};
    this.cutscenes = config.cutscenes || {};
    this.persistence = config.persistence || {};
    this.factory = config.factory || null;

    // Validation
    this._validate();
  }

  /**
   * Validate the game configuration
   * @private
   */
  _validate() {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('Game requires a valid id');
    }
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Game requires a valid name');
    }
    if (!this.description || typeof this.description !== 'string') {
      throw new Error('Game requires a valid description');
    }
    if (!this.gameType) {
      throw new Error('Game requires a valid gameType');
    }
  }

  /**
   * Check if this game supports level-based progression
   * @returns {boolean} True if the game uses levels
   */
  supportsLevels() {
    return this.gameType.isLevelBased();
  }

  /**
   * Check if the game has a specific feature
   * @param {string} feature - Feature name to check
   * @returns {boolean} True if the feature is enabled
   */
  hasFeature(feature) {
    return this.features[feature] === true;
  }

  /**
   * Get UI configuration for this game
   * @returns {Object} UI configuration object
   */
  getUIConfig() {
    return { ...this.ui };
  }

  /**
   * Get cutscene configuration for this game
   * @returns {Object} Cutscene configuration object
   */
  getCutsceneConfig() {
    return { ...this.cutscenes };
  }

  /**
   * Get persistence configuration for this game
   * @returns {Object} Persistence configuration object
   */
  getPersistenceConfig() {
    return { ...this.persistence };
  }

  /**
   * Get the default level for this game
   * @returns {string|null} Default level ID or null if not applicable
   */
  getDefaultLevel() {
    return this.defaultLevel;
  }

  /**
   * Check if a level is supported by this game
   * @param {string} levelId - Level ID to check
   * @returns {boolean} True if the level is supported
   */
  supportsLevel(levelId) {
    if (!this.supportsLevels()) {
      return false;
    }
    return this.supportedLevels.includes(levelId);
  }

  /**
   * Get all supported levels
   * @returns {string[]} Array of supported level IDs
   */
  getSupportedLevels() {
    return [...this.supportedLevels];
  }

  /**
   * Get level configuration by ID
   * @param {string} levelId - Level identifier
   * @returns {Object} Level configuration
   * @throws {Error} If level not found
   */
  getLevelConfiguration(levelId) {
    const config = this.levels[levelId];
    if (!config) {
      throw new Error(`Level '${levelId}' not found in game '${this.id}'`);
    }
    return { ...config };
  }

  /**
   * Get all level configurations for this game
   * @returns {Object[]} Array of level configurations
   */
  getAllLevelConfigurations() {
    return this.getSupportedLevels().map((levelId) => this.getLevelConfiguration(levelId));
  }

  /**
   * Get the first level configuration
   * @returns {Object|null} First level configuration or null if no levels
   */
  getFirstLevel() {
    if (this.supportedLevels.length === 0) {
      return null;
    }
    return this.getLevelConfiguration(this.supportedLevels[0]);
  }

  /**
   * Get next level after the given level
   * @param {string} currentLevelId - Current level ID
   * @returns {Object|null} Next level configuration or null if at last level
   */
  getNextLevel(currentLevelId) {
    const currentIndex = this.supportedLevels.indexOf(currentLevelId);
    if (currentIndex === -1 || currentIndex === this.supportedLevels.length - 1) {
      return null;
    }
    return this.getLevelConfiguration(this.supportedLevels[currentIndex + 1]);
  }

  /**
   * Check if level has specific zones
   * @param {string} levelId - Level identifier
   * @param {string} zoneId - Zone identifier
   * @returns {boolean} True if level contains the zone
   */
  levelHasZone(levelId, zoneId) {
    try {
      const level = this.getLevelConfiguration(levelId);
      return level.zones && level.zones.includes(zoneId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get zones for a specific level
   * @param {string} levelId - Level identifier
   * @returns {string[]} Array of zone IDs for the level
   */
  getLevelZones(levelId) {
    const level = this.getLevelConfiguration(levelId);
    return [...(level.zones || [])];
  }

  /**
   * Get total number of levels in this game
   * @returns {number} Total level count
   */
  getTotalLevelCount() {
    return this.supportedLevels.length;
  }

  /**
   * Create a game instance using this game's factory
   * @param {Object} options - Game creation options
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Created game instance
   * @throws {Error} If no factory is configured
   */
  async createGame(options = {}, dependencies = {}) {
    if (!this.factory || typeof this.factory !== 'function') {
      throw new Error(`Game '${this.id}' has no factory configured for game creation`);
    }
    return await this.factory(options, dependencies);
  }

  /**
   * Check if this game can create instances
   * @returns {boolean} True if factory is available
   */
  canCreateInstances() {
    return !!(this.factory && typeof this.factory === 'function');
  }

  /**
   * Create a lightweight descriptor version of this game
   * Useful for serialization or when only basic info is needed
   * @returns {Object} Basic game descriptor
   */
  toDescriptor() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      gameType: this.gameType,
    };
  }

  /**
   * Check equality with another Game
   * @param {Game} other - Other game
   * @returns {boolean} True if they are equal
   */
  equals(other) {
    return (
      other instanceof Game &&
      this.id === other.id &&
      this.name === other.name &&
      this.description === other.description &&
      this.gameType.equals(other.gameType)
    );
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    return `Game(${this.id}, ${this.name})`;
  }

  /**
   * Convert to JSON for serialization
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      gameType: this.gameType.toString(),
      defaultLevel: this.defaultLevel,
      supportedLevels: this.supportedLevels,
      levels: this.levels,
      features: this.features,
      ui: this.ui,
      cutscenes: this.cutscenes,
      persistence: this.persistence,
      canCreateInstances: this.canCreateInstances(),
    };
  }

  /**
   * Create a Game from a simple descriptor object
   * Useful for upgrading legacy GameDescriptor objects
   * @param {Object} descriptor - Basic game descriptor
   * @returns {Game} New Game instance
   */
  static fromDescriptor(descriptor) {
    return new Game({
      id: descriptor.id,
      name: descriptor.name,
      description: descriptor.description,
      gameType: descriptor.gameType,
    });
  }
}
