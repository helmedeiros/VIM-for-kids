/**
 * Determines edge-transition overlay style based on neighboring tiles.
 * Uses 4-bit bitmask (N, E, S, W) to detect terrain boundaries
 * and draws soft transition effects between different terrain types.
 */
export class AutoTiler {
  constructor() {
    // Tile groups: tiles in the same group don't get transitions between them
    this._groups = {
      water: 'water',
      grass: 'land',
      dirt: 'land',
      path: 'land',
      sand: 'land',
      field: 'land',
      bridge: 'land',
      test_ground: 'land',
      boss_area: 'land',
      tree: 'obstacle',
      stone: 'obstacle',
      wall: 'obstacle',
      ruins: 'obstacle',
      ramp_right: 'obstacle',
      ramp_left: 'obstacle',
      void: 'void',
    };
  }

  getGroup(tileName) {
    return this._groups[tileName] || 'land';
  }

  needsTransition(tileName, neighborName) {
    if (!tileName || !neighborName) return false;
    return this.getGroup(tileName) !== this.getGroup(neighborName);
  }

  /**
   * Compute 4-bit bitmask for a tile position.
   * Bit 0 (1) = North neighbor differs
   * Bit 1 (2) = East neighbor differs
   * Bit 2 (4) = South neighbor differs
   * Bit 3 (8) = West neighbor differs
   * @returns {number} 0-15 bitmask
   */
  computeMask(centerTile, northTile, eastTile, southTile, westTile) {
    let mask = 0;
    if (this.needsTransition(centerTile, northTile)) mask |= 1;
    if (this.needsTransition(centerTile, eastTile)) mask |= 2;
    if (this.needsTransition(centerTile, southTile)) mask |= 4;
    if (this.needsTransition(centerTile, westTile)) mask |= 8;
    return mask;
  }

  /**
   * Draw edge transition overlay on a tile.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} mask - 4-bit bitmask from computeMask
   * @param {number} screenX - screen X position
   * @param {number} screenY - screen Y position
   * @param {number} ts - tile size
   * @param {string} neighborGroup - the group of the differing neighbors
   */
  drawTransition(ctx, mask, screenX, screenY, ts, neighborGroup) {
    if (mask === 0) return;

    const shadowColor =
      neighborGroup === 'water'
        ? 'rgba(50, 100, 150, 0.3)'
        : 'rgba(0, 0, 0, 0.15)';

    const edgeSize = Math.floor(ts * 0.2);

    ctx.fillStyle = shadowColor;

    // North edge
    if (mask & 1) {
      ctx.fillRect(screenX, screenY, ts, edgeSize);
    }
    // East edge
    if (mask & 2) {
      ctx.fillRect(screenX + ts - edgeSize, screenY, edgeSize, ts);
    }
    // South edge
    if (mask & 4) {
      ctx.fillRect(screenX, screenY + ts - edgeSize, ts, edgeSize);
    }
    // West edge
    if (mask & 8) {
      ctx.fillRect(screenX, screenY, edgeSize, ts);
    }
  }
}
