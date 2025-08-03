import { Position } from '../value-objects/Position.js';
import { TileType } from '../value-objects/TileType.js';

export class DynamicZoneMap {
  constructor(zoneWidth = 12, zoneHeight = 8) {
    this._zoneWidth = zoneWidth;
    this._zoneHeight = zoneHeight;
    this._calculateDynamicGridSize();
    this._initializeMap();

    // Listen for window resize to recalculate grid if needed
    if (typeof window !== 'undefined') {
      this._resizeHandler = () => this._handleResize();
      window.addEventListener('resize', this._resizeHandler);
    }
  }

  _calculateDynamicGridSize(testDimensions = null) {
    // Get actual screen dimensions (or use test dimensions)
    let screenWidth, screenHeight;

    if (testDimensions) {
      screenWidth = testDimensions.width;
      screenHeight = testDimensions.height;
    } else if (typeof window !== 'undefined') {
      screenWidth = window.innerWidth;
      screenHeight = window.innerHeight;
    } else {
      // Default dimensions for server-side rendering or testing
      screenWidth = 1920;
      screenHeight = 1080;
    }

    // Calculate how many 32px tiles fit on screen
    const tileSize = 32;
    const minCols = Math.ceil(screenWidth / tileSize);
    const minRows = Math.ceil(screenHeight / tileSize);

    // Add padding tiles to ensure full coverage and smooth scrolling
    const paddingTiles = 2;
    this._width = minCols + paddingTiles;
    this._height = minRows + paddingTiles;

    // Ensure minimum size for gameplay (zone area needs space)
    this._width = Math.max(this._width, this._zoneWidth + 12); // Zone + padding
    this._height = Math.max(this._height, this._zoneHeight + 8); // Zone + padding
  }

  // Method for testing - allows setting specific screen dimensions
  _setTestDimensions(width, height) {
    this._calculateDynamicGridSize({ width, height });
    this._initializeMap();
  }

  _handleResize() {
    // Recalculate grid size on window resize
    const oldWidth = this._width;
    const oldHeight = this._height;

    this._calculateDynamicGridSize();

    // Only reinitialize if dimensions actually changed
    if (oldWidth !== this._width || oldHeight !== this._height) {
      this._initializeMap();

      // Trigger re-render if there's a game instance
      if (typeof window !== 'undefined' && window.game && window.game.gameRenderer) {
        window.game.gameRenderer.render(window.game.gameState.getCurrentState());
      }
    }
  }

  cleanup() {
    // Remove resize listener to prevent memory leaks
    if (typeof window !== 'undefined' && this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get size() {
    return this._width; // For backwards compatibility
  }

  get zoneStartX() {
    return Math.floor((this._width - this._zoneWidth) / 2);
  }

  get zoneStartY() {
    return Math.floor((this._height - this._zoneHeight) / 2);
  }

  get zoneEndX() {
    return this.zoneStartX + this._zoneWidth;
  }

  get zoneEndY() {
    return this.zoneStartY + this._zoneHeight;
  }

  /**
   * Expand map dimensions to accommodate hidden areas
   * @param {number} requiredWidth - Minimum required width
   * @param {number} requiredHeight - Minimum required height
   */
  expandDimensions(requiredWidth, requiredHeight) {
    const oldWidth = this._width;
    const oldHeight = this._height;

    // Expand dimensions if needed
    this._width = Math.max(this._width, requiredWidth);
    this._height = Math.max(this._height, requiredHeight);

    // If dimensions changed, we need to expand the tile grid
    if (this._width > oldWidth || this._height > oldHeight) {
      this._expandTileGrid(oldWidth, oldHeight);
    }
  }

  /**
   * Expand the tile grid to accommodate new dimensions
   * @private
   */
  _expandTileGrid(oldWidth, oldHeight) {
    const newTiles = [];

    // Create new expanded grid
    for (let y = 0; y < this._height; y++) {
      newTiles[y] = [];
      for (let x = 0; x < this._width; x++) {
        if (y < oldHeight && x < oldWidth && this._tiles[y] && this._tiles[y][x]) {
          // Copy existing tile
          newTiles[y][x] = this._tiles[y][x];
        } else {
          // Fill new areas with water
          newTiles[y][x] = TileType.WATER;
        }
      }
    }

    this._tiles = newTiles;
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

    // Create centered zone area with grass
    for (let y = this.zoneStartY; y < this.zoneEndY; y++) {
      for (let x = this.zoneStartX; x < this.zoneEndX; x++) {
        this._tiles[y][x] = TileType.GRASS;
      }
    }
  }

  getTileAt(position) {
    if (!this.isValidPosition(position)) {
      return TileType.WATER; // Out of bounds
    }
    return this._tiles[position.y][position.x];
  }

  setTileAt(position, tileType) {
    if (this.isValidPosition(position)) {
      this._tiles[position.y][position.x] = tileType;
    }
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
    const tile = this.getTileAt(position);
    return tile.walkable;
  }

  // Helper method to convert zone-relative coordinates to absolute coordinates
  zoneToAbsolute(zoneX, zoneY) {
    return new Position(this.zoneStartX + zoneX, this.zoneStartY + zoneY);
  }

  // Helper method to check if a position is within the zone area
  isInZoneArea(position) {
    return (
      position.x >= this.zoneStartX &&
      position.x < this.zoneEndX &&
      position.y >= this.zoneStartY &&
      position.y < this.zoneEndY
    );
  }
}
