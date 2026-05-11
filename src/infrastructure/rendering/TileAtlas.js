/**
 * Maps TileType names to sprite sheet frame indices.
 * Single source of truth for tile-to-sprite mapping.
 *
 * Also supports irregular pixel regions (registerRegion / getRegion)
 * so individual tiles can point at any rectangle in any source image —
 * needed when the source art is not a uniform grid.
 */
export class TileAtlas {
  constructor() {
    this._mapping = {
      water: 0,
      grass: 1,
      dirt: 2,
      tree: 3,
      stone: 4,
      path: 5,
      wall: 6,
      bridge: 7,
      sand: 8,
      ruins: 9,
      field: 10,
      test_ground: 11,
      boss_area: 12,
      ramp_right: 13,
      ramp_left: 14,
      void: 15,
      rock: 16,
    };
    this._regions = new Map();
  }

  registerRegion(tileName, region) {
    if (typeof tileName !== 'string' || tileName.length === 0) {
      throw new Error('registerRegion requires a non-empty tile name');
    }
    if (!region || typeof region !== 'object') {
      throw new Error('registerRegion requires a region object');
    }
    if (!region.image) {
      throw new Error('region.image is required');
    }
    for (const key of ['sx', 'sy', 'sw', 'sh']) {
      if (typeof region[key] !== 'number') {
        throw new Error(`region.${key} must be a number`);
      }
    }
    this._regions.set(tileName, {
      image: region.image,
      sx: region.sx,
      sy: region.sy,
      sw: region.sw,
      sh: region.sh,
    });
  }

  getRegion(tileName) {
    return this._regions.get(tileName) || null;
  }

  getFrameIndex(tileName) {
    const index = this._mapping[tileName];
    return index !== undefined ? index : this._mapping.water;
  }

  hasTile(tileName) {
    return tileName in this._mapping;
  }

  get tileCount() {
    return Object.keys(this._mapping).length;
  }

  getAllMappings() {
    return { ...this._mapping };
  }
}
