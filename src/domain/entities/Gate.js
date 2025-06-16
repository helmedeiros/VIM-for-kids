import { Position } from '../value-objects/Position.js';

export class Gate {
  constructor(position) {
    if (!(position instanceof Position)) {
      throw new Error('Position must be a valid Position object');
    }

    this._position = position;
    this._isOpen = false;
    this._type = 'gate';

    // Make properties immutable
    Object.defineProperty(this, 'position', {
      value: this._position,
      writable: false,
      configurable: false,
    });

    Object.defineProperty(this, 'type', {
      value: this._type,
      writable: false,
      configurable: false,
    });
  }

  get isOpen() {
    return this._isOpen;
  }

  open() {
    this._isOpen = true;
  }

  close() {
    this._isOpen = false;
  }

  isWalkable() {
    return this._isOpen;
  }

  equals(other) {
    return (
      other instanceof Gate && this.position.equals(other.position) && this.isOpen === other.isOpen
    );
  }

  toString() {
    return `Gate at (${this.position.x}, ${this.position.y}) - ${this.isOpen ? 'Open' : 'Closed'}`;
  }
}
