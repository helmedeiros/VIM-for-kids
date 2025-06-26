import { GameState } from './application/GameState.js';
import { LevelGameState } from './application/LevelGameState.js';
import { getLevelConfiguration } from './application/LevelConfigurations.js';
import { MovePlayerUseCase } from './application/use-cases/MovePlayerUseCase.js';
import { SelectGameUseCase } from './application/use-cases/SelectGameUseCase.js';
import { DOMGameRenderer } from './infrastructure/ui/DOMGameRenderer.js';
import { KeyboardInputHandler } from './infrastructure/input/KeyboardInputHandler.js';
import { ZoneRegistryAdapter } from './infrastructure/data/zones/ZoneRegistryAdapter.js';
import { GameProviderAdapter } from './infrastructure/data/GameProviderAdapter.js';
import { GameSelectorUI } from './infrastructure/ui/GameSelectorUI.js';

export class VimForKidsGame {
  constructor(options = {}) {
    // Support both old level-based initialization and new game-based initialization
    this.currentGameId = options.gameId || this._mapLevelToGameId(options.level || 'level_1');
    this.currentLevel = options.level || 'level_1';

    // Create infrastructure adapters
    this.zoneProvider = new ZoneRegistryAdapter();
    this.gameProvider = new GameProviderAdapter();

    // Create use cases
    this.selectGameUseCase = new SelectGameUseCase(this.gameProvider);

    // Create UI components
    this.gameRenderer = new DOMGameRenderer();
    this.gameSelectorUI = new GameSelectorUI();
    this.inputHandler = new KeyboardInputHandler(this.gameRenderer.gameBoard);

    // Initialize game synchronously for backward compatibility
    this._initializeGameSync();

    // Then enhance with async features
    this._initializeGameAsync();
  }

  /**
   * Map legacy level parameter to game ID for backward compatibility
   * @private
   */
  _mapLevelToGameId(level) {
    // All level-based games map to "cursor-before-clickers"
    if (level && level.startsWith('level_')) {
      return 'cursor-before-clickers';
    }
    // Non-level games (default, welcomeMeadow, etc.) map to textland
    if (level === 'default' || level === 'welcomeMeadow' || !level) {
      return 'cursor-textland';
    }
    // Default to textland for unknown levels
    return 'cursor-textland';
  }

  /**
   * Synchronous initialization for backward compatibility
   * @private
   */
  _initializeGameSync() {
    // Create fallback game state immediately for tests
    if (this.currentGameId === 'cursor-textland') {
      this.gameState = new GameState();
    } else {
      // For level-based games, try to create with level config
      try {
        const levelConfig = getLevelConfiguration(this.currentLevel);
        this.gameState = new LevelGameState(this.zoneProvider, levelConfig);
      } catch (error) {
        // Fallback to basic game state
        this.gameState = new GameState();
      }
    }

    // Create move player use case
    this.movePlayerUseCase = new MovePlayerUseCase(this.gameState, this.gameRenderer);

    // Initial render
    this.gameRenderer.render(this.gameState.getCurrentState());

    // Setup input handling
    this.inputHandler.setupInputHandling((direction) => {
      this.movePlayerUseCase.execute(direction);
    });

    // Focus the game board
    this.gameRenderer.focus();
  }

  /**
   * Async initialization for enhanced features
   * @private
   */
  async _initializeGameAsync() {
    try {
      // Get the current game configuration
      const gameSelection = await this.selectGameUseCase.selectGame(this.currentGameId);
      this.currentGameDescriptor = gameSelection.gameDescriptor;

      // Setup game selector UI (this is the main enhancement)
      this._setupGameSelectorUI();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to initialize enhanced game features:', error);
      // Continue with basic functionality
    }
  }

  /**
   * Initialize game (for backward compatibility)
   */
  initializeGame() {
    // Delegate to sync initialization
    this._initializeGameSync();
  }

  async _createGameState(gameSelection) {
    const { gameDescriptor, gameStateFactory } = gameSelection;

    if (gameDescriptor.gameType.isLevelBased()) {
      // For level-based games, use the current level configuration
      const levelConfig = getLevelConfiguration(this.currentLevel);
      return await gameStateFactory(this.zoneProvider, levelConfig);
    } else if (gameDescriptor.gameType.isTextland()) {
      // For textland games, create basic game state
      return await gameStateFactory();
    } else {
      throw new Error(`Unsupported game type: ${gameDescriptor.gameType.type}`);
    }
  }

  _setupGameSelectorUI() {
    // Setup game selector callback
    this.gameSelectorUI.onGameSelected(async (action) => {
      if (action === 'show-selector') {
        // Show game selection modal
        const availableGames = await this.selectGameUseCase.getAvailableGames();
        this.gameSelectorUI.showGameSelector(availableGames, this.currentGameId);
      } else {
        // Game selection - switch to new game
        await this.switchToGame(action);
      }
    });

    // Update UI with current game
    if (this.currentGameDescriptor) {
      this.gameSelectorUI.updateCurrentGame(this.currentGameDescriptor);
    }
  }

  async switchToGame(gameId) {
    // Clean up current game state
    this.cleanup();

    // Update current game
    this.currentGameId = gameId;

    // For level-based games, reset to level 1
    if (gameId === 'cursor-before-clickers') {
      this.currentLevel = 'level_1';
    }

    // Re-initialize the game with new configuration
    this._initializeGameSync();
    await this._initializeGameAsync();
  }

  transitionToLevel(newLevelId) {
    // Clean up current game state
    this.cleanup();

    // Update current level
    this.currentLevel = newLevelId;

    // Re-initialize the game using sync method
    this._initializeGameSync();

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
    if (this.inputHandler) {
      this.inputHandler.cleanup();
    }

    // Clean up game selector UI
    if (this.gameSelectorUI) {
      this.gameSelectorUI.cleanup();
    }

    // Clean up map-specific resources
    if (this.gameState && this.gameState.map && typeof this.gameState.map.cleanup === 'function') {
      this.gameState.map.cleanup();
    }

    // Clean up level game state resources
    if (this.gameState && typeof this.gameState.cleanup === 'function') {
      this.gameState.cleanup();
    }
  }
}
