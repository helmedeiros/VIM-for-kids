import { Position } from '../../domain/value-objects/Position.js'; // eslint-disable-line no-unused-vars

/**
 * Use case for handling player movement
 * Focused solely on cursor movement and immediate consequences (key collection)
 * Progression handling is delegated to HandleProgressionUseCase
 * NPC interactions are delegated to NPCInteractionUseCase
 */
export class MovePlayerUseCase {
  constructor(gameState, gameRenderer, progressionUseCase = null, npcInteractionUseCase = null) {
    this._gameState = gameState;
    this._gameRenderer = gameRenderer;
    this._progressionUseCase = progressionUseCase;
    this._npcInteractionUseCase = npcInteractionUseCase;
  }

  async execute(direction) {
    const currentPosition = this._gameState.cursor.position;
    const newPosition = this._calculateNewPosition(currentPosition, direction);

    // Check if move is valid (both map and gate walkability, plus directional ramp logic)
    if (!this._isPositionWalkable(newPosition, direction)) {
      return { success: false, reason: 'invalid_position' }; // Invalid move, do nothing
    }

    // Check if we're leaving an NPC position (fade out balloons)
    this._checkNPCExit(currentPosition, newPosition);

    // Update cursor position
    this._gameState.cursor = this._gameState.cursor.moveTo(newPosition);

    // Check for key collection
    const keyCollected = this._checkKeyCollection();

    // Check for NPC interaction
    const npcInteraction = this._checkNPCInteraction();

    // Re-render the game with new state
    this._gameRenderer.render(this._gameState.getCurrentState());

    // Delegate progression check to progression use case if available
    let progressionResult = { type: 'none' };
    if (this._progressionUseCase && this._progressionUseCase.shouldExecuteProgression()) {
      progressionResult = await this._progressionUseCase.execute();
    }

    return {
      success: true,
      newPosition,
      keyCollected,
      npcInteraction,
      progressionResult,
    };
  }

  // Synchronous version for backward compatibility (used in integration tests)
  executeSync(direction) {
    const currentPosition = this._gameState.cursor.position;
    const newPosition = this._calculateNewPosition(currentPosition, direction);

    // Check if move is valid (both map and gate walkability, plus directional ramp logic)
    if (!this._isPositionWalkable(newPosition, direction)) {
      return { success: false, reason: 'invalid_position' }; // Invalid move, do nothing
    }

    // Check if we're leaving an NPC position (fade out balloons)
    this._checkNPCExit(currentPosition, newPosition);

    // Update cursor position
    this._gameState.cursor = this._gameState.cursor.moveTo(newPosition);

    // Check for key collection
    const keyCollected = this._checkKeyCollection();

    // Check for NPC interaction
    const npcInteraction = this._checkNPCInteraction();

    // Re-render the game with new state
    this._gameRenderer.render(this._gameState.getCurrentState());

    // For sync version, skip progression to avoid async complexity
    const progressionResult = { type: 'none' };

    return {
      success: true,
      newPosition,
      keyCollected,
      npcInteraction,
      progressionResult,
    };
  }

  _isPositionWalkable(position, direction = null) {
    // First check if the map position is walkable
    if (!this._gameState.map.isWalkable(position)) {
      return false;
    }

    // Check directional ramp logic if we have direction info
    if (direction && !this._isRampMovementAllowed(position, direction)) {
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

  _isRampMovementAllowed(targetPosition, direction) {
    // Get the tile type at the target position
    const tileAtTarget = this._gameState.map.getTileAt(targetPosition);

    // If it's not a ramp tile, allow movement (regular walkability rules apply)
    if (!tileAtTarget || (tileAtTarget.name !== 'ramp_right' && tileAtTarget.name !== 'ramp_left')) {
      return true;
    }

    // For ramp tiles, check if we're approaching from the correct direction
    if (tileAtTarget.name === 'ramp_right') {
      // Ramp right (<) allows movement only when coming from the right (moving left)
      return direction === 'right';
    } else if (tileAtTarget.name === 'ramp_left') {
      // Ramp left (>) allows movement only when coming from the left (moving right)
      return direction === 'left';
    }

    return false;
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
      return keyAtPosition;
    }

    return null;
  }

  _checkNPCInteraction() {
    // Delegate NPC interaction to dedicated use case if available
    if (this._npcInteractionUseCase) {
      const cursorPosition = this._gameState.cursor.position;
      const gameState = this._gameState.getCurrentState();
      return this._npcInteractionUseCase.execute(cursorPosition, gameState);
    }

    // Fallback: no interaction occurred
    return { interactionOccurred: false, npc: null };
  }

  _checkNPCExit(currentPosition, newPosition) {
    // Only trigger fade-out if we have both the NPC interaction use case and game renderer
    if (!this._npcInteractionUseCase || !this._gameRenderer) {
      return;
    }

    // Check if we're moving away from an NPC position
    const gameState = this._gameState.getCurrentState();
    const hadNPCAtOldPosition = this._hasNPCAtPosition(currentPosition, gameState);
    const hasNPCAtNewPosition = this._hasNPCAtPosition(newPosition, gameState);

    // If we're leaving an NPC position and not moving to another NPC, fade out balloons
    if (hadNPCAtOldPosition && !hasNPCAtNewPosition) {
      // Trigger fade-out if the renderer supports it
      if (typeof this._gameRenderer.fadeOutExistingBalloons === 'function') {
        this._gameRenderer.fadeOutExistingBalloons();
      }
    }
  }

  _hasNPCAtPosition(position, gameState) {
    // Check if there's an NPC at the given position
    const npcs = gameState.npcs || [];
    return npcs.some(npc => {
      if (!npc.position) {
        return false;
      }

      // Handle Position objects with equals method
      if (typeof npc.position.equals === 'function') {
        return npc.position.equals(position);
      }

      // Handle plain objects with x,y properties
      if (typeof npc.position === 'object' && npc.position.x !== undefined && npc.position.y !== undefined) {
        return npc.position.x === position.x && npc.position.y === position.y;
      }

      // Handle arrays [x, y]
      if (Array.isArray(npc.position) && npc.position.length >= 2) {
        return npc.position[0] === position.x && npc.position[1] === position.y;
      }

      return false;
    });
  }
}
