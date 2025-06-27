import { CutsceneProvider } from '../../ports/data/CutsceneProvider.js';
import { CutsceneStory } from '../../domain/value-objects/CutsceneStory.js';
import { OriginStory } from '../../domain/value-objects/OriginStory.js';

/**
 * Infrastructure adapter that provides cutscene configurations
 * Implements the CutsceneProvider port with support for multi-level cutscenes
 * Integrates with zone system to extract narration as cutscenes
 */
export class CutsceneProviderAdapter extends CutsceneProvider {
  constructor() {
    super();
    this._cutsceneStories = this._initializeCutsceneStories();
  }

  // New multi-level cutscene methods

  async getCutsceneStory(gameId, type, levelId = null, zoneId = null) {
    try {
      // Validate input parameters
      if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
        return null;
      }

      if (!type || !['game', 'level', 'zone'].includes(type)) {
        return null;
      }

      if (type === 'level' && (!levelId || typeof levelId !== 'string' || !levelId.trim())) {
        return null;
      }

      if (type === 'zone') {
        if (!levelId || typeof levelId !== 'string' || !levelId.trim()) {
          return null;
        }
        if (!zoneId || typeof zoneId !== 'string' || !zoneId.trim()) {
          return null;
        }
      }

      // Create identifier
      const tempStory = new CutsceneStory(gameId, type, levelId, zoneId, ['temp']);
      const identifier = tempStory.identifier;

      // Get story from map
      const story = this._cutsceneStories.get(identifier);
      return story ? story.toJSON() : null;
    } catch (error) {
      return null;
    }
  }

  async hasCutsceneStory(gameId, type, levelId = null, zoneId = null) {
    try {
      // Validate input parameters
      if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
        return false;
      }

      if (!type || !['game', 'level', 'zone'].includes(type)) {
        return false;
      }

      if (type === 'level' && (!levelId || typeof levelId !== 'string' || !levelId.trim())) {
        return false;
      }

      if (type === 'zone') {
        if (!levelId || typeof levelId !== 'string' || !levelId.trim()) {
          return false;
        }
        if (!zoneId || typeof zoneId !== 'string' || !zoneId.trim()) {
          return false;
        }
      }

      // Create identifier
      const tempStory = new CutsceneStory(gameId, type, levelId, zoneId, ['temp']);
      const identifier = tempStory.identifier;

      return this._cutsceneStories.has(identifier);
    } catch (error) {
      return false;
    }
  }

  async getAllCutsceneStories() {
    return Array.from(this._cutsceneStories.values()).map((story) => story.toJSON());
  }

  async getCutsceneStoriesForGame(gameId) {
    if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
      return [];
    }

    return Array.from(this._cutsceneStories.values())
      .filter((story) => story.gameId === gameId)
      .map((story) => story.toJSON());
  }

  async getCutsceneStoriesForLevel(gameId, levelId) {
    if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
      return [];
    }
    if (!levelId || typeof levelId !== 'string' || !levelId.trim()) {
      return [];
    }

    return Array.from(this._cutsceneStories.values())
      .filter(
        (story) =>
          story.gameId === gameId &&
          ((story.type === 'level' && story.levelId === levelId) ||
            (story.type === 'zone' && story.levelId === levelId))
      )
      .map((story) => story.toJSON());
  }

  async getCutsceneStoriesForZone(gameId, levelId, zoneId) {
    if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
      return [];
    }
    if (!levelId || typeof levelId !== 'string' || !levelId.trim()) {
      return [];
    }
    if (!zoneId || typeof zoneId !== 'string' || !zoneId.trim()) {
      return [];
    }

    return Array.from(this._cutsceneStories.values())
      .filter(
        (story) =>
          story.gameId === gameId &&
          story.levelId === levelId &&
          story.zoneId === zoneId &&
          story.type === 'zone'
      )
      .map((story) => story.toJSON());
  }

  // Legacy methods for backward compatibility

  async getOriginStory(gameId) {
    const gameStory = await this.getCutsceneStory(gameId, 'game');
    if (!gameStory) {
      return null;
    }

    // Convert back to OriginStory for backward compatibility
    return new OriginStory(gameStory.gameId, gameStory.script);
  }

  async hasOriginStory(gameId) {
    return await this.hasCutsceneStory(gameId, 'game');
  }

  async getAllOriginStories() {
    const gameStories = Array.from(this._cutsceneStories.values()).filter(
      (story) => story.type === 'game'
    );

    return gameStories.map((story) => new OriginStory(story.gameId, story.script));
  }

  /**
   * Initialize all cutscene stories (game, level, and zone)
   * @private
   */
  _initializeCutsceneStories() {
    const stories = new Map();

    // Add game-level stories
    this._addGameStories(stories);

    // Add level-level stories
    this._addLevelStories(stories);

    // Add zone-level stories from zone narration
    this._addZoneStories(stories);

    return stories;
  }

  /**
   * Add game-level cutscene stories
   * @private
   */
  _addGameStories(stories) {
    // Game story for "Cursor - Before the Clickers"
    const cursorBeforeClickersScript = [
      '🎵 [Background: soft ambient melody, typewriter clacks echo gently]',
      '',
      '[BLACK SCREEN]',
      '',
      'NARRATOR (calm, magical voice):',
      'Once, the world was clear.',
      'Text flowed like rivers, perfectly aligned.',
      'But the Bugs came.',
      'They chewed through the order,',
      'left commands scrambled,',
      'and the caret spirits lost their voice.',
      '',
      '[FADE IN: a soft blinking dot in a forest clearing—Cursor]',
      '',
      'NARRATOR:',
      'Then, from the Blinking Grove, a spark appeared.',
      'A light not of fire…',
      'but of focus.',
      'You.',
      '',
      '[TEXT APPEARS]',
      '',
      '✨ *Hello, Cursor.*',
      "You don't remember much.",
      'But the land does.',
      'And the land remembers you.',
      '',
      '[Player control begins — movement keys are disabled]',
    ];

    const gameStory = new CutsceneStory(
      'cursor-before-clickers',
      'game',
      null,
      null,
      cursorBeforeClickersScript
    );

    stories.set(gameStory.identifier, gameStory);

    // Future: Add game stories for other games here
    // Example for cursor-textland could be added later
  }

  /**
   * Add level-level cutscene stories
   * @private
   */
  _addLevelStories(stories) {
    // Example level story for level 2
    const level2Script = [
      'You have learned the basics of movement.',
      'Now the real challenge begins...',
      'The Maze of Modes awaits.',
      'Here you will learn to switch between the three sacred modes:',
      'Normal, Insert, and Command.',
      'Master these transitions, young Cursor.',
    ];

    const level2Story = new CutsceneStory(
      'cursor-before-clickers',
      'level',
      'level_2',
      null,
      level2Script
    );

    stories.set(level2Story.identifier, level2Story);

    // Future: Add more level stories as needed
  }

  /**
   * Add zone-level cutscene stories from zone narration
   * @private
   */
  _addZoneStories(stories) {
    try {
      // Get all zone configurations from the registry
      const zoneConfigs = this._getZoneConfigurations();

      zoneConfigs.forEach((config) => {
        if (config.narration && Array.isArray(config.narration) && config.narration.length > 0) {
          // Create a zone cutscene story from the zone's narration
          const zoneStory = new CutsceneStory(
            'cursor-before-clickers', // Default game
            'zone',
            this._getLevelIdForZone(config.zoneId),
            config.zoneId,
            [...config.narration] // Copy the narration array
          );

          stories.set(zoneStory.identifier, zoneStory);
        }
      });
    } catch (error) {
      // If zone system is not available, continue without zone stories
      console.warn('Zone system not available for cutscene integration:', error.message);
    }
  }

  /**
   * Get zone configurations from the zone registry
   * @private
   */
  _getZoneConfigurations() {
    try {
      // Import zone classes and get their configurations
      const zoneConfigs = [];

      // Import each zone class and get its configuration
      // This is a simplified approach - in a real implementation,
      // you might want to use dynamic imports or a registry pattern

      // For now, we'll create a few example zone stories manually
      // since integrating with the full zone system would require
      // more complex dependency management

      // Example zone story for zone_1 (Blinking Grove)
      zoneConfigs.push({
        zoneId: 'zone_1',
        narration: [
          'Once, the world was clear. Text flowed like rivers, perfectly aligned. But the Bugs came...',
          'Then, from the Blinking Grove, a spark appeared. A light not of fire… but of focus. You.',
          "✨ *Hello, Cursor.* You don't remember much. But the land does. And the land remembers you.",
          '> Try walking with the keys the wind left behind...',
        ],
      });

      return zoneConfigs;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get level ID for a given zone ID
   * @private
   */
  _getLevelIdForZone(zoneId) {
    // Simple mapping - in a real implementation, this would come from level configurations
    const zoneToLevelMap = {
      zone_1: 'level_1',
      zone_2: 'level_2',
      zone_3: 'level_2',
      zone_4: 'level_3',
      zone_5: 'level_3',
      zone_6: 'level_3',
      zone_7: 'level_4',
      zone_8: 'level_4',
      zone_9: 'level_5',
      zone_10: 'level_5',
    };

    return zoneToLevelMap[zoneId] || 'level_1';
  }
}
