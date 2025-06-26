/**
 * Domain entity representing a game configuration
 * Contains the essential attributes that define a game
 */
export class GameDescriptor {
  constructor(id, name, description, gameType) {
    if (!id || !name || !description || !gameType) {
      throw new Error('GameDescriptor requires id, name, description, and gameType');
    }

    this._id = id;
    this._name = name;
    this._description = description;
    this._gameType = gameType;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get gameType() {
    return this._gameType;
  }

  equals(other) {
    return (
      other instanceof GameDescriptor &&
      this._id === other._id &&
      this._name === other._name &&
      this._description === other._description &&
      this._gameType === other._gameType
    );
  }

  toString() {
    return `GameDescriptor(${this._id}, ${this._name})`;
  }
}
