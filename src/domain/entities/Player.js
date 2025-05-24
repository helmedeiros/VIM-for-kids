import { Position } from '../value-objects/Position.js';

export class Player {
    constructor(position = new Position(5, 2)) {
        if (!(position instanceof Position)) {
            throw new Error('Player position must be a Position instance');
        }
        this._position = position;
    }

    get position() {
        return this._position;
    }

    moveTo(newPosition) {
        if (!(newPosition instanceof Position)) {
            throw new Error('New position must be a Position instance');
        }
        return new Player(newPosition);
    }

    equals(other) {
        return other instanceof Player && this._position.equals(other._position);
    }
}
