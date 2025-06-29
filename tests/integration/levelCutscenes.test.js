import { GameInitializationService } from '../../src/application/services/GameInitializationService.js';
import { VimForKidsGame } from '../../src/VimForKidsGame.js';
import { GameFactory } from '../../src/application/factories/GameFactory.js';
import { PersistenceService } from '../../src/application/services/PersistenceService.js';
import { CutsceneService } from '../../src/application/services/CutsceneService.js';
import { CutsceneProviderAdapter } from '../../src/infrastructure/data/CutsceneProviderAdapter.js';
import { CutsceneRenderer } from '../../src/infrastructure/ui/CutsceneRenderer.js';
import { BrowserURLAdapter } from '../../src/infrastructure/adapters/BrowserURLAdapter.js';
import { BrowserStorageAdapter } from '../../src/infrastructure/adapters/BrowserStorageAdapter.js';
import { FeatureFlags } from '../../src/infrastructure/FeatureFlags.js';
import { DOMGameRenderer } from '../../src/infrastructure/ui/DOMGameRenderer.js';
import { ZoneRegistryAdapter } from '../../src/infrastructure/data/zones/ZoneRegistryAdapter.js';
import { GameProviderAdapter } from '../../src/infrastructure/data/games/GameProviderAdapter.js';

describe('Level Cutscenes Integration', () => {
  let gameInitializationService;
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
    const urlAdapter = new BrowserURLAdapter();
    const storageAdapter = new BrowserStorageAdapter();
    persistenceService = new PersistenceService(urlAdapter, storageAdapter);

    const cutsceneProvider = new CutsceneProviderAdapter();
    featureFlags = new FeatureFlags();
    cutsceneService = new CutsceneService(cutsceneProvider, persistenceService, featureFlags);
    cutsceneRenderer = new CutsceneRenderer('test-container');

    const gameFactory = new GameFactory({
      cutsceneService,
      cutsceneRenderer,
    });

    gameInitializationService = new GameInitializationService(
      gameFactory,
      persistenceService,
      cutsceneService,
      cutsceneRenderer
    );

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

  describe('Level Cutscenes During Initialization', () => {
    it('should show level cutscene when starting a new level', async () => {
      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const getCutsceneSpy = jest.spyOn(cutsceneService, 'getCutsceneStory');
      const markShownSpy = jest.spyOn(cutsceneService, 'markCutsceneStoryAsShown');

      // Mock level cutscene existence
      shouldShowSpy.mockResolvedValue(true);
      getCutsceneSpy.mockResolvedValue({
        gameId: 'cursor-before-clickers',
        type: 'level',
        levelId: 'level_2',
        script: ['Level 2 begins...', 'Master the text manipulation!'],
      });

      // Initialize game with level 2
      await gameInitializationService.initializeGame({
        game: 'cursor-before-clickers',
        level: 'level_2',
      });

      // Verify level cutscene was checked and shown
      expect(shouldShowSpy).toHaveBeenCalledWith('cursor-before-clickers', 'level', 'level_2');
      expect(getCutsceneSpy).toHaveBeenCalledWith('cursor-before-clickers', 'level', 'level_2');
      expect(showCutsceneSpy).toHaveBeenCalledWith({
        gameId: 'cursor-before-clickers',
        type: 'level',
        levelId: 'level_2',
        script: ['Level 2 begins...', 'Master the text manipulation!'],
      });
      expect(markShownSpy).toHaveBeenCalledWith('cursor-before-clickers', 'level', 'level_2');
    });

    it('should not show level cutscene when already shown', async () => {
      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const shouldShowOriginSpy = jest.spyOn(cutsceneService, 'shouldShowOriginStory');

      // Mock that origin story should not be shown
      shouldShowOriginSpy.mockResolvedValue(false);

      // Mock that cutscene should not be shown (already seen)
      shouldShowSpy.mockResolvedValue(false);

      // Initialize game with level 2
      await gameInitializationService.initializeGame({
        game: 'cursor-before-clickers',
        level: 'level_2',
      });

      // Verify level cutscene was checked but not shown
      expect(shouldShowSpy).toHaveBeenCalledWith('cursor-before-clickers', 'level', 'level_2');
      expect(showCutsceneSpy).not.toHaveBeenCalled();
    });

    it('should not show level cutscene when feature flag disabled', async () => {
      // Disable feature flag
      featureFlags.disable('ORIGIN_STORY_CUTSCENES');

      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const shouldShowOriginSpy = jest.spyOn(cutsceneService, 'shouldShowOriginStory');

      // Mock that origin story should not be shown (feature disabled)
      shouldShowOriginSpy.mockResolvedValue(false);

      // Mock that cutscene should be shown (but feature is disabled)
      shouldShowSpy.mockResolvedValue(false); // Will return false due to feature flag

      // Initialize game with level 2
      await gameInitializationService.initializeGame({
        game: 'cursor-before-clickers',
        level: 'level_2',
      });

      // Verify level cutscene was checked but not shown
      expect(shouldShowSpy).toHaveBeenCalledWith('cursor-before-clickers', 'level', 'level_2');
      expect(showCutsceneSpy).not.toHaveBeenCalled();
    });

    it('should handle level cutscene errors gracefully', async () => {
      // Spy on cutscene methods
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const getCutsceneSpy = jest.spyOn(cutsceneService, 'getCutsceneStory');
      const shouldShowOriginSpy = jest.spyOn(cutsceneService, 'shouldShowOriginStory');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock that origin story should not be shown
      shouldShowOriginSpy.mockResolvedValue(false);

      // Mock cutscene service to throw error
      shouldShowSpy.mockResolvedValue(true);
      getCutsceneSpy.mockRejectedValue(new Error('Cutscene service error'));

      // Initialize game should not throw
      await expect(
        gameInitializationService.initializeGame({
          game: 'cursor-before-clickers',
          level: 'level_2',
        })
      ).resolves.toBeDefined();

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to show level cutscene:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Level Cutscenes During Transition', () => {
    let vimForKidsGame;

    beforeEach(async () => {
      // Create VimForKidsGame with cutscene services
      const gameRenderer = new DOMGameRenderer();
      const zoneProvider = new ZoneRegistryAdapter();
      const gameProvider = new GameProviderAdapter();

      vimForKidsGame = new VimForKidsGame(
        { game: 'cursor-before-clickers', level: 'level_1' },
        {
          gameRenderer,
          zoneProvider,
          gameProvider,
          cutsceneService,
          cutsceneRenderer,
          persistenceService,
        }
      );

      // Wait for async initialization
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    afterEach(() => {
      if (vimForKidsGame) {
        vimForKidsGame.cleanup();
      }
    });

    it('should show level cutscene during level transition', async () => {
      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const getCutsceneSpy = jest.spyOn(cutsceneService, 'getCutsceneStory');
      const markShownSpy = jest.spyOn(cutsceneService, 'markCutsceneStoryAsShown');

      // Mock level cutscene existence
      shouldShowSpy.mockResolvedValue(true);
      getCutsceneSpy.mockResolvedValue({
        gameId: 'cursor-before-clickers',
        type: 'level',
        levelId: 'level_3',
        script: ['Level 3 awaits...', 'Advanced movement commands ahead!'],
      });

      // Transition to level 3
      await vimForKidsGame.transitionToLevel('level_3');

      // Verify level cutscene was shown before transition
      expect(shouldShowSpy).toHaveBeenCalledWith('cursor-before-clickers', 'level', 'level_3');
      expect(getCutsceneSpy).toHaveBeenCalledWith('cursor-before-clickers', 'level', 'level_3');
      expect(showCutsceneSpy).toHaveBeenCalledWith({
        gameId: 'cursor-before-clickers',
        type: 'level',
        levelId: 'level_3',
        script: ['Level 3 awaits...', 'Advanced movement commands ahead!'],
      });
      expect(markShownSpy).toHaveBeenCalledWith('cursor-before-clickers', 'level', 'level_3');
    });

    it('should handle level transition cutscene errors gracefully', async () => {
      // Spy on cutscene methods
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock cutscene service to throw error
      shouldShowSpy.mockRejectedValue(new Error('Cutscene service error'));

      // Level transition should not throw
      await expect(vimForKidsGame.transitionToLevel('level_3')).resolves.toBeUndefined();

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to show level cutscene:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Complete Level Cutscene Flow', () => {
    it('should show game origin story, then level cutscene, then zone entry cutscene', async () => {
      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const shouldShowOriginSpy = jest.spyOn(cutsceneService, 'shouldShowOriginStory');
      const getCutsceneSpy = jest.spyOn(cutsceneService, 'getCutsceneStory');
      const getOriginSpy = jest.spyOn(cutsceneService, 'getOriginStory');

      // Mock all cutscenes to be shown
      shouldShowOriginSpy.mockResolvedValue(true);
      shouldShowSpy.mockResolvedValue(true);

      getOriginSpy.mockResolvedValue({
        gameId: 'cursor-before-clickers',
        script: ['Game origin story...'],
      });

      getCutsceneSpy.mockImplementation((gameId, type, levelId, zoneId) => {
        if (type === 'level') {
          return Promise.resolve({
            gameId,
            type,
            levelId,
            script: [`Level ${levelId} begins...`],
          });
        }
        if (type === 'zone') {
          return Promise.resolve({
            gameId,
            type,
            levelId,
            zoneId,
            script: [`Entering ${zoneId}...`],
          });
        }
        return Promise.resolve(null);
      });

      // Initialize game
      await gameInitializationService.initializeGame({
        game: 'cursor-before-clickers',
        level: 'level_1',
      });

      // Verify all cutscenes were shown in order
      expect(showCutsceneSpy).toHaveBeenCalledTimes(3); // Origin, Level, Zone

      // Verify origin story was shown first
      expect(showCutsceneSpy).toHaveBeenNthCalledWith(1, {
        gameId: 'cursor-before-clickers',
        script: ['Game origin story...'],
      });

      // Verify level cutscene was shown second
      expect(showCutsceneSpy).toHaveBeenNthCalledWith(2, {
        gameId: 'cursor-before-clickers',
        type: 'level',
        levelId: 'level_1',
        script: ['Level level_1 begins...'],
      });

      // Verify zone cutscene was shown third
      expect(showCutsceneSpy).toHaveBeenNthCalledWith(3, {
        gameId: 'cursor-before-clickers',
        type: 'zone',
        levelId: 'level_1',
        zoneId: 'zone_1',
        script: ['Entering zone_1...'],
      });
    });
  });
});
