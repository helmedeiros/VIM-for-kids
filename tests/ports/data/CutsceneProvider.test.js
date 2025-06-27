/* eslint-env node, jest */

import { CutsceneProvider } from '../../../src/ports/data/CutsceneProvider.js';
import { CutsceneStory } from '../../../src/domain/value-objects/CutsceneStory.js';

class MockCutsceneProvider extends CutsceneProvider {
  constructor() {
    super();
    this.stories = new Map();
  }

  async getCutsceneStory(gameId, type, levelId = null, zoneId = null) {
    try {
      const tempStory = new CutsceneStory(gameId, type, levelId, zoneId, ['Mock script']);
      const key = tempStory.identifier;
      const storedStory = this.stories.get(key);
      return storedStory ? storedStory.toJSON() : null;
    } catch (error) {
      return null; // Handle validation errors gracefully
    }
  }

  async hasCutsceneStory(gameId, type, levelId = null, zoneId = null) {
    try {
      const tempStory = new CutsceneStory(gameId, type, levelId, zoneId, ['Mock script']);
      const key = tempStory.identifier;
      return this.stories.has(key);
    } catch (error) {
      return false; // Handle validation errors gracefully
    }
  }

  async getAllCutsceneStories() {
    return Array.from(this.stories.values()).map((story) => story.toJSON());
  }

  async getCutsceneStoriesForGame(gameId) {
    return Array.from(this.stories.values())
      .filter((story) => story.gameId === gameId)
      .map((story) => story.toJSON());
  }

  async getCutsceneStoriesForLevel(gameId, levelId) {
    return Array.from(this.stories.values())
      .filter(
        (story) =>
          story.gameId === gameId &&
          ((story.type === 'level' && story.levelId === levelId) ||
            (story.type === 'zone' && story.levelId === levelId))
      )
      .map((story) => story.toJSON());
  }

  async getCutsceneStoriesForZone(gameId, levelId, zoneId) {
    return Array.from(this.stories.values())
      .filter(
        (story) =>
          story.gameId === gameId &&
          story.levelId === levelId &&
          story.zoneId === zoneId &&
          story.type === 'zone'
      )
      .map((story) => story.toJSON());
  }

  // Helper method for testing
  addStory(story) {
    this.stories.set(story.identifier, story);
  }
}

describe('CutsceneProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new MockCutsceneProvider();
  });

  describe('abstract methods', () => {
    it('should define getCutsceneStory as abstract method', async () => {
      const baseProvider = new CutsceneProvider();
      await expect(baseProvider.getCutsceneStory('game1', 'game')).rejects.toThrow(
        'Abstract method must be implemented'
      );
    });

    it('should define hasCutsceneStory as abstract method', async () => {
      const baseProvider = new CutsceneProvider();
      await expect(baseProvider.hasCutsceneStory('game1', 'game')).rejects.toThrow(
        'Abstract method must be implemented'
      );
    });

    it('should define getAllCutsceneStories as abstract method', async () => {
      const baseProvider = new CutsceneProvider();
      await expect(baseProvider.getAllCutsceneStories()).rejects.toThrow(
        'Abstract method must be implemented'
      );
    });

    it('should define getCutsceneStoriesForGame as abstract method', async () => {
      const baseProvider = new CutsceneProvider();
      await expect(baseProvider.getCutsceneStoriesForGame('game1')).rejects.toThrow(
        'Abstract method must be implemented'
      );
    });

    it('should define getCutsceneStoriesForLevel as abstract method', async () => {
      const baseProvider = new CutsceneProvider();
      await expect(baseProvider.getCutsceneStoriesForLevel('game1', 'level1')).rejects.toThrow(
        'Abstract method must be implemented'
      );
    });

    it('should define getCutsceneStoriesForZone as abstract method', async () => {
      const baseProvider = new CutsceneProvider();
      await expect(
        baseProvider.getCutsceneStoriesForZone('game1', 'level1', 'zone1')
      ).rejects.toThrow('Abstract method must be implemented');
    });
  });

  describe('getCutsceneStory', () => {
    it('should get game-level cutscene story', async () => {
      const gameStory = new CutsceneStory('cursor-before-clickers', 'game', null, null, [
        'Game intro',
      ]);
      provider.addStory(gameStory);

      const result = await provider.getCutsceneStory('cursor-before-clickers', 'game');
      expect(result).toEqual(gameStory.toJSON()); // Mock returns the stored story
    });

    it('should get level-level cutscene story', async () => {
      const levelStory = new CutsceneStory('cursor-before-clickers', 'level', 'level_2', null, [
        'Level intro',
      ]);
      provider.addStory(levelStory);

      const result = await provider.getCutsceneStory('cursor-before-clickers', 'level', 'level_2');
      expect(result).toEqual(levelStory.toJSON()); // Mock returns the stored story
    });

    it('should get zone-level cutscene story', async () => {
      const zoneStory = new CutsceneStory('cursor-before-clickers', 'zone', 'level_1', 'zone_1', [
        'Zone intro',
      ]);
      provider.addStory(zoneStory);

      const result = await provider.getCutsceneStory(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );
      expect(result).toEqual(zoneStory.toJSON()); // Mock returns the stored story
    });

    it('should return null for non-existent story', async () => {
      const result = await provider.getCutsceneStory('non-existent', 'game');
      expect(result).toBeNull();
    });
  });

  describe('hasCutsceneStory', () => {
    it('should check if game-level story exists', async () => {
      const result = await provider.hasCutsceneStory('cursor-before-clickers', 'game');
      expect(typeof result).toBe('boolean');
    });

    it('should check if level-level story exists', async () => {
      const result = await provider.hasCutsceneStory('cursor-before-clickers', 'level', 'level_2');
      expect(typeof result).toBe('boolean');
    });

    it('should check if zone-level story exists', async () => {
      const result = await provider.hasCutsceneStory(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1'
      );
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getAllCutsceneStories', () => {
    it('should return array of all cutscene stories', async () => {
      const result = await provider.getAllCutsceneStories();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no stories exist', async () => {
      const result = await provider.getAllCutsceneStories();
      expect(result).toEqual([]);
    });
  });

  describe('getCutsceneStoriesForGame', () => {
    it('should return stories for specific game', async () => {
      const result = await provider.getCutsceneStoriesForGame('cursor-before-clickers');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for non-existent game', async () => {
      const result = await provider.getCutsceneStoriesForGame('non-existent');
      expect(result).toEqual([]);
    });
  });

  describe('getCutsceneStoriesForLevel', () => {
    it('should return stories for specific level', async () => {
      const result = await provider.getCutsceneStoriesForLevel('cursor-before-clickers', 'level_1');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for non-existent level', async () => {
      const result = await provider.getCutsceneStoriesForLevel(
        'cursor-before-clickers',
        'non-existent'
      );
      expect(result).toEqual([]);
    });
  });

  describe('getCutsceneStoriesForZone', () => {
    it('should return stories for specific zone', async () => {
      const result = await provider.getCutsceneStoriesForZone(
        'cursor-before-clickers',
        'level_1',
        'zone_1'
      );
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for non-existent zone', async () => {
      const result = await provider.getCutsceneStoriesForZone(
        'cursor-before-clickers',
        'level_1',
        'non-existent'
      );
      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle invalid parameters gracefully', async () => {
      await expect(provider.getCutsceneStory('', 'game')).resolves.not.toThrow();
      await expect(provider.hasCutsceneStory(null, 'game')).resolves.not.toThrow();
    });
  });
});
