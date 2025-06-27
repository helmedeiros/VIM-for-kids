import { Game } from '../../../domain/entities/Game.js';
import { GameType } from '../../../domain/value-objects/GameType.js';
import { VimForKidsGame } from '../../../VimForKidsGame.js';

/**
 * Configuration for "Cursor - Before the Clickers" game
 * Level-based adventure game with structured progression through VIM learning environments
 */
export class CursorBeforeClickersGame {
  /**
   * Create the game configuration
   * @returns {Game} Configured game instance
   */
  static create() {
    return new Game({
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
    });
  }
}
