import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 7: Search Springs
 * Reflective pools where the Cursor learns search navigation
 */
export class SearchSpringsZone {
  /**
   * Get the shared configuration metadata for this zone
   * @private
   */
  static _getSharedConfig() {
    return {
      zoneId: 'zone_7',
      name: '7. Search Springs',
      biome: 'Reflective pools',
      skillFocus: ['/', '?', 'n', 'N'],
      puzzleTheme: 'Searching and navigating matches',
      narration: [
        'The pools reflect symbols out of order...',
        'Truth lies hidden in the patterns of reflection.',
        'Search forward, search backward, navigate the matches.',
        'Find the true word to unlock the deep paths.',
      ],
    };
  }

  static create() {
    const config = {
      ...this._getSharedConfig(),

      // Entry from Zone 6 - place cursor at the beginning of the path
      cursorStartPosition: new Position(25, 31),

      tiles: {
        tileType: 'spring_ground',
        // 50x32 maze layout - reflective pools with search patterns
        layout: [
          // Row 0-5: Top springs area with exit gate
          'WWWWWWWWWWWWWWWWWWWWWWWWWGWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWW', // NPC
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          // Row 6-10: First reflection pool
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          // Row 11-15: Second reflection pool with search keys
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          // Row 16-20: Third reflection pool
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          // Row 21-25: Fourth reflection pool
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          // Row 26-31: Bottom springs with entry
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW', // Entry point
        ],
        legend: {
          W: 'water',
          P: 'path',
          K: 'vim_key_spot',
          G: 'gate',
          N: 'npc_spot',
        },
        specialTiles: [
          { type: 'vim_key', value: '/', position: [10, 12], description: '/ - search forward' },
          { type: 'vim_key', value: '?', position: [25, 17], description: '? - search backward' },
          { type: 'vim_key', value: 'n', position: [35, 22], description: 'n - next match' },
          { type: 'vim_key', value: 'N', position: [40, 27], description: 'N - previous match' },
        ],
        textLabels: [
          { text: 'search', position: [15, 14] },
          { text: 'backward', position: [30, 19] },
          { text: 'next', position: [20, 24] },
          { text: 'previous', position: [45, 29] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['/', '?', 'n', 'N'] },
          position: [25, 0],
          leadsTo: 'zone_8',
        },
      },
      npcs: [
        {
          id: 'reflection_spirit',
          appearsWhen: { collectedVimKeys: ['/', '?', 'n', 'N'] },
          dialogue: [
            'The reflections clear, revealing truth...',
            '/ searches forward, ? searches backward.',
            'n finds the next, N finds the previous.',
            'You have learned to trace patterns through reflection. The cavern awaits.',
          ],
          position: [25, 1],
        },
      ],
      events: [
        {
          id: 'zone7_springs_entry',
          trigger: 'onZoneEnter',
          actions: [
            { type: 'showNarration', text: 'The pools shimmer with hidden patterns...' },
            { type: 'enableSearchMode' },
          ],
        },
        {
          id: 'zone7_forward_search',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: '/' },
          actions: [
            {
              type: 'showNarration',
              text: 'Forward search mastered! The patterns reveal themselves.',
            },
          ],
        },
        {
          id: 'zone7_backward_search',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: '?' },
          actions: [
            { type: 'showNarration', text: 'Backward search achieved! Time flows in reverse.' },
          ],
        },
        {
          id: 'zone7_unlock_gate',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['/', '?', 'n', 'N'] },
          actions: [
            { type: 'showNPC', npcId: 'reflection_spirit' },
            { type: 'unlockGate', targetZone: 'zone_8' },
            {
              type: 'showNarration',
              text: 'The true word emerges from the reflections, opening the path.',
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
