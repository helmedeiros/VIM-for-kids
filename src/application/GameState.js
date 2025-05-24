import { Player } from '../domain/entities/Player.js';
import { VimKey } from '../domain/entities/VimKey.js';
import { GameMap } from '../domain/entities/GameMap.js';
import { Position } from '../domain/value-objects/Position.js';

export class GameState {
  constructor() {
    this.map = new GameMap();
    this.player = new Player();
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
      player: this.player,
      availableKeys: this.availableKeys,
      collectedKeys: this.collectedKeys,
    };
  }

  _createInitialKeys() {
    return [
      new VimKey(new Position(2, 3), 'h', 'Move left'),
      new VimKey(new Position(3, 3), 'j', 'Move down'),
      new VimKey(new Position(4, 3), 'k', 'Move up'),
      new VimKey(new Position(5, 3), 'l', 'Move right'),
    ];
  }
}
