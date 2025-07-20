import { Position } from '../value-objects/Position.js';

/**
 * CollectibleKey represents a generic key that can be collected by the player
 * and used to unlock gates. This is distinct from VimKey which is educational.
 */
export class CollectibleKey {
  constructor(position, keyId, name = 'Key', color = '#FFD700') {
    if (!(position instanceof Position)) {
      throw new Error('CollectibleKey position must be a Position instance');
    }
    if (typeof keyId !== 'string' || keyId.length === 0) {
      throw new Error('CollectibleKey keyId must be a non-empty string');
    }
    if (typeof name !== 'string') {
      throw new Error('CollectibleKey name must be a string');
    }
    if (typeof color !== 'string') {
      throw new Error('CollectibleKey color must be a string');
    }

    this._position = position;
    this._keyId = keyId;
    this._name = name;
    this._color = color;
    this._type = 'collectible_key';
  }

  get position() {
    return this._position;
  }

  get keyId() {
    return this._keyId;
  }

  get name() {
    return this._name;
  }

  get color() {
    return this._color;
  }

  get type() {
    return this._type;
  }

  equals(other) {
    return (
      other instanceof CollectibleKey &&
      this._position.equals(other._position) &&
      this._keyId === other._keyId
    );
  }

  toString() {
    return `CollectibleKey(${this._keyId}) at (${this._position.x}, ${this._position.y})`;
  }
}
