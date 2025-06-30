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
          'WWWWWWWWWWWWWWWWSDDDDDDDDDSSDDDDDDDDSDDDDDSDDDDDDDDSDDDGGGGGGGWWWWGGGGGWDDD',
          'WWWWWWWWWWWWWWWWSDDDDDDDDDSSDSSSSSSDSDSSSDSDSSSDSSDSDSSSSGGGGWWWWWWWGGWWWWW',
          'WWWWWWWWWWWWWWWWSDDDDDDDDDSDDSDDDDDDSDSDSDSDSDSDSSDSDSDSWGGGWWWWGGGGGGWWWWW',
          'WWWWWWWWWWWWWWWWSSSSSSSSSSSDSSSSSSSDSDSDSDSDSDSDSSDSDDDSWGGGGGWWGWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWSDDDDDDDDDSDSDDDDDSDDDSDSDSDSDDDDDDSDSDSWGGWWWWWGGGWWWWWWWW',
          'WWWWWWWWWWWWWWWWSSSSSSSSSDSDSDSSSSSDSSSDSDSDSSSSSSSSDSDSWGGGWWWWGGGGGWWWWWW',
          'GGGGGGGGGGGGWWWWSDDDDDDDDDDDSDSDDDSDDDDDSDSDDDDDDDDDDSDSWGGWWWWWGWWWWWWWWWW',
          'GDDDGGGGGGGGWWWWSDSSSSSSSSSSSDSDSSSDSDSSSDSSSSSSSSSSDSSSWGGGGGGGGWWWWWWWWWW',
          'GDDDDDDDDDGGWWWWSDDDDDSDSDDDDDSDSDDDSDDDDDDDDDDDDSSSDDDSWWWWWWWWWWWWWWWWWWW',
          'GDDDGGGGGDGGWWWWSSSSSDSDSDSSSSSDSDSSSSSSSSSSSSSSDSSSDSDSWWWWWWWWWWWWWWWWWWW',
          'GGGGGGGGGDGGWWWWSDDDDDSDSDDDDDDDSDSDDDDDDDDDDDDSDSSSDSDSWWWWWWWWWWWWWWWWWWW',
          'GGGGGGGGGDGGSSSSSDSSSSSDSSSSSSSSSDSDSSSSSSSSSSDSDSSSDSDSWWWWWWWWWWWWWWWWWWW',
          'GTGGGGGGGDDDDDDDDDSDDDSDSDDDDDDDSDSDSDDDDDDDDDDSDDDDDSDSWWWWWWWWWWWWWWWWWWW',
          'GGGGGGGGGGGGSSSSSDSSSDSDSDSSSSSSSDSDSSSSSSSSSSSSDSSSSSDSWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWSDDDDDDDDDDDDDDDDDSDDDDDDDDDDDDDDDDDDDDSWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        ],
        legend: {
          W: 'water',
          G: 'grass',
          D: 'dirt',
          S: 'stone',
          T: 'tree',
          N: 'stone',
        },
        specialTiles: [
          { type: 'vim_key', value: 'h', position: [1, 10] }, // Left movement key - on grass
          { type: 'vim_key', value: 'j', position: [2, 11] }, // Down movement key - on grass
          { type: 'vim_key', value: 'k', position: [2, 9] }, // Up movement key - on grass
          { type: 'vim_key', value: 'l', position: [3, 10] }, // Right movement key - on grass
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
          unlocksWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          position: [74, 1], // Gate position in the stone maze
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
          position: [6, 10], // NPC position in the stone maze
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
