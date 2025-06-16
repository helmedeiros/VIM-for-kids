import { Position } from '../value-objects/Position.js';

export class TextLabel {
  constructor(position, text) {
    if (!(position instanceof Position)) {
      throw new Error('Position must be a valid Position object');
    }

    if (!text || typeof text !== 'string' || text.length === 0) {
      throw new Error('Text must be a non-empty string');
    }

    this._position = position;
    this._text = text;
    this._type = 'textLabel';
    this._isVisible = true;
    this._color = '#2c3e50'; // Dark color for readability
    this._fontSize = '12px';

    // Make properties immutable
    Object.defineProperty(this, 'position', {
      value: this._position,
      writable: false,
      configurable: false,
    });

    Object.defineProperty(this, 'text', {
      value: this._text,
      writable: false,
      configurable: false,
    });

    Object.defineProperty(this, 'type', {
      value: this._type,
      writable: false,
      configurable: false,
    });
  }

  get isVisible() {
    return this._isVisible;
  }

  get color() {
    return this._color;
  }

  get fontSize() {
    return this._fontSize;
  }

  equals(other) {
    return (
      other instanceof TextLabel && this.position.equals(other.position) && this.text === other.text
    );
  }

  toString() {
    return `TextLabel "${this.text}" at (${this.position.x}, ${this.position.y})`;
  }
}
