import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 4: Delete Canyon
 * Red cliffs and ledges where the Cursor learns deletion mechanics
 */
export class DeleteCanyonZone {
  static create() {
    const config = {
      zoneId: 'zone_4',
      name: '4. Delete Canyon',
      biome: 'Red cliffs and ledges',
      skillFocus: ['x', 'dd', 'D', 'dw'],
      puzzleTheme: 'Deletion mechanics',
      narration: [
        'The canyon walls bleed red with corrupted syntax...',
        'Bugs crawl through broken lines, spreading chaos.',
        'Only deletion can cleanse this place.',
        'Learn to cut away the corruption, but be precise - one wrong cut and all is lost.',
      ],

      // Entry from Zone 3 - place cursor at the beginning of the path
      cursorStartPosition: new Position(0, 31),

      tiles: {
        tileType: 'canyon_floor',
        // 50x32 maze layout - red canyon with cliffs and ledges
        layout: [
          // Row 0-5: Top canyon area
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          // Row 6-10: First ledge section
          'SPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          // Row 11-15: Second ledge with deletion keys
          'SPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          // Row 16-20: Third ledge section
          'SPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          // Row 21-25: Fourth ledge with more keys
          'SPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          // Row 26-31: Bottom canyon with exit
          'SPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'SMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMS',
          'PNGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGS', // Entry, NPC, Gate
        ],
        legend: {
          S: 'sand',
          M: 'wall',
          P: 'path',
          K: 'vim_key_spot',
          G: 'gate',
          N: 'npc_spot',
        },
        specialTiles: [
          {
            type: 'vim_key',
            value: 'x',
            position: [10, 6],
            description: 'x - delete character under cursor',
          },
          {
            type: 'vim_key',
            value: 'dd',
            position: [20, 11],
            description: 'dd - delete entire line',
          },
          {
            type: 'vim_key',
            value: 'D',
            position: [30, 16],
            description: 'D - delete from cursor to end of line',
          },
          { type: 'vim_key', value: 'dw', position: [40, 21], description: 'dw - delete word' },
        ],
        textLabels: [
          { text: 'corrupted', position: [15, 8] },
          { text: 'broken-line', position: [25, 13] },
          { text: 'syntax-error', position: [35, 18] },
          { text: 'bug-nest', position: [45, 23] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['x', 'dd', 'D', 'dw'] },
          position: [48, 31],
          leadsTo: 'zone_5',
        },
      },
      npcs: [
        {
          id: 'deletion_echo',
          appearsWhen: { collectedVimKeys: ['x', 'dd', 'D', 'dw'] },
          dialogue: [
            'The canyon remembers every deletion...',
            'x for precision, dd for lines, D for endings, dw for words.',
            'You have learned to cut away corruption without destroying the whole.',
            'The path ahead leads to creation - the Field of Insertion awaits.',
          ],
          position: [2, 31],
        },
      ],
      events: [
        {
          id: 'zone4_canyon_entry',
          trigger: 'onZoneEnter',
          actions: [
            {
              type: 'showNarration',
              text: 'The canyon echoes with the screams of deleted text...',
            },
            { type: 'enableDeletionMode' },
          ],
        },
        {
          id: 'zone4_first_deletion',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: 'x' },
          actions: [
            { type: 'showNarration', text: 'Character deletion mastered! The bugs retreat.' },
          ],
        },
        {
          id: 'zone4_line_deletion',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: 'dd' },
          actions: [
            { type: 'showNarration', text: 'Line deletion achieved! Broken syntax crumbles.' },
          ],
        },
        {
          id: 'zone4_unlock_gate',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['x', 'dd', 'D', 'dw'] },
          actions: [
            { type: 'showNPC', npcId: 'deletion_echo' },
            { type: 'unlockGate', targetZone: 'zone_5' },
            {
              type: 'showNarration',
              text: 'The canyon walls crack and crumble, revealing the path forward.',
            },
          ],
        },
      ],
    };

    return new Zone(config);
  }

  static getConfig() {
    return {
      zoneId: 'zone_4',
      name: '4. Delete Canyon',
      biome: 'Red cliffs and ledges',
      skillFocus: ['x', 'dd', 'D', 'dw'],
      puzzleTheme: 'Deletion mechanics',
    };
  }
}
