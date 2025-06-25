import { Cursor } from '../domain/entities/Cursor.js';
import { BlinkingGroveZone } from '../infrastructure/data/zones/BlinkingGroveZone.js';

export class BlinkingGroveGameState {
  constructor() {
    this.zone = BlinkingGroveZone.create();
    this.map = this.zone.gameMap; // Map interface
    this.cursor = new Cursor(this.zone.getCursorStartPosition());
    this.availableKeys = this.zone.vimKeys;
    this.collectedKeys = new Set();
  }

  collectKey(vimKey) {
    if (this.availableKeys.includes(vimKey)) {
      this.collectedKeys.add(vimKey.key);
      this.availableKeys = this.availableKeys.filter((key) => key !== vimKey);

      // Notify zone about key collection
      this.zone.collectKey(vimKey);
    }
  }

  getCurrentState() {
    return {
      map: this.map,
      cursor: this.cursor,
      availableKeys: this.availableKeys,
      collectedKeys: this.collectedKeys,
      textLabels: this.zone.textLabels,
      gate: this.zone.gate,
      npcs: this.zone.getActiveNPCs(),
    };
  }

  getTextLabels() {
    return this.zone.textLabels;
  }

  getGate() {
    return this.zone.gate;
  }

  getNPCs() {
    return this.zone.getActiveNPCs();
  }

  isLevelComplete() {
    return this.zone.isComplete();
  }

  getCompletionMessage() {
    if (this.zone.isComplete()) {
      return 'Blinking Grove completed! You have mastered the basic VIM movement commands: h, j, k, l';
    }
    return '';
  }

  cleanup() {
    // Clean up zone resources
    if (this.zone && typeof this.zone.cleanup === 'function') {
      this.zone.cleanup();
    }
  }
}
