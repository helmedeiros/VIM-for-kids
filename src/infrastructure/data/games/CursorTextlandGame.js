import { Game } from '../../../domain/entities/Game.js';
import { GameType } from '../../../domain/value-objects/GameType.js';
import { VimForKidsGame } from '../../../VimForKidsGame.js';

/**
 * Configuration for "Cursor and the Textland" game
 * Open exploration game for free-form VIM practice in a textual world
 */
export class CursorTextlandGame {
  /**
   * Create the game configuration
   * @returns {Game} Configured game instance
   */
  static create() {
    return new Game({
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
    });
  }
}
