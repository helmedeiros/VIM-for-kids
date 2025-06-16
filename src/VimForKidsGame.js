import { GameState } from './application/GameState.js';
import { WelcomeMeadowGameState } from './application/WelcomeMeadowGameState.js';
import { MovePlayerUseCase } from './application/use-cases/MovePlayerUseCase.js';
import { DOMGameRenderer } from './infrastructure/ui/DOMGameRenderer.js';
import { KeyboardInputHandler } from './infrastructure/input/KeyboardInputHandler.js';

export class VimForKidsGame {
  constructor(options = {}) {
    this.currentLevel = options.level || 'default';
    this.gameState = this._createGameState();
    this.gameRenderer = new DOMGameRenderer();
    this.inputHandler = new KeyboardInputHandler(this.gameRenderer.gameBoard);
    this.movePlayerUseCase = new MovePlayerUseCase(this.gameState, this.gameRenderer);

    this.initializeGame();
  }

  _createGameState() {
    switch (this.currentLevel) {
      case 'welcomeMeadow':
        return new WelcomeMeadowGameState();
      default:
        return new GameState();
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
  }
}
