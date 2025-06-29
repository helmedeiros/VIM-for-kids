/**
 * Regression test for zone cutscenes
 * Ensures zone cutscenes work properly and don't break during game switching
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

describe('Zone Cutscenes Regression Tests', () => {
  let game;
  let gameRenderer;
  let zoneProvider;
  let gameProvider;
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

    // Create dependencies
    gameRenderer = new DOMGameRenderer('test-container');
    zoneProvider = new ZoneRegistryAdapter();
    gameProvider = new GameProviderAdapter();

    // Create cutscene services
    const urlAdapter = new BrowserURLAdapter();
    const storageAdapter = new BrowserStorageAdapter();
    persistenceService = new PersistenceService(urlAdapter, storageAdapter);

    const cutsceneProvider = new CutsceneProviderAdapter();
    featureFlags = new FeatureFlags();
    featureFlags.enable('ORIGIN_STORY_CUTSCENES');

    cutsceneService = new CutsceneService(cutsceneProvider, persistenceService, featureFlags);
    cutsceneRenderer = new CutsceneRenderer('test-container');

    // Clear any existing cutscene state
    localStorage.clear();
  });

  afterEach(() => {
    // Cleanup
    if (game) {
      game.cleanup();
    }
    if (mockContainer) {
      document.body.removeChild(mockContainer);
    }
    localStorage.clear();
  });

  describe('Zone Cutscenes After Game Initialization', () => {
    it('should show zone cutscenes for zones that have narration', async () => {
      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const getCutsceneSpy = jest.spyOn(cutsceneService, 'getCutsceneStory');

      // Mock zone cutscene to be shown
      shouldShowSpy.mockImplementation((gameId, type, levelId, zoneId) => {
        return Promise.resolve(type === 'zone' && zoneId === 'zone_1');
      });

      getCutsceneSpy.mockImplementation((gameId, type, levelId, zoneId) => {
        if (type === 'zone' && zoneId === 'zone_1') {
          return Promise.resolve({
            gameId,
            type,
            levelId,
            zoneId,
            script: [
              'Once, the world was clear. Text flowed like rivers, perfectly aligned. But the Bugs came...',
              'Then, from the Blinking Grove, a spark appeared. A light not of fire… but of focus. You.',
            ],
          });
        }
        return Promise.resolve(null);
      });

      // Create game instance
      game = new VimForKidsGame(
        { gameRenderer, gameId: 'cursor-before-clickers', level: 'level_1' },
        {
          zoneProvider,
          gameProvider,
          cutsceneService,
          cutsceneRenderer,
          persistenceService,
          featureFlags,
        }
      );

      // Initialize game (this should trigger zone cutscenes)
      await game.initializeGame();

      // Verify zone cutscene was shown
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
        script: [
          'Once, the world was clear. Text flowed like rivers, perfectly aligned. But the Bugs came...',
          'Then, from the Blinking Grove, a spark appeared. A light not of fire… but of focus. You.',
        ],
      });
    });

    it('should show zone cutscenes after game switching', async () => {
      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const getCutsceneSpy = jest.spyOn(cutsceneService, 'getCutsceneStory');

      // Mock zone cutscene to be shown
      shouldShowSpy.mockImplementation((gameId, type) => {
        return Promise.resolve(type === 'zone');
      });

      getCutsceneSpy.mockImplementation((gameId, type, levelId, zoneId) => {
        if (type === 'zone') {
          return Promise.resolve({
            gameId,
            type,
            levelId,
            zoneId,
            script: [`Zone cutscene for ${zoneId}`],
          });
        }
        return Promise.resolve(null);
      });

      // Create game instance with textland first
      game = new VimForKidsGame(
        { gameRenderer, gameId: 'cursor-textland' },
        {
          zoneProvider,
          gameProvider,
          cutsceneService,
          cutsceneRenderer,
          persistenceService,
          featureFlags,
        }
      );

      await game.initializeGame();

      // Reset spies
      showCutsceneSpy.mockClear();
      shouldShowSpy.mockClear();
      getCutsceneSpy.mockClear();

      // Switch to level-based game (should trigger zone cutscenes)
      await game.switchToGame('cursor-before-clickers');

      // Verify zone cutscene was shown after switching
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
        script: ['Zone cutscene for zone_1'],
      });
    });

    it('should not show zone cutscenes when feature flag is disabled', async () => {
      // Disable feature flag
      featureFlags.disable('ORIGIN_STORY_CUTSCENES');

      // Spy on cutscene methods
      const showCutsceneSpy = jest.spyOn(cutsceneRenderer, 'showCutscene').mockResolvedValue();
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');

      // Mock that cutscene should not be shown due to feature flag
      shouldShowSpy.mockResolvedValue(false);

      // Create game instance
      game = new VimForKidsGame(
        { gameRenderer, gameId: 'cursor-before-clickers', level: 'level_1' },
        {
          zoneProvider,
          gameProvider,
          cutsceneService,
          cutsceneRenderer,
          persistenceService,
          featureFlags,
        }
      );

      await game.initializeGame();

      // Verify zone cutscene was not shown
      expect(shouldShowSpy).toHaveBeenCalledWith(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );
      expect(showCutsceneSpy).not.toHaveBeenCalled();
    });

    it('should handle zone cutscene errors gracefully', async () => {
      // Spy on cutscene methods and console
      const shouldShowSpy = jest.spyOn(cutsceneService, 'shouldShowCutsceneStory');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock cutscene service to throw error
      shouldShowSpy.mockRejectedValue(new Error('Zone cutscene service error'));

      // Create game instance
      game = new VimForKidsGame(
        { gameRenderer, gameId: 'cursor-before-clickers', level: 'level_1' },
        {
          zoneProvider,
          gameProvider,
          cutsceneService,
          cutsceneRenderer,
          persistenceService,
          featureFlags,
        }
      );

      // Initialize game should not throw even with cutscene errors
      await expect(game.initializeGame()).resolves.toBeUndefined();

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to show zone entry cutscene:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Zone Cutscenes Integration with CutsceneProviderAdapter', () => {
    it('should find zone cutscenes from zone narration', async () => {
      const cutsceneProvider = new CutsceneProviderAdapter();

      // Check if zone cutscenes are available
      const hasZone1Cutscene = await cutsceneProvider.hasCutsceneStory(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );

      expect(hasZone1Cutscene).toBe(true);

      // Get the zone cutscene story
      const zoneStory = await cutsceneProvider.getCutsceneStory(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );

      expect(zoneStory).toBeDefined();
      expect(zoneStory.type).toBe('zone');
      expect(zoneStory.gameId).toBe('cursor-before-clickers');
      expect(zoneStory.levelId).toBe('level_1');
      expect(zoneStory.zoneId).toBe('zone_1');
      expect(Array.isArray(zoneStory.script)).toBe(true);
      expect(zoneStory.script.length).toBeGreaterThan(0);
    });

    it('should list all available zone cutscenes', async () => {
      const cutsceneProvider = new CutsceneProviderAdapter();
      const allStories = await cutsceneProvider.getAllCutsceneStories();

      const zoneStories = Array.from(allStories.values()).filter((story) => story.type === 'zone');

      expect(zoneStories.length).toBeGreaterThan(0);

      // Verify zone stories have correct structure
      zoneStories.forEach((story) => {
        expect(story.type).toBe('zone');
        expect(story.gameId).toBeDefined();
        expect(story.levelId).toBeDefined();
        expect(story.zoneId).toBeDefined();
        expect(Array.isArray(story.script)).toBe(true);
        expect(story.script.length).toBeGreaterThan(0);
      });
    });
  });
});
