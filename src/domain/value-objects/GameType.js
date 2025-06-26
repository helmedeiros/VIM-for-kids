/**
 * Value object representing different game types
 * Encapsulates the logic for determining which game state class to use
 */
export class GameType {
  static get LEVEL_BASED() {
    return 'level_based';
  }
  static get TEXTLAND() {
    return 'textland';
  }

  constructor(type) {
    if (!GameType.isValid(type)) {
      throw new Error(`Invalid game type: ${type}`);
    }
    this._type = type;
  }

  get type() {
    return this._type;
  }

  static isValid(type) {
    return type === GameType.LEVEL_BASED || type === GameType.TEXTLAND;
  }

  static fromString(typeString) {
    return new GameType(typeString);
  }

  equals(other) {
    return other instanceof GameType && this._type === other._type;
  }

  toString() {
    return this._type;
  }

  /**
   * Determines if this game type uses level-based progression
   */
  isLevelBased() {
    return this._type === GameType.LEVEL_BASED;
  }

  /**
   * Determines if this game type is the textland game
   */
  isTextland() {
    return this._type === GameType.TEXTLAND;
  }
}
