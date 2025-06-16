import { Position } from '../value-objects/Position.js';
import { TileType } from '../value-objects/TileType.js';

export class GameMap {
  constructor(size = 12) {
    this._size = size;
    this._tiles = this._generateInitialMap();
  }

  get size() {
    return this._size;
  }

  getTileAt(position) {
    if (!this.isValidPosition(position)) {
      throw new Error('Position is outside map boundaries');
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
    return this.getTileAt(position).walkable;
  }

  _generateInitialMap() {
    const tiles = [];

    // Initialize with grass
    for (let y = 0; y < this._size; y++) {
      tiles[y] = [];
      for (let x = 0; x < this._size; x++) {
        tiles[y][x] = TileType.GRASS;
      }
    }

    // Add water border
    for (let i = 0; i < this._size; i++) {
      tiles[0][i] = TileType.WATER; // Top
      tiles[this._size - 1][i] = TileType.WATER; // Bottom
      tiles[i][0] = TileType.WATER; // Left
      tiles[i][this._size - 1] = TileType.WATER; // Right
    }

    // Create dirt path (starting area)
    const dirtPath = [
      // Main horizontal path (shorter now)
      [2, 2],
      [3, 2],
      [4, 2],
      [5, 2],
      [6, 2],
      // Vertical connection down
      [5, 3],
      [5, 4],
      [5, 5],
      [5, 6],
      [5, 7],
      [5, 8],
      [5, 9],
      // Key collection area
      [2, 3],
      [3, 3],
      [4, 3],
      // Branch paths
      [3, 4],
      [3, 6],
    ];

    dirtPath.forEach(([x, y]) => {
      const position = new Position(x, y);
      if (this.isValidPosition(position)) {
        tiles[y][x] = TileType.DIRT;
      }
    });

    // Create labyrinth area (right side of the map)
    this._createLabyrinth(tiles);

    // Add tree
    tiles[2][9] = TileType.TREE;

    return tiles;
  }

  _createLabyrinth(tiles) {
    // Fill the right side with stone first (x >= 7)
    for (let y = 1; y < this._size - 1; y++) {
      for (let x = 7; x < this._size - 1; x++) {
        tiles[y][x] = TileType.STONE;
      }
    }

    // Create labyrinth paths (walkable areas)
    const labyrinthPaths = [
      // Entry path from main area
      [6, 2],
      [7, 2],
      [8, 2],

      // Main corridors
      [7, 3],
      [8, 3],
      [9, 3],
      [10, 3],
      [7, 4],
      [9, 4],
      [10, 4],
      [7, 5],
      [7, 6],
      [7, 7],
      [9, 5],
      [10, 5],
      [8, 7],
      [9, 7],
      [10, 7],
      [9, 6],

      // Lower section paths
      [7, 8],
      [8, 8],
      [9, 8],
      [10, 8],
      [8, 9],
      [9, 9],
      [10, 9],
      [8, 10],
      [10, 10],

      // Dead ends and branches
      [9, 10],
      [8, 5],
      [8, 6],
      [10, 6],
      [10, 9],
    ];

    labyrinthPaths.forEach(([x, y]) => {
      const position = new Position(x, y);
      if (this.isValidPosition(position)) {
        tiles[y][x] = TileType.DIRT;
      }
    });
  }
}
