import { Zone } from '../../../domain/entities/Zone.js';

/**
 * Factory for Zone 1: Blinking Grove
 * Forest clearing where the Cursor learns basic movement (h, j, k, l)
 */
export class BlinkingGroveZone {
  static create() {
    const config = {
      zoneId: 'zone_1',
      name: '1. Blinking Grove',
      biome: 'Forest clearing (bottom left)',
      skillFocus: ['h', 'j', 'k', 'l'],
      puzzleTheme: 'Basic movement, bump-to-talk',
      narration: [
        'Once, the world was clear. Text flowed like rivers, perfectly aligned. But the Bugs came...',
        'Then, from the Blinking Grove, a spark appeared. A light not of fire… but of focus. You.',
        "✨ *Hello, Cursor.* You don't remember much. But the land does. And the land remembers you.",
        '> Try walking with the keys the wind left behind...',
      ],
      tiles: {
        tileType: 'forest_ground',
        // 100x8 extended forest layout with clear navigation paths
        layout: [
          // Row 0: Top border with strategic openings
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          // Row 1: Main pathway with clearings and instructional areas
          'TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPT',
          // Row 2: Mixed terrain with dirt patches but maintaining clear paths
          'TPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDPT',
          // Row 3: Key collection areas with clear access paths (h=2, j=7, k=14, l=21)
          'TPPHPPPJPPPPPPKPPPPPPPLPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPT',
          // Row 4: Central exploration area with varied terrain but clear navigation
          'TPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDPT',
          // Row 5: Text labels and narrative areas with clear paths to gate (G at position 95)
          'TPPHHWWPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPGPPT',
          // Row 6: Lower pathway ensuring full navigation
          'TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPT',
          // Row 7: Bottom border
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        ],
        legend: {
          T: 'tree',
          P: 'path',
          D: 'dirt',
          H: 'path', // Hello text position
          W: 'path', // world! text position
          G: 'path', // Gate position
          // VIM key positions (will be handled by specialTiles)
        },
        specialTiles: [
          { type: 'vim_key', value: 'h', position: [2, 3] }, // Left movement key - on path
          { type: 'vim_key', value: 'j', position: [7, 3] }, // Down movement key - on path
          { type: 'vim_key', value: 'k', position: [14, 3] }, // Up movement key - on path
          { type: 'vim_key', value: 'l', position: [21, 3] }, // Right movement key - on path
        ],
        textLabels: [
          // "Hello" - each letter on its own tile
          { text: 'H', position: [3, 5] },
          { text: 'e', position: [4, 5] },
          { text: 'l', position: [5, 5] },
          { text: 'l', position: [6, 5] },
          { text: 'o', position: [7, 5] },

          // "world!" - each letter on its own tile
          { text: 'w', position: [9, 5] },
          { text: 'o', position: [10, 5] },
          { text: 'r', position: [11, 5] },
          { text: 'l', position: [12, 5] },
          { text: 'd', position: [13, 5] },
          { text: '!', position: [14, 5] },

          // Instructional text - spaced across the zone
          { text: 'W', position: [30, 1] },
          { text: 'e', position: [31, 1] },
          { text: 'l', position: [32, 1] },
          { text: 'c', position: [33, 1] },
          { text: 'o', position: [34, 1] },
          { text: 'm', position: [35, 1] },
          { text: 'e', position: [36, 1] },

          { text: 'L', position: [50, 1] },
          { text: 'e', position: [51, 1] },
          { text: 'a', position: [52, 1] },
          { text: 'r', position: [53, 1] },
          { text: 'n', position: [54, 1] },

          // Key instructions - single characters
          { text: 'h', position: [2, 4] },
          { text: 'j', position: [7, 4] },
          { text: 'k', position: [14, 4] },
          { text: 'l', position: [21, 4] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          position: [92, 5], // Correct position where 'G' character is located
          leadsTo: 'zone_2',
        },
      },
      npcs: [
        {
          id: 'caret_stone',
          appearsWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          dialogue: [
            'Very good, oh Shadowy One.',
            'You have learned the Four Motions: h, j, k, l – the Way of the Cursor.',
            'Your path continues through the gate.',
            'But beware: not all words are the same. Some are words. Others are WORDS.',
          ],
          position: [90, 5], // Near the gate on the clear pathway
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
            { type: 'showNPC', npcId: 'caret_stone' },
            { type: 'unlockGate', targetZone: 'zone_2' },
            { type: 'playMusic', track: 'zone1_complete' },
            { type: 'showNarration', text: 'And so begins your journey...' },
          ],
        },
      ],
    };

    return new Zone(config);
  }

