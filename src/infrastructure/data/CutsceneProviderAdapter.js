import { CutsceneProvider } from '../../ports/data/CutsceneProvider.js';
import { Story } from '../../domain/value-objects/Story.js';
import { ZoneRegistry } from './zones/ZoneRegistry.js';
import { GameRegistry } from './games/GameRegistry.js';

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

      if (!type || !['origin', 'level', 'zone'].includes(type)) {
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
      const tempStory = new Story(gameId, type, ['temp'], { levelId, zoneId });
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

      if (!type || !['origin', 'level', 'zone'].includes(type)) {
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
      const tempStory = new Story(gameId, type, ['temp'], { levelId, zoneId });
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
    const gameStory = await this.getCutsceneStory(gameId, 'origin');
    if (!gameStory) {
      return null;
    }

    // Convert back to Story for backward compatibility
    return Story.createOriginStory(gameStory.gameId, gameStory.script);
  }

  async hasOriginStory(gameId) {
    return await this.hasCutsceneStory(gameId, 'origin');
  }

  async getAllOriginStories() {
    const gameStories = Array.from(this._cutsceneStories.values()).filter(
      (story) => story.type === 'origin'
    );

    return gameStories.map((story) => Story.createOriginStory(story.gameId, story.script));
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

    const gameStory = Story.createOriginStory('cursor-before-clickers', cursorBeforeClickersScript);

    stories.set(gameStory.identifier, gameStory);

    // Future: Add game stories for other games here
    // Example for cursor-textland could be added later
  }

  /**
   * Add level-level cutscene stories
   * @private
   */
  _addLevelStories(stories) {
    try {
      // Get level configurations from actual game configurations
      // This avoids duplication and ensures we use the source of truth
      const levelConfigs = this._getLevelConfigurations();

      levelConfigs.forEach((config) => {
        if (config.cutscene && Array.isArray(config.cutscene) && config.cutscene.length > 0) {
          // Create a level cutscene story from the level's cutscene configuration
          const levelStory = Story.createLevelStory(
            config.gameId,
            config.levelId,
            [...config.cutscene] // Copy the cutscene array
          );

          stories.set(levelStory.identifier, levelStory);
        }
      });
    } catch (error) {
      // If game system is not available, continue without level stories
      console.warn('Game system not available for level cutscene integration:', error.message);
    }
  }

  /**
   * Add zone-level cutscene stories from zone narration
   * @private
   */
  _addZoneStories(stories) {
    try {
      // Get all zone configurations from the actual zone classes
      const zoneConfigs = this._getZoneConfigurations();

      zoneConfigs.forEach((config) => {
        if (config.narration && Array.isArray(config.narration) && config.narration.length > 0) {
          // Create a zone cutscene story from the zone's narration
          const zoneStory = Story.createZoneStory(
            'cursor-before-clickers', // Default game
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
   * Get zone configurations from the actual zone classes
   * @private
   */
  _getZoneConfigurations() {
    try {
      // Use ZoneRegistry to get actual zone configurations
      // This avoids duplication and ensures we use the source of truth
      const zoneConfigs = [];
      const availableZoneIds = ZoneRegistry.getAvailableZoneIds();

      // Get configurations from actual zone classes
      for (const zoneId of availableZoneIds) {
        // Skip textland_exploration as it's not part of cursor-before-clickers
        if (zoneId === 'textland_exploration') {
          continue;
        }

        try {
          const config = ZoneRegistry.getZoneConfig(zoneId);
          if (config && config.narration && Array.isArray(config.narration)) {
            zoneConfigs.push({
              zoneId: config.zoneId || zoneId,
              narration: [...config.narration], // Copy the narration array
            });
          }
        } catch (error) {
          // Skip zones that can't be loaded
          console.warn(`Failed to load zone config for ${zoneId}:`, error.message);
        }
      }

      return zoneConfigs;
    } catch (error) {
      // Fallback: if ZoneRegistry is not available, return empty array
      console.warn('ZoneRegistry not available for cutscene integration:', error.message);
      return [];
    }
  }

  /**
   * Get level configurations from the actual game classes
   * @private
   */
  _getLevelConfigurations() {
    try {
      // Use GameRegistry to get actual level configurations
      // This avoids duplication and ensures we use the source of truth
      const levelConfigs = [];
      const availableGameIds = GameRegistry.getGameIds();

      // Get configurations from actual game classes
      for (const gameId of availableGameIds) {
        try {
          const game = GameRegistry.getGame(gameId);
          if (game && game.levels) {
            // Extract level configurations with cutscenes
            Object.values(game.levels).forEach((levelConfig) => {
              if (levelConfig.cutscene && Array.isArray(levelConfig.cutscene)) {
                levelConfigs.push({
                  gameId: game.id,
                  levelId: levelConfig.id,
                  cutscene: [...levelConfig.cutscene], // Copy the cutscene array
                });
              }
            });
          }
        } catch (error) {
          // Skip games that can't be loaded
          console.warn(`Failed to load game config for ${gameId}:`, error.message);
        }
      }

      return levelConfigs;
    } catch (error) {
      // Fallback: if GameRegistry is not available, return empty array
      console.warn('GameRegistry not available for level cutscene integration:', error.message);
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
