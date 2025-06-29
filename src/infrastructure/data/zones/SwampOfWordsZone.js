import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 3: Swamp of Words
 * Wetlands with unstable bridges where the Cursor learns word navigation
 */
export class SwampOfWordsZone {
  static create() {
    const config = {
      zoneId: 'zone_3',
      name: '3. Swamp of Words',
      biome: 'Wetlands with unstable bridges',
      skillFocus: ['w', 'W', 'e', 'E', 'b', 'B'],
      puzzleTheme: 'Word vs WORD movement',
      narration: [
        'The swamp bubbles with forgotten words...',
        'Some bridges hold only words, others support WORDS.',
        'Learn the difference, for one misstep means a watery grave.',
        'The Word Witch watches from the mist, testing your understanding.',
      ],

      // Entry from Zone 2 - place cursor at the beginning of the path (within bounds)
      cursorStartPosition: new Position(47, 0),

      tiles: {
        tileType: 'swamp_ground',
        // 50x32 maze layout - wetlands with water and bridges
        layout: [
          // Row 0-5: Entry area from Zone 2
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWBBBBBP',
          // Row 6-10: First bridge section with word keys
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWBBBBBBBP',
          // Row 11-15: Central swamp area
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWP',
          'PBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBP',
          // Row 16-20: Second bridge section
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBW',
          // Row 21-25: Third bridge section with more keys
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBW',
          // Row 26-31: Final area with Word Witch and gate
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // Word Witch NPC
          'PGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // Gate to Zone 4
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        ],
        legend: {
          W: 'water',
          B: 'bridge',
          P: 'path',
          K: 'vim_key_spot',
          G: 'gate',
          N: 'npc_spot',
        },
        specialTiles: [
          {
            type: 'vim_key',
            value: 'w',
            position: [42, 5],
            description: 'word - forward to start of next word',
          },
          {
            type: 'vim_key',
            value: 'W',
            position: [42, 10],
            description: 'WORD - forward to start of next WORD',
          },
          {
            type: 'vim_key',
            value: 'e',
            position: [42, 15],
            description: 'end - forward to end of word',
          },
          {
            type: 'vim_key',
            value: 'E',
            position: [42, 20],
            description: 'End - forward to end of WORD',
          },
          {
            type: 'vim_key',
            value: 'b',
            position: [42, 25],
            description: 'back - backward to start of word',
          },
          {
            type: 'vim_key',
            value: 'B',
            position: [5, 15],
            description: 'Back - backward to start of WORD',
          },
        ],
        textLabels: [
          { text: 'words', position: [20, 8] },
          { text: 'WORDS', position: [30, 12] },
          { text: 'word-end', position: [25, 18] },
          { text: 'WORD-END', position: [15, 22] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['w', 'W', 'e', 'E', 'b', 'B'] },
          position: [1, 30],
          leadsTo: 'zone_4',
        },
      },
      npcs: [
        {
          id: 'word_witch',
          appearsWhen: { collectedVimKeys: ['w', 'W', 'e', 'E', 'b', 'B'] },
          dialogue: [
            'Ahhhh, young Cursor... you have learned the subtle art.',
            'Words and WORDS - punctuation makes all the difference.',
            'w, W, e, E, b, B - the six movements of textual wisdom.',
            'The swamp yields its secrets to you. Pass, and face the canyon ahead.',
          ],
          position: [1, 29],
        },
      ],
      events: [
        {
          id: 'zone3_swamp_entry',
          trigger: 'onZoneEnter',
          actions: [
            {
              type: 'showNarration',
              text: 'The bridges creak under the weight of forgotten words...',
            },
            { type: 'enableWordHighlighting' },
          ],
        },
        {
          id: 'zone3_word_key',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: 'w' },
          actions: [
            { type: 'showNarration', text: 'word movement unlocked! You feel the rhythm of text.' },
          ],
        },
        {
          id: 'zone3_WORD_key',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: 'W' },
          actions: [
            {
              type: 'showNarration',
              text: 'WORD movement unlocked! Punctuation holds no power over you.',
            },
          ],
        },
        {
          id: 'zone3_bridge_warning',
          trigger: 'onStepOnTile',
          conditions: { tileType: 'bridge' },
          actions: [{ type: 'showNarration', text: 'The bridge holds... for now.' }],
        },
        {
          id: 'zone3_unlock_gate',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['w', 'W', 'e', 'E', 'b', 'B'] },
          actions: [
            { type: 'showNPC', npcId: 'word_witch' },
            { type: 'unlockGate', targetZone: 'zone_4' },
            { type: 'showNarration', text: 'The swamp mist parts, revealing the path forward.' },
          ],
        },
      ],
    };

    return new Zone(config);
  }

  static getConfig() {
    return {
      zoneId: 'zone_3',
      name: '3. Swamp of Words',
      biome: 'Wetlands with unstable bridges',
      skillFocus: ['w', 'W', 'e', 'E', 'b', 'B'],
      puzzleTheme: 'Word vs WORD movement',
      narration: [
        'The swamp bubbles with forgotten words...',
        'Some bridges hold only words, others support WORDS.',
        'Learn the difference, for one misstep means a watery grave.',
        'The Word Witch watches from the mist, testing your understanding.',
      ],
    };
  }
}
