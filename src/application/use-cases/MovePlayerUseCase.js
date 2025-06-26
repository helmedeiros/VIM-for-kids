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

    // Check for progression after moving
    this._checkProgression();

    // Re-render the game
    this._gameRenderer.render(this._gameState.getCurrentState());
  }

  _isPositionWalkable(position) {
    // First check if the map position is walkable
    if (!this._gameState.map.isWalkable(position)) {
      return false;
    }

    // Then check if there's a gate at this position and if it's walkable
    // Only check gates if the game state supports them (backward compatibility)
    if (typeof this._gameState.getGate === 'function') {
      const gate = this._gameState.getGate();
      if (gate && gate.position.equals(position)) {
        return gate.isWalkable();
      }
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

  _checkProgression() {
    // Check if progression should happen (only if game state supports it)
    if (typeof this._gameState.executeProgression === 'function') {
      const progressionResult = this._gameState.executeProgression();

      if (progressionResult.type === 'zone') {
        this._handleZoneProgression(progressionResult.newZoneId);
      } else if (progressionResult.type === 'level') {
        this._handleLevelProgression(progressionResult.nextLevelId);
      }
    }
  }

  _handleZoneProgression(newZoneId) {
    // Show zone progression message
    if (this._gameRenderer.showMessage) {
      this._gameRenderer.showMessage(`Progressing to ${newZoneId}...`);
    }

    // The zone has already been loaded by executeProgression
    // Just need to re-render with new state
  }

  _handleLevelProgression(nextLevelId) {
    // Show level progression message
    if (this._gameRenderer.showMessage) {
      this._gameRenderer.showMessage(`Level Complete! Progressing to ${nextLevelId}...`);
    } else {
      // Fallback to alert if showMessage is not available
      alert(`Level Complete! Progressing to ${nextLevelId}...`);
    }

    // Trigger level transition through the global game instance
    setTimeout(async () => {
      if (window.vimForKidsGame && typeof window.vimForKidsGame.transitionToLevel === 'function') {
        await window.vimForKidsGame.transitionToLevel(nextLevelId);
      } else {
        // Fallback: reload page with new level parameter
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('level', nextLevelId);
        window.location.href = currentUrl.toString();
      }
    }, 2000); // 2 second delay to show the message
  }
}
