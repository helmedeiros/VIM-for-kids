export class Position {
    constructor(x, y) {
        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            throw new Error('Position coordinates must be integers');
        }
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    equals(other) {
        return other instanceof Position && this._x === other._x && this._y === other._y;
    }

    move(deltaX, deltaY) {
        return new Position(this._x + deltaX, this._y + deltaY);
    }

    toString() {
        return `Position(${this._x}, ${this._y})`;
    }
}
