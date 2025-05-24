import { Position } from '../../domain/value-objects/Position.js';

export class MovePlayerUseCase {
    constructor(gameState, gameRenderer) {
        this._gameState = gameState;
        this._gameRenderer = gameRenderer;
    }

    execute(direction) {
        const currentPosition = this._gameState.player.position;
        const newPosition = this._calculateNewPosition(currentPosition, direction);

        // Check if move is valid
        if (!this._gameState.map.isWalkable(newPosition)) {
            return; // Invalid move, do nothing
        }

        // Update player position
        this._gameState.player = this._gameState.player.moveTo(newPosition);

        // Check for key collection
        this._checkKeyCollection();

        // Re-render the game
        this._gameRenderer.render(this._gameState.getCurrentState());
    }

    _calculateNewPosition(currentPosition, direction) {
        const movements = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };

        const movement = movements[direction];
        if (!movement) {
            throw new Error(`Invalid direction: ${direction}`);
        }

        return currentPosition.move(movement.x, movement.y);
    }

    _checkKeyCollection() {
        const playerPosition = this._gameState.player.position;
        const keyAtPosition = this._gameState.availableKeys.find(key =>
            key.position.equals(playerPosition)
        );

        if (keyAtPosition) {
            this._gameState.collectKey(keyAtPosition);
            this._gameRenderer.showKeyInfo(keyAtPosition);
        }
    }
}
