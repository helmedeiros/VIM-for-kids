import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 6: Copy Circle
 * Calm, ring-shaped stone garden where the Cursor learns copying and pasting
 */
export class CopyCircleZone {
  /**
   * Get the shared configuration metadata for this zone
   * @private
   */
  static _getSharedConfig() {
    return {
      zoneId: 'zone_6',
      name: '6. Copy Circle',
      biome: 'Calm, ring-shaped stone garden',
      skillFocus: ['yy', 'p', 'P', 'd'],
      puzzleTheme: 'Copying, pasting, deleting',
      narration: [
        'The stone circle hums with echoes of duplicated text...',
        'Here, the ancient art of yank and put is practiced.',
        'Learn to copy without corruption, paste without chaos.',
        'The Yanker teaches the harmony of duplication and placement.',
      ],
    };
  }

  static create() {
    const config = {
      ...this._getSharedConfig(),

      // Entry from Zone 5 - place cursor at the beginning of the path
      cursorStartPosition: new Position(25, 0),

      tiles: {
        tileType: 'stone_garden',
        // 50x32 maze layout - circular stone garden
        layout: [
          // Row 0-5: Entry and outer ring
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          // Row 6-10: Outer ring with first keys
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          // Row 11-15: Middle ring
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          // Row 16-20: Inner circle with center
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          // Row 21-25: Inner circle continues
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          // Row 26-31: Bottom ring with exit
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWGNWWWWWWWWWWWWWWWWWWWWWWWW', // Gate, NPC
        ],
        legend: {
          W: 'wall',
          P: 'path',
          K: 'vim_key_spot',
          G: 'gate',
          N: 'npc_spot',
        },
        specialTiles: [
          { type: 'vim_key', value: 'yy', position: [25, 8], description: 'yy - yank (copy) line' },
          {
            type: 'vim_key',
            value: 'p',
            position: [25, 13],
            description: 'p - put (paste) after cursor',
          },
          {
            type: 'vim_key',
            value: 'P',
            position: [25, 18],
            description: 'P - put (paste) before cursor',
          },
          {
            type: 'vim_key',
            value: 'd',
            position: [25, 23],
            description: 'd - delete (cut) for pasting',
          },
        ],
        textLabels: [
          { text: 'yank', position: [20, 10] },
          { text: 'put-after', position: [30, 15] },
          { text: 'put-before', position: [20, 20] },
          { text: 'cut', position: [30, 25] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['yy', 'p', 'P', 'd'] },
          position: [25, 31],
          leadsTo: 'zone_7',
        },
      },
      npcs: [
        {
          id: 'the_yanker',
          appearsWhen: { collectedVimKeys: ['yy', 'p', 'P', 'd'] },
          dialogue: [
            'Perfect harmony, young Cursor! You have mastered the Circle.',
            'yy to yank, p to put after, P to put before, d to cut.',
            'Text flows in perfect circles - copy, paste, duplicate, move.',
            'The circle is complete. Seek now the reflective pools of Search Springs.',
          ],
          position: [26, 31],
        },
      ],
      events: [
        {
          id: 'zone6_circle_entry',
          trigger: 'onZoneEnter',
          actions: [
            { type: 'showNarration', text: 'The stone circle resonates with copied text...' },
            { type: 'enableYankMode' },
          ],
        },
        {
          id: 'zone6_first_yank',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: 'yy' },
          actions: [{ type: 'showNarration', text: 'Yank mastered! Text echoes in the stone.' }],
        },
        {
          id: 'zone6_first_put',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: 'p' },
          actions: [
            { type: 'showNarration', text: 'Put achieved! The circle accepts your offering.' },
          ],
        },
        {
          id: 'zone6_unlock_gate',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['yy', 'p', 'P', 'd'] },
          actions: [
            { type: 'showNPC', npcId: 'the_yanker' },
            { type: 'unlockGate', targetZone: 'zone_7' },
            {
              type: 'showNarration',
              text: 'The circle spins, opening a path to the springs beyond.',
            },
          ],
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
      cursorStartPosition: tempZone.cursorStartPosition,
      tiles: tempZone.tiles,
      npcs: tempZone.npcs,
      events: tempZone.events,
    };
  }
}
