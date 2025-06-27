import { Cursor } from '../domain/entities/Cursor.js';

/**
 * Simple game state for Textland exploration
 * Uses the zone system for consistency but provides open exploration
 */
export class TextlandGameState {
  constructor(zoneProvider) {
    if (!zoneProvider) {
      throw new Error('TextlandGameState requires a zone provider');
    }

    this._zoneProvider = zoneProvider;

    // Load the textland exploration zone
    this._loadTextlandZone();
  }

  _loadTextlandZone() {
    try {
      this.zone = this._zoneProvider.createZone('textland_exploration');
      this.map = this.zone.gameMap;
      this.cursor = new Cursor(this.zone.getCursorStartPosition());
      this.availableKeys = this.zone.vimKeys;
      this.collectedKeys = new Set();
    } catch (error) {
      throw new Error('Failed to load textland exploration zone');
    }
  }

  // Key collection (same as other game states)
  collectKey(vimKey) {
    if (this.availableKeys.includes(vimKey)) {
      this.collectedKeys.add(vimKey.key);
      this.availableKeys = this.availableKeys.filter((key) => key !== vimKey);

      // Notify zone about key collection
      this.zone.collectKey(vimKey);
    }
  }

  // Get current state for rendering
  getCurrentState() {
    return {
      currentZone: this.zone,
      map: this.map,
      cursor: this.cursor,
      availableKeys: this.availableKeys,
      collectedKeys: this.collectedKeys,
      textLabels: this.zone.textLabels,
      gate: null, // No gate in textland exploration
      npcs: [], // No NPCs in simple exploration
      // No level progress for textland
    };
  }

  // Helper methods for compatibility
  getTextLabels() {
    return this.zone.textLabels;
  }

  getGate() {
    return null; // No gate in textland
  }

  getNPCs() {
    return []; // No NPCs in textland
  }

  // Cleanup
  cleanup() {
    if (this.zone && typeof this.zone.cleanup === 'function') {
      this.zone.cleanup();
    }
  }
}
