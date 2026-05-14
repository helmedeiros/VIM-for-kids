import { Position } from '../value-objects/Position.js';

export class Gate {
  constructor(position, unlockConditions = null, leadsTo = null, opts = {}) {
    if (!(position instanceof Position)) {
      throw new Error('Position must be a valid Position object');
    }

    this._position = position;
    this._isOpen = false;
    this._type = 'gate';
    this._unlockConditions = unlockConditions || {};
    this._leadsTo = leadsTo;
    // Optional PNG-region overrides — when set the renderer draws these
    // instead of the default gate sprite. Useful for thematic re-skins
    // (e.g. "energy meter" gates that need a different visual when
    // empty vs charged).
    this._closedSpriteRegion = opts.closedSpriteRegion || null;
    this._openSpriteRegion = opts.openSpriteRegion || null;

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

    Object.defineProperty(this, 'leadsTo', {
      value: this._leadsTo,
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

  get closedSpriteRegion() {
    return this._closedSpriteRegion;
  }
  get openSpriteRegion() {
    return this._openSpriteRegion;
  }
  /**
   * Returns the active sprite region based on current open/closed state,
   * or null if no override was supplied.
   */
  get spriteRegion() {
    return this._isOpen ? this._openSpriteRegion : this._closedSpriteRegion;
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
    // Master key is a universal one-shot unlocker — if the player has
    // one in their inventory, it opens this door regardless of the
    // declared requirements. The caller is responsible for consuming
    // the master_key after the unlock so it's only good for one door.
    if (collectedCollectibleKeyIds && collectedCollectibleKeyIds.has('master_key')) {
      return true;
    }

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
   * Variant of canUnlock that ignores the master_key wildcard. Used by
   * Zone to decide whether to consume the master key vs the normal
   * required keys when both could have opened the gate.
   */
  canUnlockWithoutMasterKey(collectedVimKeys = new Set(), collectedCollectibleKeyIds = new Set()) {
    const filtered = new Set(collectedCollectibleKeyIds);
    filtered.delete('master_key');
    return this.canUnlock(collectedVimKeys, filtered);
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
