/* eslint-env node, jest */
import { CutsceneProviderAdapter } from '../../../src/infrastructure/data/CutsceneProviderAdapter.js';
import { OriginStory } from '../../../src/domain/value-objects/OriginStory.js';

describe('CutsceneProviderAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new CutsceneProviderAdapter();
  });

  describe('constructor', () => {
    it('should create adapter with initialized origin stories', () => {
      expect(adapter).toBeInstanceOf(CutsceneProviderAdapter);
    });
  });

  describe('getOriginStory', () => {
    it('should return origin story for cursor-before-clickers', async () => {
      const originStory = await adapter.getOriginStory('cursor-before-clickers');

      expect(originStory).toBeInstanceOf(OriginStory);
      expect(originStory.gameId).toBe('cursor-before-clickers');
      expect(originStory.script).toContain(
        '🎵 [Background: soft ambient melody, typewriter clacks echo gently]'
      );
      expect(originStory.script).toContain('Once, the world was clear.');
      expect(originStory.script).toContain('You.');
    });

    it('should return null for games without origin stories', async () => {
      const originStory = await adapter.getOriginStory('cursor-textland');

      expect(originStory).toBeNull();
    });

    it('should return null for non-existent games', async () => {
      const originStory = await adapter.getOriginStory('non-existent-game');

      expect(originStory).toBeNull();
    });
  });

  describe('hasOriginStory', () => {
    it('should return true for games with origin stories', async () => {
      const hasStory = await adapter.hasOriginStory('cursor-before-clickers');

      expect(hasStory).toBe(true);
    });

    it('should return false for games without origin stories', async () => {
      const hasStory = await adapter.hasOriginStory('cursor-textland');

      expect(hasStory).toBe(false);
    });

    it('should return false for non-existent games', async () => {
      const hasStory = await adapter.hasOriginStory('non-existent-game');

      expect(hasStory).toBe(false);
    });
  });

  describe('getAllOriginStories', () => {
    it('should return all available origin stories', async () => {
      const stories = await adapter.getAllOriginStories();

      expect(Array.isArray(stories)).toBe(true);
      expect(stories.length).toBeGreaterThan(0);
      expect(stories[0]).toBeInstanceOf(OriginStory);
    });

    it('should return array containing cursor-before-clickers story', async () => {
      const stories = await adapter.getAllOriginStories();

      const cursorStory = stories.find((story) => story.gameId === 'cursor-before-clickers');
      expect(cursorStory).toBeDefined();
      expect(cursorStory.gameId).toBe('cursor-before-clickers');
    });
  });

  describe('origin story content validation', () => {
    it('should have properly formatted script for cursor-before-clickers', async () => {
      const originStory = await adapter.getOriginStory('cursor-before-clickers');

      expect(originStory.script).toBeInstanceOf(Array);
      expect(originStory.script.length).toBeGreaterThan(0);

      // Check for expected story elements
      const scriptText = originStory.script.join(' ');
      expect(scriptText).toContain('Once, the world was clear');
      expect(scriptText).toContain('But the Bugs came');
      expect(scriptText).toContain('Blinking Grove');
      expect(scriptText).toContain('Hello, Cursor');
    });

    it('should have reasonable duration calculation', async () => {
      const originStory = await adapter.getOriginStory('cursor-before-clickers');
      const duration = originStory.getDuration();

      expect(duration).toBeGreaterThan(3000); // At least 3 seconds
      expect(duration).toBeLessThan(90000); // Less than 1.5 minutes
    });
  });
});
