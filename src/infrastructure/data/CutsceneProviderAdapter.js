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
    try {
      // Get game configurations from actual game configurations
      // This avoids duplication and ensures we use the source of truth
      const gameConfigs = this._getGameConfigurations();

      gameConfigs.forEach((config) => {
        if (
          config.originStory &&
          Array.isArray(config.originStory) &&
          config.originStory.length > 0
        ) {
          // Create a game origin story from the game's cutscene configuration
          const gameStory = Story.createOriginStory(
            config.gameId,
            [...config.originStory] // Copy the origin story array
          );

          stories.set(gameStory.identifier, gameStory);
        }
      });
    } catch (error) {
      // If game system is not available, continue without game stories
      console.warn('Game system not available for game cutscene integration:', error.message);
    }
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
          // Get the game and level for this zone dynamically
          const zoneMapping = this._getZoneToGameLevelMapping(config.zoneId);
          if (zoneMapping) {
            // Create a zone cutscene story from the zone's narration
            const zoneStory = Story.createZoneStory(
              zoneMapping.gameId,
              zoneMapping.levelId,
              config.zoneId,
              [...config.narration] // Copy the narration array
            );

            stories.set(zoneStory.identifier, zoneStory);
          }
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
   * Get game configurations from the actual game classes
   * @private
   */
  _getGameConfigurations() {
    try {
      // Use GameRegistry to get actual game configurations
      // This avoids duplication and ensures we use the source of truth
      const gameConfigs = [];
      const availableGameIds = GameRegistry.getGameIds();

      // Get configurations from actual game classes
      for (const gameId of availableGameIds) {
        try {
          const game = GameRegistry.getGame(gameId);
          if (game && game.cutscenes && game.cutscenes.originStory) {
            // Extract game configurations with origin stories
            gameConfigs.push({
              gameId: game.id,
              originStory: [...game.cutscenes.originStory], // Copy the origin story array
            });
          }
        } catch (error) {
          // Skip games that can't be loaded
          console.warn(`Failed to load game config for ${gameId}:`, error.message);
        }
      }

      return gameConfigs;
    } catch (error) {
      // Fallback: if GameRegistry is not available, return empty array
      console.warn('GameRegistry not available for game cutscene integration:', error.message);
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
   * Get game and level mapping for a given zone ID by dynamically searching game configurations
   * @private
   */
  _getZoneToGameLevelMapping(zoneId) {
    try {
      const availableGameIds = GameRegistry.getGameIds();

      // Search through all games and their levels to find the zone
      for (const gameId of availableGameIds) {
        try {
          const game = GameRegistry.getGame(gameId);
          if (game && game.levels) {
            // Search through all levels in this game
            for (const levelConfig of Object.values(game.levels)) {
              if (levelConfig.zones && levelConfig.zones.includes(zoneId)) {
                return {
                  gameId: game.id,
                  levelId: levelConfig.id,
                };
              }
            }
          }
        } catch (error) {
          // Skip games that can't be loaded
          console.warn(`Failed to load game config for ${gameId}:`, error.message);
        }
      }

      // If not found in any game, return null
      return null;
    } catch (error) {
      console.warn('Failed to get zone-to-game-level mapping:', error.message);
      return null;
    }
  }
}
