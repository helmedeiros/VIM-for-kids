import { Position } from '../../domain/value-objects/Position.js'; // eslint-disable-line no-unused-vars
import { WordMotion } from '../../domain/services/WordMotion.js';

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
    if (direction === 'word_forward') {
      return this._executeWordMotion('w', WordMotion.findNextWordStart);
    }
    if (direction === 'word_end') {
      return this._executeWordMotion('e', WordMotion.findNextWordEnd);
    }
    if (direction === 'word_backward') {
      return this._executeWordMotion('b', WordMotion.findPreviousWordStart);
    }

    const currentPosition = this._gameState.cursor.position;
    const newPosition = this._calculateNewPosition(currentPosition, direction);

    const walkCheck = this._checkWalkability(newPosition, direction);
    if (!walkCheck.walkable) {
      if (walkCheck.blockedBy === 'npc') {
        // Bump-to-talk: trigger NPC dialogue at the target without moving.
        const npcInteraction = this._triggerNPCInteractionAt(newPosition);
        return { success: false, reason: 'npc_block', npcInteraction };
      }
      if (walkCheck.blockedBy && typeof this._gameRenderer.showLockedGateHint === 'function') {
        this._gameRenderer.showLockedGateHint(walkCheck.blockedBy);
      }
      return { success: false, reason: 'invalid_position' };
    }

    // Column memory may map a vertical move back to the start position; surface the
    // locked-gate hint for the direct target so the player gets feedback either way.
    if (newPosition.equals(currentPosition)) {
      const directTarget = currentPosition.move(
        direction === 'right' ? 1 : direction === 'left' ? -1 : 0,
        direction === 'down' ? 1 : direction === 'up' ? -1 : 0
      );
      const directCheck = this._checkWalkability(directTarget, direction);
      if (directCheck.blockedBy === 'npc') {
        const npcInteraction = this._triggerNPCInteractionAt(directTarget);
        return { success: false, reason: 'npc_block', npcInteraction };
      }
      if (directCheck.blockedBy && typeof this._gameRenderer.showLockedGateHint === 'function') {
        this._gameRenderer.showLockedGateHint(directCheck.blockedBy);
      }
      return { success: false, reason: 'invalid_position' };
    }

    this._checkNPCExit(currentPosition, newPosition);

    if (direction === 'up' || direction === 'down') {
      this._gameState.cursor = this._gameState.cursor.moveToWithColumnMemory(newPosition);
    } else {
      this._gameState.cursor = this._gameState.cursor.moveTo(newPosition);
    }

    return this._finalizeMove(newPosition);
  }

  // Shared driver for word-based motions (vim 'w', 'e'). The strategy parameter
  // picks WHICH word-position to land on (start vs end). Required key is the
  // vim-key letter the player must have collected to use this motion.
  async _executeWordMotion(requiredKey, findTarget) {
    if (!this._hasCollectedKey(requiredKey)) {
      return { success: false, reason: 'word_motion_locked' };
    }

    const labels = this._gameState.getTextLabels();
    if (labels.length === 0) {
      return { success: false, reason: 'no_text' };
    }

    const cursorPos = this._gameState.cursor.position;
    const onText = labels.some((l) => l.position.equals(cursorPos));
    if (!onText) {
      return { success: false, reason: 'not_on_text' };
    }

    const isWalkable = (pos) => this._isWalkableForWordMotion(pos);
    const target = findTarget(cursorPos, labels, isWalkable);
    if (!target) {
      return { success: false, reason: 'no_next_word' };
    }

    this._checkNPCExit(cursorPos, target);
    this._gameState.cursor = this._gameState.cursor.moveTo(target);

    return this._finalizeMove(target);
  }

  async _finalizeMove(newPosition) {
    const keyCollected = this._checkKeyCollection();
    const npcInteraction = this._checkNPCInteraction();
    this._gameRenderer.render(this._gameState.getCurrentState());

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

    // Check if move is valid
    const walk = this._checkWalkability(newPosition, direction);
    if (!walk.walkable) {
      if (walk.blockedBy === 'npc') {
        const npcInteraction = this._triggerNPCInteractionAt(newPosition);
        return { success: false, reason: 'npc_block', npcInteraction };
      }
      return { success: false, reason: 'invalid_position' };
    }

    // Check if we're leaving an NPC position (fade out balloons)
    this._checkNPCExit(currentPosition, newPosition);

    // Update cursor position with column memory logic
    if (direction === 'up' || direction === 'down') {
      // For vertical movement, preserve column memory
      this._gameState.cursor = this._gameState.cursor.moveToWithColumnMemory(newPosition);
    } else {
      // For horizontal movement, update remembered column
      this._gameState.cursor = this._gameState.cursor.moveTo(newPosition);
    }

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

  _checkWalkability(position, direction = null) {
    // NPCs are impassable. Detect them before any tile/gate checks so that
    // bump-to-talk works even when the NPC stands on a walkable tile.
    const npcAtTarget = this._findNPCAtPosition(position);
    if (npcAtTarget) {
      return { walkable: false, blockedBy: 'npc', npc: npcAtTarget };
    }

    // Check gates first (they overlay map tiles and have their own walkability)
    if (typeof this._gameState.getGate === 'function') {
      const gate = this._gameState.getGate();
      if (gate && gate.position.equals(position)) {
        return gate.isWalkable() ? { walkable: true } : { walkable: false, blockedBy: 'main' };
      }
    }

    if (typeof this._gameState.getSecondaryGates === 'function') {
      for (const gate of this._gameState.getSecondaryGates()) {
        if (gate && gate.position.equals(position)) {
          if (gate.isWalkable()) return { walkable: true };
          if (typeof this._gameState.tryUnlockSecondaryGate === 'function') {
            return this._gameState.tryUnlockSecondaryGate(position)
              ? { walkable: true }
              : { walkable: false, blockedBy: 'secondary' };
          }
          return { walkable: false, blockedBy: 'secondary' };
        }
      }
    }

    if (!this._gameState.map.isWalkable(position)) {
      return { walkable: false };
    }

    if (direction && !this._isRampMovementAllowed(position, direction)) {
      return { walkable: false };
    }

    return { walkable: true };
  }

  _hasWordKey() {
    return this._hasCollectedKey('w');
  }

  _hasCollectedKey(key) {
    return this._gameState.collectedKeys.has(key);
  }

  _isPositionWalkable(position, direction = null) {
    return this._checkWalkability(position, direction).walkable;
  }

  // Side-effect-free walkability predicate used by the WordMotion flood-fill.
  // Mirrors _checkWalkability but never triggers tryUnlockSecondaryGate (which
  // would consume collected keys). Word motions (w, e) can hop over rocks AND
  // walls — but water (and any other non-walkable tile not in this list) stays
  // a hard border between text groups.
  _isWalkableForWordMotion(position) {
    if (typeof this._gameState.getGate === 'function') {
      const gate = this._gameState.getGate();
      if (gate && gate.position.equals(position)) {
        return gate.isWalkable();
      }
    }
    if (typeof this._gameState.getSecondaryGates === 'function') {
      for (const gate of this._gameState.getSecondaryGates()) {
        if (gate && gate.position.equals(position)) {
          return gate.isWalkable();
        }
      }
    }
    if (this._gameState.map.isWalkable(position)) return true;
    const tile = this._gameState.map.getTileAt(position);
    return !!(tile && (tile.name === 'rock' || tile.name === 'wall'));
  }

  _isRampMovementAllowed(targetPosition, direction) {
    // Get the tile type at the target position
    const tileAtTarget = this._gameState.map.getTileAt(targetPosition);

    // If it's not a ramp tile, allow movement (regular walkability rules apply)
    if (
      !tileAtTarget ||
      (tileAtTarget.name !== 'ramp_right' && tileAtTarget.name !== 'ramp_left')
    ) {
      return true;
    }

    // Allow vertical movement (up/down) onto any ramp tile
    // Players should be able to step down onto ramps from above or climb up onto them
    if (direction === 'up' || direction === 'down') {
      return true;
    }

    // For horizontal movement, check directional constraints
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

    // For vertical movement, implement Vim-like column memory
    if (direction === 'up' || direction === 'down') {
      return this._calculateVerticalMovementWithColumnMemory(currentPosition, direction);
    }

    // For horizontal movement, standard calculation
    return currentPosition.move(movement.x, movement.y);
  }

  /**
   * Calculate vertical movement with Vim-like column memory behavior
   * Column memory only applies to water tiles, not other obstacles
   * @private
   */
  _calculateVerticalMovementWithColumnMemory(currentPosition, direction) {
    const yMovement = direction === 'up' ? -1 : 1;
    const targetY = currentPosition.y + yMovement;
    const rememberedColumn = this._gameState.cursor.rememberedColumn;

    // First, try to move to the remembered column
    let targetPosition = new Position(rememberedColumn, targetY);

    // If the remembered column position is walkable, use it
    if (this._isPositionWalkable(targetPosition)) {
      return targetPosition;
    }

    // If not walkable, check if the blocking tile is water
    // Column memory only applies to water tiles (representing "shorter lines" like in Vim)
    // For other obstacles (walls, stone, etc.), use normal movement
    const blockingTile = this._gameState.map.getTileAt(targetPosition);
    const isWaterBlocked = blockingTile && blockingTile.name === 'water';

    if (isWaterBlocked) {
      // Use column memory behavior for water tiles
      targetPosition = this._findNearestWalkableInRow(targetY, rememberedColumn);

      if (targetPosition) {
        return targetPosition;
      }
    } else {
      // For non-water obstacles, try normal movement (direct target position)
      const directTarget = new Position(currentPosition.x, targetY);
      if (this._isPositionWalkable(directTarget)) {
        return directTarget;
      }
    }

    // If no walkable position found, return current position (no movement)
    return currentPosition;
  }

  /**
   * Find the rightmost walkable position on the left side of water, like Vim's "end of line" behavior
   * Limited to 5 spaces away from the preferred column to prevent unexpected long jumps
   * Only returns positions that are walkably connected to the current position
   * @private
   */
  _findNearestWalkableInRow(targetY, preferredX) {
    // Check bounds first
    if (targetY < 0 || targetY >= this._gameState.map.height) {
      return null;
    }

    const mapWidth = this._gameState.map.width;
    const maxSearchDistance = 5; // Limit search to 5 spaces away

    // First check the preferred column
    if (preferredX >= 0 && preferredX < mapWidth) {
      const preferredPosition = new Position(preferredX, targetY);
      if (this._isPositionWalkable(preferredPosition)) {
        return preferredPosition;
      }
    }

    // Find the end of the leftmost contiguous walkable area within 5 spaces
    // This simulates Vim's behavior of going to the "end of line" when moving to a shorter line
    // BUT only if the areas are walkably connected
    const leftBoundary = Math.max(0, preferredX - maxSearchDistance);

    // Find the leftmost contiguous walkable area and return its rightmost position
    let leftmostWalkableStart = null;
    let endOfLeftmostArea = null;

    // First, find the start of the leftmost walkable area
    for (let x = leftBoundary; x < preferredX; x++) {
      const position = new Position(x, targetY);
      if (this._isPositionWalkable(position)) {
        leftmostWalkableStart = x;
        break;
      }
    }

    // If we found a leftmost walkable area, find its end
    if (leftmostWalkableStart !== null) {
      for (let x = leftmostWalkableStart; x < preferredX; x++) {
        const position = new Position(x, targetY);
        if (this._isPositionWalkable(position)) {
          endOfLeftmostArea = new Position(x, targetY);
        } else {
          // Hit a non-walkable tile, so we've found the end of the contiguous area
          break;
        }
      }

      // Check if this area is walkably connected to current position
      if (
        endOfLeftmostArea &&
        this._isWalkablyConnected(
          this._gameState.cursor.position,
          endOfLeftmostArea,
          maxSearchDistance
        )
      ) {
        return endOfLeftmostArea;
      }
    }

    // If no walkable position found on the left, check right side as fallback
    // but still prefer left over right when equidistant, and only if connected
    const rightBoundary = Math.min(mapWidth - 1, preferredX + maxSearchDistance);

    for (let x = preferredX + 1; x <= rightBoundary; x++) {
      const position = new Position(x, targetY);
      if (this._isPositionWalkable(position)) {
        // Check if this position is walkably connected
        if (
          this._isWalkablyConnected(this._gameState.cursor.position, position, maxSearchDistance)
        ) {
          return position;
        }
      }
    }

    return null;
  }

  /**
   * Check if two positions are walkably connected within a maximum distance
   * This ensures column memory only works between truly connected areas
   * @private
   */
  _isWalkablyConnected(fromPosition, toPosition, maxDistance) {
    // If positions are in the same row, check horizontal connectivity
    if (fromPosition.y === toPosition.y) {
      return this._areHorizontallyConnected(fromPosition, toPosition, maxDistance);
    }

    // Special case: if the starting position is isolated (only walkable tile in its row),
    // allow movement as any jump would be valid from an isolated position
    if (this._isPositionIsolated(fromPosition)) {
      return Math.abs(fromPosition.x - toPosition.x) <= maxDistance;
    }

    // For vertical movement, check if there's a walkable bridge between the rows
    // We need to find a column that's walkable in both rows within the maxDistance
    const minX = Math.max(0, Math.min(fromPosition.x, toPosition.x) - maxDistance);
    const maxX = Math.min(
      this._gameState.map.width - 1,
      Math.max(fromPosition.x, toPosition.x) + maxDistance
    );

    for (let x = minX; x <= maxX; x++) {
      const fromRowPosition = new Position(x, fromPosition.y);
      const toRowPosition = new Position(x, toPosition.y);

      // Check if this column provides a walkable bridge
      if (this._isPositionWalkable(fromRowPosition) && this._isPositionWalkable(toRowPosition)) {
        // Check if we can reach this bridge from both positions horizontally
        if (
          this._areHorizontallyConnected(fromPosition, fromRowPosition, maxDistance) &&
          this._areHorizontallyConnected(toPosition, toRowPosition, maxDistance)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if a position is isolated (only walkable tile in its row within search distance)
   * @private
   */
  _isPositionIsolated(position) {
    const maxSearchDistance = 5;
    const minX = Math.max(0, position.x - maxSearchDistance);
    const maxX = Math.min(this._gameState.map.width - 1, position.x + maxSearchDistance);

    // Count walkable positions in the row within search distance
    let walkableCount = 0;
    for (let x = minX; x <= maxX; x++) {
      const checkPosition = new Position(x, position.y);
      if (this._isPositionWalkable(checkPosition)) {
        walkableCount++;
        if (walkableCount > 1) {
          return false; // Not isolated
        }
      }
    }

    return walkableCount === 1; // Only the starting position is walkable
  }

  /**
   * Check if two positions in the same row are horizontally connected by walkable tiles
   * @private
   */
  _areHorizontallyConnected(fromPosition, toPosition, maxDistance) {
    if (fromPosition.y !== toPosition.y) {
      return false;
    }

    const startX = Math.min(fromPosition.x, toPosition.x);
    const endX = Math.max(fromPosition.x, toPosition.x);

    // Check if distance exceeds limit
    if (endX - startX > maxDistance) {
      return false;
    }

    // Check if all positions between start and end are walkable
    for (let x = startX; x <= endX; x++) {
      const position = new Position(x, fromPosition.y);
      if (!this._isPositionWalkable(position)) {
        return false;
      }
    }

    return true;
  }

  _checkKeyCollection() {
    const cursorPosition = this._gameState.cursor.position;



    // Check for VIM keys
    const vimKeyAtPosition = this._gameState.availableKeys.find((key) =>
      key.position.equals(cursorPosition)
    );

    if (vimKeyAtPosition) {
      this._gameState.collectKey(vimKeyAtPosition);
      this._gameRenderer.showKeyInfo(vimKeyAtPosition);
      return vimKeyAtPosition;
    }

    // Check for CollectibleKeys
    // Get fresh keys from getCurrentState() instead of stale property
    const currentState = this._gameState.getCurrentState();

    if (currentState.availableCollectibleKeys) {
      const collectibleKeyAtPosition = currentState.availableCollectibleKeys.find((key) =>
        key.position.equals(cursorPosition)
      );

      if (collectibleKeyAtPosition) {
        const isFirstCollectible = this._gameState.collectedCollectibleKeys
          ? this._gameState.collectedCollectibleKeys.size === 0
          : false;

        if (typeof this._gameState.collectCollectibleKey === 'function') {
          this._gameState.collectCollectibleKey(collectibleKeyAtPosition);
        } else {
          this._gameState.collectKey(collectibleKeyAtPosition);
        }

        if (isFirstCollectible && typeof this._gameRenderer.showCollectibleKeyIntro === 'function') {
          this._gameRenderer.showCollectibleKeyIntro(collectibleKeyAtPosition);
        } else {
          this._gameRenderer.showKeyInfo(collectibleKeyAtPosition);
        }

        return collectibleKeyAtPosition;
      }
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

  _findNPCAtPosition(position) {
    if (typeof this._gameState.getCurrentState !== 'function') return null;
    const state = this._gameState.getCurrentState();
    if (!state || !Array.isArray(state.npcs)) return null;
    return (
      state.npcs.find(
        (npc) =>
          npc &&
          Array.isArray(npc.position) &&
          npc.position[0] === position.x &&
          npc.position[1] === position.y
      ) || null
    );
  }

  _triggerNPCInteractionAt(position) {
    // Used by bump-to-talk: dialogue fires at the NPC's cell while the cursor
    // stays in place. Returns the interaction result so callers can include it
    // in the response payload alongside reason: 'npc_block'.
    if (!this._npcInteractionUseCase) {
      return { interactionOccurred: false, npc: null };
    }
    const gameState = this._gameState.getCurrentState();
    return this._npcInteractionUseCase.execute(position, gameState);
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
    return npcs.some((npc) => {
      if (!npc.position) {
        return false;
      }

      // Handle Position objects with equals method
      if (typeof npc.position.equals === 'function') {
        return npc.position.equals(position);
      }

      // Handle plain objects with x,y properties
      if (
        typeof npc.position === 'object' &&
        npc.position.x !== undefined &&
        npc.position.y !== undefined
      ) {
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
