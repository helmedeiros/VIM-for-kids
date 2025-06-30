import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 1: Blinking Grove
 * Forest clearing where the Cursor learns basic movement (h, j, k, l)
 */
export class BlinkingGroveZone {
  /**
   * Get the shared configuration metadata for this zone
   * @private
   */
  static _getSharedConfig() {
    return {
      zoneId: 'zone_1',
      name: '1. Blinking Grove',
      biome: 'Forest clearing with water and stone maze',
      skillFocus: ['h', 'j', 'k', 'l'],
      puzzleTheme: 'Basic movement, bump-to-talk',
      narration: [
        'Once, the world was clear. Text flowed like rivers, perfectly aligned. But the Bugs came...',
        'Then, from the Blinking Grove, a spark appeared. A light not of fire… but of focus. You.',
        "✨ *Hello, Cursor.* You don't remember much. But the land does. And the land remembers you.",
        '> Try walking with the keys the wind left behind...',
      ],
    };
  }

  /**
   * Get the complete zone configuration (for compatibility with tests and external systems)
   * @private
   */
  static _getCompleteConfig() {
    return {
      ...this._getSharedConfig(),

      // Custom cursor start position - on the green grassy area (avoiding key and text positions)
      cursorStartPosition: new Position(38, 9),
      tiles: {
        tileType: 'mixed_terrain',
        // Large layout matching the image: water left, grass center-left, stone maze right
        layout: [
          // Row 0: Top border with "Remember words are not WORD" text area
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          // Row 1: Water and stone with text labels
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWSREMEMRERWOSSSSARESSSSNOTSSSSWORDSSSSSSSSSSSSSSSS',
          // Row 2: Transition to grass and stone maze
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          // Row 3: Water, grass patch with keys and stone maze with openings
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGGGGGGGGGGGGGGGGGGGGGGSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          // Row 4: Water, grass with dirt patches, and stone maze
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGGDDGDDDGGGGDDGDDGGGGSSSSSSSSSSSSSsssSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          // Row 5: Water, grass with keys h,j,l and dirt, stone maze
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGhGDjGDDDGGGGGDlDGGGGSSSSSSSSSSSSSsssSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          // Row 6: Water, grass area, stone maze
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGGGGGDDDGGGGGGGGGGGGGSSSSSSSSSSSSSsssSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSsSS',
          // Row 7: Water, grass with "Hello" text area, stone maze
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGGGGGGGGGGGGGGGGGGGGGSSSSSsssSSSSSsssSSSSSSSSSSSSsssSSSSSSSSSSSSSSSssSS',
          // Row 8: Water, grass with "world!" text, stone maze with NPC
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGkGGGGGGGGGGGGGGGGGGGGSSSSSsssSSSSSSSSSSSSSSSSSSsssSSSSSSSSSSSSSSSSsNSS',
          // Row 9: Water, grass area continues, stone maze
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGGGGGGGGGGGGGGGGGGGGGGSSSSSSSSSSSSsssSSSSSSSSSSSSsssSSSSSSSSSSSSSSSSssSS',
          // Row 10: Water, grass area, stone maze
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGGGGGGGGGGGGGGGGGGGGGGSSSSSSSSSSSSSsssSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          // Row 11: Water and stone base
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
        ],
        legend: {
          W: 'water',
          G: 'grass',
          D: 'dirt',
          S: 'stone',
          s: 'stone', // path stone
          N: 'stone', // NPC position
          // Text positions will be handled by textLabels
          R: 'stone', // Remember
          e: 'stone', // letters
          m: 'stone',
          b: 'stone',
          r: 'stone',
          w: 'stone', // words
          o: 'stone',
          d: 'stone',
          a: 'stone', // are
          n: 'stone', // not
          t: 'stone',
          // Keys will be handled by specialTiles
          h: 'grass',
          j: 'grass',
          k: 'grass',
          l: 'grass',
        },
        specialTiles: [
          { type: 'vim_key', value: 'h', position: [31, 5] }, // Left movement key - on grass
          { type: 'vim_key', value: 'j', position: [34, 5] }, // Down movement key - on grass
          { type: 'vim_key', value: 'k', position: [31, 8] }, // Up movement key - on grass
          { type: 'vim_key', value: 'l', position: [37, 5] }, // Right movement key - on grass
        ],
        textLabels: [
          // "Remember words are not WORD" text at the top
          { text: 'R', position: [52, 1], color: '#000', fontSize: '14px' },
          { text: 'e', position: [53, 1], color: '#000', fontSize: '14px' },
          { text: 'm', position: [54, 1], color: '#000', fontSize: '14px' },
          { text: 'e', position: [55, 1], color: '#000', fontSize: '14px' },
          { text: 'm', position: [56, 1], color: '#000', fontSize: '14px' },
          { text: 'b', position: [57, 1], color: '#000', fontSize: '14px' },
          { text: 'e', position: [58, 1], color: '#000', fontSize: '14px' },
          { text: 'r', position: [59, 1], color: '#000', fontSize: '14px' },

          { text: 'w', position: [62, 1], color: '#000', fontSize: '14px' },
          { text: 'o', position: [63, 1], color: '#000', fontSize: '14px' },
          { text: 'r', position: [64, 1], color: '#000', fontSize: '14px' },
          { text: 'd', position: [65, 1], color: '#000', fontSize: '14px' },
          { text: 's', position: [66, 1], color: '#000', fontSize: '14px' },

          { text: 'a', position: [69, 1], color: '#000', fontSize: '14px' },
          { text: 'r', position: [70, 1], color: '#000', fontSize: '14px' },
          { text: 'e', position: [71, 1], color: '#000', fontSize: '14px' },

          { text: 'n', position: [74, 1], color: '#000', fontSize: '14px' },
          { text: 'o', position: [75, 1], color: '#000', fontSize: '14px' },
          { text: 't', position: [76, 1], color: '#000', fontSize: '14px' },

          { text: 'W', position: [79, 1], color: '#000', fontSize: '14px' },
          { text: 'O', position: [80, 1], color: '#000', fontSize: '14px' },
          { text: 'R', position: [81, 1], color: '#000', fontSize: '14px' },
          { text: 'D', position: [82, 1], color: '#000', fontSize: '14px' },

          // "Hello" text on the grass area
          { text: 'H', position: [32, 7], color: '#22c55e', fontSize: '16px' },
          { text: 'e', position: [33, 7], color: '#22c55e', fontSize: '16px' },
          { text: 'l', position: [34, 7], color: '#22c55e', fontSize: '16px' },
          { text: 'l', position: [35, 7], color: '#22c55e', fontSize: '16px' },
          { text: 'o', position: [36, 7], color: '#22c55e', fontSize: '16px' },

          // "world!" text on the grass area
          { text: 'w', position: [32, 8], color: '#22c55e', fontSize: '16px' },
          { text: 'o', position: [33, 8], color: '#22c55e', fontSize: '16px' },
          { text: 'r', position: [34, 8], color: '#22c55e', fontSize: '16px' },
          { text: 'l', position: [35, 8], color: '#22c55e', fontSize: '16px' },
          { text: 'd', position: [36, 8], color: '#22c55e', fontSize: '16px' },
          { text: '!', position: [37, 8], color: '#22c55e', fontSize: '16px' },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          position: [85, 8], // Gate position in the stone maze
          leadsTo: 'zone_2',
        },
      },
      npcs: [
        {
          id: 'caret_stone',
          type: 'caret_stone',
          appearsWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          dialogue: [
            'Yes... the foundation is strong.',
            'h left, j down, k up, l right.',
            'You understand the ancient ways.',
            'The paths ahead... await your steps.',
          ],
          position: [81, 8], // NPC position in the stone maze
        },
      ],
      events: [
        {
          id: 'zone1_intro_lock',
          trigger: 'onZoneEnter',
          actions: [
            { type: 'disableMovement' },
            { type: 'showNarration', text: 'Try walking with the keys the wind left behind...' },
          ],
        },
        {
          id: 'zone1_unlock_gate',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['h', 'j', 'k', 'l'] },
          actions: [
            { type: 'showNPC', npcId: 'caret_spirit' },
            { type: 'unlockGate', targetZone: 'zone_2' },
            { type: 'playMusic', track: 'zone1_complete' },
            { type: 'showNarration', text: 'And so begins your journey...' },
          ],
        },
      ],
    };
  }

  static create() {
    const config = this._getCompleteConfig();
    return new Zone(config);
  }

  static getConfig() {
    return this._getCompleteConfig();
  }
}
