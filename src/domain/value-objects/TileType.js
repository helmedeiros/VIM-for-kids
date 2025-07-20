export class TileType {
  constructor(name, walkable) {
    this._name = name;
    this._walkable = walkable;
  }

  get name() {
    return this._name;
  }

  get walkable() {
    return this._walkable;
  }

  equals(other) {
    return other instanceof TileType && this._name === other._name;
  }

  toString() {
    return this._name;
  }
}

// Define static instances after class definition
TileType.GRASS = new TileType('grass', true);
TileType.WATER = new TileType('water', false);
TileType.DIRT = new TileType('dirt', true);
TileType.TREE = new TileType('tree', false);
TileType.STONE = new TileType('stone', false);

// Additional tile types for different zones
TileType.PATH = new TileType('path', true);
TileType.WALL = new TileType('wall', false);
TileType.BRIDGE = new TileType('bridge', true);
TileType.SAND = new TileType('sand', true);
TileType.RUINS = new TileType('ruins', false);
TileType.FIELD = new TileType('field', true);
TileType.TEST_GROUND = new TileType('test_ground', true);
TileType.BOSS_AREA = new TileType('boss_area', true);

// Directional ramp tiles - walkable but with movement restrictions based on approach direction
TileType.RAMP_RIGHT = new TileType('ramp_right', true);
TileType.RAMP_LEFT = new TileType('ramp_left', true);
