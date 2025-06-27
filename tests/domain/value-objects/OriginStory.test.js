/* eslint-env node, jest */
import { OriginStory } from '../../../src/domain/value-objects/OriginStory.js';

describe('OriginStory', () => {
  let validScript;

  beforeEach(() => {
    validScript = [
      'NARRATOR: In the beginning, there was text...',
      '[The screen flickers to life]',
      'And the cursor was formless and void...',
    ];
  });

  describe('Constructor', () => {
    it('should create origin story with valid inputs', () => {
      const story = new OriginStory('test-game', validScript);

      expect(story.gameId).toBe('test-game');
      expect(story.script).toEqual(validScript);
      expect(story.hasBeenShown).toBe(false);
    });

    it('should throw error for missing game ID', () => {
      expect(() => new OriginStory(null, validScript)).toThrow('Game ID is required');
    });

    it('should throw error for empty game ID', () => {
      expect(() => new OriginStory('', validScript)).toThrow('Game ID is required');
    });

    it('should throw error for whitespace-only game ID', () => {
      expect(() => new OriginStory('   ', validScript)).toThrow('Game ID is required');
    });

    it('should throw error for non-string game ID', () => {
      expect(() => new OriginStory(123, validScript)).toThrow('Game ID is required');
    });

    it('should throw error for missing script', () => {
      expect(() => new OriginStory('test-game', null)).toThrow('Script is required');
    });

    it('should throw error for invalid script', () => {
      expect(() => new OriginStory('test-game', [])).toThrow('Script cannot be empty');
    });
  });

  describe('Immutability', () => {
    it('should return copy of script to maintain immutability', () => {
      const story = new OriginStory('test-game', validScript);
      const returnedScript = story.script;

      returnedScript.push('Modified line');

      expect(story.script).toEqual(validScript);
      expect(story.script).not.toBe(returnedScript);
    });

    it('should create copy of input script to ensure immutability', () => {
      const originalScript = [...validScript];
      const story = new OriginStory('test-game', validScript);

      validScript.push('Modified line');

      expect(story.script).toEqual(originalScript);
    });
  });

  describe('State Management', () => {
    it('should start with hasBeenShown as false', () => {
      const story = new OriginStory('test-game', validScript);
      expect(story.hasBeenShown).toBe(false);
    });

    it('should update hasBeenShown when marked as shown', () => {
      const story = new OriginStory('test-game', validScript);
      story.markAsShown();
      expect(story.hasBeenShown).toBe(true);
    });

    it('should reset hasBeenShown to false', () => {
      const story = new OriginStory('test-game', validScript);
      story.markAsShown();
      story.reset();
      expect(story.hasBeenShown).toBe(false);
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate duration based on script length', () => {
      const story = new OriginStory('test-game', validScript);
      const duration = story.getDuration();

      expect(duration).toBeGreaterThan(0);
      expect(typeof duration).toBe('number');
    });

    it('should return minimum duration for very short scripts', () => {
      const shortScript = ['Short'];
      const story = new OriginStory('test-game', shortScript);
      const duration = story.getDuration();

      expect(duration).toBe(3000); // 3 seconds minimum
    });

    it('should calculate longer duration for longer scripts', () => {
      const longScript = Array(50).fill('This is a longer line with more words to read');
      const story = new OriginStory('test-game', longScript);
      const duration = story.getDuration();

      expect(duration).toBeGreaterThan(3000);
    });
  });

  describe('Script Validation', () => {
    it('should validate array script as valid', () => {
      expect(OriginStory.isValidScript(validScript)).toBe(true);
    });

    it('should validate non-empty array as valid', () => {
      expect(OriginStory.isValidScript(['Single line'])).toBe(true);
    });

    it('should invalidate empty array', () => {
      expect(OriginStory.isValidScript([])).toBe(false);
    });

    it('should invalidate non-array', () => {
      expect(OriginStory.isValidScript('not an array')).toBe(false);
    });

    it('should invalidate null', () => {
      expect(OriginStory.isValidScript(null)).toBe(false);
    });

    it('should invalidate undefined', () => {
      expect(OriginStory.isValidScript(undefined)).toBe(false);
    });
  });

  describe('clone', () => {
    it('should create deep copy of origin story', () => {
      const story = new OriginStory('test-game', validScript);
      story.markAsShown();

      const cloned = story.clone();

      expect(cloned).toBeInstanceOf(OriginStory);
      expect(cloned.gameId).toBe(story.gameId);
      expect(cloned.script).toEqual(story.script);
      expect(cloned.hasBeenShown).toBe(story.hasBeenShown);
      expect(cloned).not.toBe(story); // Different instances
    });

    it('should clone with independent state', () => {
      const story = new OriginStory('test-game', validScript);
      const cloned = story.clone();

      story.markAsShown();

      expect(story.hasBeenShown).toBe(true);
      expect(cloned.hasBeenShown).toBe(false);
    });

    it('should clone with independent script arrays', () => {
      const story = new OriginStory('test-game', validScript);
      const cloned = story.clone();

      expect(cloned.script).toEqual(story.script);
      expect(cloned.script).not.toBe(story.script);
    });
  });

  describe('equals', () => {
    it('should return true for identical origin stories', () => {
      const story1 = new OriginStory('test-game', validScript);
      const story2 = new OriginStory('test-game', validScript);

      expect(story1.equals(story2)).toBe(true);
    });

    it('should return false for different game IDs', () => {
      const story1 = new OriginStory('game1', validScript);
      const story2 = new OriginStory('game2', validScript);

      expect(story1.equals(story2)).toBe(false);
    });

    it('should return false for different scripts', () => {
      const story1 = new OriginStory('test-game', validScript);
      const story2 = new OriginStory('test-game', ['Different script']);

      expect(story1.equals(story2)).toBe(false);
    });

    it('should ignore hasBeenShown status in equality check', () => {
      const story1 = new OriginStory('test-game', validScript);
      const story2 = new OriginStory('test-game', validScript);

      story1.markAsShown();

      expect(story1.equals(story2)).toBe(true);
    });

    it('should return false for non-OriginStory objects', () => {
      const story = new OriginStory('test-game', validScript);
      const notStory = { gameId: 'test-game', script: validScript };

      expect(story.equals(notStory)).toBe(false);
    });

    it('should return false for null', () => {
      const story = new OriginStory('test-game', validScript);

      expect(story.equals(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      const story = new OriginStory('test-game', validScript);

      expect(story.equals(undefined)).toBe(false);
    });
  });
});
