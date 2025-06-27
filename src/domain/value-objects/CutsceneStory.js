/**
 * CutsceneStory Value Object
 * Represents a cutscene story that can be associated with games, levels, or zones
 * Immutable value object following SOLID principles
 */
export class CutsceneStory {
  /**
   * Create a new CutsceneStory
   * @param {string} gameId - Game identifier
   * @param {string} type - Story type: 'game', 'level', or 'zone'
   * @param {string|null} levelId - Level identifier (required for level and zone types)
   * @param {string|null} zoneId - Zone identifier (required for zone type)
   * @param {string[]} script - Array of script lines
   */
  constructor(gameId, type, levelId, zoneId, script) {
    this._validateInputs(gameId, type, levelId, zoneId, script);

    this._gameId = gameId;
    this._type = type;
    this._levelId = levelId;
    this._zoneId = zoneId;
    this._script = [...script]; // Create immutable copy

    // Validate the complete object
    if (!this.isValid()) {
      throw new Error('Invalid cutscene story configuration');
    }
  }

  /**
   * Validate constructor inputs
   * @private
   */
  _validateInputs(gameId, type, levelId, zoneId, script) {
    if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
      throw new Error('Game ID is required');
    }

    const validTypes = ['game', 'level', 'zone'];
    if (!validTypes.includes(type)) {
      throw new Error(`Cutscene type must be one of: ${validTypes.join(', ')}`);
    }

    if (type === 'level' && (!levelId || typeof levelId !== 'string' || !levelId.trim())) {
      throw new Error('Level ID is required for level-type cutscenes');
    }

    if (type === 'zone') {
      if (!levelId || typeof levelId !== 'string' || !levelId.trim()) {
        throw new Error('Level ID is required for zone-type cutscenes');
      }
      if (!zoneId || typeof zoneId !== 'string' || !zoneId.trim()) {
        throw new Error('Zone ID is required for zone-type cutscenes');
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
   * Get cutscene type
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
   * Calculate cutscene duration in seconds
   * @returns {number}
   */
  get duration() {
    const nonEmptyLines = this._script.filter(
      (line) => typeof line === 'string' && line.trim().length > 0
    );
    return nonEmptyLines.length * 2; // 2 seconds per line
  }

  /**
   * Get unique identifier for this cutscene story
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
   * Validate the cutscene story configuration
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
   * Check equality with another CutsceneStory
   * @param {CutsceneStory} other - Other cutscene story to compare
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof CutsceneStory)) {
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
   * Create a deep copy of this cutscene story
   * @returns {CutsceneStory}
   */
  clone() {
    return new CutsceneStory(this._gameId, this._type, this._levelId, this._zoneId, [
      ...this._script,
    ]);
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
      duration: this.duration,
      identifier: this.identifier,
    };
  }

  /**
   * Create CutsceneStory from JSON representation
   * @param {Object} json - JSON object
   * @returns {CutsceneStory}
   */
  static fromJSON(json) {
    return new CutsceneStory(json.gameId, json.type, json.levelId, json.zoneId, json.script);
  }
}
