import { GameState } from './application/GameState.js';
import { BlinkingGroveGameState } from './application/BlinkingGroveGameState.js';
import { MovePlayerUseCase } from './application/use-cases/MovePlayerUseCase.js';
import { DOMGameRenderer } from './infrastructure/ui/DOMGameRenderer.js';
import { KeyboardInputHandler } from './infrastructure/input/KeyboardInputHandler.js';

export class VimForKidsGame {
  constructor(options = {}) {
    this.currentLevel = options.level || 'level1';
    this.gameState = this._createGameState();
    this.gameRenderer = new DOMGameRenderer();
    this.inputHandler = new KeyboardInputHandler(this.gameRenderer.gameBoard);
    this.movePlayerUseCase = new MovePlayerUseCase(this.gameState, this.gameRenderer);

    this.initializeGame();
  }

  _createGameState() {
    switch (this.currentLevel) {
      case 'level1':
        return new BlinkingGroveGameState(); // Use new zone-based level
      case 'default':
        return new GameState();
      default:
        return new BlinkingGroveGameState(); // Default to Blinking Grove
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
