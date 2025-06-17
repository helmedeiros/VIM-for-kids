import { Position } from '../value-objects/Position.js';
import { TileType } from '../value-objects/TileType.js';
import { VimKey } from './VimKey.js';
import { Gate } from './Gate.js';
import { TextLabel } from './TextLabel.js';

export class WelcomeMeadow {
  constructor() {
    this._width = 20; // Wider to accommodate full-screen water
    this._height = 15; // Taller to accommodate full-screen water
    this._collectedKeys = new Set();
    this._initializeMap();
    this._initializeElements();
  }

  get size() {
    return this._width; // For backwards compatibility, return width
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  _initializeMap() {
    // Create large grid with water filling entire screen
    this._tiles = [];

    // Initialize entire grid with water
    for (let y = 0; y < this._height; y++) {
      this._tiles[y] = [];
      for (let x = 0; x < this._width; x++) {
        this._tiles[y][x] = TileType.WATER;
      }
    }

    // Calculate center position for 12x8 grass area
    const grassWidth = 12;
    const grassHeight = 8;
    const grassStartX = Math.floor((this._width - grassWidth) / 2);
    const grassStartY = Math.floor((this._height - grassHeight) / 2);

    // Create centered 12x8 grass area
    for (let y = grassStartY; y < grassStartY + grassHeight; y++) {
      for (let x = grassStartX; x < grassStartX + grassWidth; x++) {
        this._tiles[y][x] = TileType.GRASS;
      }
    }

    // Create 3x3 dirt starting area at the left side of grass area
    const dirtStartX = grassStartX;
    const dirtStartY = grassStartY + 1; // Offset from top of grass area

    for (let y = dirtStartY; y < dirtStartY + 3; y++) {
      for (let x = dirtStartX; x < dirtStartX + 3; x++) {
        this._tiles[y][x] = TileType.DIRT;
      }
    }

    // Create dirt path from starting area to stone area
    // Horizontal path across the grass area
    const pathY = dirtStartY + 1; // Middle of the 3x3 dirt area
    for (let x = dirtStartX + 3; x < grassStartX + grassWidth - 2; x++) {
      this._tiles[pathY][x] = TileType.DIRT;
    }

    // Stone area on the right side
    const stoneStartX = grassStartX + grassWidth;
    const stoneStartY = grassStartY + 2;

    for (let y = stoneStartY; y < stoneStartY + 4; y++) {
      for (let x = stoneStartX; x < stoneStartX + 2; x++) {
        if (x < this._width && y < this._height) {
          this._tiles[y][x] = TileType.STONE;
        }
      }
    }

    // Place tree in grass area on the left side
    this._tiles[grassStartY + 5][grassStartX + 1] = TileType.TREE;
  }

  _initializeElements() {
    // Calculate positions based on the centered layout
    const grassWidth = 12;
    const grassHeight = 8;
    const grassStartX = Math.floor((this._width - grassWidth) / 2);
    const grassStartY = Math.floor((this._height - grassHeight) / 2);
    const dirtStartX = grassStartX;
    const dirtStartY = grassStartY + 1;

    // Initialize movement keys in dirt area
    this._movementKeys = [
      new VimKey(new Position(dirtStartX, dirtStartY + 1), 'h', 'Move left'),
      new VimKey(new Position(dirtStartX + 1, dirtStartY + 2), 'j', 'Move down'),
      new VimKey(new Position(dirtStartX + 1, dirtStartY), 'k', 'Move up'),
      new VimKey(new Position(grassStartX + grassWidth - 3, dirtStartY + 1), 'l', 'Move right'),
    ];

    // Initialize "Hello world!" text labels in grass area
    const message = 'Hello world!';
    this._textLabels = [];

    // Position text in two rows in grass area (ensuring they're not on tree position)
    const textStartX = grassStartX + 3; // Move away from tree position
    const textStartY = grassStartY + 4; // Position in middle of grass area
    const textPositions = [
      // First row: "Hello "
      [textStartX, textStartY],
      [textStartX + 1, textStartY],
      [textStartX + 2, textStartY],
      [textStartX + 3, textStartY],
      [textStartX + 4, textStartY],
      [textStartX + 5, textStartY],
      // Second row: "world!"
      [textStartX, textStartY + 1],
      [textStartX + 1, textStartY + 1],
      [textStartX + 2, textStartY + 1],
      [textStartX + 3, textStartY + 1],
      [textStartX + 4, textStartY + 1],
      [textStartX + 5, textStartY + 1],
    ];

    for (let i = 0; i < message.length && i < textPositions.length; i++) {
      const [x, y] = textPositions[i];
      this._textLabels.push(new TextLabel(new Position(x, y), message[i]));
    }

    // Initialize gate in the stone area
    const stoneStartX = grassStartX + grassWidth;
    const stoneStartY = grassStartY + 2;
    this._gate = new Gate(new Position(stoneStartX, stoneStartY + 1));
  }

  getTileAt(position) {
    if (!this.isValidPosition(position)) {
      return TileType.WATER; // Out of bounds
    }
    return this._tiles[position.y][position.x];
  }

  isValidPosition(position) {
    return (
      position.x >= 0 && position.x < this._width && position.y >= 0 && position.y < this._height
    );
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
    // Player starts in the center of the 3x3 dirt area
    const grassWidth = 12;
    const grassHeight = 8;
    const grassStartX = Math.floor((this._width - grassWidth) / 2);
    const grassStartY = Math.floor((this._height - grassHeight) / 2);
    const dirtStartX = grassStartX;
    const dirtStartY = grassStartY + 1;

    return new Position(dirtStartX + 1, dirtStartY + 1);
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
