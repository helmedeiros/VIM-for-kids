// Development build information for deployment verification
console.info(`🎮 VIM for Kids - Version 1.0.0`);
console.info(`📅 Build Date: ${__BUILD_DATE__}`);
console.info(`🔗 Git Commit: ${__GIT_HASH__}`);
console.info(`🌐 Environment: ${__DEV__ ? 'Development' : 'Production'}`);

// Update meta tags with build information
if (typeof document !== 'undefined') {
  const buildDateMeta = document.querySelector('meta[name="build-date"]');
  const gitCommitMeta = document.querySelector('meta[name="git-commit"]');

  if (buildDateMeta) buildDateMeta.setAttribute('content', __BUILD_DATE__);
  if (gitCommitMeta) gitCommitMeta.setAttribute('content', __GIT_HASH__);
}

import { GameInitializationService } from './application/services/GameInitializationService.js';
import { PersistenceService } from './application/services/PersistenceService.js';
import { CutsceneService } from './application/services/CutsceneService.js';
import { GameFactory } from './application/factories/GameFactory.js';
import { BrowserURLAdapter } from './infrastructure/adapters/BrowserURLAdapter.js';
import { BrowserStorageAdapter } from './infrastructure/adapters/BrowserStorageAdapter.js';
import { CutsceneProviderAdapter } from './infrastructure/data/CutsceneProviderAdapter.js';
import { CutsceneRenderer } from './infrastructure/ui/CutsceneRenderer.js';
import { LevelSelectorUI } from './infrastructure/ui/LevelSelectorUI.js';
import { FeatureFlags } from './infrastructure/FeatureFlags.js';
import { CanvasGameRenderer } from './infrastructure/ui/CanvasGameRenderer.js';


/**
 * Application entry point
 * Follows SOLID principles with dependency injection
 */
class Application {
  constructor() {
    this._initializationService = null;
    this._persistenceService = null;
    this._cutsceneService = null;
    this._cutsceneRenderer = null;
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

    // Create cutscene services
    const cutsceneProvider = new CutsceneProviderAdapter();
    const featureFlags = new FeatureFlags();
    this._cutsceneService = new CutsceneService(
      cutsceneProvider,
      this._persistenceService,
      featureFlags
    );

    // Create cutscene renderer (using main game container)
    try {
      this._cutsceneRenderer = new CutsceneRenderer('game-container');
    } catch (error) {
      // If game-container doesn't exist, create a fallback container or skip cutscene rendering
      console.warn('Game container not found, cutscenes will be disabled:', error);
      this._cutsceneRenderer = null;
    }

    // Create game renderer based on feature flag
    // Check URL param (?renderer=canvas) or localStorage for activation
    const useCanvas = this._shouldUseCanvasRenderer(featureFlags);
    const gameRenderer = useCanvas ? new CanvasGameRenderer() : null;

    // Create game factory and initialization service
    const factoryDependencies = {
      cutsceneService: this._cutsceneService,
      cutsceneRenderer: this._cutsceneRenderer,
    };
    if (gameRenderer) {
      factoryDependencies.gameRenderer = gameRenderer;
    }
    const gameFactory = new GameFactory(factoryDependencies);
    this._initializationService = new GameInitializationService(
      gameFactory,
      this._persistenceService,
      this._cutsceneService,
      this._cutsceneRenderer
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
    await this._updateUIForGameType(config);

    // Update global reference for backward compatibility
    window.vimForKidsGame = game;
  }

  /**
   * Update UI based on game type using GameRegistry
   * @private
   */
  async _updateUIForGameType(config) {
    try {
      const { GameRegistry } = await import('./infrastructure/data/games/GameRegistry.js');
      const game = GameRegistry.getGame(config.game);
      const uiConfig = game.getUIConfig();

      // Show/hide level selection based on game configuration
      this._levelSelectorUI.setVisible(uiConfig.showLevelSelector);

      // Set active level for level-based games
      if (game.supportsLevels() && config.level) {
        this._levelSelectorUI.setActiveLevel(config.level);
      }
    } catch (error) {
      // Fallback to old behavior if GameRegistry fails
      console.warn('Failed to load GameRegistry, using fallback UI logic:', error);
      const isLevelBased = config.game === 'cursor-before-clickers';
      this._levelSelectorUI.setVisible(isLevelBased);
      if (isLevelBased && config.level) {
        this._levelSelectorUI.setActiveLevel(config.level);
      }
    }
  }

  /**
   * Check if Canvas renderer should be used via feature flag, URL param, or localStorage
   * @private
   */
  _shouldUseCanvasRenderer(featureFlags) {
    // 1. Check feature flag (static config)
    if (featureFlags.isEnabled('CANVAS_RENDERER')) return true;

    // 2. Check URL parameter: ?renderer=canvas
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('renderer') === 'canvas') return true;

    // 3. Check localStorage directly (workaround for async loadFromRemoteConfig)
    try {
      const stored = localStorage.getItem('canvasRenderer');
      if (stored === 'true') return true;
    } catch {
      // localStorage unavailable
    }

    return false;
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
