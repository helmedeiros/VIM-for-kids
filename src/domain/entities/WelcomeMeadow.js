import { Position } from '../value-objects/Position.js';
import { TileType } from '../value-objects/TileType.js';
import { VimKey } from './VimKey.js';
import { Gate } from './Gate.js';
import { TextLabel } from './TextLabel.js';

export class WelcomeMeadow {
  constructor() {
    this._size = 10;
    this._collectedKeys = new Set();
    this._initializeMap();
    this._initializeElements();
  }

  get size() {
    return this._size;
  }

  _initializeMap() {
    // Create 10x10 grid with water only on top, left, and right edges
    this._tiles = [];
    for (let y = 0; y < this._size; y++) {
      this._tiles[y] = [];
      for (let x = 0; x < this._size; x++) {
        if (x === 0 || y === 0 || x === this._size - 1) {
          // Water borders only on top, left, and right edges
          this._tiles[y][x] = TileType.WATER;
        } else if (y >= 1 && y <= 3 && x >= 1 && x <= 8) {
          // Upper dirt area where keys and player are located
          this._tiles[y][x] = TileType.DIRT;
        } else {
          // Lower area is grass where "Hello world!" text is displayed
          this._tiles[y][x] = TileType.GRASS;
        }
      }
    }

    // Place tree in grass area on the left side (matching image)
    this._tiles[4][1] = TileType.TREE;
  }

  _initializeElements() {
    // Initialize movement keys in dirt area (upper portion) matching image positions
    this._movementKeys = [
      new VimKey(new Position(1, 2), 'h', 'Move left'),
      new VimKey(new Position(2, 3), 'j', 'Move down'),
      new VimKey(new Position(3, 1), 'k', 'Move up'),
      new VimKey(new Position(8, 2), 'l', 'Move right'),
    ];

    // Initialize "Hello world!" text labels in grass area (lower portion) as shown in image
    const message = 'Hello world!';
    this._textLabels = [];

    // Position text in two rows in grass area as shown in image
    const textPositions = [
      // First row: "Hello "
      [2, 4],
      [3, 4],
      [4, 4],
      [5, 4],
      [6, 4],
      [7, 4],
      // Second row: "world!"
      [2, 5],
      [3, 5],
      [4, 5],
      [5, 5],
      [6, 5],
      [7, 5],
    ];

    for (let i = 0; i < message.length && i < textPositions.length; i++) {
      const [x, y] = textPositions[i];
      this._textLabels.push(new TextLabel(new Position(x, y), message[i]));
    }

    // Initialize gate on the right side as shown in image (inside playable area)
    this._gate = new Gate(new Position(8, 4));
  }

  getTileAt(position) {
    if (!this.isValidPosition(position)) {
      return TileType.WATER; // Out of bounds
    }
    return this._tiles[position.y][position.x];
  }

  isValidPosition(position) {
    return position.x >= 0 && position.x < this._size && position.y >= 0 && position.y < this._size;
  }

  isWalkable(position) {
    if (!this.isValidPosition(position)) {
      return false;
    }

    // Check if it's the gate position - gate controls walkability
    if (this._gate.position.equals(position)) {
      return this._gate.isWalkable();
    }

    const tile = this.getTileAt(position);
    return tile.walkable;
  }

  getPlayerStartPosition() {
    // Player starts in the dirt area as shown in image (center-right of dirt area)
    return new Position(6, 2);
  }

  getMovementKeys() {
    return [...this._movementKeys];
  }

  getTextLabels() {
    return [...this._textLabels];
  }

  getGate() {
    return this._gate;
  }

  collectKey(key) {
    this._collectedKeys.add(key.key);

    // Remove key from available keys
    const index = this._movementKeys.findIndex((k) => k.key === key.key);
    if (index !== -1) {
      this._movementKeys.splice(index, 1);
    }

    // Check if all keys collected and open gate
    if (this._collectedKeys.size === 4) {
      this._gate.open();
    }
  }

  getCollectedKeysCount() {
    return this._collectedKeys.size;
  }

  isComplete() {
    return this._collectedKeys.size === 4 && this._gate.isOpen;
  }

  getCompletionMessage() {
    if (this.isComplete()) {
      return 'Welcome Meadow completed! You have mastered the basic VIM movement commands: h, j, k, l';
    }
    return '';
  }
}