  /**
   * Get the zone configuration object (without creating a Zone instance)
   * Useful for serialization or configuration inspection
   */
  static getConfig() {
    return {
      zoneId: 'zone_1',
      name: '1. Blinking Grove',
      biome: 'Forest clearing (bottom left)',
      skillFocus: ['h', 'j', 'k', 'l'],
      puzzleTheme: 'Basic movement, bump-to-talk',
      narration: [
        'Once, the world was clear. Text flowed like rivers, perfectly aligned. But the Bugs came...',
        'Then, from the Blinking Grove, a spark appeared. A light not of fire… but of focus. You.',
        "✨ *Hello, Cursor.* You don't remember much. But the land does. And the land remembers you.",
        '> Try walking with the keys the wind left behind...',
      ],
      tiles: {
        tileType: 'forest_ground',
        // 100x8 extended forest layout with clear navigation paths
        layout: [
          // Row 0: Top border with strategic openings
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          // Row 1: Main pathway with clearings and instructional areas
          'TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPT',
          // Row 2: Mixed terrain with dirt patches but maintaining clear paths
          'TPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDPT',
          // Row 3: Key collection areas with clear access paths (h=2, j=7, k=14, l=21)
          'TPPHPPPJPPPPPPKPPPPPPPLPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPT',
          // Row 4: Central exploration area with varied terrain but clear navigation
          'TPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDDDPPPPDDDDPT',
          // Row 5: Text labels and narrative areas with clear paths to gate (G at position 95)
          'TPPHHWWPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPGPPT',
          // Row 6: Lower pathway ensuring full navigation
          'TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPT',
          // Row 7: Bottom border
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        ],
        legend: {
          T: 'tree',
          P: 'path',
          D: 'dirt',
          H: 'path', // Hello text position
          W: 'path', // world! text position
          G: 'path', // Gate position
          // VIM key positions (will be handled by specialTiles)
        },
        specialTiles: [
          { type: 'vim_key', value: 'h', position: [2, 3] }, // Left movement key - on path
          { type: 'vim_key', value: 'j', position: [7, 3] }, // Down movement key - on path
          { type: 'vim_key', value: 'k', position: [14, 3] }, // Up movement key - on path
          { type: 'vim_key', value: 'l', position: [21, 3] }, // Right movement key - on path
        ],
        textLabels: [
          // "Hello" - each letter on its own tile
          { text: 'H', position: [3, 5] },
          { text: 'e', position: [4, 5] },
          { text: 'l', position: [5, 5] },
          { text: 'l', position: [6, 5] },
          { text: 'o', position: [7, 5] },

          // "world!" - each letter on its own tile
          { text: 'w', position: [9, 5] },
          { text: 'o', position: [10, 5] },
          { text: 'r', position: [11, 5] },
          { text: 'l', position: [12, 5] },
          { text: 'd', position: [13, 5] },
          { text: '!', position: [14, 5] },

          // Instructional text - spaced across the zone
          { text: 'W', position: [30, 1] },
          { text: 'e', position: [31, 1] },
          { text: 'l', position: [32, 1] },
          { text: 'c', position: [33, 1] },
          { text: 'o', position: [34, 1] },
          { text: 'm', position: [35, 1] },
          { text: 'e', position: [36, 1] },

          { text: 'L', position: [50, 1] },
          { text: 'e', position: [51, 1] },
          { text: 'a', position: [52, 1] },
          { text: 'r', position: [53, 1] },
          { text: 'n', position: [54, 1] },

          // Key instructions - single characters
          { text: 'h', position: [2, 4] },
          { text: 'j', position: [7, 4] },
          { text: 'k', position: [14, 4] },
          { text: 'l', position: [21, 4] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          position: [92, 5], // Correct position where 'G' character is located
          leadsTo: 'zone_2',
        },
      },
      npcs: [
        {
          id: 'caret_stone',
          appearsWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          dialogue: [
            'Very good, oh Shadowy One.',
            'You have learned the Four Motions: h, j, k, l – the Way of the Cursor.',
            'Your path continues through the gate.',
            'But beware: not all words are the same. Some are words. Others are WORDS.',
          ],
          position: [90, 5], // Near the gate on the clear pathway
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
            { type: 'showNPC', npcId: 'caret_stone' },
            { type: 'unlockGate', targetZone: 'zone_2' },
            { type: 'playMusic', track: 'zone1_complete' },
            { type: 'showNarration', text: 'And so begins your journey...' },
          ],
        },
      ],
    };
  }
}
