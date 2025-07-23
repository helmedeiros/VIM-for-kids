import { Position } from '../value-objects/Position.js';

export class Cursor {
  constructor(position = new Position(5, 2), isBlinking = true, rememberedColumn = null) {
    if (!(position instanceof Position)) {
      throw new Error('Cursor position must be a Position instance');
    }
    if (typeof isBlinking !== 'boolean') {
      throw new Error('isBlinking must be a boolean');
    }
    if (rememberedColumn !== null && typeof rememberedColumn !== 'number') {
      throw new Error('rememberedColumn must be a number or null');
    }

    this._position = position;
    this._isBlinking = isBlinking;
    this._rememberedColumn = rememberedColumn !== null ? rememberedColumn : position.x;
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

  get rememberedColumn() {
    return this._rememberedColumn;
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

  moveTo(newPosition, updateRememberedColumn = true) {
    if (!(newPosition instanceof Position)) {
      throw new Error('New position must be a Position instance');
    }

    // Update remembered column only if it's horizontal movement or explicitly requested
    const newRememberedColumn = updateRememberedColumn ? newPosition.x : this._rememberedColumn;

    const newCursor = new Cursor(newPosition, this._isBlinking, newRememberedColumn);
    newCursor._curiosityLevel = this._curiosityLevel;
    return newCursor;
  }

  moveToWithColumnMemory(newPosition) {
    // For vertical navigation, preserve column memory
    return this.moveTo(newPosition, false);
  }

  toggleBlinking() {
    const newCursor = new Cursor(this._position, !this._isBlinking, this._rememberedColumn);
    newCursor._curiosityLevel = this._curiosityLevel;
    return newCursor;
  }

  increaseCuriosity(amount = 10) {
    const newLevel = Math.min(100, this._curiosityLevel + amount);
    const newCursor = new Cursor(this._position, this._isBlinking, this._rememberedColumn);
    newCursor._curiosityLevel = newLevel;
    return newCursor;
  }

  equals(other) {
    return (
      other instanceof Cursor &&
      this._position.equals(other._position) &&
      this._isBlinking === other._isBlinking &&
      this._rememberedColumn === other._rememberedColumn
    );
  }
}
