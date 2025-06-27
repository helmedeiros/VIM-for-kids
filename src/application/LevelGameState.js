import { Cursor } from '../domain/entities/Cursor.js';
import { GameRegistry } from '../infrastructure/data/GameRegistry.js';

export class LevelGameState {
  constructor(zoneProvider, levelConfig, gameId = null) {
    if (!zoneProvider || !levelConfig) {
      throw new Error('LevelGameState requires zoneProvider and levelConfig');
    }

    if (!levelConfig.zones || levelConfig.zones.length === 0) {
      throw new Error('Level must contain at least one zone');
    }

    this._zoneProvider = zoneProvider;
    this._levelConfig = levelConfig;
    this._gameId = gameId;
    this._currentZoneIndex = 0;
    this._completedZones = new Set();

    // Initialize first zone
    this._loadZone(this._getCurrentZoneId());
  }

  _loadZone(zoneId) {
    try {
      this.zone = this._zoneProvider.createZone(zoneId);
      this.map = this.zone.gameMap;
      this.cursor = new Cursor(this.zone.getCursorStartPosition());
      this.availableKeys = this.zone.vimKeys;
      this.collectedKeys = new Set();
    } catch (error) {
      throw new Error(`Zone '${zoneId}' not found in registry`);
    }
  }

  _getCurrentZoneId() {
    return this._levelConfig.zones[this._currentZoneIndex];
  }

  // Zone Navigation
  getCurrentZoneId() {
    return this._getCurrentZoneId();
  }

  getCurrentZoneIndex() {
    return this._currentZoneIndex;
  }

  getCurrentZone() {
    return this.zone;
  }

  hasNextZone() {
    return this._currentZoneIndex < this._levelConfig.zones.length - 1;
  }

  // Zone Progression
  progressToNextZone() {
    if (!this.isCurrentZoneComplete()) {
      throw new Error('Cannot progress: current zone not complete');
    }

    if (!this.hasNextZone()) {
      throw new Error('Cannot progress: already at last zone');
    }

    // Mark current zone as completed
    this._completedZones.add(this._getCurrentZoneId());

    // Move to next zone
    this._currentZoneIndex++;
    this._loadZone(this._getCurrentZoneId());
  }

  isCurrentZoneComplete() {
    return this.zone.isComplete();
  }

  // Level Management
  isLevelComplete() {
    // Level is complete when:
    // 1. We're at the last zone (index === length - 1)
    // 2. The current zone is complete
    // 3. All previous zones are marked as completed
    const isAtLastZone = this._currentZoneIndex === this._levelConfig.zones.length - 1;
    const currentZoneComplete = this.isCurrentZoneComplete();
    const allPreviousZonesCompleted = this._completedZones.size === this._currentZoneIndex;

    return isAtLastZone && currentZoneComplete && allPreviousZonesCompleted;
  }

  getCompletedZones() {
    return Array.from(this._completedZones);
  }

  getTotalZones() {
    return this._levelConfig.zones.length;
  }

  getRemainingZones() {
    return this._levelConfig.zones.length - this._completedZones.size;
  }

  getCompletionMessage() {
    if (this.isLevelComplete()) {
      return `${this._levelConfig.name} completed! ${this._levelConfig.description}`;
    }
    return '';
  }

  // Zone Operations (delegated to current zone)
  collectKey(vimKey) {
    if (this.availableKeys.includes(vimKey)) {
      this.collectedKeys.add(vimKey.key);
      this.availableKeys = this.availableKeys.filter((key) => key !== vimKey);

      // Notify zone about key collection
      this.zone.collectKey(vimKey);
    }
  }

  getCurrentState() {
    return {
      currentZone: this.zone,
      map: this.map,
      cursor: this.cursor,
      availableKeys: this.availableKeys,
      collectedKeys: this.collectedKeys,
      textLabels: this.zone.textLabels,
      gate: this.zone.gate,
      npcs: this.zone.getActiveNPCs(),
      levelProgress: {
        levelId: this._levelConfig.id,
        levelName: this._levelConfig.name,
        currentZoneIndex: this._currentZoneIndex,
        totalZones: this.getTotalZones(),
        completedZones: this.getCompletedZones(),
        isLevelComplete: this.isLevelComplete(),
      },
    };
  }

  getTextLabels() {
    return this.zone.textLabels;
  }

  getGate() {
    return this.zone.gate;
  }

  getNPCs() {
    return this.zone.getActiveNPCs();
  }

  // Progression Methods for Gate Interaction
  shouldProgressToNextZone() {
    // Can progress to next zone if:
    // 1. Current zone is complete
    // 2. There is a next zone in the current level
    // 3. Cursor is at the gate position
    const gate = this.getGate();
    const isAtGate = gate && this.cursor.position.equals(gate.position);

    return this.isCurrentZoneComplete() && this.hasNextZone() && isAtGate;
  }

  shouldProgressToNextLevel() {
    // Can progress to next level if:
    // 1. Current level is complete (all zones done)
    // 2. Cursor is at the gate position
    // 3. There is a next level available
    const gate = this.getGate();
    const isAtGate = gate && this.cursor.position.equals(gate.position);
    const hasNextLevel = this._getNextLevel() !== null;

    return this.isLevelComplete() && isAtGate && hasNextLevel;
  }

  isGameComplete() {
    // Game is complete when level is complete and there's no next level
    const hasNextLevel = this._getNextLevel() !== null;
    return this.isLevelComplete() && !hasNextLevel;
  }

  executeProgression() {
    // Execute the appropriate progression based on current state
    if (this.shouldProgressToNextZone()) {
      this.progressToNextZone();
      return { type: 'zone', newZoneId: this.getCurrentZoneId() };
    } else if (this.shouldProgressToNextLevel()) {
      const nextLevel = this._getNextLevel();
      return { type: 'level', nextLevelId: nextLevel.id };
    }

    return { type: 'none' };
  }

  /**
   * Get next level using GameRegistry
   * @private
   */
  _getNextLevel() {
    if (!this._gameId) {
      return null;
    }

    try {
      const game = GameRegistry.getGame(this._gameId);
      return game.getNextLevel(this._levelConfig.id);
    } catch (error) {
      return null;
    }
  }

  cleanup() {
    // Clean up zone resources
    if (this.zone && typeof this.zone.cleanup === 'function') {
      this.zone.cleanup();
    }
  }
}
