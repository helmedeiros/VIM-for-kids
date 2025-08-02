import { Cursor } from '../domain/entities/Cursor.js';
import { GameRegistry } from '../infrastructure/data/games/GameRegistry.js';

export class LevelGameState {
  constructor(
    zoneProvider,
    levelConfig,
    gameId = null,
    cutsceneService = null,
    cutsceneRenderer = null
  ) {
    if (!zoneProvider || !levelConfig) {
      throw new Error('LevelGameState requires zoneProvider and levelConfig');
    }

    if (!levelConfig.zones || levelConfig.zones.length === 0) {
      throw new Error('Level must contain at least one zone');
    }

    this._zoneProvider = zoneProvider;
    this._levelConfig = levelConfig;
    this._gameId = gameId;
    this._cutsceneService = cutsceneService;
    this._cutsceneRenderer = cutsceneRenderer;
    this._currentZoneIndex = 0;
    this._completedZones = new Set();

    // Track ESC progression for special zones
    this._escProgressionPressed = new Set();

    // Initialize first zone synchronously for backward compatibility
    this._loadZoneSync(this._getCurrentZoneId());
  }

  /**
   * Initialize the first zone with potential cutscenes
   * This method is called after construction to allow for async zone loading
   */
  async initializeFirstZone() {
    // Show zone entry cutscene for the first zone if applicable
    await this._showZoneEntryCutsceneIfNeeded(this._getCurrentZoneId());
  }

  /**
   * Load zone synchronously (for backward compatibility)
   * @param {string} zoneId - Zone identifier
   * @private
   */
  _loadZoneSync(zoneId) {
    try {
      this.zone = this._zoneProvider.createZone(zoneId);
      this.map = this.zone.gameMap;
      this.cursor = new Cursor(this.zone.getCursorStartPosition());
      this.availableKeys = this.zone.vimKeys;
      this.availableCollectibleKeys = this.zone.collectibleKeys;
      this.collectedKeys = new Set();
      this.collectedCollectibleKeys = new Set();
    } catch (error) {
      throw new Error(`Zone '${zoneId}' not found in registry`);
    }
  }

  async _loadZone(zoneId) {
    // Load zone synchronously first
    this._loadZoneSync(zoneId);

    // Show zone progression cutscene if applicable (not for first zone entry)
    if (this._currentZoneIndex > 0) {
      await this._showZoneProgressionCutsceneIfNeeded(zoneId);
    }
  }

  /**
   * Show zone progression cutscene if conditions are met (for zone-to-zone progression)
   * @param {string} zoneId - Zone identifier
   * @private
   */
  async _showZoneProgressionCutsceneIfNeeded(zoneId) {
    // Skip if cutscene services are not available
    if (!this._cutsceneService || !this._cutsceneRenderer) {
      return;
    }

    // Skip if no game ID or level config
    if (!this._gameId || !this._levelConfig) {
      return;
    }

    try {
      // Check if zone progression cutscene should be shown
      const shouldShow = await this._cutsceneService.shouldShowCutsceneStory(
        this._gameId,
        'zone',
        this._levelConfig.id,
        zoneId
      );
      if (!shouldShow) {
        return;
      }

      // Get zone progression cutscene story
      const zoneStory = await this._cutsceneService.getCutsceneStory(
        this._gameId,
        'zone',
        this._levelConfig.id,
        zoneId
      );
      if (!zoneStory) {
        return;
      }

      // Show cutscene and wait for completion
      await this._cutsceneRenderer.showCutscene(zoneStory);

      // Mark as shown
      await this._cutsceneService.markCutsceneStoryAsShown(
        this._gameId,
        'zone',
        this._levelConfig.id,
        zoneId
      );
    } catch (error) {
      // Log error but don't prevent zone loading
      // eslint-disable-next-line no-console
      console.error('Failed to show zone progression cutscene:', error);
    }
  }

