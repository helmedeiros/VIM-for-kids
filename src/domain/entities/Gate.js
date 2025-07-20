import { Position } from '../value-objects/Position.js';

export class Gate {
  constructor(position, unlockConditions = null) {
    if (!(position instanceof Position)) {
      throw new Error('Position must be a valid Position object');
    }

    this._position = position;
    this._isOpen = false;
    this._type = 'gate';
    this._unlockConditions = unlockConditions || {};

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

  get unlockConditions() {
    return this._unlockConditions;
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

  /**
   * Check if the gate can be unlocked with the given collected keys
   * @param {Set} collectedVimKeys - Set of collected VIM key strings
   * @param {Set} collectedCollectibleKeyIds - Set of collected CollectibleKey IDs
   * @returns {boolean} - Whether the gate can be unlocked
   */
      canUnlock(collectedVimKeys = new Set(), collectedCollectibleKeyIds = new Set()) {
    // If no unlock conditions defined at all, gate cannot be unlocked (stays closed)
    if (!this._unlockConditions || Object.keys(this._unlockConditions).length === 0) {
      return false;
    }

    // Check if any requirements are actually specified
    const hasVimKeyReqs = 'collectedVimKeys' in this._unlockConditions;
    const hasCollectibleKeyReqs = 'requiredCollectibleKeys' in this._unlockConditions;

    // If no requirements are specified, gate cannot be unlocked
    if (!hasVimKeyReqs && !hasCollectibleKeyReqs) {
      return false;
    }

    // Check VIM key requirements (only if specified)
    let vimKeysMatch = true;
    if (hasVimKeyReqs) {
      const requiredVimKeys = this._unlockConditions.collectedVimKeys || [];
      vimKeysMatch = requiredVimKeys.every(key => collectedVimKeys.has(key));
    }

    // Check CollectibleKey requirements (only if specified)
    let collectibleKeysMatch = true;
    if (hasCollectibleKeyReqs) {
      const requiredCollectibleKeys = this._unlockConditions.requiredCollectibleKeys || [];
      collectibleKeysMatch = requiredCollectibleKeys.every(keyId => collectedCollectibleKeyIds.has(keyId));
    }

    // Both conditions must be met if specified
    return vimKeysMatch && collectibleKeysMatch;
  }

  /**
   * Get the required CollectibleKeys for unlocking this gate
   * @returns {Array} - Array of CollectibleKey IDs required to unlock this gate
   */
  getRequiredCollectibleKeys() {
    if (!this._unlockConditions || !this._unlockConditions.requiredCollectibleKeys) {
      return [];
    }
    return [...this._unlockConditions.requiredCollectibleKeys];
  }

  equals(other) {
    return (
      other instanceof Gate &&
      this.position.equals(other.position) &&
      this.isOpen === other.isOpen &&
      JSON.stringify(this._unlockConditions) === JSON.stringify(other._unlockConditions)
    );
  }

  toString() {
    return `Gate at (${this.position.x}, ${this.position.y}) - ${this.isOpen ? 'Open' : 'Closed'}`;
  }
}
