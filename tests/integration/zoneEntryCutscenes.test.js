import { LevelGameState } from '../../src/application/LevelGameState.js';
import { CutsceneService } from '../../src/application/services/CutsceneService.js';
import { CutsceneProviderAdapter } from '../../src/infrastructure/data/CutsceneProviderAdapter.js';
import { CutsceneRenderer } from '../../src/infrastructure/ui/CutsceneRenderer.js';
import { PersistenceService } from '../../src/application/services/PersistenceService.js';
import { BrowserURLAdapter } from '../../src/infrastructure/adapters/BrowserURLAdapter.js';
import { BrowserStorageAdapter } from '../../src/infrastructure/adapters/BrowserStorageAdapter.js';
import { FeatureFlags } from '../../src/infrastructure/FeatureFlags.js';
import { ZoneRegistryAdapter } from '../../src/infrastructure/data/zones/ZoneRegistryAdapter.js';

describe('Zone Entry Cutscenes Integration', () => {
  let zoneProvider;
  let cutsceneService;
  let cutsceneRenderer;
  let persistenceService;
  let featureFlags;
  let mockContainer;

  beforeEach(() => {
    // Create mock DOM container
    mockContainer = document.createElement('div');
    mockContainer.id = 'test-container';
    document.body.appendChild(mockContainer);

    // Create services
    zoneProvider = new ZoneRegistryAdapter();
    const urlAdapter = new BrowserURLAdapter();
    const storageAdapter = new BrowserStorageAdapter();
    persistenceService = new PersistenceService(urlAdapter, storageAdapter);

    const cutsceneProvider = new CutsceneProviderAdapter();
    featureFlags = new FeatureFlags();
    cutsceneService = new CutsceneService(cutsceneProvider, persistenceService, featureFlags);
    cutsceneRenderer = new CutsceneRenderer('test-container');

    // Enable feature flag
    featureFlags.enable('ORIGIN_STORY_CUTSCENES');

    // Clear any existing cutscene state
    localStorage.removeItem('cutsceneState');
  });

  afterEach(() => {
    // Cleanup
    if (mockContainer) {
      document.body.removeChild(mockContainer);
    }
    localStorage.clear();
  });

  describe('Zone Entry Cutscenes During Level Initialization', () => {
    it('should show zone entry cutscene when first zone is loaded', async () => {
      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const getCutsceneSpy = jest.spyOn(cutsceneService, 'getCutsceneStory');
      const markShownSpy = jest.spyOn(cutsceneService, 'markCutsceneStoryAsShown');

      // Mock zone entry cutscene existence
      shouldShowSpy.mockResolvedValue(true);
      getCutsceneSpy.mockResolvedValue({
        gameId: 'cursor-before-clickers',
        type: 'zone',
        levelId: 'level_1',
        zoneId: 'zone_1',
        script: ['Welcome to the Blinking Grove...', 'Master basic movement here!'],
      });

      // Create level configuration
      const levelConfig = {
        id: 'level_1',
        name: 'VIM Basics',
        zones: ['zone_1'],
        description: 'Learn fundamental VIM movement commands',
      };

      // Create LevelGameState
      const gameState = new LevelGameState(
        zoneProvider,
        levelConfig,
        'cursor-before-clickers',
        cutsceneService,
        cutsceneRenderer
      );

      // Initialize first zone (this should trigger cutscene)
      await gameState.initializeFirstZone();

      // Verify zone entry cutscene was checked and shown
      expect(shouldShowSpy).toHaveBeenCalledWith(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );
      expect(getCutsceneSpy).toHaveBeenCalledWith(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );
      expect(showCutsceneSpy).toHaveBeenCalledWith({
        gameId: 'cursor-before-clickers',
        type: 'zone',
        levelId: 'level_1',
        zoneId: 'zone_1',
        script: ['Welcome to the Blinking Grove...', 'Master basic movement here!'],
      });
      expect(markShownSpy).toHaveBeenCalledWith(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );
    });

    it('should not show zone entry cutscene when already shown', async () => {
      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');

      // Mock that cutscene should not be shown (already seen)
      shouldShowSpy.mockResolvedValue(false);

      // Create level configuration
      const levelConfig = {
        id: 'level_1',
        name: 'VIM Basics',
        zones: ['zone_1'],
        description: 'Learn fundamental VIM movement commands',
      };

      // Create LevelGameState
      const gameState = new LevelGameState(
        zoneProvider,
        levelConfig,
        'cursor-before-clickers',
        cutsceneService,
        cutsceneRenderer
      );

      // Initialize first zone
      await gameState.initializeFirstZone();

      // Verify zone entry cutscene was checked but not shown
      expect(shouldShowSpy).toHaveBeenCalledWith(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );
      expect(showCutsceneSpy).not.toHaveBeenCalled();
    });

    it('should not show zone entry cutscene when feature flag disabled', async () => {
      // Disable feature flag
      featureFlags.disable('ORIGIN_STORY_CUTSCENES');

      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');

      // Mock that cutscene should be shown (but feature is disabled)
      shouldShowSpy.mockResolvedValue(false); // Will return false due to feature flag

      // Create level configuration
      const levelConfig = {
        id: 'level_1',
        name: 'VIM Basics',
        zones: ['zone_1'],
        description: 'Learn fundamental VIM movement commands',
      };

      // Create LevelGameState
      const gameState = new LevelGameState(
        zoneProvider,
        levelConfig,
        'cursor-before-clickers',
        cutsceneService,
        cutsceneRenderer
      );

      // Initialize first zone
      await gameState.initializeFirstZone();

      // Verify zone entry cutscene was checked but not shown
      expect(shouldShowSpy).toHaveBeenCalledWith(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );
      expect(showCutsceneSpy).not.toHaveBeenCalled();
    });

    it('should handle zone entry cutscene errors gracefully', async () => {
      // Spy on cutscene methods
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const getCutsceneSpy = jest.spyOn(cutsceneService, 'getCutsceneStory');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock cutscene service to throw error
      shouldShowSpy.mockResolvedValue(true);
      getCutsceneSpy.mockRejectedValue(new Error('Cutscene service error'));

      // Create level configuration
      const levelConfig = {
        id: 'level_1',
        name: 'VIM Basics',
        zones: ['zone_1'],
        description: 'Learn fundamental VIM movement commands',
      };

      // Create LevelGameState
      const gameState = new LevelGameState(
        zoneProvider,
        levelConfig,
        'cursor-before-clickers',
        cutsceneService,
        cutsceneRenderer
      );

      // Initialize first zone should not throw
      await expect(gameState.initializeFirstZone()).resolves.toBeUndefined();

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to show zone entry cutscene:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not show zone entry cutscene when cutscene services not available', async () => {
      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();

      // Create level configuration
      const levelConfig = {
        id: 'level_1',
        name: 'VIM Basics',
        zones: ['zone_1'],
        description: 'Learn fundamental VIM movement commands',
      };

      // Create LevelGameState without cutscene services
      const gameState = new LevelGameState(zoneProvider, levelConfig, 'cursor-before-clickers');

      // Initialize first zone
      await gameState.initializeFirstZone();

      // Verify no cutscene was shown
      expect(showCutsceneSpy).not.toHaveBeenCalled();
    });
  });

  describe('Zone Entry vs Zone Progression Cutscenes', () => {
    it('should show zone entry cutscene only for first zone, not during progression', async () => {
      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const getCutsceneSpy = jest.spyOn(cutsceneService, 'getCutsceneStory');

      // Mock zone entry cutscene existence for first zone only
      shouldShowSpy.mockImplementation((gameId, type, levelId, zoneId) => {
        return Promise.resolve(zoneId === 'zone_2'); // Only show for zone_2 (first zone in level_2)
      });

      getCutsceneSpy.mockImplementation((gameId, type, levelId, zoneId) => {
        if (zoneId === 'zone_2') {
          return Promise.resolve({
            gameId,
            type,
            levelId,
            zoneId,
            script: [`Welcome to ${zoneId}!`],
          });
        }
        return Promise.resolve(null);
      });

      // Create level configuration with multiple zones
      const levelConfig = {
        id: 'level_2',
        name: 'Text Manipulation',
        zones: ['zone_2', 'zone_3'],
        description: 'Master VIM modes and word navigation',
      };

      // Create LevelGameState
      const gameState = new LevelGameState(
        zoneProvider,
        levelConfig,
        'cursor-before-clickers',
        cutsceneService,
        cutsceneRenderer
      );

      // Initialize first zone (should show cutscene)
      await gameState.initializeFirstZone();

      // Verify zone entry cutscene was shown for first zone
      expect(showCutsceneSpy).toHaveBeenCalledTimes(1);
      expect(showCutsceneSpy).toHaveBeenCalledWith({
        gameId: 'cursor-before-clickers',
        type: 'zone',
        levelId: 'level_2',
        zoneId: 'zone_2',
        script: ['Welcome to zone_2!'],
      });

      // Reset spy
      showCutsceneSpy.mockClear();

      // Mock zone completion for progression
      gameState.zone.isComplete = jest.fn().mockReturnValue(true);

      // Mock gate and cursor position for progression
      jest.spyOn(gameState, 'getGate').mockReturnValue({
        position: { equals: jest.fn().mockReturnValue(true) },
      });
      jest.spyOn(gameState.cursor.position, 'equals').mockReturnValue(true);

      // Verify we can progress to next zone
      expect(gameState.shouldProgressToNextZone()).toBe(true);

      // Progress to next zone (should NOT show zone entry cutscene)
      await gameState.progressToNextZone();

      // Verify no zone entry cutscene was shown during progression
      expect(showCutsceneSpy).not.toHaveBeenCalled();
    });
  });

  describe('Multi-Zone Level Flow', () => {
    it('should show zone entry cutscene only once per zone across multiple sessions', async () => {
      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const getCutsceneSpy = jest.spyOn(cutsceneService, 'getCutsceneStory');
      const markShownSpy = jest.spyOn(cutsceneService, 'markCutsceneStoryAsShown');

      // Create level configuration
      const levelConfig = {
        id: 'level_1',
        name: 'VIM Basics',
        zones: ['zone_1'],
        description: 'Learn fundamental VIM movement commands',
      };

      // First session - show cutscene
      shouldShowSpy.mockResolvedValueOnce(true);
      getCutsceneSpy.mockResolvedValueOnce({
        gameId: 'cursor-before-clickers',
        type: 'zone',
        levelId: 'level_1',
        zoneId: 'zone_1',
        script: ['First visit to zone_1!'],
      });

      // Create first game state
      const gameState1 = new LevelGameState(
        zoneProvider,
        levelConfig,
        'cursor-before-clickers',
        cutsceneService,
        cutsceneRenderer
      );

      await gameState1.initializeFirstZone();

      // Verify cutscene was shown and marked
      expect(showCutsceneSpy).toHaveBeenCalledTimes(1);
      expect(markShownSpy).toHaveBeenCalledWith(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );

      // Reset spies
      showCutsceneSpy.mockClear();
      shouldShowSpy.mockClear();

      // Second session - don't show cutscene (already shown)
      shouldShowSpy.mockResolvedValueOnce(false);

      // Create second game state (simulating new session)
      const gameState2 = new LevelGameState(
        zoneProvider,
        levelConfig,
        'cursor-before-clickers',
        cutsceneService,
        cutsceneRenderer
      );

      await gameState2.initializeFirstZone();

      // Verify cutscene was not shown again
      expect(showCutsceneSpy).not.toHaveBeenCalled();
    });
  });
});
