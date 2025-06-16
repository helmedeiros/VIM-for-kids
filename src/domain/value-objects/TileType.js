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
