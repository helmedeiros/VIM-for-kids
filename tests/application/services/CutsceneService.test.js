/* eslint-env node, jest */
import { jest } from '@jest/globals';
import { CutsceneService } from '../../../src/application/services/CutsceneService.js';
import { OriginStory } from '../../../src/domain/value-objects/OriginStory.js';

describe('CutsceneService', () => {
  let cutsceneService;
  let mockCutsceneProvider;
  let mockPersistenceService;
  let mockFeatureFlags;

  beforeEach(() => {
    mockCutsceneProvider = {
      hasOriginStory: jest.fn(),
      getOriginStory: jest.fn(),
      getAllOriginStories: jest.fn(),
    };

    mockPersistenceService = {
      getCutsceneState: jest.fn(),
      persistCutsceneState: jest.fn(),
    };

    mockFeatureFlags = {
      isEnabled: jest.fn(),
    };

    cutsceneService = new CutsceneService(
      mockCutsceneProvider,
      mockPersistenceService,
      mockFeatureFlags
    );
  });

  describe('Constructor', () => {
    it('should create service with all dependencies', () => {
      expect(cutsceneService).toBeDefined();
    });

    it('should throw error when cutsceneProvider is missing', () => {
      expect(() => new CutsceneService(null, mockPersistenceService, mockFeatureFlags)).toThrow(
        'CutsceneProvider is required'
      );
    });

    it('should throw error when persistenceService is missing', () => {
      expect(() => new CutsceneService(mockCutsceneProvider, null, mockFeatureFlags)).toThrow(
        'PersistenceService is required'
      );
    });

    it('should throw error when featureFlags is missing', () => {
      expect(() => new CutsceneService(mockCutsceneProvider, mockPersistenceService, null)).toThrow(
        'FeatureFlags is required'
      );
    });
  });

  describe('shouldShowOriginStory', () => {
    beforeEach(() => {
      mockFeatureFlags.isEnabled.mockReturnValue(true);
      mockCutsceneProvider.hasOriginStory.mockResolvedValue(true);
      mockPersistenceService.getCutsceneState.mockReturnValue({});
    });

    it('should return false when feature is disabled', async () => {
      mockFeatureFlags.isEnabled.mockReturnValue(false);

      const result = await cutsceneService.shouldShowOriginStory('test-game');

      expect(result).toBe(false);
      expect(mockFeatureFlags.isEnabled).toHaveBeenCalledWith('ORIGIN_STORY_CUTSCENES');
    });

    it('should return false when game has no origin story', async () => {
      mockCutsceneProvider.hasOriginStory.mockResolvedValue(false);

      const result = await cutsceneService.shouldShowOriginStory('test-game');

      expect(result).toBe(false);
      expect(mockCutsceneProvider.hasOriginStory).toHaveBeenCalledWith('test-game');
    });

    it('should return false when story has already been shown', async () => {
      mockPersistenceService.getCutsceneState.mockReturnValue({
        'test-game': { hasBeenShown: true },
      });

      const result = await cutsceneService.shouldShowOriginStory('test-game');

      expect(result).toBe(false);
    });

    it('should return true when all conditions are met', async () => {
      const result = await cutsceneService.shouldShowOriginStory('test-game');

      expect(result).toBe(true);
    });

    it('should return true when game has no previous state', async () => {
      mockPersistenceService.getCutsceneState.mockReturnValue({
        'other-game': { hasBeenShown: true },
      });

      const result = await cutsceneService.shouldShowOriginStory('test-game');

      expect(result).toBe(true);
    });

    it('should return true when game state shows not shown', async () => {
      mockPersistenceService.getCutsceneState.mockReturnValue({
        'test-game': { hasBeenShown: false },
      });

      const result = await cutsceneService.shouldShowOriginStory('test-game');

      expect(result).toBe(true);
    });
  });

  describe('getOriginStory', () => {
    it('should delegate to cutscene provider', async () => {
      const mockStory = new OriginStory('test-game', ['Test script']);
      mockCutsceneProvider.getOriginStory.mockResolvedValue(mockStory);

      const result = await cutsceneService.getOriginStory('test-game');

      expect(result).toBe(mockStory);
      expect(mockCutsceneProvider.getOriginStory).toHaveBeenCalledWith('test-game');
    });
  });

  describe('markOriginStoryAsShown', () => {
    it('should persist shown state', async () => {
      await cutsceneService.markOriginStoryAsShown('test-game');

      expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith('test-game', {
        hasBeenShown: true,
      });
    });
  });

  describe('resetOriginStoryState', () => {
    it('should reset story state to not shown', async () => {
      await cutsceneService.resetOriginStoryState('test-game');

      expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith('test-game', {
        hasBeenShown: false,
      });
    });
  });

  describe('resetAllOriginStories', () => {
    it('should reset all stories when no stories exist', async () => {
      mockCutsceneProvider.getAllOriginStories.mockResolvedValue([]);

      await cutsceneService.resetAllOriginStories();

      expect(mockCutsceneProvider.getAllOriginStories).toHaveBeenCalled();
      expect(mockPersistenceService.persistCutsceneState).not.toHaveBeenCalled();
    });

    it('should reset single story', async () => {
      const story1 = new OriginStory('game1', ['Script 1']);
      mockCutsceneProvider.getAllOriginStories.mockResolvedValue([story1]);
      const resetSpy = jest.spyOn(cutsceneService, 'resetOriginStoryState');

      await cutsceneService.resetAllOriginStories();

      expect(resetSpy).toHaveBeenCalledWith('game1');
    });

    it('should reset multiple stories', async () => {
      const story1 = new OriginStory('game1', ['Script 1']);
      const story2 = new OriginStory('game2', ['Script 2']);
      const story3 = new OriginStory('game3', ['Script 3']);

      mockCutsceneProvider.getAllOriginStories.mockResolvedValue([story1, story2, story3]);
      const resetSpy = jest.spyOn(cutsceneService, 'resetOriginStoryState');

      await cutsceneService.resetAllOriginStories();

      expect(resetSpy).toHaveBeenCalledTimes(3);
      expect(resetSpy).toHaveBeenCalledWith('game1');
      expect(resetSpy).toHaveBeenCalledWith('game2');
      expect(resetSpy).toHaveBeenCalledWith('game3');
    });
  });

  describe('isCutsceneFeatureEnabled', () => {
    it('should return true when feature is enabled', () => {
      mockFeatureFlags.isEnabled.mockReturnValue(true);

      const result = cutsceneService.isCutsceneFeatureEnabled();

      expect(result).toBe(true);
      expect(mockFeatureFlags.isEnabled).toHaveBeenCalledWith('ORIGIN_STORY_CUTSCENES');
    });

    it('should return false when feature is disabled', () => {
      mockFeatureFlags.isEnabled.mockReturnValue(false);

      const result = cutsceneService.isCutsceneFeatureEnabled();

      expect(result).toBe(false);
      expect(mockFeatureFlags.isEnabled).toHaveBeenCalledWith('ORIGIN_STORY_CUTSCENES');
    });
  });
});