  /**
   * Show zone entry cutscene if conditions are met
   * @param {string} zoneId - Zone identifier
   * @private
   */
  async _showZoneEntryCutsceneIfNeeded(zoneId) {
    // Skip if cutscene services are not available
    if (!this._cutsceneService || !this._cutsceneRenderer) {
      return;
    }

    // Skip if no game ID or level config
    if (!this._gameId || !this._levelConfig) {
      return;
    }

    try {
      // Check if zone entry cutscene should be shown
      const shouldShow = await this._cutsceneService.shouldShowCutsceneStory(
        this._gameId,
        'zone',
        this._levelConfig.id,
        zoneId
      );
      if (!shouldShow) {
        return;
      }

      // Get zone entry cutscene story
      const zoneStory = await this._cutsceneService.getCutsceneStory(
        this._gameId,
        'zone',
        this._levelConfig.id,
        zoneId
      );
      if (!zoneStory) {
        return;
      }

      // Show cutscene and wait for completion
      await this._cutsceneRenderer.showCutscene(zoneStory);

      // Mark as shown
      await this._cutsceneService.markCutsceneStoryAsShown(
        this._gameId,
        'zone',
        this._levelConfig.id,
        zoneId
      );
    } catch (error) {
      // Log error but don't prevent zone loading
      // eslint-disable-next-line no-console
      console.error('Failed to show zone entry cutscene:', error);
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
  async progressToNextZone() {
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
    await this._loadZone(this._getCurrentZoneId());
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

  collectCollectibleKey(collectibleKey) {
    if (this.availableCollectibleKeys.includes(collectibleKey)) {
      this.collectedCollectibleKeys.add(collectibleKey.keyId);
      this.availableCollectibleKeys = this.availableCollectibleKeys.filter(
        (key) => key !== collectibleKey
      );

      // Notify zone about key collection
      this.zone.collectKey(collectibleKey);
    }
  }

  getCurrentState() {
    return {
      currentZone: this.zone,
      map: this.map,
      cursor: this.cursor,
      availableKeys: this.availableKeys,
      availableCollectibleKeys: this.availableCollectibleKeys,
      collectedKeys: this.collectedKeys,
      collectedCollectibleKeys: this.collectedCollectibleKeys,
      textLabels: this.zone.textLabels,
      gate: this.zone.gate,
      secondaryGates: this.zone.secondaryGates,
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

  getSecondaryGates() {
    return this.zone.secondaryGates;
  }

  tryUnlockSecondaryGate(position) {
    const unlocked = this.zone.tryUnlockSecondaryGate(position);

    // If gate was unlocked, sync the CollectibleKeys from zone (keys may have been consumed)
    if (unlocked) {
      this.collectedCollectibleKeys = new Set(this.zone.collectedCollectibleKeys);
    }

    return unlocked;
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
    // 4. For special zones, ESC key has been pressed (zone_1 requires ESC)
    const gate = this.getGate();
    const isAtGate = gate && this.cursor.position.equals(gate.position);
    const hasNextLevel = this._getNextLevel() !== null;
    const escProgression = this._checkEscProgressionRequirement();

    return this.isLevelComplete() && isAtGate && hasNextLevel && escProgression;
  }

  /**
   * Check if ESC progression requirement is met for the current zone
   * @returns {boolean} True if progression is allowed
   * @private
   */
  _checkEscProgressionRequirement() {
    const currentZoneId = this._getCurrentZoneId();

    // Zone 1 (Blinking Grove) requires ESC progression
    if (currentZoneId === 'zone_1') {
      return this._escProgressionPressed.has(currentZoneId);
    }

    // Other zones don't require ESC progression
    return true;
  }

  /**
   * Mark ESC as pressed for the current zone
   */
  markEscProgressionPressed() {
    const currentZoneId = this._getCurrentZoneId();
    this._escProgressionPressed.add(currentZoneId);
  }

  isGameComplete() {
    // Game is complete when level is complete and there's no next level
    const hasNextLevel = this._getNextLevel() !== null;
    return this.isLevelComplete() && !hasNextLevel;
  }

  async executeProgression() {
    // Execute the appropriate progression based on current state
    if (this.shouldProgressToNextZone()) {
      await this.progressToNextZone();
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
