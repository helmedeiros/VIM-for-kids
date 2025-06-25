import { Cursor } from '../domain/entities/Cursor.js';
import { VimKey } from '../domain/entities/VimKey.js';
import { GameMap } from '../domain/entities/GameMap.js';
import { Position } from '../domain/value-objects/Position.js';

export class GameState {
  constructor() {
    this.map = new GameMap();
    this.cursor = new Cursor();
    this.availableKeys = this._createInitialKeys();
    this.collectedKeys = new Set();
  }

  collectKey(vimKey) {
    if (this.availableKeys.includes(vimKey)) {
      this.collectedKeys.add(vimKey.key);
      this.availableKeys = this.availableKeys.filter((key) => key !== vimKey);
    }
  }

  getCurrentState() {
    return {
      map: this.map,
      cursor: this.cursor,
      availableKeys: this.availableKeys,
      collectedKeys: this.collectedKeys,
    };
  }

  _createInitialKeys() {
    return [
      new VimKey(new Position(2, 3), 'h', 'Move left'),
      new VimKey(new Position(3, 3), 'j', 'Move down'),
      new VimKey(new Position(9, 5), 'k', 'Move up'), // In labyrinth
      new VimKey(new Position(10, 8), 'l', 'Move right'), // In labyrinth
    ];
  }
}
