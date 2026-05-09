/**
 * Spatial index for O(1) entity lookups by position.
 * Replaces per-tile .find() linear scans in the render loop.
 */
export class EntityIndex {
  constructor() {
    this._keys = new Map();
    this._collectibles = new Map();
    this._npcs = new Map();
    this._textLabels = new Map();
    this._gate = null;
    this._gateKey = null;
    this._secondaryGates = new Map();
  }

  rebuild(gameState) {
    this._keys.clear();
    this._collectibles.clear();
    this._npcs.clear();
    this._textLabels.clear();
    this._secondaryGates.clear();
    this._gate = null;
    this._gateKey = null;

    if (gameState.availableKeys) {
      for (const key of gameState.availableKeys) {
        this._keys.set(this._posKey(key.position.x, key.position.y), key);
      }
    }

    if (gameState.availableCollectibleKeys) {
      for (const ck of gameState.availableCollectibleKeys) {
        this._collectibles.set(this._posKey(ck.position.x, ck.position.y), ck);
      }
    }

    if (gameState.npcs) {
      for (const npc of gameState.npcs) {
        if (npc.position && Array.isArray(npc.position)) {
          this._npcs.set(this._posKey(npc.position[0], npc.position[1]), npc);
        }
      }
    }

    if (gameState.textLabels) {
      for (const label of gameState.textLabels) {
        this._textLabels.set(this._posKey(label.position.x, label.position.y), label);
      }
    }

    if (gameState.gate) {
      this._gate = gameState.gate;
      this._gateKey = this._posKey(gameState.gate.position.x, gameState.gate.position.y);
    }

    if (gameState.secondaryGates) {
      for (const sg of gameState.secondaryGates) {
        if (!sg.isOpen) {
          this._secondaryGates.set(this._posKey(sg.position.x, sg.position.y), sg);
        }
      }
    }
  }

  getKeyAt(x, y) {
    return this._keys.get(this._posKey(x, y)) || null;
  }

  getCollectibleAt(x, y) {
    return this._collectibles.get(this._posKey(x, y)) || null;
  }

  getNPCAt(x, y) {
    return this._npcs.get(this._posKey(x, y)) || null;
  }

  getTextLabelAt(x, y) {
    return this._textLabels.get(this._posKey(x, y)) || null;
  }

  getGateAt(x, y) {
    if (this._gate && this._gateKey === this._posKey(x, y)) {
      return this._gate;
    }
    return null;
  }

  getSecondaryGateAt(x, y) {
    return this._secondaryGates.get(this._posKey(x, y)) || null;
  }

  _posKey(x, y) {
    return `${x},${y}`;
  }
}
