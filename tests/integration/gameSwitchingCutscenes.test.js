/**
 * Integration test for game switching with cutscenes
 * Ensures cutscenes remain functional after switching games
 */

import { VimForKidsGame } from '../../src/VimForKidsGame.js';
import { DOMGameRenderer } from '../../src/infrastructure/ui/DOMGameRenderer.js';
import { ZoneRegistryAdapter } from '../../src/infrastructure/data/zones/ZoneRegistryAdapter.js';
import { GameProviderAdapter } from '../../src/infrastructure/data/games/GameProviderAdapter.js';
import { CutsceneService } from '../../src/application/services/CutsceneService.js';
import { CutsceneProviderAdapter } from '../../src/infrastructure/data/CutsceneProviderAdapter.js';
import { CutsceneRenderer } from '../../src/infrastructure/ui/CutsceneRenderer.js';
import { PersistenceService } from '../../src/application/services/PersistenceService.js';
import { BrowserStorageAdapter } from '../../src/infrastructure/adapters/BrowserStorageAdapter.js';
import { BrowserURLAdapter } from '../../src/infrastructure/adapters/BrowserURLAdapter.js';
import { FeatureFlags } from '../../src/infrastructure/FeatureFlags.js';

describe('Game Switching Cutscenes Integration', () => {
  let game;
  let gameRenderer;
  let zoneProvider;
  let gameProvider;
  let cutsceneService;
  let cutsceneRenderer;
  let persistenceService;
  let mockContainer;

  beforeEach(() => {
    // Create mock DOM container
    mockContainer = document.createElement('div');
    mockContainer.id = 'test-container';
    document.body.appendChild(mockContainer);

    // Create infrastructure adapters
    const urlAdapter = new BrowserURLAdapter();
    const storageAdapter = new BrowserStorageAdapter();
    persistenceService = new PersistenceService(urlAdapter, storageAdapter);

    // Create cutscene services
    const cutsceneProvider = new CutsceneProviderAdapter();
    const featureFlags = new FeatureFlags();
    cutsceneService = new CutsceneService(cutsceneProvider, persistenceService, featureFlags);
    cutsceneRenderer = new CutsceneRenderer('test-container');

    // Create providers
    zoneProvider = new ZoneRegistryAdapter();
    gameProvider = new GameProviderAdapter();

    // Create game renderer
    gameRenderer = new DOMGameRenderer('test-container');

    // Create game instance with cutscene services
    game = new VimForKidsGame(
      {
        gameId: 'cursor-before-clickers',
        level: 'level_1',
      },
      {
        gameRenderer,
        zoneProvider,
        gameProvider,
        cutsceneService,
        cutsceneRenderer,
        persistenceService,
      }
    );
  });

  afterEach(() => {
    if (game) {
      game.cleanup();
    }
    if (mockContainer && mockContainer.parentNode) {
      document.body.removeChild(mockContainer);
    }
    // Clear localStorage
    localStorage.clear();
  });

  test('should maintain cutscene services after game switching', async () => {
    // Initialize the game
    game._initializeGameSync();

    // Verify cutscene services are available initially
    expect(game.cutsceneService).toBeDefined();
    expect(game.cutsceneRenderer).toBeDefined();
    expect(game.gameState).toBeDefined();

    // Manually switch to textland game (using sync method to avoid async loops)
    game.cleanup();
    game.currentGameId = 'cursor-textland';
    game.gameSelectorUI = { updateCurrentGame: jest.fn(), cleanup: jest.fn() };
    game.inputHandler = { setupInputHandling: jest.fn(), cleanup: jest.fn() };
    game._initializeGameSync(true); // Skip async init

    // Verify cutscene services are still available after switching
    expect(game.cutsceneService).toBeDefined();
    expect(game.cutsceneRenderer).toBeDefined();
    expect(game.currentGameId).toBe('cursor-textland');
    expect(game.gameState).toBeDefined();
  });

  test('should maintain progression use case with cutscene services after switching', async () => {
    // Initialize the game
    game._initializeGameSync();

    // Verify progression use case has cutscene services
    expect(game.handleProgressionUseCase).toBeDefined();
    expect(game.handleProgressionUseCase._cutsceneService).toBeDefined();
    expect(game.handleProgressionUseCase._cutsceneRenderer).toBeDefined();

    // Switch to textland game
    game.cleanup();
    game.currentGameId = 'cursor-textland';
    game.gameSelectorUI = { updateCurrentGame: jest.fn(), cleanup: jest.fn() };
    game.inputHandler = { setupInputHandling: jest.fn(), cleanup: jest.fn() };
    game._initializeGameSync(true); // Skip async init

    // Verify progression use case still has cutscene services
    expect(game.handleProgressionUseCase).toBeDefined();
    expect(game.handleProgressionUseCase._cutsceneService).toBeDefined();
    expect(game.handleProgressionUseCase._cutsceneRenderer).toBeDefined();
  });

  test('should handle missing cutscene services gracefully', async () => {
    // Create game without cutscene services
    const gameWithoutCutscenes = new VimForKidsGame(
      { gameId: 'cursor-before-clickers', level: 'level_1' },
      {
        gameRenderer,
        zoneProvider,
        gameProvider,
        // No cutscene services
      }
    );

    // Initialize - should not throw error
    expect(() => gameWithoutCutscenes._initializeGameSync()).not.toThrow();

    // Verify game works without cutscenes
    expect(gameWithoutCutscenes.gameState).toBeDefined();
    expect(gameWithoutCutscenes.handleProgressionUseCase).toBeDefined();

    gameWithoutCutscenes.cleanup();
  });

  test('should create level game state with cutscene services for level-based games', async () => {
    // Initialize with level-based game
    game._initializeGameSync();

    // Verify level game state has cutscene services
    expect(game.gameState._cutsceneService).toBeDefined();
    expect(game.gameState._cutsceneRenderer).toBeDefined();
    expect(game.gameState._gameId).toBe('cursor-before-clickers');
  });

  test('should preserve cutscene state across manual game switches', async () => {
    // Mark origin story as shown
    await cutsceneService.markOriginStoryAsShown('cursor-before-clickers');

    // Initialize game
    game._initializeGameSync();

    // Switch to textland and back (manually)
    game.cleanup();
    game.currentGameId = 'cursor-textland';
    game.gameSelectorUI = { updateCurrentGame: jest.fn(), cleanup: jest.fn() };
    game.inputHandler = { setupInputHandling: jest.fn(), cleanup: jest.fn() };
    game._initializeGameSync(true);

    game.cleanup();
    game.currentGameId = 'cursor-before-clickers';
    game.currentLevel = 'level_1';
    game.gameSelectorUI = { updateCurrentGame: jest.fn(), cleanup: jest.fn() };
    game.inputHandler = { setupInputHandling: jest.fn(), cleanup: jest.fn() };
    game._initializeGameSync(true);

    // Verify cutscene state is preserved
    const shouldShow = await cutsceneService.shouldShowOriginStory('cursor-before-clickers');
    expect(shouldShow).toBe(false);
  });
});
