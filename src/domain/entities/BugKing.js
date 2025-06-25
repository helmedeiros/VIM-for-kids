import { Position } from '../value-objects/Position.js';

export class BugKing {
  constructor(position, corruptionLevel = 100, isDefeated = false) {
    if (!(position instanceof Position)) {
      throw new Error('BugKing position must be a Position instance');
    }
    if (typeof corruptionLevel !== 'number' || corruptionLevel < 0 || corruptionLevel > 100) {
      throw new Error('Corruption level must be a number between 0 and 100');
    }
    if (typeof isDefeated !== 'boolean') {
      throw new Error('isDefeated must be a boolean');
    }

    this._position = position;
    this._corruptionLevel = corruptionLevel;
    this._isDefeated = isDefeated;
    this._name = 'The Bug King';
    this._description = 'The final enemy who corrupts logic and overwrites order';
    this._corruptionRadius = 2; // How far corruption spreads
    this._vulnerabilities = ['clean-code', 'proper-syntax', 'vim-mastery'];
  }

  get position() {
    return this._position;
  }

  get corruptionLevel() {
    return this._corruptionLevel;
  }

  get isDefeated() {
    return this._isDefeated;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get corruptionRadius() {
    return this._corruptionRadius;
  }

  get vulnerabilities() {
    return [...this._vulnerabilities]; // Return a copy
  }

  moveTo(newPosition) {
    if (!(newPosition instanceof Position)) {
      throw new Error('New position must be a Position instance');
    }
    if (this._isDefeated) {
      throw new Error('Cannot move a defeated Bug King');
    }
    return new BugKing(newPosition, this._corruptionLevel, this._isDefeated);
  }

  takeDamage(damageAmount = 10) {
    if (this._isDefeated) {
      return this; // Already defeated
    }

    const newCorruptionLevel = Math.max(0, this._corruptionLevel - damageAmount);
    const newIsDefeated = newCorruptionLevel === 0;

    return new BugKing(this._position, newCorruptionLevel, newIsDefeated);
  }

  spreadCorruption() {
    if (this._isDefeated) {
      return []; // Cannot spread corruption when defeated
    }

    const corruptedPositions = [];
    const { x, y } = this._position;

    // Spread corruption in a radius around the Bug King
    for (let dx = -this._corruptionRadius; dx <= this._corruptionRadius; dx++) {
      for (let dy = -this._corruptionRadius; dy <= this._corruptionRadius; dy++) {
        if (dx === 0 && dy === 0) continue; // Skip the Bug King's position

        const distance = Math.abs(dx) + Math.abs(dy); // Manhattan distance
        if (distance <= this._corruptionRadius) {
          corruptedPositions.push(new Position(x + dx, y + dy));
        }
      }
    }

    return corruptedPositions;
  }

  getCorruptionMessage() {
    if (this._isDefeated) {
      return 'Order has been restored. The corruption lifts like morning mist.';
    }

    const messages = [
      'Logic.exe has stopped working...',
      'Syntax error in reality.code',
      'Stack overflow in the realm of order',
      'Null pointer exception in the fabric of code',
      'Infinite loop detected in the laws of nature',
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  getDefeatMessage() {
    return 'The Bug King dissolves into clean, commented code. Order is restored to the digital realm.';
  }

  isPositionCorrupted(position) {
    if (this._isDefeated) {
      return false;
    }

    const corruptedPositions = this.spreadCorruption();
    return corruptedPositions.some((pos) => pos.equals(position));
  }

  equals(other) {
    return (
      other instanceof BugKing &&
      this._position.equals(other._position) &&
      this._corruptionLevel === other._corruptionLevel &&
      this._isDefeated === other._isDefeated
    );
  }

  // Static factory method for creating the final boss
  static createFinalBoss(position) {
    return new BugKing(position, 100, false);
  }
}
