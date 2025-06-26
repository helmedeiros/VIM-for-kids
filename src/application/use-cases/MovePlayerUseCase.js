import { Position } from '../../domain/value-objects/Position.js'; // eslint-disable-line no-unused-vars

export class MovePlayerUseCase {
  constructor(gameState, gameRenderer) {
    this._gameState = gameState;
    this._gameRenderer = gameRenderer;
  }

  execute(direction) {
    const currentPosition = this._gameState.cursor.position;
    const newPosition = this._calculateNewPosition(currentPosition, direction);

    // Check if move is valid (both map and gate walkability)
    if (!this._isPositionWalkable(newPosition)) {
      return; // Invalid move, do nothing
    }

    // Update cursor position
    this._gameState.cursor = this._gameState.cursor.moveTo(newPosition);

    // Check for key collection
    this._checkKeyCollection();

    // Re-render the game
    this._gameRenderer.render(this._gameState.getCurrentState());
  }

  _isPositionWalkable(position) {
    // First check if the map position is walkable
    if (!this._gameState.map.isWalkable(position)) {
      return false;
    }

    // Then check if there's a gate at this position and if it's walkable
    const gate = this._gameState.getGate();
    if (gate && gate.position.equals(position)) {
      return gate.isWalkable();
    }

    return true;
  }

  _calculateNewPosition(currentPosition, direction) {
    const movements = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };

    const movement = movements[direction];
    if (!movement) {
      throw new Error(`Invalid direction: ${direction}`);
    }

    return currentPosition.move(movement.x, movement.y);
  }

  _checkKeyCollection() {
    const cursorPosition = this._gameState.cursor.position;
    const keyAtPosition = this._gameState.availableKeys.find((key) =>
      key.position.equals(cursorPosition)
    );

    if (keyAtPosition) {
      this._gameState.collectKey(keyAtPosition);
      this._gameRenderer.showKeyInfo(keyAtPosition);
    }
  }
}
