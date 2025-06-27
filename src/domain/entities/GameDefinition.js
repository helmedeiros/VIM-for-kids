/**
 * Domain entity representing a complete game definition
 * Contains all configuration needed to create and manage a game
 * Follows Domain-Driven Design principles
 */
export class GameDefinition {
  constructor(config) {
    if (!config) {
      throw new Error('GameDefinition requires configuration object');
    }

    // Core game properties
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.gameType = config.gameType;

    // Extended game configuration
    this.defaultLevel = config.defaultLevel || null;
    this.supportedLevels = config.supportedLevels || [];
    this.features = config.features || {};
    this.ui = config.ui || {};
    this.cutscenes = config.cutscenes || {};
    this.persistence = config.persistence || {};
    this.factory = config.factory;

    // Validation
    this._validate();
  }

  /**
   * Validate the game definition
   * @private
   */
  _validate() {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('GameDefinition requires a valid id');
    }
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('GameDefinition requires a valid name');
    }
    if (!this.description || typeof this.description !== 'string') {
      throw new Error('GameDefinition requires a valid description');
    }
    if (!this.gameType) {
      throw new Error('GameDefinition requires a valid gameType');
    }
    if (!this.factory || typeof this.factory !== 'function') {
      throw new Error('GameDefinition requires a factory function');
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
   * Create a game instance using this definition
   * @param {Object} options - Game creation options
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Created game instance
   */
  async createGame(options = {}, dependencies = {}) {
    return await this.factory(options, dependencies);
  }

  /**
   * Convert to GameDescriptor for compatibility
   * @returns {Object} GameDescriptor-compatible object
   */
  toGameDescriptor() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      gameType: this.gameType,
    };
  }

  /**
   * Check equality with another GameDefinition
   * @param {GameDefinition} other - Other game definition
   * @returns {boolean} True if they are equal
   */
  equals(other) {
    return (
      other instanceof GameDefinition &&
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
    return `GameDefinition(${this.id}, ${this.name})`;
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
      features: this.features,
      ui: this.ui,
      cutscenes: this.cutscenes,
      persistence: this.persistence,
    };
  }
}
