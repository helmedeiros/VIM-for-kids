import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 2: Maze of Modes
 * Stone labyrinth where the Cursor learns mode switching (i, ESC, :)
 */
export class MazeOfModesZone {
  static create() {
    const config = {
      zoneId: 'zone_2',
      name: '2. Maze of Modes',
      biome: 'Stone labyrinth',
      skillFocus: ['i', 'ESC', ':', 'mode switching'],
      puzzleTheme: 'Switching between Normal, Insert, Visual',
      narration: [
        'The stone walls whisper of ancient modes...',
        'Normal mode is where you begin, Insert mode is where you create.',
        'Command mode is where you command the very fabric of text.',
        'Master the transitions, young Cursor, for modes are the keys to power.',
      ],

      // Entry from Zone 1 - place cursor at the beginning of the path
      cursorStartPosition: new Position(0, 5),

      tiles: {
        tileType: 'stone_floor',
        // 50x32 maze layout - stone labyrinth with narrow paths
        layout: [
          // Row 0-4: Entry area and first maze section
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          // Row 5: Entry path from Zone 1
          'PPPPPPPPMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMPMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMPMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMPMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMPMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          // Row 10-15: First maze section with mode keys
          'MMMMMMPPPPPPPMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMPMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMPPPPPPPMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMPMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMKPPPPPPMMMMMMMMMMMMMMMMMMMMMM', // i key
          'MMMMMMMMMMMMMMMMMMMMMMMMPMMMMMMMMMMMMMMMMMMMMMM',
          // Row 16-20: Central maze area
          'MMMMMMMMMMMMMMMMMMMMMMMMPPPPPPPMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMPMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMPPPPPPPMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMPMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMKPPPPMMMMMM', // ESC key
          // Row 21-25: Final maze section
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMPMMMMMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMPPPPPMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMPMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMPMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMPMM',
          // Row 26-31: Exit area
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMKPM', // : key
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMPN', // NPC
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMPG', // Gate to Zone 3
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
        ],
        legend: {
          M: 'wall',
          P: 'path',
          K: 'vim_key_spot',
          G: 'gate',
          N: 'npc_spot',
        },
        specialTiles: [
          {
            type: 'vim_key',
            value: 'i',
            position: [18, 14],
            description: 'Insert mode - the key to creation',
          },
          {
            type: 'vim_key',
            value: 'ESC',
            position: [36, 20],
            description: 'Escape to Normal mode - the key to control',
          },
          {
            type: 'vim_key',
            value: ':',
            position: [44, 26],
            description: 'Command mode - the key to power',
          },
        ],
        textLabels: [
          { text: 'MODES', position: [25, 8] },
          { text: 'Normal', position: [10, 12] },
          { text: 'Insert', position: [20, 16] },
          { text: 'Command', position: [40, 24] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['i', 'ESC', ':'] },
          position: [47, 28],
          leadsTo: 'zone_3',
        },
      },
      npcs: [
        {
          id: 'mode_guardian',
          appearsWhen: { collectedVimKeys: ['i', 'ESC', ':'] },
          dialogue: [
            'Excellent, Cursor. You have mastered the Three Modes.',
            'Normal mode for navigation, Insert mode for creation, Command mode for power.',
            'The maze has tested your understanding. You may pass.',
            'But beware - ahead lies the Swamp of Words, where words and WORDS are not the same.',
          ],
          position: [46, 27],
        },
      ],
      events: [
        {
          id: 'zone2_mode_tutorial',
          trigger: 'onZoneEnter',
          actions: [
            { type: 'showNarration', text: 'Stone walls shift based on your mode...' },
            { type: 'enableModeIndicator' },
          ],
        },
        {
          id: 'zone2_first_key',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: 'i' },
          actions: [
            {
              type: 'showNarration',
              text: 'Insert mode unlocked! The walls remember your intention.',
            },
          ],
        },
        {
          id: 'zone2_second_key',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: 'ESC' },
          actions: [
            {
              type: 'showNarration',
              text: 'Escape to Normal! The maze acknowledges your control.',
            },
          ],
        },
        {
          id: 'zone2_unlock_gate',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['i', 'ESC', ':'] },
          actions: [
            { type: 'showNPC', npcId: 'mode_guardian' },
            { type: 'unlockGate', targetZone: 'zone_3' },
            { type: 'showNarration', text: 'The stone maze yields to your mastery of modes.' },
          ],
        },
      ],
    };

    return new Zone(config);
  }

  static getConfig() {
    return {
      zoneId: 'zone_2',
      name: '2. Maze of Modes',
      biome: 'Stone labyrinth',
      skillFocus: ['i', 'ESC', ':', 'mode switching'],
      puzzleTheme: 'Switching between Normal, Insert, Visual',
      narration: [
        'The stone walls whisper of ancient modes...',
        'Normal mode is where you begin, Insert mode is where you create.',
        'Command mode is where you command the very fabric of text.',
        'Master the transitions, young Cursor, for modes are the keys to power.',
      ],
    };
  }
}
