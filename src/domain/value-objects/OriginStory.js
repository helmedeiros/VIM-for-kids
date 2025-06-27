/**
 * Value object representing an origin story cutscene for a game
 * Immutable object that contains the script and metadata for a cutscene
 */
export class OriginStory {
  constructor(gameId, script) {
    if (!gameId || typeof gameId !== 'string' || gameId.trim() === '') {
      throw new Error('Game ID is required');
    }

    if (!script) {
      throw new Error('Script is required');
    }

    if (!OriginStory.isValidScript(script)) {
      throw new Error('Script cannot be empty');
    }

    this._gameId = gameId;
    this._script = [...script]; // Create a copy to ensure immutability
    this._hasBeenShown = false;
  }

  get gameId() {
    return this._gameId;
  }

  get script() {
    return [...this._script]; // Return a copy to maintain immutability
  }

  get hasBeenShown() {
    return this._hasBeenShown;
  }

  /**
   * Mark the origin story as shown
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
   * Calculate estimated duration in milliseconds based on script length
   * Assumes average reading speed of ~200 words per minute
   */
  getDuration() {
    const averageWordsPerLine = 8;
    const wordsPerMinute = 200;
    const millisecondsPerMinute = 60000;
    const minimumDuration = 3000; // 3 seconds minimum

    const estimatedWords = this._script.length * averageWordsPerLine;
    const estimatedDuration = (estimatedWords / wordsPerMinute) * millisecondsPerMinute;

    return Math.max(estimatedDuration, minimumDuration);
  }

  /**
   * Validate script format
   * @param {*} script - Script to validate
   * @returns {boolean} True if script is valid
   */
  static isValidScript(script) {
    return Array.isArray(script) && script.length > 0;
  }

  /**
   * Create a deep copy of the origin story
   */
  clone() {
    const cloned = new OriginStory(this._gameId, this._script);
    cloned._hasBeenShown = this._hasBeenShown;
    return cloned;
  }

  /**
   * Check equality with another OriginStory
   */
  equals(other) {
    if (!(other instanceof OriginStory)) {
      return false;
    }

    return (
      this._gameId === other._gameId &&
      JSON.stringify(this._script) === JSON.stringify(other._script)
    );
  }
}
