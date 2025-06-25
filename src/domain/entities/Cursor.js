import { Position } from '../value-objects/Position.js';

export class Cursor {
  constructor(position = new Position(5, 2), isBlinking = true) {
    if (!(position instanceof Position)) {
      throw new Error('Cursor position must be a Position instance');
    }
    if (typeof isBlinking !== 'boolean') {
      throw new Error('isBlinking must be a boolean');
    }

    this._position = position;
    this._isBlinking = isBlinking;
    this._curiosityLevel = 100; // Full of curiosity
    this._name = 'Cursor';
    this._description = 'The blinking protagonist, genderless and full of curiosity';
  }

  get position() {
    return this._position;
  }

  get isBlinking() {
    return this._isBlinking;
  }

  get curiosityLevel() {
    return this._curiosityLevel;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  moveTo(newPosition) {
    if (!(newPosition instanceof Position)) {
      throw new Error('New position must be a Position instance');
    }
    return new Cursor(newPosition, this._isBlinking);
  }

  toggleBlinking() {
    return new Cursor(this._position, !this._isBlinking);
  }

  increaseCuriosity(amount = 10) {
    const newLevel = Math.min(100, this._curiosityLevel + amount);
    const newCursor = new Cursor(this._position, this._isBlinking);
    newCursor._curiosityLevel = newLevel;
    return newCursor;
  }

  equals(other) {
    return (
      other instanceof Cursor &&
      this._position.equals(other._position) &&
      this._isBlinking === other._isBlinking
    );
  }
}
