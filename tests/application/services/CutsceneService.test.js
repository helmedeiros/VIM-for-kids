/* eslint-env node, jest */
import { jest } from '@jest/globals';
import { CutsceneService } from '../../../src/application/services/CutsceneService.js';
import { Story } from '../../../src/domain/value-objects/Story.js';

describe('CutsceneService', () => {
  let cutsceneService;
  let mockCutsceneProvider;
  let mockPersistenceService;
  let mockFeatureFlags;

  beforeEach(() => {
    mockCutsceneProvider = {
      // Legacy methods
      hasOriginStory: jest.fn(),
      getOriginStory: jest.fn(),
      getAllOriginStories: jest.fn(),
      // New multi-level methods
      hasCutsceneStory: jest.fn(),
      getCutsceneStory: jest.fn(),
      getAllCutsceneStories: jest.fn(),
      getCutsceneStoriesForGame: jest.fn(),
      getCutsceneStoriesForLevel: jest.fn(),
      getCutsceneStoriesForZone: jest.fn(),
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

  describe('Multi-level cutscene methods', () => {
    describe('shouldShowCutsceneStory', () => {
      beforeEach(() => {
        mockFeatureFlags.isEnabled.mockReturnValue(true);
        mockCutsceneProvider.hasCutsceneStory.mockResolvedValue(true);
        mockPersistenceService.getCutsceneState.mockReturnValue({});
      });

      it('should return false when feature is disabled', async () => {
        mockFeatureFlags.isEnabled.mockReturnValue(false);

        const result = await cutsceneService.shouldShowCutsceneStory('test-game', 'game');

        expect(result).toBe(false);
        expect(mockFeatureFlags.isEnabled).toHaveBeenCalledWith('ORIGIN_STORY_CUTSCENES');
      });

      it('should return false when game has no cutscene story', async () => {
        mockCutsceneProvider.hasCutsceneStory.mockResolvedValue(false);

        const result = await cutsceneService.shouldShowCutsceneStory('test-game', 'game');

        expect(result).toBe(false);
        expect(mockCutsceneProvider.hasCutsceneStory).toHaveBeenCalledWith(
          'test-game',
          'game',
          null,
          null
        );
      });

      it('should return false when story has already been shown', async () => {
        mockPersistenceService.getCutsceneState.mockReturnValue({
          'test-game:game': { hasBeenShown: true },
        });

        const result = await cutsceneService.shouldShowCutsceneStory('test-game', 'game');

        expect(result).toBe(false);
      });

      it('should return true when all conditions are met for game story', async () => {
        const result = await cutsceneService.shouldShowCutsceneStory('test-game', 'game');

        expect(result).toBe(true);
      });

      it('should return true when all conditions are met for level story', async () => {
        const result = await cutsceneService.shouldShowCutsceneStory(
          'test-game',
          'level',
          'level_2'
        );

        expect(result).toBe(true);
        expect(mockCutsceneProvider.hasCutsceneStory).toHaveBeenCalledWith(
          'test-game',
          'level',
          'level_2',
          null
        );
      });

      it('should return true when all conditions are met for zone story', async () => {
        const result = await cutsceneService.shouldShowCutsceneStory(
          'test-game',
          'zone',
          'level_1',
          'zone_1'
        );

        expect(result).toBe(true);
        expect(mockCutsceneProvider.hasCutsceneStory).toHaveBeenCalledWith(
          'test-game',
          'zone',
          'level_1',
          'zone_1'
        );
      });

      it('should handle invalid cutscene type gracefully', async () => {
        const result = await cutsceneService.shouldShowCutsceneStory('test-game', 'invalid-type');

        expect(result).toBe(false);
      });
    });

    describe('getCutsceneStory', () => {
      it('should delegate to cutscene provider for game story', async () => {
        const mockStoryData = {
          gameId: 'test-game',
          type: 'game',
          script: ['Test script'],
        };
        mockCutsceneProvider.getCutsceneStory.mockResolvedValue(mockStoryData);

        const result = await cutsceneService.getCutsceneStory('test-game', 'game');

        expect(result).toBe(mockStoryData);
        expect(mockCutsceneProvider.getCutsceneStory).toHaveBeenCalledWith(
          'test-game',
          'game',
          null,
          null
        );
      });

      it('should delegate to cutscene provider for level story', async () => {
        const mockStoryData = {
          gameId: 'test-game',
          type: 'level',
          levelId: 'level_2',
          zoneId: null,
          script: ['Level script'],
          identifier: 'test-game:level:level_2',
        };
        mockCutsceneProvider.getCutsceneStory.mockResolvedValue(mockStoryData);

        const result = await cutsceneService.getCutsceneStory('test-game', 'level', 'level_2');

        expect(result).toBe(mockStoryData);
        expect(mockCutsceneProvider.getCutsceneStory).toHaveBeenCalledWith(
          'test-game',
          'level',
          'level_2',
          null
        );
      });

      it('should delegate to cutscene provider for zone story', async () => {
        const mockStoryData = {
          gameId: 'test-game',
          type: 'zone',
          levelId: 'level_1',
          zoneId: 'zone_1',
          script: ['Zone script'],
          identifier: 'test-game:zone:level_1:zone_1',
        };
        mockCutsceneProvider.getCutsceneStory.mockResolvedValue(mockStoryData);

        const result = await cutsceneService.getCutsceneStory(
          'test-game',
          'zone',
          'level_1',
          'zone_1'
        );

        expect(result).toBe(mockStoryData);
        expect(mockCutsceneProvider.getCutsceneStory).toHaveBeenCalledWith(
          'test-game',
          'zone',
          'level_1',
          'zone_1'
        );
      });
    });

    describe('markCutsceneStoryAsShown', () => {
      it('should persist shown state for game story', async () => {
        await cutsceneService.markCutsceneStoryAsShown('test-game', 'game');

        expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith('test-game:game', {
          hasBeenShown: true,
        });
      });

      it('should persist shown state for level story', async () => {
        await cutsceneService.markCutsceneStoryAsShown('test-game', 'level', 'level_2');

        expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith(
          'test-game:level:level_2',
          {
            hasBeenShown: true,
          }
        );
      });

      it('should persist shown state for zone story', async () => {
        await cutsceneService.markCutsceneStoryAsShown('test-game', 'zone', 'level_1', 'zone_1');

        expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith(
          'test-game:zone:level_1:zone_1',
          {
            hasBeenShown: true,
          }
        );
      });
    });

    describe('resetCutsceneStoryState', () => {
      it('should reset story state to not shown for game story', async () => {
        await cutsceneService.resetCutsceneStoryState('test-game', 'game');

        expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith('test-game:game', {
          hasBeenShown: false,
        });
      });

      it('should reset story state to not shown for level story', async () => {
        await cutsceneService.resetCutsceneStoryState('test-game', 'level', 'level_2');

        expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith(
          'test-game:level:level_2',
          {
            hasBeenShown: false,
          }
        );
      });

      it('should reset story state to not shown for zone story', async () => {
        await cutsceneService.resetCutsceneStoryState('test-game', 'zone', 'level_1', 'zone_1');

        expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith(
          'test-game:zone:level_1:zone_1',
          {
            hasBeenShown: false,
          }
        );
      });
    });

    describe('resetAllCutsceneStories', () => {
      it('should reset all stories when no stories exist', async () => {
        mockCutsceneProvider.getAllCutsceneStories.mockResolvedValue([]);

        await cutsceneService.resetAllCutsceneStories();

        expect(mockCutsceneProvider.getAllCutsceneStories).toHaveBeenCalled();
        expect(mockPersistenceService.persistCutsceneState).not.toHaveBeenCalled();
      });

      it('should reset single story', async () => {
        const stories = [
          { gameId: 'game1', type: 'game', identifier: 'game1:game', script: ['Game script'] },
        ];
        mockCutsceneProvider.getAllCutsceneStories.mockResolvedValue(stories);

        await cutsceneService.resetAllCutsceneStories();

        expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith('game1:game', {
          hasBeenShown: false,
        });
      });

      it('should reset multiple stories of different types', async () => {
        const stories = [
          { gameId: 'game1', type: 'game', identifier: 'game1:game', script: ['Game script'] },
          {
            gameId: 'game1',
            type: 'level',
            levelId: 'level_2',
            identifier: 'game1:level:level_2',
            script: ['Level script'],
          },
          {
            gameId: 'game1',
            type: 'zone',
            levelId: 'level_1',
            zoneId: 'zone_1',
            identifier: 'game1:zone:level_1:zone_1',
            script: ['Zone script'],
          },
        ];
        mockCutsceneProvider.getAllCutsceneStories.mockResolvedValue(stories);

        await cutsceneService.resetAllCutsceneStories();

        expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledTimes(3);
        expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith('game1:game', {
          hasBeenShown: false,
        });
        expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith(
          'game1:level:level_2',
          { hasBeenShown: false }
        );
        expect(mockPersistenceService.persistCutsceneState).toHaveBeenCalledWith(
          'game1:zone:level_1:zone_1',
          { hasBeenShown: false }
        );
      });
    });
  });

  describe('Legacy origin story methods (backward compatibility)', () => {
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
        const mockStory = Story.createOriginStory('test-game', ['Test script']);
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
        const story1 = Story.createOriginStory('game1', ['Script 1']);
        mockCutsceneProvider.getAllOriginStories.mockResolvedValue([story1]);
        const resetSpy = jest.spyOn(cutsceneService, 'resetOriginStoryState');

        await cutsceneService.resetAllOriginStories();

        expect(resetSpy).toHaveBeenCalledWith('game1');
      });

      it('should reset multiple stories', async () => {
        const story1 = Story.createOriginStory('game1', ['Script 1']);
        const story2 = Story.createOriginStory('game2', ['Script 2']);
        const story3 = Story.createOriginStory('game3', ['Script 3']);

        mockCutsceneProvider.getAllOriginStories.mockResolvedValue([story1, story2, story3]);
        const resetSpy = jest.spyOn(cutsceneService, 'resetOriginStoryState');

        await cutsceneService.resetAllOriginStories();

        expect(resetSpy).toHaveBeenCalledTimes(3);
        expect(resetSpy).toHaveBeenCalledWith('game1');
        expect(resetSpy).toHaveBeenCalledWith('game2');
        expect(resetSpy).toHaveBeenCalledWith('game3');
      });
    });
  });

  describe('Feature flag methods', () => {
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

  describe('Error handling', () => {
    it('should handle provider errors gracefully in shouldShowCutsceneStory', async () => {
      mockCutsceneProvider.hasCutsceneStory.mockRejectedValue(new Error('Provider error'));

      const result = await cutsceneService.shouldShowCutsceneStory('test-game', 'game');

      expect(result).toBe(false);
    });

    it('should handle persistence errors gracefully in markCutsceneStoryAsShown', async () => {
      mockPersistenceService.persistCutsceneState.mockImplementation(() => {
        throw new Error('Persistence error');
      });

      // Should not throw - errors are caught and handled gracefully
      await expect(
        cutsceneService.markCutsceneStoryAsShown('test-game', 'game')
      ).resolves.toBeUndefined();
    });

    it('should handle invalid story identifiers gracefully', async () => {
      const result = await cutsceneService.shouldShowCutsceneStory('', '');

      expect(result).toBe(false);
    });
  });
});
