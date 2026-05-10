/**
 * Maps TileType names to sprite sheet frame indices.
 * Single source of truth for tile-to-sprite mapping.
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
