import { GameState } from './application/GameState.js';
import { BlinkingGroveGameState } from './application/BlinkingGroveGameState.js';
import { MovePlayerUseCase } from './application/use-cases/MovePlayerUseCase.js';
import { DOMGameRenderer } from './infrastructure/ui/DOMGameRenderer.js';
import { KeyboardInputHandler } from './infrastructure/input/KeyboardInputHandler.js';
import { ZoneRegistryAdapter } from './infrastructure/data/zones/ZoneRegistryAdapter.js';

export class VimForKidsGame {
  constructor(options = {}) {
    this.currentLevel = options.level || 'level1';

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
    switch (this.currentLevel) {
      case 'level1':
        return new BlinkingGroveGameState(this.zoneProvider); // Inject ZoneProvider
      case 'default':
        return new GameState();
      default:
        return new BlinkingGroveGameState(this.zoneProvider); // Inject ZoneProvider
    }
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

  cleanup() {
    this.inputHandler.cleanup();

    // Clean up map-specific resources
    if (this.gameState.map && typeof this.gameState.map.cleanup === 'function') {
      this.gameState.map.cleanup();
    }
  }
}
