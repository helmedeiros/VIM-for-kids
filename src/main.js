import { GameInitializationService } from './application/services/GameInitializationService.js';
import { PersistenceService } from './application/services/PersistenceService.js';
import { GameFactory } from './application/factories/GameFactory.js';
import { BrowserURLAdapter } from './infrastructure/adapters/BrowserURLAdapter.js';
import { BrowserStorageAdapter } from './infrastructure/adapters/BrowserStorageAdapter.js';
import { LevelSelectorUI } from './infrastructure/ui/LevelSelectorUI.js';

/**
 * Application entry point
 * Follows SOLID principles with dependency injection
 */
class Application {
  constructor() {
    this._initializationService = null;
    this._persistenceService = null;
    this._levelSelectorUI = null;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    // Create infrastructure adapters
    const urlAdapter = new BrowserURLAdapter();
    const storageAdapter = new BrowserStorageAdapter();

    // Create services with dependency injection
    this._persistenceService = new PersistenceService(urlAdapter, storageAdapter);
    const gameFactory = new GameFactory();
    this._initializationService = new GameInitializationService(
      gameFactory,
      this._persistenceService
    );

    // Create UI components
    this._levelSelectorUI = new LevelSelectorUI();

    // Setup event handlers
    this._setupEventHandlers();

    // Initialize game based on persisted state
    await this._initializeGameFromPersistence();
  }

  /**
   * Setup event handlers
   * @private
   */
  _setupEventHandlers() {
    // Level selection handler
    this._levelSelectorUI.onLevelSelected(async (level) => {
      await this._initializationService.initializeGame({ level });
      this._persistenceService.persistGameSelection('cursor-before-clickers', level);

      // Update global reference for backward compatibility
      window.vimForKidsGame = this._initializationService.getCurrentGame();
    });

    // Initialize UI
    this._levelSelectorUI.initialize();
  }

  /**
   * Initialize game from persistence
   * @private
   */
  async _initializeGameFromPersistence() {
    const config = this._persistenceService.getGameConfiguration();

    // Initialize game
    const game = await this._initializationService.initializeGame(config);

    // Update UI based on game type
    this._updateUIForGameType(config);

    // Update global reference for backward compatibility
    window.vimForKidsGame = game;
  }

  /**
   * Update UI based on game type
   * @private
   */
  _updateUIForGameType(config) {
    const isLevelBased = config.game === 'cursor-before-clickers';

    // Show/hide level selection
    this._levelSelectorUI.setVisible(isLevelBased);

    // Set active level for level-based games
    if (isLevelBased && config.level) {
      this._levelSelectorUI.setActiveLevel(config.level);
    }
  }

  /**
   * Cleanup application resources
   */
  cleanup() {
    if (this._initializationService) {
      this._initializationService.cleanup();
    }
    if (this._levelSelectorUI) {
      this._levelSelectorUI.cleanup();
    }
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const app = new Application();

  try {
    await app.initialize();
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }

  // Make app available globally for debugging
  window.app = app;
});
