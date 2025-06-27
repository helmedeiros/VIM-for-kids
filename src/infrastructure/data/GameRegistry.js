import { Game } from '../../domain/entities/Game.js';
import { GameType } from '../../domain/value-objects/GameType.js';
import { VimForKidsGame } from '../../VimForKidsGame.js';

/**
 * Centralized registry for all games
 * Single source of truth for game configuration
 * Follows Registry pattern for better maintainability
 */
export class GameRegistry {
  /**
   * Get all games
   * @returns {Map<string, Game>} Map of game ID to Game
   */
  static getGames() {
    if (!this._games) {
      this._games = this._initializeGames();
    }
    return this._games;
  }

  /**
   * Initialize all games
   * @private
   * @returns {Map<string, Game>} Initialized games map
   */
  static _initializeGames() {
    const games = new Map();

    // Game 1: "Cursor - Before the Clickers" (Level-based adventure game)
    games.set(
      'cursor-before-clickers',
      new Game({
        id: 'cursor-before-clickers',
        name: 'Cursor - Before the Clickers',
        description:
          'Journey through mystical zones collecting VIM keys and mastering movement commands. A structured adventure through different VIM learning environments.',
        gameType: new GameType(GameType.LEVEL_BASED),

        // Extended configuration
        defaultLevel: 'level_1',
        supportedLevels: ['level_1', 'level_2', 'level_3', 'level_4', 'level_5'],

        // Level configurations specific to this game
        levels: {
          level_1: {
            id: 'level_1',
            name: 'VIM Basics',
            zones: ['zone_1'], // Blinking Grove - Basic movement
            description: 'Learn fundamental VIM movement commands in the Blinking Grove',
          },
          level_2: {
            id: 'level_2',
            name: 'Text Manipulation',
            zones: ['zone_2', 'zone_3'], // Maze of Modes, Swamp of Words
            description: 'Master VIM modes and word navigation',
          },
          level_3: {
            id: 'level_3',
            name: 'Advanced Movement',
            zones: ['zone_4', 'zone_5', 'zone_6'], // Delete Canyon, Field of Insertion, Copy Circle
            description: 'Navigate efficiently with advanced movement commands',
          },
          level_4: {
            id: 'level_4',
            name: 'Text Operations',
            zones: ['zone_7', 'zone_8'], // Search Springs, Command Cavern
            description: 'Master deletion, copying, and pasting operations',
          },
          level_5: {
            id: 'level_5',
            name: 'Search & Command',
            zones: ['zone_9', 'zone_10'], // Playground of Practice, Syntax Temple
            description: 'Find, search, and command like a VIM master',
          },
        },

        features: {
          levelProgression: true,
          cutscenes: true,
          zoneNarration: true,
          keyCollection: true,
          gateUnlocking: true,
          multipleZonesPerLevel: true,
          progressTracking: true,
        },

        ui: {
          showLevelSelector: true,
          showProgressIndicator: true,
          showKeyCollection: true,
          theme: 'mystical',
          enableGameSelector: true,
        },

        cutscenes: {
          hasOriginStory: true,
          hasLevelTransitions: true,
          hasZoneIntros: true,
          enableCutsceneSkipping: true,
        },

        persistence: {
          saveProgress: true,
          saveCollectedKeys: true,
          saveUnlockedZones: true,
          saveCurrentLevel: true,
          saveCurrentZone: true,
        },

        factory: async (options, dependencies) => {
          return new VimForKidsGame(options, dependencies);
        },
      })
    );

    // Game 2: "Cursor and the Textland" (Open exploration game)
    games.set(
      'cursor-textland',
      new Game({
        id: 'cursor-textland',
        name: 'Cursor and the Textland',
        description:
          'Explore a free-form textual world where you can practice basic VIM movements in an open environment. Perfect for experimenting with commands.',
        gameType: new GameType(GameType.TEXTLAND),

        // Extended configuration
        defaultLevel: null,
        supportedLevels: [],

        features: {
          freeExploration: true,
          basicMovement: true,
          openWorld: true,
          experimentalMode: true,
          noProgressLimits: true,
        },

        ui: {
          showLevelSelector: false,
          showProgressIndicator: false,
          showKeyCollection: false,
          theme: 'minimal',
          enableGameSelector: true,
        },

        cutscenes: {
          hasOriginStory: false,
          hasLevelTransitions: false,
          hasZoneIntros: false,
          enableCutsceneSkipping: false,
        },

        persistence: {
          saveProgress: false,
          savePosition: true,
          saveCollectedKeys: false,
          saveCurrentLevel: false,
          saveCurrentZone: false,
        },

        factory: async (options, dependencies) => {
          return new VimForKidsGame(options, dependencies);
        },
      })
    );

    return games;
  }

  /**
   * Get a specific game by ID
   * @param {string} gameId - Game identifier
   * @returns {Game} Game instance
   * @throws {Error} If game not found
   */
  static getGame(gameId) {
    const game = this.getGames().get(gameId);
    if (!game) {
      throw new Error(`Game '${gameId}' not found`);
    }
    return game;
  }

  /**
   * Get all games as an array
   * @returns {Game[]} Array of all games
   */
  static getAllGames() {
    return Array.from(this.getGames().values());
  }

  /**
   * Get the default game
   * @returns {Game} Default game
   */
  static getDefaultGame() {
    return this.getGame('cursor-before-clickers');
  }

  /**
   * Check if a game exists
   * @param {string} gameId - Game identifier
   * @returns {boolean} True if game exists
   */
  static hasGame(gameId) {
    return this.getGames().has(gameId);
  }

  /**
   * Get all game IDs
   * @returns {string[]} Array of game IDs
   */
  static getGameIds() {
    return Array.from(this.getGames().keys());
  }

  /**
   * Get games by type
   * @param {GameType} gameType - Game type to filter by
   * @returns {Game[]} Array of games matching the type
   */
  static getGamesByType(gameType) {
    return this.getAllGames().filter((game) => game.gameType.equals(gameType));
  }

  /**
   * Get games with a specific feature
   * @param {string} feature - Feature name
   * @returns {Game[]} Array of games with the feature
   */
  static getGamesWithFeature(feature) {
    return this.getAllGames().filter((game) => game.hasFeature(feature));
  }

  /**
   * Register a new game
   * @param {string} gameId - Game identifier
   * @param {Game} game - Game instance
   */
  static registerGame(gameId, game) {
    if (!(game instanceof Game)) {
      throw new Error('Must provide a Game instance');
    }
    this.getGames().set(gameId, game);
  }

  /**
   * Unregister a game definition
   * @param {string} gameId - Game identifier
   * @returns {boolean} True if game was removed
   */
  static unregisterGame(gameId) {
    return this.getGames().delete(gameId);
  }

  /**
   * Reset the registry (useful for testing)
   */
  static reset() {
    this._games = null;
  }

  /**
   * Get registry statistics
   * @returns {Object} Registry statistics
   */
  static getStats() {
    const games = this.getAllGames();
    const levelBasedGames = this.getGamesByType(new GameType(GameType.LEVEL_BASED));
    const textlandGames = this.getGamesByType(new GameType(GameType.TEXTLAND));

    return {
      totalGames: games.length,
      levelBasedGames: levelBasedGames.length,
      textlandGames: textlandGames.length,
      gamesWithCutscenes: this.getGamesWithFeature('cutscenes').length,
      gamesWithLevelProgression: this.getGamesWithFeature('levelProgression').length,
    };
  }
}
