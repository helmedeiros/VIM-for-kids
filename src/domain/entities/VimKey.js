import { Position } from '../value-objects/Position.js';

export class VimKey {
    constructor(position, key, description) {
        if (!(position instanceof Position)) {
            throw new Error('VimKey position must be a Position instance');
        }
        if (typeof key !== 'string' || key.length !== 1) {
            throw new Error('VimKey key must be a single character string');
        }
        if (typeof description !== 'string') {
            throw new Error('VimKey description must be a string');
        }

        this._position = position;
        this._key = key;
        this._description = description;
    }

    get position() {
        return this._position;
    }

    get key() {
        return this._key;
    }

    get description() {
        return this._description;
    }

    equals(other) {
        return other instanceof VimKey &&
               this._position.equals(other._position) &&
               this._key === other._key;
    }
}
