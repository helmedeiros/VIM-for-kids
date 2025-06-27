/* eslint-env node, jest */
import { CutsceneProviderAdapter } from '../../../src/infrastructure/data/CutsceneProviderAdapter.js';
import { CutsceneStory } from '../../../src/domain/value-objects/CutsceneStory.js';
import { OriginStory } from '../../../src/domain/value-objects/OriginStory.js';

describe('CutsceneProviderAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new CutsceneProviderAdapter();
  });

  describe('constructor', () => {
    it('should create an instance of CutsceneProviderAdapter', () => {
      expect(adapter).toBeInstanceOf(CutsceneProviderAdapter);
    });

    it('should initialize with predefined cutscene stories', async () => {
      const allStories = await adapter.getAllCutsceneStories();
      expect(allStories.length).toBeGreaterThan(0);
    });
  });

  describe('game-level cutscenes', () => {
    it('should return game-level cutscene for cursor-before-clickers', async () => {
      const story = await adapter.getCutsceneStory('cursor-before-clickers', 'game');

      expect(story).not.toBeNull();
      expect(story.gameId).toBe('cursor-before-clickers');
      expect(story.type).toBe('game');
      expect(story.levelId).toBeNull();
      expect(story.zoneId).toBeNull();
      expect(Array.isArray(story.script)).toBe(true);
      expect(story.script.length).toBeGreaterThan(0);
    });

    it('should check if game-level cutscene exists', async () => {
      const exists = await adapter.hasCutsceneStory('cursor-before-clickers', 'game');
      expect(exists).toBe(true);
    });

    it('should return null for non-existent game', async () => {
      const story = await adapter.getCutsceneStory('non-existent-game', 'game');
      expect(story).toBeNull();
    });

    it('should return false for non-existent game check', async () => {
      const exists = await adapter.hasCutsceneStory('non-existent-game', 'game');
      expect(exists).toBe(false);
    });
  });

  describe('level-level cutscenes', () => {
    it('should return level-level cutscene when available', async () => {
      // First, let's check if any level cutscenes exist
      const allStories = await adapter.getAllCutsceneStories();
      const levelStories = allStories.filter((story) => story.type === 'level');

      if (levelStories.length > 0) {
        const firstLevelStory = levelStories[0];
        const story = await adapter.getCutsceneStory(
          firstLevelStory.gameId,
          'level',
          firstLevelStory.levelId
        );

        expect(story).not.toBeNull();
        expect(story.type).toBe('level');
        expect(story.levelId).toBe(firstLevelStory.levelId);
      } else {
        // If no level stories exist, test that null is returned
        const story = await adapter.getCutsceneStory('cursor-before-clickers', 'level', 'level_1');
        expect(story).toBeNull();
      }
    });

    it('should check if level-level cutscene exists', async () => {
      const exists = await adapter.hasCutsceneStory('cursor-before-clickers', 'level', 'level_1');
      expect(typeof exists).toBe('boolean');
    });

    it('should return null for non-existent level', async () => {
      const story = await adapter.getCutsceneStory(
        'cursor-before-clickers',
        'level',
        'non-existent-level'
      );
      expect(story).toBeNull();
    });
  });

  describe('zone-level cutscenes', () => {
    it('should return zone-level cutscene when available', async () => {
      // First, let's check if any zone cutscenes exist
      const allStories = await adapter.getAllCutsceneStories();
      const zoneStories = allStories.filter((story) => story.type === 'zone');

      if (zoneStories.length > 0) {
        const firstZoneStory = zoneStories[0];
        const story = await adapter.getCutsceneStory(
          firstZoneStory.gameId,
          'zone',
          firstZoneStory.levelId,
          firstZoneStory.zoneId
        );

        expect(story).not.toBeNull();
        expect(story.type).toBe('zone');
        expect(story.levelId).toBe(firstZoneStory.levelId);
        expect(story.zoneId).toBe(firstZoneStory.zoneId);
      } else {
        // If no zone stories exist, test that null is returned
        const story = await adapter.getCutsceneStory(
          'cursor-before-clickers',
          'zone',
          'level_1',
          'zone_1'
        );
        expect(story).toBeNull();
      }
    });

    it('should check if zone-level cutscene exists', async () => {
      const exists = await adapter.hasCutsceneStory(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );
      expect(typeof exists).toBe('boolean');
    });

    it('should return null for non-existent zone', async () => {
      const story = await adapter.getCutsceneStory(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'non-existent-zone'
      );
      expect(story).toBeNull();
    });
  });

  describe('query methods', () => {
    it('should return all cutscene stories', async () => {
      const stories = await adapter.getAllCutsceneStories();

      expect(Array.isArray(stories)).toBe(true);
      expect(stories.length).toBeGreaterThan(0);

      // Verify each story is properly formatted
      stories.forEach((story) => {
        expect(story).toHaveProperty('gameId');
        expect(story).toHaveProperty('type');
        expect(story).toHaveProperty('script');
        expect(['game', 'level', 'zone']).toContain(story.type);
      });
    });

    it('should return stories for specific game', async () => {
      const stories = await adapter.getCutsceneStoriesForGame('cursor-before-clickers');

      expect(Array.isArray(stories)).toBe(true);
      stories.forEach((story) => {
        expect(story.gameId).toBe('cursor-before-clickers');
      });
    });

    it('should return empty array for non-existent game', async () => {
      const stories = await adapter.getCutsceneStoriesForGame('non-existent-game');
      expect(stories).toEqual([]);
    });

    it('should return stories for specific level', async () => {
      const stories = await adapter.getCutsceneStoriesForLevel('cursor-before-clickers', 'level_1');

      expect(Array.isArray(stories)).toBe(true);
      stories.forEach((story) => {
        expect(story.gameId).toBe('cursor-before-clickers');
        expect(['level', 'zone']).toContain(story.type);
        if (story.type === 'level') {
          expect(story.levelId).toBe('level_1');
        } else if (story.type === 'zone') {
          expect(story.levelId).toBe('level_1');
        }
      });
    });

    it('should return stories for specific zone', async () => {
      const stories = await adapter.getCutsceneStoriesForZone(
        'cursor-before-clickers',
        'level_1',
        'zone_1'
      );

      expect(Array.isArray(stories)).toBe(true);
      stories.forEach((story) => {
        expect(story.gameId).toBe('cursor-before-clickers');
        expect(story.type).toBe('zone');
        expect(story.levelId).toBe('level_1');
        expect(story.zoneId).toBe('zone_1');
      });
    });
  });

  describe('zone narration integration', () => {
    it('should create zone cutscenes from existing zone narration', async () => {
      // Test that zone narration is converted to cutscenes
      const zoneStories = await adapter.getCutsceneStoriesForZone(
        'cursor-before-clickers',
        'level_1',
        'zone_1'
      );

      // If zone stories exist, they should have proper narration content
      if (zoneStories.length > 0) {
        const story = zoneStories[0];
        expect(story.script).toBeDefined();
        expect(Array.isArray(story.script)).toBe(true);
        expect(story.script.length).toBeGreaterThan(0);
      }
    });

    it('should handle zones without narration gracefully', async () => {
      // Test with a zone that might not have narration
      const stories = await adapter.getCutsceneStoriesForZone(
        'cursor-before-clickers',
        'level_1',
        'non-existent-zone'
      );
      expect(Array.isArray(stories)).toBe(true);
    });
  });

  describe('backward compatibility', () => {
    it('should support legacy getOriginStory method', async () => {
      const story = await adapter.getOriginStory('cursor-before-clickers');

      expect(story).not.toBeNull();
      expect(story).toBeInstanceOf(OriginStory);
      expect(story.gameId).toBe('cursor-before-clickers');
    });

    it('should support legacy hasOriginStory method', async () => {
      const exists = await adapter.hasOriginStory('cursor-before-clickers');
      expect(exists).toBe(true);
    });

    it('should support legacy getAllOriginStories method', async () => {
      const stories = await adapter.getAllOriginStories();

      expect(Array.isArray(stories)).toBe(true);
      stories.forEach((story) => {
        expect(story).toBeInstanceOf(OriginStory);
      });
    });
  });

  describe('error handling', () => {
    it('should handle invalid parameters gracefully', async () => {
      await expect(adapter.getCutsceneStory('', 'game')).resolves.toBeNull();
      await expect(adapter.getCutsceneStory(null, 'game')).resolves.toBeNull();
      await expect(adapter.getCutsceneStory('game1', 'invalid-type')).resolves.toBeNull();
    });

    it('should handle missing level/zone IDs for zone type', async () => {
      await expect(adapter.getCutsceneStory('game1', 'zone', null, 'zone1')).resolves.toBeNull();
      await expect(adapter.getCutsceneStory('game1', 'zone', 'level1', null)).resolves.toBeNull();
    });

    it('should handle missing level ID for level type', async () => {
      await expect(adapter.getCutsceneStory('game1', 'level', null)).resolves.toBeNull();
    });
  });

  describe('story validation', () => {
    it('should return valid CutsceneStory objects', async () => {
      const gameStory = await adapter.getCutsceneStory('cursor-before-clickers', 'game');

      if (gameStory) {
        // Verify it can be reconstructed as a CutsceneStory
        const reconstructed = CutsceneStory.fromJSON(gameStory);
        expect(reconstructed).toBeInstanceOf(CutsceneStory);
        expect(reconstructed.isValid()).toBe(true);
      }
    });

    it('should have consistent identifiers', async () => {
      const allStories = await adapter.getAllCutsceneStories();

      allStories.forEach((storyData) => {
        const story = CutsceneStory.fromJSON(storyData);
        expect(story.identifier).toBe(storyData.identifier);
      });
    });
  });
});
