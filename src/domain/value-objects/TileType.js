export class TileType {
    static GRASS = new TileType('grass', true);
    static WATER = new TileType('water', false);
    static DIRT = new TileType('dirt', true);
    static TREE = new TileType('tree', false);

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
