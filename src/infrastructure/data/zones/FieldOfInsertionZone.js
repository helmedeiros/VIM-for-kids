import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 5: Field of Insertion
 * Lush plains with chalk paths where the Cursor learns insertion mechanics
 */
export class FieldOfInsertionZone {
  /**
   * Get the shared configuration metadata for this zone
   * @private
   */
  static _getSharedConfig() {
    return {
      zoneId: 'zone_5',
      name: '5. Field of Insertion',
      biome: 'Lush plains, chalk paths',
      skillFocus: ['i', 'a', 'o', 'O'],
      puzzleTheme: 'Insertion and line positioning',
      narration: [
        'The fields shimmer with potential text...',
        'Here, creation flows like rivers of ink.',
        'Learn the four ways to enter the realm of insertion.',
        'The Scribe waits to share the poetry of the Insert Path.',
      ],
    };
  }

  static create() {
    const config = {
      ...this._getSharedConfig(),

      // Entry from Zone 4 - place cursor at the beginning of the path
      cursorStartPosition: new Position(49, 31),

      tiles: {
        tileType: 'grass_field',
        // 50x32 maze layout - lush plains with chalk paths
        layout: [
          // Row 0-5: Top field area with gate to next zone
          'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          // Row 6-10: First chalk path section
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          // Row 11-15: Second field section with insertion keys
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          // Row 16-20: Third field section
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          // Row 21-25: Fourth field section
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          // Row 26-31: Bottom field with entry and scribe
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFNP', // Entry point, NPC
        ],
        legend: {
          F: 'field',
          P: 'path',
          K: 'vim_key_spot',
          G: 'gate',
          N: 'npc_spot',
        },
        specialTiles: [
          {
            type: 'vim_key',
            value: 'i',
            position: [10, 7],
            description: 'i - insert before cursor',
          },
          {
            type: 'vim_key',
            value: 'a',
            position: [25, 12],
            description: 'a - append after cursor',
          },
          { type: 'vim_key', value: 'o', position: [35, 17], description: 'o - open line below' },
          { type: 'vim_key', value: 'O', position: [40, 22], description: 'O - open line above' },
        ],
        textLabels: [
          { text: 'insert', position: [15, 9] },
          { text: 'append', position: [30, 14] },
          { text: 'open-below', position: [20, 19] },
          { text: 'open-above', position: [45, 24] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['i', 'a', 'o', 'O'] },
          position: [25, 0],
          leadsTo: 'zone_6',
        },
      },
      npcs: [
        {
          id: 'scribe_poet',
          appearsWhen: { collectedVimKeys: ['i', 'a', 'o', 'O'] },
          dialogue: [
            'Ah, young Cursor, you have learned the Four Insertions!',
            'i before, a after, o below, O above - the sacred rhythm.',
            'Text flows like poetry when you know where to place your words.',
            'The field remembers your creativity. Go forth to the Circle of Copying.',
          ],
          position: [47, 31],
        },
      ],
      events: [
        {
          id: 'zone5_field_entry',
          trigger: 'onZoneEnter',
          actions: [
            { type: 'showNarration', text: 'The fields pulse with creative energy...' },
            { type: 'enableInsertMode' },
          ],
        },
        {
          id: 'zone5_first_insert',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: 'i' },
          actions: [
            { type: 'showNarration', text: 'Insert mode awakened! The field accepts your input.' },
          ],
        },
        {
          id: 'zone5_append_mode',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: 'a' },
          actions: [
            { type: 'showNarration', text: 'Append mastered! Text flows after your cursor.' },
          ],
        },
        {
          id: 'zone5_unlock_gate',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['i', 'a', 'o', 'O'] },
          actions: [
            { type: 'showNPC', npcId: 'scribe_poet' },
            { type: 'unlockGate', targetZone: 'zone_6' },
            {
              type: 'showNarration',
              text: 'The field blooms with new text, opening the path forward.',
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
