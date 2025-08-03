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
      cursorStartPosition: new Position(2, 10),
      tiles: {
        tileType: 'mixed_terrain',
        // Large layout matching the image: water left, grass center-left, stone maze right
        layout: [
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGGGGGGGGD',
          'WWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSGGGGGGWWWGWWWWWGDD',
          'WWWWWWWWWWWWWWWWSPPPPPPPPPSSDDDDDDDDSDDDDDSDDDDDDDDSDDDGGGGGGGWWWWGGGGGWDDD',
          'WWWWWWWWWWWWWWWWSPPPPPPPPPSSDSSSSSSDSDSSSDSDSSSDSSDSDSSSSGGGGWWWWWWWGGWWWWW',
          'WWWWWWWWWWWWWWWWSPPPPPPPPPSDDSDDDDDDSDSDSDSDSDSDSSDSDSDSWGGGWWWWGGGGGGWWWWW',
          'WWWWWWWWWWWWWWWWSSSSSSSSSSSDSSSSSSSDSDSDSDSDSDSDSSDSDDDSWGGGGGWWGWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWSDDDDDDDDDSDSDDDDDSD<DSDSDSDSDDDDDDSDSDSWGGWWWWWGGGWWWWWWWW',
          'WWWWWWWWWWWWWWWWSSSSSSSSSDSDSDSSSSSDSSSDSDSDSSSSSSSSDSDSWGGGWWWWGGGGGWWWWWW',
          'GGGGGGGGGGGGWWWWSDDDDDDDDDDDSDSDDDSD>DDDSDSDDDDDDDDDDSDSWGGWWWWWGWWWWWWWWWW',
          'GDDDGGGGGGGGWWWWSDSSSSSSSSSSSDSDSSSDSDSSSDSSSSSSSSSSDSSSWGGGGGGGGWWWWWWWWWW',
          'GDDDDDDDDDGGWWWWSDDDDDSDSDDDDDSDSDDDSDDDDDDDDDDDDSSSDDDSWWWWWWWWWWWWWWWWWWW',
          'GDDDGGGGGDGGWWWWSSSSSDSDSDSSSSSDSDSSSSSSSSSSSSSSDSSSDSDSWWWWWWWWWWWWWWWWWWW',
          'GGGGGGGGGDGGWWWWSDDDDDSDSDDDDDDDSDSDDDDDDDDDDDDSDSSSDSDSWWWWWWWWWWWWWWWWWWW',
          'GGGGGGGGGDGGSSSSSDSSSSSDSSSSSSSSSDSDSSSSSSSSSSDSDSSSDSDSWWWWWWWWWWWWWWWWWWW',
          'GTGGGGGGGDDDDDDDDDSDDDSDSDDDDDDDSDSDSDDDDDDDDDDSD<DDDSDSWWWWWWWWWWWWWWWWWWW',
          'GGGGGGGGGGGGSSSSSDSSSDSDSDSSSSSSSDSDSSSSSSSSSSSSDSSSSSDSWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWSD<DDDDDDDDDDDDDDD<DDDDDDDDDDDDDD>DDDDDSWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        ],
        legend: {
          W: 'water',
          G: 'grass',
          D: 'dirt',
          S: 'wall',
          T: 'tree',
          N: 'wall',
          P: 'path',
          '>': 'ramp_left',
          '<': 'ramp_right',
        },
        specialTiles: [
          { type: 'vim_key', value: 'h', position: [1, 10] }, // Left movement key - on grass
          { type: 'vim_key', value: 'j', position: [2, 11] }, // Down movement key - on grass
          { type: 'vim_key', value: 'k', position: [2, 9] }, // Up movement key - on grass
          { type: 'vim_key', value: 'l', position: [3, 10] }, // Right movement key - on grass
          { type: 'collectible_key', keyId: 'maze_key', name: 'Maze Key', color: '#FFD700', position: [37, 14] }, // Golden key in the maze
        ],
        textLabels: [
          // "Remember words are not WORD" text at the top
          { text: 'R', position: [17, 2], color: '#000', fontSize: '14px' },
          { text: 'e', position: [18, 2], color: '#000', fontSize: '14px' },
          { text: 'm', position: [19, 2], color: '#000', fontSize: '14px' },
          { text: 'e', position: [20, 2], color: '#000', fontSize: '14px' },
          { text: 'm', position: [21, 2], color: '#000', fontSize: '14px' },
          { text: 'b', position: [22, 2], color: '#000', fontSize: '14px' },
          { text: 'e', position: [23, 2], color: '#000', fontSize: '14px' },
          { text: 'r', position: [24, 2], color: '#000', fontSize: '14px' },
          { text: ':', position: [25, 2], color: '#000', fontSize: '14px' },

          { text: 'w', position: [17, 3], color: '#000', fontSize: '14px' },
          { text: 'o', position: [18, 3], color: '#000', fontSize: '14px' },
          { text: 'r', position: [19, 3], color: '#000', fontSize: '14px' },
          { text: 'd', position: [20, 3], color: '#000', fontSize: '14px' },
          { text: 's', position: [21, 3], color: '#000', fontSize: '14px' },

          { text: 'a', position: [23, 3], color: '#000', fontSize: '14px' },
          { text: 'r', position: [24, 3], color: '#000', fontSize: '14px' },
          { text: 'e', position: [25, 3], color: '#000', fontSize: '14px' },

          { text: 'n', position: [17, 4], color: '#000', fontSize: '14px' },
          { text: 'o', position: [18, 4], color: '#000', fontSize: '14px' },
          { text: 't', position: [19, 4], color: '#000', fontSize: '14px' },

          { text: 'W', position: [21, 4], color: '#000', fontSize: '14px' },
          { text: 'O', position: [22, 4], color: '#000', fontSize: '14px' },
          { text: 'R', position: [23, 4], color: '#000', fontSize: '14px' },
          { text: 'D', position: [24, 4], color: '#000', fontSize: '14px' },
          { text: 'S', position: [25, 4], color: '#000', fontSize: '14px' },

          // "Hello" text on the grass area
          { text: 'H', position: [2, 13], color: '#22c55e', fontSize: '16px' },
          { text: 'e', position: [3, 13], color: '#22c55e', fontSize: '16px' },
          { text: 'l', position: [4, 13], color: '#22c55e', fontSize: '16px' },
          { text: 'l', position: [5, 13], color: '#22c55e', fontSize: '16px' },
          { text: 'o', position: [6, 13], color: '#22c55e', fontSize: '16px' },

          // "world!" text on the grass area
          { text: 'w', position: [2, 14], color: '#22c55e', fontSize: '16px' },
          { text: 'o', position: [3, 14], color: '#22c55e', fontSize: '16px' },
          { text: 'r', position: [4, 14], color: '#22c55e', fontSize: '16px' },
          { text: 'l', position: [5, 14], color: '#22c55e', fontSize: '16px' },
          { text: 'd', position: [6,14], color: '#22c55e', fontSize: '16px' },
          { text: '!', position: [7,14], color: '#22c55e', fontSize: '16px' },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] }, // Gate auto-unlocks when keys collected
          position: [74, 1], // Gate position to connect with hidden area
          leadsTo: 'vim_secret_area', // First leads to hidden area, not directly to zone_2
        },
        hiddenAreas: [
          {
            id: 'vim_secret_area',
            revealWhen: 'escProgression',
            layout: [
          'DWWWWWWWWWWWWWWWPPPPPPPPPPPPPPPPPPPPWWWWWWWWWWWWWWWW',
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWDWWWWWWWWWWWWWWWW',
          'PDWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWDWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPPPWWWWWWWWWWWDWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPWWDWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPWWWWWWDWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPWWWWWWWWWDWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPWWWWWWWWWWWWPPPPPPWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPWWWWWWWWPPPPPPWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPPWWWWWWWPPPPPPWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPPPPWWWWWWWWWWDWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPWWWWWWWWWWWWWWWWWWWWDWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPDWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWDWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWDWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        ],
            legend: {
              W: 'water',
              D: 'dirt',
              P: 'path',
              G: 'gate',
            },
            offsetX: 56, // Positioned to connect directly to the main area
            offsetY: 1, // Same vertical level as the main area
            textLabels: [
              // "vim Total Rulez!!!" text in the hidden area (centered in the wider area)
              { text: 'v', position: [16, 0], color: '#ff6b6b', fontSize: '20px', fontWeight: 'bold' },
              { text: 'i', position: [17, 0], color: '#ff6b6b', fontSize: '20px', fontWeight: 'bold' },
              { text: 'm', position: [18, 0], color: '#ff6b6b', fontSize: '20px', fontWeight: 'bold' },

              { text: 'T', position: [20, 0], color: '#4ecdc4', fontSize: '20px', fontWeight: 'bold' },
              { text: 'o', position: [21, 0], color: '#4ecdc4', fontSize: '20px', fontWeight: 'bold' },
              { text: 't', position: [22, 0], color: '#4ecdc4', fontSize: '20px', fontWeight: 'bold' },
              { text: 'a', position: [23, 0], color: '#4ecdc4', fontSize: '20px', fontWeight: 'bold' },
              { text: 'l', position: [24, 0], color: '#4ecdc4', fontSize: '20px', fontWeight: 'bold' },

              { text: 'R', position: [26, 0], color: '#45b7d1', fontSize: '20px', fontWeight: 'bold' },
              { text: 'u', position: [27, 0], color: '#45b7d1', fontSize: '20px', fontWeight: 'bold' },
              { text: 'l', position: [28, 0], color: '#45b7d1', fontSize: '20px', fontWeight: 'bold' },
              { text: 'e', position: [29, 0], color: '#45b7d1', fontSize: '20px', fontWeight: 'bold' },
              { text: 'z', position: [30, 0], color: '#45b7d1', fontSize: '20px', fontWeight: 'bold' },

              { text: '!', position: [32, 0], color: '#f7dc6f', fontSize: '24px', fontWeight: 'bold' },
              { text: '!', position: [33, 0], color: '#f7dc6f', fontSize: '24px', fontWeight: 'bold' },
              { text: '!', position: [34, 0], color: '#f7dc6f', fontSize: '24px', fontWeight: 'bold' },

              // Additional encouraging text
              { text: 'T', position: [0, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'h', position: [1, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [2, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'r', position: [3, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [4, 3], color: '#95e1d3', fontSize: '16px' },

              { text: 'w', position: [5, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'i', position: [6, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'l', position: [7, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'l', position: [8, 3], color: '#95e1d3', fontSize: '16px' },

              { text: 'c', position: [10, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'o', position: [11, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'm', position: [12, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [13, 3], color: '#95e1d3', fontSize: '16px' },

              { text: 'a', position: [15, 3], color: '#95e1d3', fontSize: '16px' },

              { text: 't', position: [17, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'i', position: [18, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'm', position: [19, 3], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [20, 3], color: '#95e1d3', fontSize: '16px' },
              { text: ',', position: [21, 3], color: '#95e1d3', fontSize: '16px' },

              // "Before open source's golden era," - Line 4
              { text: 'B', position: [0, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [1, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'f', position: [2, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'o', position: [3, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'r', position: [4, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [5, 4], color: '#95e1d3', fontSize: '16px' },

              { text: 'o', position: [7, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'p', position: [8, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [9, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'n', position: [10, 4], color: '#95e1d3', fontSize: '16px' },

              { text: 's', position: [12, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'o', position: [13, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'u', position: [14, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'r', position: [15, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'c', position: [16, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [17, 4], color: '#95e1d3', fontSize: '16px' },
              { text: '\'', position: [18, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 's', position: [19, 4], color: '#95e1d3', fontSize: '16px' },

              { text: 'g', position: [21, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'o', position: [22, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'l', position: [23, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'd', position: [24, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [25, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'n', position: [26, 4], color: '#95e1d3', fontSize: '16px' },

              { text: 'e', position: [28, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'r', position: [29, 4], color: '#95e1d3', fontSize: '16px' },
              { text: 'a', position: [30, 4], color: '#95e1d3', fontSize: '16px' },
              { text: ',', position: [31, 4], color: '#95e1d3', fontSize: '16px' },

              // "When the bugs rule the land," - Line 5
              { text: 'W', position: [0, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'h', position: [1, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [2, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'n', position: [3, 5], color: '#95e1d3', fontSize: '16px' },

              { text: 't', position: [5, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'h', position: [6, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [7, 5], color: '#95e1d3', fontSize: '16px' },

              { text: 'b', position: [9, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'u', position: [10, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'g', position: [11, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 's', position: [12, 5], color: '#95e1d3', fontSize: '16px' },

              { text: 'r', position: [14, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'u', position: [15, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'l', position: [16, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [17, 5], color: '#95e1d3', fontSize: '16px' },

              { text: 't', position: [19, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'h', position: [20, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [21, 5], color: '#95e1d3', fontSize: '16px' },

              { text: 'l', position: [23, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'a', position: [24, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'n', position: [25, 5], color: '#95e1d3', fontSize: '16px' },
              { text: 'd', position: [26, 5], color: '#95e1d3', fontSize: '16px' },
              { text: ',', position: [27, 5], color: '#95e1d3', fontSize: '16px' },

              // "And the darkness is deep." - Line 6
              { text: 'A', position: [0, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'n', position: [1, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'd', position: [2, 6], color: '#95e1d3', fontSize: '16px' },

              { text: 't', position: [4, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'h', position: [5, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [6, 6], color: '#95e1d3', fontSize: '16px' },

              { text: 'd', position: [8, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'a', position: [9, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'r', position: [10, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'k', position: [11, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'n', position: [12, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [13, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 's', position: [14, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 's', position: [15, 6], color: '#95e1d3', fontSize: '16px' },

              { text: 'i', position: [17, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 's', position: [18, 6], color: '#95e1d3', fontSize: '16px' },

              { text: 'd', position: [20, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [21, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [22, 6], color: '#95e1d3', fontSize: '16px' },
              { text: 'p', position: [23, 6], color: '#95e1d3', fontSize: '16px' },
              { text: '.', position: [24, 6], color: '#95e1d3', fontSize: '16px' },

              // "But from the shadows emerge," - Line 8
              { text: 'B', position: [0, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 'u', position: [1, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 't', position: [2, 8], color: '#95e1d3', fontSize: '16px' },

              { text: 'f', position: [4, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 'r', position: [5, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 'o', position: [6, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 'm', position: [7, 8], color: '#95e1d3', fontSize: '16px' },

              { text: 't', position: [9, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 'h', position: [10, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [11, 8], color: '#95e1d3', fontSize: '16px' },

              { text: 's', position: [13, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 'h', position: [14, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 'a', position: [15, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 'd', position: [16, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 'o', position: [17, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 'w', position: [18, 8], color: '#95e1d3', fontSize: '16px' },
              { text: 's', position: [19, 8], color: '#95e1d3', fontSize: '16px' },
              { text: ',', position: [20, 8], color: '#95e1d3', fontSize: '16px' },


              // "A shady one emerges." - Line 9
              { text: 'A', position: [0, 9], color: '#95e1d3', fontSize: '16px' },

              { text: 's', position: [2, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'h', position: [3, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'a', position: [4, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'd', position: [5, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'o', position: [6, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'w', position: [7, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'y', position: [8, 9], color: '#95e1d3', fontSize: '16px' },

              { text: 'o', position: [10, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'n', position: [11, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [12, 9], color: '#95e1d3', fontSize: '16px' },

              { text: 'e', position: [14, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'm', position: [15, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [16, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'r', position: [17, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'g', position: [18, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [19, 9], color: '#95e1d3', fontSize: '16px' },
              { text: 's', position: [20, 9], color: '#95e1d3', fontSize: '16px' },
              { text: ',', position: [21, 9], color: '#95e1d3', fontSize: '16px' },

              // "To restore the old code." - Line 10
              { text: 'T', position: [0, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'o', position: [1, 10], color: '#95e1d3', fontSize: '16px' },

              { text: 'r', position: [3, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [4, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 's', position: [5, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 't', position: [6, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'o', position: [7, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'r', position: [8, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [9, 10], color: '#95e1d3', fontSize: '16px' },

              { text: 't', position: [11, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'h', position: [12, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [13, 10], color: '#95e1d3', fontSize: '16px' },

              { text: 'o', position: [15, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'l', position: [17, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'd', position: [18, 10], color: '#95e1d3', fontSize: '16px' },

              { text: 'c', position: [20, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'o', position: [21, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'd', position: [22, 10], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [23, 10], color: '#95e1d3', fontSize: '16px' },
              { text: ',', position: [24, 10], color: '#95e1d3', fontSize: '16px' },

              // "And the power of VIM will prevail." - Line 11
              { text: 'A', position: [0, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'n', position: [1, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'd', position: [2, 12], color: '#95e1d3', fontSize: '16px' },

              { text: 't', position: [4, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'h', position: [5, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [6, 12], color: '#95e1d3', fontSize: '16px' },

              { text: 'p', position: [8, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'o', position: [9, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'w', position: [10, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [11, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'r', position: [12, 12], color: '#95e1d3', fontSize: '16px' },

              { text: 'o', position: [14, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'f', position: [15, 12], color: '#95e1d3', fontSize: '16px' },

              { text: 'V', position: [17, 12], color: '#ff6b6b', fontSize: '16px', fontWeight: 'bold' },
              { text: 'I', position: [18, 12], color: '#ff6b6b', fontSize: '16px', fontWeight: 'bold' },
              { text: 'M', position: [19, 12], color: '#ff6b6b', fontSize: '16px', fontWeight: 'bold' },

              { text: 'w', position: [21, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'i', position: [22, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'l', position: [23, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'l', position: [24, 12], color: '#95e1d3', fontSize: '16px' },

              { text: 'p', position: [26, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'r', position: [27, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'e', position: [28, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'v', position: [29, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'a', position: [30, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'i', position: [31, 12], color: '#95e1d3', fontSize: '16px' },
              { text: 'l', position: [32, 12], color: '#95e1d3', fontSize: '16px' },
              { text: '.', position: [33, 12], color: '#95e1d3', fontSize: '16px' },

              // Secret message
              { text: 'N', position: [30, 7], color: '#ffa726', fontSize: '14px' },
              { text: 'o', position: [31, 7], color: '#ffa726', fontSize: '14px' },
              { text: 'w', position: [32, 7], color: '#ffa726', fontSize: '14px' },

              { text: 'g', position: [34, 7], color: '#ffa726', fontSize: '14px' },
              { text: 'o', position: [35, 7], color: '#ffa726', fontSize: '14px' },

              { text: 'b', position: [30, 8], color: '#ffa726', fontSize: '14px' },
              { text: 'a', position: [31, 8], color: '#ffa726', fontSize: '14px' },
              { text: 'c', position: [32, 8], color: '#ffa726', fontSize: '14px' },
              { text: 'k', position: [33, 8], color: '#ffa726', fontSize: '14px' },

              { text: ':', position: [30, 9], color: '#ffa726', fontSize: '14px' },
              { text: ')', position: [31, 9], color: '#ffa726', fontSize: '14px' },
            ],
            specialTiles: [
              // Add some special vim keys as rewards in the hidden area (positioned on the path)
              { type: 'collectible_key', keyId: 'secret_vim_key', name: 'Secret Vim Key', color: '#FFD700', position: [15, 10] },
              { type: 'collectible_key', keyId: 'master_key', name: 'Master Key', color: '#FF6B6B', position: [50, 10] },

              // Three new keys positioned near the letters (not on top to avoid text overlap)
              { type: 'collectible_key', keyId: 'golden_key', name: 'Golden Key', color: '#FFD700', position: [19, 0] }, // Next to 'm' in 'vim'
              { type: 'collectible_key', keyId: 'silver_key', name: 'Silver Key', color: '#C0C0C0', position: [25, 0] }, // Next to 'l' in 'Total'
              { type: 'collectible_key', keyId: 'bronze_key', name: 'Bronze Key', color: '#CD7F32', position: [31, 0] }, // Next to 'z' in 'Rulez'
            ],
            // Player starts here when entering the hidden area (just inside from the gate)
            playerStartPosition: [0, 0], // Just inside the hidden area, right after the connection
            // Gate in the hidden area that leads to the real next level
            gate: {
              locked: false, // Unlocked - player earned access by reaching hidden area
              position: [73, 10], // Gate position in the hidden area (on the dirt path at the far right)
              leadsTo: 'zone_2', // This gate leads to the actual next zone
            },
            // Secondary gates within the hidden area that require specific keys
            secondaryGates: [
              {
                locked: true,
                unlocksWhen: { requiredCollectibleKeys: ['golden_key'] },
                position: [34, 13], // First gate in hidden area (relative to hidden area grid)
                leadsTo: 'golden_chamber',
              },
              {
                locked: true,
                unlocksWhen: { requiredCollectibleKeys: ['silver_key'] },
                position: [34, 14], // Second gate in hidden area (relative to hidden area grid)
                leadsTo: 'silver_chamber',
              },
              {
                locked: true,
                unlocksWhen: { requiredCollectibleKeys: ['bronze_key'] },
                position: [34, 15], // Third gate in hidden area (relative to hidden area grid)
                leadsTo: 'bronze_chamber',
              },
            ],
          },
        ],
        secondaryGates: [
          {
            locked: true,
            unlocksWhen: { requiredCollectibleKeys: ['maze_key'] },
            position: [52, 3], // Gate position at end of dirt path in maze
          },
        ],
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
          position: [6, 10], // NPC position in the stone maze
        },
        {
          id: 'gate_completion_spirit',
          type: 'caret_spirit',
          appearsWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          dialogue: [
            'Very good oh Shadowy One! You learned the hjkl skill.',
            'Go on!',
            'Press Esc to continue...',
          ],
          position: [74, 1], // NPC position at the gate
          requiresEscToProgress: true, // Custom flag for ESC progression
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
          id: 'zone1_keys_collected',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['h', 'j', 'k', 'l'] },
          actions: [
            { type: 'showNPC', npcId: 'caret_stone' },
            { type: 'showNPC', npcId: 'gate_completion_spirit' },
            { type: 'playMusic', track: 'zone1_keys_complete' },
          ],
        },
        {
          id: 'zone1_esc_progression',
          trigger: 'onEscKeyPressed',
          conditions: {
            collectedKeys: ['h', 'j', 'k', 'l'],
            npcVisible: 'gate_completion_spirit',
            atGatePosition: true
          },
          actions: [
            { type: 'unlockGate', targetZone: 'zone_2' },
            { type: 'hideNPC', npcId: 'gate_completion_spirit' },
            { type: 'progressToNextLevel' },
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
