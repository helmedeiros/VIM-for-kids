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
          cutscene: [
            'You have learned the basics of movement.',
            'Now the real challenge begins...',
            '🏛️ Welcome to the realm of Text Manipulation.',
            'Here you will master the sacred modes of VIM:',
            '• Normal Mode - Where you navigate and command',
            '• Insert Mode - Where you create and modify',
            '• Command Mode - Where you wield true power',
            'The Maze of Modes and Swamp of Words await your mastery.',
          ],
        },
        level_3: {
          id: 'level_3',
          name: 'Advanced Movement',
          zones: ['zone_4', 'zone_5', 'zone_6'], // Delete Canyon, Field of Insertion, Copy Circle
          description: 'Navigate efficiently with advanced movement commands',
          cutscene: [
            '⚡ You have conquered the modes!',
            'But now, the text itself calls to you...',
            'Welcome to Advanced Movement - where every keystroke has purpose.',
            'Delete Canyon will teach you precision in removal.',
            'Field of Insertion will show you the art of placement.',
            'Copy Circle will reveal the mysteries of duplication.',
            'Master these skills, and text will bend to your will.',
          ],
        },
        level_4: {
          id: 'level_4',
          name: 'Text Operations',
          zones: ['zone_7', 'zone_8'], // Search Springs, Command Cavern
          description: 'Master deletion, copying, and pasting operations',
          cutscene: [
            '🔥 The cursor grows stronger...',
            'Text Operations await - the true power of VIM.',
            'In Search Springs, you will learn to find anything.',
            'In Command Cavern, you will discover the deep magic.',
            'These are not mere tools - they are extensions of thought.',
            'Prepare yourself for mastery beyond movement.',
          ],
        },
        level_5: {
          id: 'level_5',
          name: 'Search & Command',
          zones: ['zone_9', 'zone_10'], // Playground of Practice, Syntax Temple
          description: 'Find, search, and command like a VIM master',
          cutscene: [
            '✨ The final trials await...',
            'You stand at the threshold of true VIM mastery.',
            'Playground of Practice will test everything you know.',
            'Syntax Temple holds the ultimate challenge - the Bug King himself.',
            'This is where legends are made, young Cursor.',
            'The fate of Textland rests in your keystrokes.',
          ],
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
