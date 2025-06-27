/* eslint-env node, jest */

import { CutsceneStory } from '../../../src/domain/value-objects/CutsceneStory.js';

describe('CutsceneStory', () => {
  describe('constructor', () => {
    it('should create a valid game-level cutscene story', () => {
      const script = ['Line 1', 'Line 2', 'Line 3'];
      const story = new CutsceneStory('cursor-before-clickers', 'game', null, null, script);

      expect(story.gameId).toBe('cursor-before-clickers');
      expect(story.type).toBe('game');
      expect(story.levelId).toBeNull();
      expect(story.zoneId).toBeNull();
      expect(story.script).toEqual(script);
      expect(story.isValid()).toBe(true);
    });

    it('should create a valid level-level cutscene story', () => {
      const script = ['Level intro', 'Get ready...'];
      const story = new CutsceneStory('cursor-before-clickers', 'level', 'level_2', null, script);

      expect(story.gameId).toBe('cursor-before-clickers');
      expect(story.type).toBe('level');
      expect(story.levelId).toBe('level_2');
      expect(story.zoneId).toBeNull();
      expect(story.script).toEqual(script);
      expect(story.isValid()).toBe(true);
    });

    it('should create a valid zone-level cutscene story', () => {
      const script = ['Welcome to the zone', 'Prepare for challenges'];
      const story = new CutsceneStory(
        'cursor-before-clickers',
        'zone',
        'level_1',
        'zone_1',
        script
      );

      expect(story.gameId).toBe('cursor-before-clickers');
      expect(story.type).toBe('zone');
      expect(story.levelId).toBe('level_1');
      expect(story.zoneId).toBe('zone_1');
      expect(story.script).toEqual(script);
      expect(story.isValid()).toBe(true);
    });

    it('should throw error for invalid type', () => {
      const script = ['Line 1'];
      expect(() => {
        new CutsceneStory('game1', 'invalid', null, null, script);
      }).toThrow('Cutscene type must be one of: game, level, zone');
    });

    it('should throw error for missing gameId', () => {
      const script = ['Line 1'];
      expect(() => {
        new CutsceneStory('', 'game', null, null, script);
      }).toThrow('Game ID is required');
    });

    it('should throw error for missing levelId when type is level', () => {
      const script = ['Line 1'];
      expect(() => {
        new CutsceneStory('game1', 'level', null, null, script);
      }).toThrow('Level ID is required for level-type cutscenes');
    });

    it('should throw error for missing zoneId when type is zone', () => {
      const script = ['Line 1'];
      expect(() => {
        new CutsceneStory('game1', 'zone', 'level_1', null, script);
      }).toThrow('Zone ID is required for zone-type cutscenes');
    });

    it('should throw error for missing levelId when type is zone', () => {
      const script = ['Line 1'];
      expect(() => {
        new CutsceneStory('game1', 'zone', null, 'zone_1', script);
      }).toThrow('Level ID is required for zone-type cutscenes');
    });

    it('should throw error for empty script', () => {
      expect(() => {
        new CutsceneStory('game1', 'game', null, null, []);
      }).toThrow('Script must contain at least one line');
    });

    it('should throw error for invalid script', () => {
      expect(() => {
        new CutsceneStory('game1', 'game', null, null, 'not an array');
      }).toThrow('Script must be an array of strings');
    });
  });

  describe('getters', () => {
    it('should return immutable script copy', () => {
      const originalScript = ['Line 1', 'Line 2'];
      const story = new CutsceneStory('game1', 'game', null, null, originalScript);

      const scriptCopy = story.script;
      scriptCopy.push('Modified');

      expect(story.script).toEqual(['Line 1', 'Line 2']);
      expect(story.script).not.toBe(originalScript);
    });

    it('should calculate correct duration', () => {
      const script = ['Line 1', '', 'Line 3', 'Line 4'];
      const story = new CutsceneStory('game1', 'game', null, null, script);

      // 3 non-empty lines * 2 seconds each = 6 seconds
      expect(story.duration).toBe(6);
    });

    it('should generate unique identifier for game-level story', () => {
      const story = new CutsceneStory('cursor-before-clickers', 'game', null, null, ['Script']);
      expect(story.identifier).toBe('cursor-before-clickers:game');
    });

    it('should generate unique identifier for level-level story', () => {
      const story = new CutsceneStory('cursor-before-clickers', 'level', 'level_2', null, [
        'Script',
      ]);
      expect(story.identifier).toBe('cursor-before-clickers:level:level_2');
    });

    it('should generate unique identifier for zone-level story', () => {
      const story = new CutsceneStory('cursor-before-clickers', 'zone', 'level_1', 'zone_1', [
        'Script',
      ]);
      expect(story.identifier).toBe('cursor-before-clickers:zone:level_1:zone_1');
    });
  });

  describe('validation', () => {
    it('should validate correct game-level story', () => {
      const story = new CutsceneStory('game1', 'game', null, null, ['Script']);
      expect(story.isValid()).toBe(true);
    });

    it('should validate correct level-level story', () => {
      const story = new CutsceneStory('game1', 'level', 'level_1', null, ['Script']);
      expect(story.isValid()).toBe(true);
    });

    it('should validate correct zone-level story', () => {
      const story = new CutsceneStory('game1', 'zone', 'level_1', 'zone_1', ['Script']);
      expect(story.isValid()).toBe(true);
    });

    it('should invalidate story with missing required fields', () => {
      const story = new CutsceneStory('game1', 'game', null, null, ['Script']);
      // Manually break validation by setting type to level without levelId
      story._type = 'level';
      story._levelId = null;
      expect(story.isValid()).toBe(false);
    });
  });

  describe('equality and cloning', () => {
    it('should correctly compare equal stories', () => {
      const story1 = new CutsceneStory('game1', 'game', null, null, ['Line 1', 'Line 2']);
      const story2 = new CutsceneStory('game1', 'game', null, null, ['Line 1', 'Line 2']);

      expect(story1.equals(story2)).toBe(true);
    });

    it('should correctly compare different stories', () => {
      const story1 = new CutsceneStory('game1', 'game', null, null, ['Line 1']);
      const story2 = new CutsceneStory('game1', 'level', 'level_1', null, ['Line 1']);

      expect(story1.equals(story2)).toBe(false);
    });

    it('should clone story correctly', () => {
      const original = new CutsceneStory('game1', 'zone', 'level_1', 'zone_1', [
        'Line 1',
        'Line 2',
      ]);
      const cloned = original.clone();

      expect(cloned.equals(original)).toBe(true);
      expect(cloned).not.toBe(original);
      expect(cloned.script).not.toBe(original.script);
    });
  });

  describe('edge cases', () => {
    it('should handle script with only empty lines', () => {
      const story = new CutsceneStory('game1', 'game', null, null, ['', ' ', '\t']);
      expect(story.duration).toBe(0);
    });

    it('should handle very long scripts', () => {
      const longScript = Array(1000).fill('Line');
      const story = new CutsceneStory('game1', 'game', null, null, longScript);
      expect(story.duration).toBe(2000); // 1000 lines * 2 seconds each
    });

    it('should handle special characters in script', () => {
      const script = ['🎵 [Music]', '✨ *Special*', 'Normal line'];
      const story = new CutsceneStory('game1', 'game', null, null, script);
      expect(story.script).toEqual(script);
      expect(story.duration).toBe(6);
    });
  });
});
