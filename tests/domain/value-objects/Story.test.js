import { Story } from '../../../src/domain/value-objects/Story.js';

describe('Story', () => {
  describe('Constructor and Basic Properties', () => {
    it('should create a valid origin story', () => {
      const script = ['Welcome to the game!', 'Let the adventure begin.'];
      const story = new Story('cursor-before-clickers', 'origin', script);

      expect(story.gameId).toBe('cursor-before-clickers');
      expect(story.type).toBe('origin');
      expect(story.script).toEqual(script);
      expect(story.levelId).toBeNull();
      expect(story.zoneId).toBeNull();
      expect(story.hasBeenShown).toBe(false);
    });

    it('should create a valid level story', () => {
      const script = ['Level completed!', 'Moving to next challenge.'];
      const story = new Story('cursor-before-clickers', 'level', script, { levelId: 'level_2' });

      expect(story.gameId).toBe('cursor-before-clickers');
      expect(story.type).toBe('level');
      expect(story.script).toEqual(script);
      expect(story.levelId).toBe('level_2');
      expect(story.zoneId).toBeNull();
      expect(story.hasBeenShown).toBe(false);
    });

    it('should create a valid zone story', () => {
      const script = ['Zone discovered!', 'New mechanics unlocked.'];
      const story = new Story('cursor-before-clickers', 'zone', script, {
        levelId: 'level_1',
        zoneId: 'zone_1',
      });

      expect(story.gameId).toBe('cursor-before-clickers');
      expect(story.type).toBe('zone');
      expect(story.script).toEqual(script);
      expect(story.levelId).toBe('level_1');
      expect(story.zoneId).toBe('zone_1');
      expect(story.hasBeenShown).toBe(false);
    });

    it('should preserve hasBeenShown state when provided', () => {
      const script = ['Test script'];
      const story = new Story('test-game', 'origin', script, { hasBeenShown: true });

      expect(story.hasBeenShown).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should throw error for invalid story type', () => {
      const script = ['Test script'];
      expect(() => {
        new Story('game1', 'invalid', script);
      }).toThrow('Story type must be one of: origin, level, zone');
    });

    it('should throw error for empty game ID', () => {
      const script = ['Test script'];
      expect(() => {
        new Story('', 'origin', script);
      }).toThrow('Game ID is required');
    });

    it('should throw error for level story without level ID', () => {
      const script = ['Test script'];
      expect(() => {
        new Story('game1', 'level', script);
      }).toThrow('Level ID is required for level-type stories');
    });

    it('should throw error for zone story without level ID', () => {
      const script = ['Test script'];
      expect(() => {
        new Story('game1', 'zone', script, { zoneId: 'zone_1' });
      }).toThrow('Level ID is required for zone-type stories');
    });

    it('should throw error for zone story without zone ID', () => {
      const script = ['Test script'];
      expect(() => {
        new Story('game1', 'zone', script, { levelId: 'level_1' });
      }).toThrow('Zone ID is required for zone-type stories');
    });

    it('should throw error for empty script', () => {
      expect(() => {
        new Story('game1', 'origin', []);
      }).toThrow('Script must contain at least one line');
    });

    it('should throw error for non-array script', () => {
      expect(() => {
        new Story('game1', 'origin', 'not an array');
      }).toThrow('Script must be an array of strings');
    });
  });

  describe('Immutability', () => {
    it('should return a copy of the script to maintain immutability', () => {
      const originalScript = ['Line 1', 'Line 2'];
      const story = new Story('game1', 'origin', originalScript);

      const scriptCopy = story.script;
      scriptCopy.push('Modified');

      expect(story.script).toEqual(originalScript);
      expect(story.script).not.toBe(originalScript); // Different reference
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate duration for origin stories using word-based method', () => {
      const script = ['Short script'];
      const story = new Story('game1', 'origin', script);

      const duration = story.duration;
      expect(duration).toBeGreaterThanOrEqual(3000); // Minimum 3 seconds
      expect(typeof duration).toBe('number');
    });

    it('should calculate duration for level stories using line-based method', () => {
      const script = ['Line 1', 'Line 2', 'Line 3'];
      const story = new Story('game1', 'level', script, { levelId: 'level_1' });

      const duration = story.duration;
      expect(duration).toBe(6000); // 3 lines * 2000ms per line
    });

    it('should calculate duration for zone stories using line-based method', () => {
      const script = ['Line 1', 'Line 2'];
      const story = new Story('game1', 'zone', script, {
        levelId: 'level_1',
        zoneId: 'zone_1',
      });

      const duration = story.duration;
      expect(duration).toBe(4000); // 2 lines * 2000ms per line
    });

    it('should filter empty lines for non-origin stories', () => {
      const script = ['Line 1', '', '   ', 'Line 2'];
      const story = new Story('game1', 'level', script, { levelId: 'level_1' });

      const duration = story.duration;
      expect(duration).toBe(4000); // Only 2 non-empty lines * 2000ms per line
    });
  });

  describe('Identifier Generation', () => {
    it('should generate identifier for origin story', () => {
      const story = new Story('cursor-before-clickers', 'origin', ['Script']);
      expect(story.identifier).toBe('cursor-before-clickers:origin');
    });

    it('should generate identifier for level story', () => {
      const story = new Story('cursor-before-clickers', 'level', ['Script'], {
        levelId: 'level_2',
      });
      expect(story.identifier).toBe('cursor-before-clickers:level:level_2');
    });

    it('should generate identifier for zone story', () => {
      const story = new Story('cursor-before-clickers', 'zone', ['Script'], {
        levelId: 'level_1',
        zoneId: 'zone_1',
      });
      expect(story.identifier).toBe('cursor-before-clickers:zone:level_1:zone_1');
    });
  });

  describe('State Management', () => {
    it('should mark story as shown', () => {
      const story = new Story('game1', 'origin', ['Script']);
      expect(story.hasBeenShown).toBe(false);

      story.markAsShown();
      expect(story.hasBeenShown).toBe(true);
    });

    it('should reset shown status', () => {
      const story = new Story('game1', 'origin', ['Script'], { hasBeenShown: true });
      expect(story.hasBeenShown).toBe(true);

      story.reset();
      expect(story.hasBeenShown).toBe(false);
    });
  });

  describe('Validation Method', () => {
    it('should validate correct story configurations', () => {
      const originStory = new Story('game1', 'origin', ['Script']);
      expect(originStory.isValid()).toBe(true);

      const levelStory = new Story('game1', 'level', ['Script'], { levelId: 'level_1' });
      expect(levelStory.isValid()).toBe(true);

      const zoneStory = new Story('game1', 'zone', ['Script'], {
        levelId: 'level_1',
        zoneId: 'zone_1',
      });
      expect(zoneStory.isValid()).toBe(true);
    });
  });

  describe('Equality', () => {
    it('should correctly identify equal stories', () => {
      const story1 = new Story('game1', 'origin', ['Line 1', 'Line 2']);
      const story2 = new Story('game1', 'origin', ['Line 1', 'Line 2']);

      expect(story1.equals(story2)).toBe(true);
    });

    it('should correctly identify different stories', () => {
      const story1 = new Story('game1', 'origin', ['Line 1']);
      const story2 = new Story('game1', 'level', ['Line 1'], { levelId: 'level_1' });

      expect(story1.equals(story2)).toBe(false);
    });

    it('should return false when comparing with non-Story object', () => {
      const story = new Story('game1', 'origin', ['Script']);
      expect(story.equals({})).toBe(false);
      expect(story.equals(null)).toBe(false);
    });
  });

  describe('Cloning', () => {
    it('should create a deep copy of the story', () => {
      const original = new Story('game1', 'zone', ['Line 1', 'Line 2'], {
        levelId: 'level_1',
        zoneId: 'zone_1',
        hasBeenShown: true,
      });

      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned.equals(original)).toBe(true);
      expect(cloned.hasBeenShown).toBe(true);
      expect(cloned.script).toEqual(original.script);
      expect(cloned.script).not.toBe(original.script); // Different reference
    });
  });

  describe('JSON Serialization', () => {
    it('should convert to JSON representation', () => {
      const story = new Story('game1', 'zone', ['Line 1'], {
        levelId: 'level_1',
        zoneId: 'zone_1',
        hasBeenShown: true,
      });

      const json = story.toJSON();

      expect(json).toEqual({
        gameId: 'game1',
        type: 'zone',
        levelId: 'level_1',
        zoneId: 'zone_1',
        script: ['Line 1'],
        hasBeenShown: true,
        duration: 2000,
        identifier: 'game1:zone:level_1:zone_1',
      });
    });

    it('should create story from JSON representation', () => {
      const json = {
        gameId: 'game1',
        type: 'origin',
        levelId: null,
        zoneId: null,
        script: ['Line 1', 'Line 2'],
        hasBeenShown: false,
      };

      const story = Story.fromJSON(json);

      expect(story.gameId).toBe('game1');
      expect(story.type).toBe('origin');
      expect(story.script).toEqual(['Line 1', 'Line 2']);
      expect(story.hasBeenShown).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('should validate script format', () => {
      expect(Story.isValidScript(['Line 1'])).toBe(true);
      expect(Story.isValidScript([])).toBe(false);
      expect(Story.isValidScript('not array')).toBe(false);
      expect(Story.isValidScript(null)).toBe(false);
    });
  });

  describe('Factory Methods', () => {
    it('should create origin story using factory method', () => {
      const story = Story.createOriginStory('game1', ['Script'], true);

      expect(story.gameId).toBe('game1');
      expect(story.type).toBe('origin');
      expect(story.script).toEqual(['Script']);
      expect(story.hasBeenShown).toBe(true);
    });

    it('should create level story using factory method', () => {
      const story = Story.createLevelStory('game1', 'level_1', ['Script']);

      expect(story.gameId).toBe('game1');
      expect(story.type).toBe('level');
      expect(story.levelId).toBe('level_1');
      expect(story.script).toEqual(['Script']);
    });

    it('should create zone story using factory method', () => {
      const story = Story.createZoneStory('game1', 'level_1', 'zone_1', ['Script']);

      expect(story.gameId).toBe('game1');
      expect(story.type).toBe('zone');
      expect(story.levelId).toBe('level_1');
      expect(story.zoneId).toBe('zone_1');
      expect(story.script).toEqual(['Script']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle scripts with empty and whitespace-only lines for duration calculation', () => {
      const script = ['', ' ', '\t', 'Valid line'];
      const story = new Story('game1', 'level', script, { levelId: 'level_1' });

      expect(story.duration).toBe(2000); // Only 1 valid line * 2000ms
    });

    it('should handle long scripts for origin story duration', () => {
      const longScript = new Array(100).fill('Long line with many words here');
      const story = new Story('game1', 'origin', longScript);

      const duration = story.duration;
      expect(duration).toBeGreaterThan(3000); // Should be much more than minimum
      expect(typeof duration).toBe('number');
    });
  });
});
