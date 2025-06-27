// GameState removed - now using TextlandGameState for textland games
import { LevelGameState } from './application/LevelGameState.js';
import { TextlandGameState } from './application/TextlandGameState.js';
import { GameRegistry } from './infrastructure/data/games/GameRegistry.js';
import { MovePlayerUseCase } from './application/use-cases/MovePlayerUseCase.js';
import { SelectGameUseCase } from './application/use-cases/SelectGameUseCase.js';
import { DOMGameRenderer } from './infrastructure/ui/DOMGameRenderer.js';
import { KeyboardInputHandler } from './infrastructure/input/KeyboardInputHandler.js';
import { ZoneRegistryAdapter } from './infrastructure/data/zones/ZoneRegistryAdapter.js';
import { GameProviderAdapter } from './infrastructure/data/games/GameProviderAdapter.js';
import { GameSelectorUI } from './infrastructure/ui/GameSelectorUI.js';

export class VimForKidsGame {
  constructor(options = {}, dependencies = {}) {
    // Support both old level-based initialization and new game-based initialization
    this.currentGameId =
      options.game ||
      options.gameId ||
      this._mapLevelToGameId(options.level || this._getFirstLevelId());
    this.currentLevel = options.level || this._getFirstLevelId();

    // Use injected dependencies or create defaults for backward compatibility
    this.zoneProvider = dependencies.zoneProvider || new ZoneRegistryAdapter();
    this.gameProvider = dependencies.gameProvider || new GameProviderAdapter();
    this.gameRenderer = dependencies.gameRenderer || new DOMGameRenderer();
    this.gameSelectorUI = dependencies.gameSelectorUI || new GameSelectorUI();
    this.persistenceService = dependencies.persistenceService || null;

    // Create use cases
    this.selectGameUseCase = new SelectGameUseCase(this.gameProvider);

    // Create input handler (needs game renderer)
    this.inputHandler =
      dependencies.inputHandler || new KeyboardInputHandler(this.gameRenderer.gameBoard);

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
   * Get first level ID from GameRegistry
   * @private
   */
  _getFirstLevelId() {
    try {
      const game = GameRegistry.getGame('cursor-before-clickers');
      const firstLevel = game.getFirstLevel();
      return firstLevel ? firstLevel.id : 'level_1';
    } catch (error) {
      return 'level_1';
    }
  }

  /**
   * Get level configuration from GameRegistry
   * @private
   */
  _getLevelConfiguration(levelId) {
    try {
      const game = GameRegistry.getGame(this.currentGameId);
      return game.getLevelConfiguration(levelId);
    } catch (error) {
      throw new Error(`Level configuration not found: ${levelId}`);
    }
  }

  /**
   * Synchronous initialization for backward compatibility
   * @private
   */
  _initializeGameSync() {
    // Create fallback game state immediately for tests
    if (this.currentGameId === 'cursor-textland') {
      this.gameState = new TextlandGameState(this.zoneProvider);
    } else {
      // For level-based games, try to create with level config
      try {
        const levelConfig = this._getLevelConfiguration(this.currentLevel);
        this.gameState = new LevelGameState(this.zoneProvider, levelConfig, this.currentGameId);
      } catch (error) {
        // Fallback to textland game state
        this.gameState = new TextlandGameState(this.zoneProvider);
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

    // Update level selection visibility based on current game
    this._updateLevelSelectionForCurrentGame();

    // Focus the game board
    this.gameRenderer.focus();
  }

  /**
   * Update level selection visibility based on current game
   * @private
   */
  _updateLevelSelectionForCurrentGame() {
    const levelSelection = document.querySelector('.level-selection');
    if (levelSelection) {
      if (this.currentGameId === 'cursor-before-clickers') {
        // Show level selection for level-based games
        levelSelection.style.display = 'flex';
      } else {
        // Hide level selection for free exploration games
        levelSelection.style.display = 'none';
      }
    }
  }

  /**
   * Async initialization for enhanced features
   * @private
   */
  async _initializeGameAsync() {
    try {
      // Get the current game configuration
      const gameSelection = await this.selectGameUseCase.selectGame(this.currentGameId);
      this.currentGame = gameSelection.game;

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
    const { game, gameStateFactory } = gameSelection;

    if (game.gameType.isLevelBased()) {
      // For level-based games, use the current level configuration
      const levelConfig = this._getLevelConfiguration(this.currentLevel);
      return await gameStateFactory(this.zoneProvider, levelConfig, this.currentGameId);
    } else if (game.gameType.isTextland()) {
      // For textland games, create game state with zone provider
      return await gameStateFactory(this.zoneProvider);
    } else {
      throw new Error(`Unsupported game type: ${game.gameType.type}`);
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
    if (this.currentGame) {
      this.gameSelectorUI.updateCurrentGame(this.currentGame);
    }
  }

  async switchToGame(gameId) {
    // Clean up current game state
    this.cleanup();

    // Update current game
    this.currentGameId = gameId;

    // For level-based games, reset to first level
    if (gameId === 'cursor-before-clickers') {
      this.currentLevel = this._getFirstLevelId();
    }

    // Persist game selection
    this._persistGameSelection(gameId);

    // Recreate UI components that were cleaned up
    this.gameSelectorUI = new GameSelectorUI();
    this.inputHandler = new KeyboardInputHandler(this.gameRenderer.gameBoard);

    // Re-initialize the game with new configuration
    this._initializeGameSync();
    await this._initializeGameAsync();

    // Update UI to reflect the new game
    if (this.currentGame) {
      this.gameSelectorUI.updateCurrentGame(this.currentGame);
    }

    // Ensure game board has focus for keyboard input
    this.gameRenderer.focus();
  }

  /**
   * Persist game selection
   * @private
   */
  _persistGameSelection(gameId) {
    // Use persistence service if available, otherwise fallback to direct implementation
    if (this.persistenceService) {
      this.persistenceService.persistGameSelection(gameId, this.currentLevel);
    } else {
      // Fallback for backward compatibility
      this._legacyPersistGameSelection(gameId);
    }
  }

  /**
   * Legacy persistence implementation for backward compatibility
   * @private
   */
  _legacyPersistGameSelection(gameId) {
    // Store in localStorage
    localStorage.setItem('selectedGame', gameId);

    // Update URL without page reload
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('game', gameId);

    // For level-based games, also set the level parameter
    if (gameId === 'cursor-before-clickers') {
      currentUrl.searchParams.set('level', this.currentLevel);
    } else {
      // Remove level parameter for non-level games
      currentUrl.searchParams.delete('level');
    }

    window.history.pushState({}, '', currentUrl.toString());
  }

  async transitionToLevel(newLevelId) {
    // Clean up current game state
    this.cleanup();

    // Update current level
    this.currentLevel = newLevelId;

    // Recreate UI components that were cleaned up
    this.gameSelectorUI = new GameSelectorUI();
    this.inputHandler = new KeyboardInputHandler(this.gameRenderer.gameBoard);

    // Re-initialize the game using sync method
    this._initializeGameSync();

    // Then enhance with async features (this sets up the gear icon)
    await this._initializeGameAsync();

    // Update UI to reflect the current game
    if (this.currentGame) {
      this.gameSelectorUI.updateCurrentGame(this.currentGame);
    }

    // Update the active level button in the UI
    this._updateActiveLevelButton(newLevelId);

    // Update URL without page reload
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('level', newLevelId);
    window.history.pushState({}, '', currentUrl.toString());

    // Ensure game board has focus for keyboard input
    this.gameRenderer.focus();
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
