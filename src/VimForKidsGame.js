import { GameState } from './application/GameState.js';
import { LevelGameState } from './application/LevelGameState.js';
import { getLevelConfiguration } from './application/LevelConfigurations.js';
import { MovePlayerUseCase } from './application/use-cases/MovePlayerUseCase.js';
import { DOMGameRenderer } from './infrastructure/ui/DOMGameRenderer.js';
import { KeyboardInputHandler } from './infrastructure/input/KeyboardInputHandler.js';
import { ZoneRegistryAdapter } from './infrastructure/data/zones/ZoneRegistryAdapter.js';

export class VimForKidsGame {
  constructor(options = {}) {
    this.currentLevel = options.level || 'level_1';

    // Create infrastructure adapters
    this.zoneProvider = new ZoneRegistryAdapter();

    // Create application state with injected dependencies
    this.gameState = this._createGameState();
    this.gameRenderer = new DOMGameRenderer();
    this.inputHandler = new KeyboardInputHandler(this.gameRenderer.gameBoard);
    this.movePlayerUseCase = new MovePlayerUseCase(this.gameState, this.gameRenderer);

    this.initializeGame();
  }

  _createGameState() {
    // Handle all levels using LevelGameState with proper configurations
    if (this.currentLevel.startsWith('level_')) {
      try {
        const levelConfig = getLevelConfiguration(this.currentLevel);
        return new LevelGameState(this.zoneProvider, levelConfig);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Level ${this.currentLevel} not found, defaulting to level_1`);
        const defaultConfig = getLevelConfiguration('level_1');
        return new LevelGameState(this.zoneProvider, defaultConfig);
      }
    }

    // Fallback to basic GameState for non-level modes
    return new GameState();
  }

  initializeGame() {
    // Initial render
    this.gameRenderer.render(this.gameState.getCurrentState());

    // Setup input handling
    this.inputHandler.setupInputHandling((direction) => {
      this.movePlayerUseCase.execute(direction);
    });

    // Focus the game board
    this.gameRenderer.focus();
  }

  transitionToLevel(newLevelId) {
    // Clean up current game state
    this.cleanup();

    // Update current level
    this.currentLevel = newLevelId;

    // Create new game state for the new level
    this.gameState = this._createGameState();

    // Create new move player use case with updated game state
    this.movePlayerUseCase = new MovePlayerUseCase(this.gameState, this.gameRenderer);

    // Re-initialize the game
    this.initializeGame();

    // Update the active level button in the UI
    this._updateActiveLevelButton(newLevelId);

    // Update URL without page reload
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('level', newLevelId);
    window.history.pushState({}, '', currentUrl.toString());
  }

  _updateActiveLevelButton(levelId) {
    // Remove active class from all level buttons
    document.querySelectorAll('.level-btn').forEach((btn) => {
      btn.classList.remove('active');
    });

    // Add active class to the current level button
    const activeButton = document.getElementById(levelId);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  cleanup() {
    this.inputHandler.cleanup();

    // Clean up map-specific resources
    if (this.gameState.map && typeof this.gameState.map.cleanup === 'function') {
      this.gameState.map.cleanup();
    }
  }
}
