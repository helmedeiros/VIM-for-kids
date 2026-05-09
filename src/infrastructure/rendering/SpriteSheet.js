/**
 * Wraps a loaded Image and provides frame extraction by index.
 * Sprite sheets are organized as a grid of equal-sized tiles.
 */
export class SpriteSheet {
  constructor(image, tileWidth, tileHeight, columns) {
    if (!image) {
      throw new Error('SpriteSheet requires a valid image');
    }
    if (tileWidth <= 0 || tileHeight <= 0) {
      throw new Error('Tile dimensions must be positive');
    }
    if (columns <= 0) {
      throw new Error('Columns must be positive');
    }

    this._image = image;
    this._tileWidth = tileWidth;
    this._tileHeight = tileHeight;
    this._columns = columns;
  }

  get image() {
    return this._image;
  }

  get tileWidth() {
    return this._tileWidth;
  }

  get tileHeight() {
    return this._tileHeight;
  }

  getFrame(index) {
    if (index < 0) {
      throw new Error('Frame index must be non-negative');
    }

    const col = index % this._columns;
    const row = Math.floor(index / this._columns);

    return {
      image: this._image,
      sx: col * this._tileWidth,
      sy: row * this._tileHeight,
      sw: this._tileWidth,
      sh: this._tileHeight,
    };
  }
}
