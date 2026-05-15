import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 1b: Word Practice Arena
 *
 * A small open arena that sits at the start of Level 2. The player has
 * just collected h/j/k/l from the Blinking Grove and w/e/b from its
 * hidden area; this zone lets them practice those word motions on a
 * dedicated phrase before tackling the Maze of Modes.
 *
 * Layout: a cobblestone arena framed by water, with three short lines
 * of text separated by single-cell rocks the player has to hop over
 * with w/e/b. The level-exit gate is on the south wall.
 */
export class WordPracticeZone {
  static _getSharedConfig() {
    return {
      zoneId: 'zone_practice',
      name: '1.5 Word Practice Arena',
      biome: 'Cobblestone arena ringed by water',
      skillFocus: ['w', 'e', 'b'],
      puzzleTheme: 'Practice the word motions on a free-roam arena before the labyrinth',
      narration: [
        'The arena hums with quiet, patient air.',
        'No traps. No locks. Just words — and the motions you already know.',
        '> Jump across the rocks with w / e / b until you reach the southern gate.',
      ],
    };
  }

  static _getCompleteConfig() {
    return {
      ...this._getSharedConfig(),

      cursorStartPosition: new Position(2, 2),
      tiles: {
        tileType: 'cobblestone',
        // 20 cols × 11 rows. The cursor spawns top-left of the arena
        // and walks south through three text lines to reach the gate.
        layout: [
          'WWWWWWWWWWWWWWWWWWWW',
          'WCCCCCCCCCCCCCCCCCCW',
          'WCPPPPPPPPPPPPPPPPCW',
          'WCPRPPPPPPPPPPPPPPCW',
          'WCPPPPPPPPPPPPPPPPCW',
          'WCPRPPPPPPPPPPPRPPCW',
          'WCPPPPPPPPPPPPPPPPCW',
          'WCPPPPPPPPPPPPPRPPCW',
          'WCPPPPPPPPPPPPPPPPCW',
          'WCCCCCCCCCCCCCGCCCCW',
          'WWWWWWWWWWWWWWWWWWWW',
        ],
        legend: {
          W: 'water',
          C: 'cobblestone',
          P: 'path',
          R: 'rock',
          G: 'gate',
        },
        textLabels: [
          // Line 1: "practice"
          { text: 'p', position: [5, 3], color: '#1c1108', fontSize: '14px' },
          { text: 'r', position: [6, 3], color: '#1c1108', fontSize: '14px' },
          { text: 'a', position: [7, 3], color: '#1c1108', fontSize: '14px' },
          { text: 'c', position: [8, 3], color: '#1c1108', fontSize: '14px' },
          { text: 't', position: [9, 3], color: '#1c1108', fontSize: '14px' },
          { text: 'i', position: [10, 3], color: '#1c1108', fontSize: '14px' },
          { text: 'c', position: [11, 3], color: '#1c1108', fontSize: '14px' },
          { text: 'e', position: [12, 3], color: '#1c1108', fontSize: '14px' },

          // Line 2: "with w e b"
          { text: 'w', position: [5, 5], color: '#1c1108', fontSize: '14px' },
          { text: 'i', position: [6, 5], color: '#1c1108', fontSize: '14px' },
          { text: 't', position: [7, 5], color: '#1c1108', fontSize: '14px' },
          { text: 'h', position: [8, 5], color: '#1c1108', fontSize: '14px' },
          { text: 'w', position: [10, 5], color: '#ff6b6b', fontSize: '14px', fontWeight: 'bold' },
          { text: 'e', position: [12, 5], color: '#ff6b6b', fontSize: '14px', fontWeight: 'bold' },
          { text: 'b', position: [14, 5], color: '#ff6b6b', fontSize: '14px', fontWeight: 'bold' },

          // Line 3: "words"
          { text: 'w', position: [5, 7], color: '#1c1108', fontSize: '14px' },
          { text: 'o', position: [6, 7], color: '#1c1108', fontSize: '14px' },
          { text: 'r', position: [7, 7], color: '#1c1108', fontSize: '14px' },
          { text: 'd', position: [8, 7], color: '#1c1108', fontSize: '14px' },
          { text: 's', position: [9, 7], color: '#1c1108', fontSize: '14px' },
        ],
        gate: {
          // Empty unlock requirements: the practice arena is a warm-up,
          // not a puzzle. Zone._buildGate runs _checkGateUnlock at the
          // end of construction so the gate is open the moment the
          // player arrives.
          locked: false,
          unlocksWhen: { collectedVimKeys: [] },
          position: [14, 9],
          leadsTo: 'zone_2',
        },
      },
      npcs: [],
      events: [
        {
          id: 'zone_practice_intro',
          trigger: 'onZoneEnter',
          actions: [
            {
              type: 'showNarration',
              text: 'Practice arena: hop the rocks with w / e / b until you reach the gate.',
            },
          ],
        },
      ],
    };
  }

  static create() {
    return new Zone(this._getCompleteConfig());
  }

  static getConfig() {
    return this._getCompleteConfig();
  }
}
