import { Cursor } from '../domain/entities/Cursor.js';
import { WelcomeMeadow } from '../domain/entities/WelcomeMeadow.js';

export class WelcomeMeadowGameState {
  constructor() {
    this.meadow = new WelcomeMeadow();
    this.map = this.meadow; // Map interface
    this.cursor = new Cursor(this.meadow.getCursorStartPosition());
    this.availableKeys = this.meadow.getMovementKeys();
    this.collectedKeys = new Set();
  }

  collectKey(vimKey) {
    if (this.availableKeys.includes(vimKey)) {
      this.collectedKeys.add(vimKey.key);
      this.availableKeys = this.availableKeys.filter((key) => key !== vimKey);

      // Notify meadow about key collection
      this.meadow.collectKey(vimKey);
    }
  }

  getCurrentState() {
    return {
      map: this.map,
      cursor: this.cursor,
      availableKeys: this.availableKeys,
      collectedKeys: this.collectedKeys,
      textLabels: this.meadow.getTextLabels(),
      gate: this.meadow.getGate(),
    };
  }

  getTextLabels() {
    return this.meadow.getTextLabels();
  }

  getGate() {
    return this.meadow.getGate();
  }

  isLevelComplete() {
    return this.meadow.isComplete();
  }

  getCompletionMessage() {
    return this.meadow.getCompletionMessage();
  }
}
