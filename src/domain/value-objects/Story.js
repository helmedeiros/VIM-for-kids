/**
 * Story Value Object
 * Unified story system for all types of cutscenes (origin, level, zone)
 * Immutable value object following SOLID principles
 */
export class Story {
  /**
   * Create a new Story
   * @param {string} gameId - Game identifier
   * @param {string} type - Story type: 'origin', 'level', or 'zone'
   * @param {string[]} script - Array of script lines
   * @param {Object} options - Optional configuration
   * @param {string|null} options.levelId - Level identifier (required for level and zone types)
   * @param {string|null} options.zoneId - Zone identifier (required for zone type)
   * @param {boolean} options.hasBeenShown - Whether the story has been shown (for state tracking)
   */
  constructor(gameId, type, script, options = {}) {
    this._validateInputs(gameId, type, script, options);

    this._gameId = gameId;
    this._type = type;
    this._script = [...script]; // Create immutable copy
    this._levelId = options.levelId || null;
    this._zoneId = options.zoneId || null;
    this._hasBeenShown = options.hasBeenShown || false;

    // Validate the complete object
    if (!this.isValid()) {
      throw new Error('Invalid story configuration');
    }
  }

  /**
   * Validate constructor inputs
   * @private
   */
  _validateInputs(gameId, type, script, options) {
    if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
      throw new Error('Game ID is required');
    }

    const validTypes = ['origin', 'level', 'zone'];
    if (!validTypes.includes(type)) {
      throw new Error(`Story type must be one of: ${validTypes.join(', ')}`);
    }

    if (
      type === 'level' &&
      (!options.levelId || typeof options.levelId !== 'string' || !options.levelId.trim())
    ) {
      throw new Error('Level ID is required for level-type stories');
    }

    if (type === 'zone') {
      if (!options.levelId || typeof options.levelId !== 'string' || !options.levelId.trim()) {
        throw new Error('Level ID is required for zone-type stories');
      }
      if (!options.zoneId || typeof options.zoneId !== 'string' || !options.zoneId.trim()) {
        throw new Error('Zone ID is required for zone-type stories');
      }
    }

    if (!Array.isArray(script)) {
      throw new Error('Script must be an array of strings');
    }

    if (script.length === 0) {
      throw new Error('Script must contain at least one line');
    }
  }

  /**
   * Get game identifier
   * @returns {string}
   */
  get gameId() {
    return this._gameId;
  }

  /**
   * Get story type
   * @returns {string}
   */
  get type() {
    return this._type;
  }

  /**
   * Get level identifier
   * @returns {string|null}
   */
  get levelId() {
    return this._levelId;
  }

  /**
   * Get zone identifier
   * @returns {string|null}
   */
  get zoneId() {
    return this._zoneId;
  }

  /**
   * Get immutable copy of script
   * @returns {string[]}
   */
  get script() {
    return [...this._script];
  }

  /**
   * Get whether the story has been shown
   * @returns {boolean}
   */
  get hasBeenShown() {
    return this._hasBeenShown;
  }

  /**
   * Calculate story duration in milliseconds
   * Uses word-based calculation for origin stories, line-based for others
   * @returns {number}
   */
  get duration() {
    if (this._type === 'origin') {
      // Word-based calculation for origin stories (from OriginStory)
      const averageWordsPerLine = 8;
      const wordsPerMinute = 200;
      const millisecondsPerMinute = 60000;
      const minimumDuration = 3000; // 3 seconds minimum

      const estimatedWords = this._script.length * averageWordsPerLine;
      const estimatedDuration = (estimatedWords / wordsPerMinute) * millisecondsPerMinute;

      return Math.max(estimatedDuration, minimumDuration);
    } else {
      // Line-based calculation for other story types (from CutsceneStory)
      const nonEmptyLines = this._script.filter(
        (line) => typeof line === 'string' && line.trim().length > 0
      );
      return nonEmptyLines.length * 2000; // 2 seconds per line in milliseconds
    }
  }

  /**
   * Get unique identifier for this story
   * @returns {string}
   */
  get identifier() {
    const parts = [this._gameId, this._type];

    if (this._levelId) {
      parts.push(this._levelId);
    }

    if (this._zoneId) {
      parts.push(this._zoneId);
    }

    return parts.join(':');
  }

  /**
   * Mark the story as shown (mutates state for persistence)
   */
  markAsShown() {
    this._hasBeenShown = true;
  }

  /**
   * Reset the shown status (useful for testing or replay)
   */
  reset() {
    this._hasBeenShown = false;
  }

  /**
   * Validate the story configuration
   * @returns {boolean}
   */
  isValid() {
    try {
      // Check basic requirements
      if (
        !this._gameId ||
        !this._type ||
        !Array.isArray(this._script) ||
        this._script.length === 0
      ) {
        return false;
      }

      // Check type-specific requirements
      if (this._type === 'level' && !this._levelId) {
        return false;
      }

      if (this._type === 'zone' && (!this._levelId || !this._zoneId)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check equality with another Story
   * @param {Story} other - Other story to compare
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof Story)) {
      return false;
    }

    return (
      this._gameId === other._gameId &&
      this._type === other._type &&
      this._levelId === other._levelId &&
      this._zoneId === other._zoneId &&
      JSON.stringify(this._script) === JSON.stringify(other._script)
    );
  }

  /**
   * Create a deep copy of this story
   * @returns {Story}
   */
  clone() {
    return new Story(this._gameId, this._type, [...this._script], {
      levelId: this._levelId,
      zoneId: this._zoneId,
      hasBeenShown: this._hasBeenShown,
    });
  }

  /**
   * Convert to JSON representation
   * @returns {Object}
   */
  toJSON() {
    return {
      gameId: this._gameId,
      type: this._type,
      levelId: this._levelId,
      zoneId: this._zoneId,
      script: [...this._script],
      hasBeenShown: this._hasBeenShown,
      duration: this.duration,
      identifier: this.identifier,
    };
  }

  /**
   * Create Story from JSON representation
   * @param {Object} json - JSON object
   * @returns {Story}
   */
  static fromJSON(json) {
    return new Story(json.gameId, json.type, json.script, {
      levelId: json.levelId,
      zoneId: json.zoneId,
      hasBeenShown: json.hasBeenShown,
    });
  }

  /**
   * Validate script format
   * @param {*} script - Script to validate
   * @returns {boolean} True if script is valid
   */
  static isValidScript(script) {
    return Array.isArray(script) && script.length > 0;
  }

  // Factory methods for common story types

  /**
   * Create an origin story
   * @param {string} gameId - Game identifier
   * @param {string[]} script - Array of script lines
   * @param {boolean} hasBeenShown - Whether the story has been shown
   * @returns {Story}
   */
  static createOriginStory(gameId, script, hasBeenShown = false) {
    return new Story(gameId, 'origin', script, { hasBeenShown });
  }

  /**
   * Create a level story
   * @param {string} gameId - Game identifier
   * @param {string} levelId - Level identifier
   * @param {string[]} script - Array of script lines
   * @returns {Story}
   */
  static createLevelStory(gameId, levelId, script) {
    return new Story(gameId, 'level', script, { levelId });
  }

  /**
   * Create a zone story
   * @param {string} gameId - Game identifier
   * @param {string} levelId - Level identifier
   * @param {string} zoneId - Zone identifier
   * @param {string[]} script - Array of script lines
   * @returns {Story}
   */
  static createZoneStory(gameId, levelId, zoneId, script) {
    return new Story(gameId, 'zone', script, { levelId, zoneId });
  }
}
