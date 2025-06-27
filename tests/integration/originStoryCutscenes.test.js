/* eslint-env node, jest */

import { GameInitializationService } from '../../src/application/services/GameInitializationService.js';
import { CutsceneService } from '../../src/application/services/CutsceneService.js';
import { PersistenceService } from '../../src/application/services/PersistenceService.js';
import { GameFactory } from '../../src/application/factories/GameFactory.js';
import { CutsceneProviderAdapter } from '../../src/infrastructure/data/CutsceneProviderAdapter.js';
import { CutsceneRenderer } from '../../src/infrastructure/ui/CutsceneRenderer.js';
import { BrowserURLAdapter } from '../../src/infrastructure/adapters/BrowserURLAdapter.js';
import { BrowserStorageAdapter } from '../../src/infrastructure/adapters/BrowserStorageAdapter.js';
import { FeatureFlags } from '../../src/infrastructure/FeatureFlags.js';

/**
 * Integration tests for Origin Story Cutscenes
 * These tests verify the complete cutscene integration flow
 */
describe('Origin Story Cutscenes Integration', () => {
  let gameInitializationService;
  let cutsceneService;
  let persistenceService;
  let featureFlags;
  let mockContainer;

  beforeEach(() => {
    // Setup DOM container for cutscene renderer
    mockContainer = document.createElement('div');
    mockContainer.id = 'test-container';
    document.body.appendChild(mockContainer);

    // Create real services
    const urlAdapter = new BrowserURLAdapter();
    const storageAdapter = new BrowserStorageAdapter();
    persistenceService = new PersistenceService(urlAdapter, storageAdapter);

    const cutsceneProvider = new CutsceneProviderAdapter();
    featureFlags = new FeatureFlags();
    cutsceneService = new CutsceneService(cutsceneProvider, persistenceService, featureFlags);

    const cutsceneRenderer = new CutsceneRenderer('test-container');
    const gameFactory = new GameFactory();

    gameInitializationService = new GameInitializationService(
      gameFactory,
      persistenceService,
      cutsceneService,
      cutsceneRenderer
    );

    // Clear any existing cutscene state
    persistenceService.clearCutsceneState();
  });

  afterEach(() => {
    // Cleanup DOM
    if (mockContainer && mockContainer.parentNode) {
      mockContainer.parentNode.removeChild(mockContainer);
    }

    // Clear cutscene state
    persistenceService.clearCutsceneState();
  });

  describe('Game initialization flow with cutscenes', () => {
    it('should show origin story before game map when conditions are met', async () => {
      // Mock cutscene renderer to avoid actual UI rendering delays
      const originalShowCutscene = gameInitializationService._cutsceneRenderer.showCutscene;
      gameInitializationService._cutsceneRenderer.showCutscene = jest.fn().mockResolvedValue();

      // Verify cutscene should be shown initially
      const shouldShow = await cutsceneService.shouldShowOriginStory('cursor-before-clickers');
      expect(shouldShow).toBe(true);

      // Initialize game - this should trigger cutscene
      const game = await gameInitializationService.initializeGame({
        game: 'cursor-before-clickers',
      });

      // Verify game was created
      expect(game).toBeDefined();

      // Verify cutscene renderer was called
      expect(gameInitializationService._cutsceneRenderer.showCutscene).toHaveBeenCalled();

      // Verify cutscene was marked as shown
      const shouldShowAfter = await cutsceneService.shouldShowOriginStory('cursor-before-clickers');
      expect(shouldShowAfter).toBe(false);

      // Restore original method
      gameInitializationService._cutsceneRenderer.showCutscene = originalShowCutscene;
    });

    it('should skip cutscene when feature flag is disabled', async () => {
      // Create new feature flags with cutscenes disabled
      const disabledFeatureFlags = new FeatureFlags();
      disabledFeatureFlags.disable('ORIGIN_STORY_CUTSCENES');

      // Create new cutscene service with disabled feature flags
      const disabledCutsceneService = new CutsceneService(
        new CutsceneProviderAdapter(),
        persistenceService,
        disabledFeatureFlags
      );

      // Verify cutscene should not be shown
      const shouldShow =
        await disabledCutsceneService.shouldShowOriginStory('cursor-before-clickers');
      expect(shouldShow).toBe(false);

      // Create new game initialization service with disabled cutscenes
      const disabledGameService = new GameInitializationService(
        new GameFactory(),
        persistenceService,
        disabledCutsceneService,
        gameInitializationService._cutsceneRenderer
      );

      // Initialize game
      const game = await disabledGameService.initializeGame({
        game: 'cursor-before-clickers',
      });

      // Verify game was created
      expect(game).toBeDefined();
    });

    it('should skip cutscene when already shown this session', async () => {
      // Mark cutscene as already shown
      await cutsceneService.markOriginStoryAsShown('cursor-before-clickers');

      // Verify cutscene should not be shown
      const shouldShow = await cutsceneService.shouldShowOriginStory('cursor-before-clickers');
      expect(shouldShow).toBe(false);

      // Initialize game
      const game = await gameInitializationService.initializeGame({
        game: 'cursor-before-clickers',
      });

      // Verify game was created
      expect(game).toBeDefined();
    });

    it('should handle page reload correctly', async () => {
      // Show cutscene first time
      await cutsceneService.markOriginStoryAsShown('cursor-before-clickers');

      // Simulate page reload by creating new service instances
      const newCutsceneService = new CutsceneService(
        new CutsceneProviderAdapter(),
        persistenceService, // Same persistence service to simulate storage
        featureFlags
      );

      // Verify cutscene state is remembered
      const shouldShow = await newCutsceneService.shouldShowOriginStory('cursor-before-clickers');
      expect(shouldShow).toBe(false);
    });

    it('should handle game switching correctly', async () => {
      // Show cutscene for first game
      await cutsceneService.markOriginStoryAsShown('cursor-before-clickers');

      // Verify first game cutscene is marked as shown
      const shouldShowFirst = await cutsceneService.shouldShowOriginStory('cursor-before-clickers');
      expect(shouldShowFirst).toBe(false);

      // Verify second game cutscene would still be shown (if it existed)
      // Note: cursor-textland doesn't have an origin story yet
      const hasTextlandStory =
        await cutsceneService._cutsceneProvider.hasOriginStory('cursor-textland');
      expect(hasTextlandStory).toBe(false);
    });
  });

  describe('Cutscene service integration', () => {
    it('should integrate CutsceneService with GameInitializationService', async () => {
      // Test that cutscene service is properly integrated
      expect(gameInitializationService._cutsceneService).toBe(cutsceneService);

      // Verify origin story exists
      const originStory = await cutsceneService.getOriginStory('cursor-before-clickers');
      expect(originStory).toBeDefined();
      expect(originStory.gameId).toBe('cursor-before-clickers');
      expect(originStory.script).toBeInstanceOf(Array);
      expect(originStory.script.length).toBeGreaterThan(0);
    });

    it('should integrate CutsceneRenderer with actual DOM', async () => {
      // Verify renderer can access DOM container
      expect(mockContainer).toBeDefined();
      expect(mockContainer.id).toBe('test-container');

      // Verify cutscene renderer was created successfully
      expect(gameInitializationService._cutsceneRenderer).toBeDefined();
    });

    it('should handle cutscene completion properly', async () => {
      // Get origin story
      const originStory = await cutsceneService.getOriginStory('cursor-before-clickers');
      expect(originStory).toBeDefined();

      // Verify initial state
      const initialState = await cutsceneService.shouldShowOriginStory('cursor-before-clickers');
      expect(initialState).toBe(true);

      // Simulate showing cutscene
      await cutsceneService.markOriginStoryAsShown('cursor-before-clickers');

      // Verify state changed
      const finalState = await cutsceneService.shouldShowOriginStory('cursor-before-clickers');
      expect(finalState).toBe(false);
    });
  });

  describe('Persistence integration', () => {
    it('should persist cutscene state across sessions', async () => {
      // Mark cutscene as shown
      await cutsceneService.markOriginStoryAsShown('cursor-before-clickers');

      // Get persisted state
      const cutsceneState = persistenceService.getCutsceneState();
      expect(cutsceneState['cursor-before-clickers']).toBeDefined();
      expect(cutsceneState['cursor-before-clickers'].hasBeenShown).toBe(true);
    });

    it('should handle multiple games cutscene states independently', async () => {
      // Mark one game as shown
      await cutsceneService.markOriginStoryAsShown('cursor-before-clickers');

      // Simulate another game state
      persistenceService.persistCutsceneState('cursor-textland', { hasBeenShown: false });

      // Verify states are independent
      const cutsceneState = persistenceService.getCutsceneState();
      expect(cutsceneState['cursor-before-clickers'].hasBeenShown).toBe(true);
      expect(cutsceneState['cursor-textland'].hasBeenShown).toBe(false);
    });
  });

  describe('Error handling integration', () => {
    it('should gracefully handle missing origin stories', async () => {
      // Test with non-existent game
      const shouldShow = await cutsceneService.shouldShowOriginStory('non-existent-game');
      expect(shouldShow).toBe(false);

      // Initialize game with non-existent origin story
      const game = await gameInitializationService.initializeGame({
        game: 'cursor-textland', // This game doesn't have an origin story
      });

      // Game should still be created
      expect(game).toBeDefined();
    });

    it('should handle cutscene rendering errors gracefully', async () => {
      // Test that the CutsceneRenderer throws appropriate error for missing container
      expect(() => new CutsceneRenderer('non-existent-container')).toThrow(
        'CutsceneRenderer: Container element not found'
      );

      // Test that game initialization service handles missing cutscene renderer gracefully
      const serviceWithoutRenderer = new GameInitializationService(
        new GameFactory(),
        persistenceService,
        null, // No cutscene service
        null // No cutscene renderer
      );

      // Game should still initialize without cutscenes
      const game = await serviceWithoutRenderer.initializeGame({
        game: 'cursor-before-clickers',
      });

      expect(game).toBeDefined();
    });
  });

  describe('Feature flag integration', () => {
    it('should respect feature flag settings', async () => {
      // Test with feature enabled
      expect(featureFlags.isEnabled('ORIGIN_STORY_CUTSCENES')).toBe(true);

      let shouldShow = await cutsceneService.shouldShowOriginStory('cursor-before-clickers');
      expect(shouldShow).toBe(true);

      // Test with feature disabled by creating new service
      const disabledFeatureFlags = new FeatureFlags();
      disabledFeatureFlags.disable('ORIGIN_STORY_CUTSCENES');

      const disabledCutsceneService = new CutsceneService(
        new CutsceneProviderAdapter(),
        persistenceService,
        disabledFeatureFlags
      );

      expect(disabledFeatureFlags.isEnabled('ORIGIN_STORY_CUTSCENES')).toBe(false);

      shouldShow = await disabledCutsceneService.shouldShowOriginStory('cursor-before-clickers');
      expect(shouldShow).toBe(false);
    });
  });
});
