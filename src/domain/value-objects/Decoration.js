import { Position } from './Position.js';

/**
 * A decoration is a multi-tile sprite placed on the map (e.g. a 2x2 tree,
 * a 2x3 house). Decorations live above the tile grid: each one has an
 * anchor position (top-left cell of its footprint), a region name pointing
 * at the source artwork, an integer footprint, and a blocking flag that
 * folds into walkability.
 */
export class Decoration {
  constructor({
    regionName,
    anchor,
    footprintW,
    footprintH,
    blocking = false,
    collisionFootprintH,
  }) {
    if (typeof regionName !== 'string' || regionName.length === 0) {
      throw new Error('Decoration requires a non-empty regionName');
    }
    if (!(anchor instanceof Position)) {
      throw new Error('Decoration anchor must be a Position');
    }
    if (
      !Number.isInteger(footprintW) ||
      !Number.isInteger(footprintH) ||
      footprintW <= 0 ||
      footprintH <= 0
    ) {
      throw new Error('Decoration footprint must be positive integers');
    }
    this._regionName = regionName;
    this._anchor = anchor;
    this._footprintW = footprintW;
    this._footprintH = footprintH;
    this._blocking = Boolean(blocking);
    // Optional: number of bottom rows that actually block movement. Lets a
    // tall sprite (2x2 boulder, tree) be passable through the top — the
    // player walks "into" the cell and gets hidden behind the sprite.
    // Defaults to the full visual footprint so existing decorations
    // (trees, etc.) keep blocking every occupied cell.
    this._collisionFootprintH =
      collisionFootprintH === undefined ? footprintH : collisionFootprintH;
  }

  get regionName() {
    return this._regionName;
  }
  get anchor() {
    return this._anchor;
  }
  get footprintW() {
    return this._footprintW;
  }
  get footprintH() {
    return this._footprintH;
  }
  get blocking() {
    return this._blocking;
  }
  get collisionFootprintH() {
    return this._collisionFootprintH;
  }
  get baseY() {
    return this._anchor.y + this._footprintH - 1;
  }

  blocks(position) {
    if (!this._blocking) return false;
    const dx = position.x - this._anchor.x;
    const dy = position.y - this._anchor.y;
    const collisionStartY = this._footprintH - this._collisionFootprintH;
    return (
      dx >= 0 &&
      dx < this._footprintW &&
      dy >= collisionStartY &&
      dy < this._footprintH
    );
  }

  occupies(position) {
    const dx = position.x - this._anchor.x;
    const dy = position.y - this._anchor.y;
    return dx >= 0 && dx < this._footprintW && dy >= 0 && dy < this._footprintH;
  }

  overlapsBounds({ startX, startY, endX, endY }) {
    const x0 = this._anchor.x;
    const y0 = this._anchor.y;
    const x1 = x0 + this._footprintW;
    const y1 = y0 + this._footprintH;
    return x0 < endX && x1 > startX && y0 < endY && y1 > startY;
  }
}
