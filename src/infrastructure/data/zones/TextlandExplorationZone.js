import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Textland Exploration Zone
 * A simple, open exploration zone for the cursor-textland game
 * Provides basic movement practice without complex puzzles or progression
 */
export class TextlandExplorationZone {
  /**
   * Get the shared configuration metadata for this zone
   * @private
   */
  static _getSharedConfig() {
    return {
      zoneId: 'textland_exploration',
      name: 'Textland Exploration Area',
      biome: 'Open plains with scattered elements',
      skillFocus: ['h', 'j', 'k', 'l'],
      puzzleTheme: 'Free exploration and movement practice',
      narration: [
        'Welcome to the Textland!',
        'This is a free exploration area where you can practice basic VIM movements.',
        'Use h, j, k, l to move around and collect keys at your own pace.',
        'There are no complex puzzles here - just enjoy exploring!',
      ],
    };
  }

  static create() {
    const config = {
      ...this._getSharedConfig(),

      tiles: {
        tileType: 'textland_ground',
        // Simple layout for open exploration
        layout: [
          '############',
          '#..........#',
          '#..........#',
          '#..........#',
          '#..........#',
          '#..........#',
          '#..........#',
          '############',
        ],
        legend: {
          '#': 'wall',
          '.': 'path',
        },

        specialTiles: [
          { type: 'vim_key', value: 'h', position: [2, 2] },
          { type: 'vim_key', value: 'k', position: [8, 2] },
          { type: 'vim_key', value: 'j', position: [5, 4] },
          { type: 'vim_key', value: 'l', position: [2, 6] },
        ],

        textLabels: [
          {
            position: [6, 1],
            text: 'Textland Exploration',
            style: 'title',
          },
          {
            position: [1, 7],
            text: 'Practice area - explore freely!',
            style: 'hint',
          },
        ],

        // No gate - this is an endless exploration zone
        gate: null,

        // Cursor starts in a safe open area
        cursorStartPosition: new Position(3, 3),
      },

      // No NPCs for simple exploration
      npcs: [],

      // Simple completion: collect all keys (but zone never actually "completes")
      events: [
        {
          trigger: 'allKeysCollected',
          action: 'showMessage',
          message: 'Great! You collected all the keys. Keep exploring!',
        },
      ],
    };

    return new Zone(config);
  }

  static getConfig() {
    // Create a temporary zone instance and extract its configuration
    const tempZone = this.create();

    // Extract the configuration from the zone instance
    return {
      ...this._getSharedConfig(),
      tiles: tempZone.tiles,
      npcs: tempZone.npcs,
      events: tempZone.events,
    };
  }
}
