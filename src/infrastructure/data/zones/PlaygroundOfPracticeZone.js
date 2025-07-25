import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 9: Playground of Practice
 * Testing grounds and sandbox where the Cursor reinforces all skills
 */
export class PlaygroundOfPracticeZone {
  /**
   * Get the shared configuration metadata for this zone
   * @private
   */
  static _getSharedConfig() {
    return {
      zoneId: 'zone_9',
      name: '9. Playground of Practice',
      biome: 'Testing grounds, sandbox',
      skillFocus: [
        'h',
        'j',
        'k',
        'l',
        'i',
        'ESC',
        'w',
        'e',
        'b',
        'x',
        'dd',
        'yy',
        'p',
        '/',
        'n',
        ':w',
      ],
      puzzleTheme: 'Freestyle challenges',
      narration: [
        'Welcome to the Playground, young Cursor...',
        'Here, all your skills will be tested without guidance.',
        'No hints, no help - only your mastery and intuition.',
        'The friendly spirits watch, but they offer only encouragement.',
      ],
    };
  }

  static create() {
    const config = {
      ...this._getSharedConfig(),

      // Entry from Zone 8 - place cursor at the beginning of the path (on walkable tile)
      cursorStartPosition: new Position(24, 31),

      tiles: {
        tileType: 'practice_ground',
        // 50x32 maze layout - complex testing ground with all skill types
        layout: [
          // Row 0-5: Top area with final gate
          'TTTTTTTTTTTTTTTTTTTTTTTTGNTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          // Row 6-10: Movement challenge area
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          // Row 11-15: Word navigation area
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          // Row 16-20: Editing challenge area
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          // Row 21-25: Search and command area
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          // Row 26-31: Final challenge area with entry
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
          'TTTTTTTTTTTTTTTTTTTTTTTTPTTTTTTTTTTTTTTTTTTTTTTTTT', // Entry point
        ],
        legend: {
          T: 'test_ground',
          P: 'path',
          K: 'vim_key_spot',
          G: 'gate',
          N: 'npc_spot',
        },
        specialTiles: [
          // Mixed skills scattered throughout
          { type: 'vim_key', value: 'h', position: [5, 7], description: 'h - left (review)' },
          { type: 'vim_key', value: 'l', position: [45, 7], description: 'l - right (review)' },
          {
            type: 'vim_key',
            value: 'w',
            position: [10, 12],
            description: 'w - word forward (review)',
          },
          {
            type: 'vim_key',
            value: 'b',
            position: [40, 12],
            description: 'b - word back (review)',
          },
          {
            type: 'vim_key',
            value: 'x',
            position: [15, 17],
            description: 'x - delete char (review)',
          },
          {
            type: 'vim_key',
            value: 'yy',
            position: [35, 17],
            description: 'yy - yank line (review)',
          },
          { type: 'vim_key', value: '/', position: [20, 22], description: '/ - search (review)' },
          { type: 'vim_key', value: ':w', position: [30, 22], description: ':w - write (review)' },
          // Final mastery key
          {
            type: 'vim_key',
            value: 'mastery',
            position: [25, 27],
            description: 'Complete mastery of all VIM skills',
          },
        ],
        textLabels: [
          { text: 'movement', position: [25, 9] },
          { text: 'navigation', position: [25, 14] },
          { text: 'editing', position: [25, 19] },
          { text: 'commands', position: [25, 24] },
          { text: 'MASTERY', position: [25, 29] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['h', 'l', 'w', 'b', 'x', 'yy', '/', ':w', 'mastery'] },
          position: [25, 0],
          leadsTo: 'zone_10',
        },
      },
      npcs: [
        {
          id: 'practice_buddy_1',
          type: 'practice_buddy',
          appearsWhen: { collectedVimKeys: ['h', 'l'] },
          dialogue: [
            '🎉 Hey there, superstar! Welcome to Practice Central!',
            "I'm your Practice Buddy - here to cheer you on!",
            '*Bounces with excitement*',
            "Ready to show me what you've learned?",
            'Every skill you practice makes you stronger! 💪',
          ],
          position: [10, 8],
        },
        {
          id: 'practice_buddy_2',
          type: 'practice_buddy',
          appearsWhen: { collectedVimKeys: ['w', 'b'] },
          dialogue: [
            '🚀 Look at you go! Those first skills are solid!',
            'The foundation is looking strong!',
            '*Does a little victory dance*',
            "Keep exploring - there's so much more to discover!",
          ],
          position: [40, 13],
        },
        {
          id: 'practice_buddy_3',
          type: 'practice_buddy',
          appearsWhen: { collectedVimKeys: ['x', 'yy'] },
          dialogue: [
            "⚡ WOW! You're really getting the hang of this!",
            'I love seeing your confidence grow!',
            '*Jumps up and down with joy*',
            "You're becoming a real VIM warrior!",
          ],
          position: [25, 18],
        },
        {
          id: 'final_practice_buddy',
          type: 'practice_buddy',
          appearsWhen: { collectedVimKeys: ['h', 'l', 'w', 'b', 'x', 'yy', '/', ':w', 'mastery'] },
          dialogue: [
            '🌟 LEGENDARY STATUS ACHIEVED! 🌟',
            "You're absolutely amazing!",
            "I've watched you grow from beginner to master!",
            '*Explodes with pride and joy*',
            "You're ready to face any text editing challenge!",
            'The playground celebrates your mastery!',
          ],
          position: [26, 0],
        },
      ],
      events: [
        {
          id: 'zone9_playground_entry',
          trigger: 'onZoneEnter',
          actions: [
            {
              type: 'showNarration',
              text: 'No guidance here - only your skills and determination.',
            },
            { type: 'disableHints' },
          ],
        },
        {
          id: 'zone9_movement_complete',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['h', 'l'] },
          actions: [
            { type: 'showNPC', npcId: 'practice_spirit_1' },
            { type: 'showNarration', text: 'Movement skills confirmed. Progress noted.' },
          ],
        },
        {
          id: 'zone9_navigation_complete',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['w', 'b'] },
          actions: [
            { type: 'showNPC', npcId: 'practice_spirit_2' },
            { type: 'showNarration', text: 'Navigation skills verified. Advancement recorded.' },
          ],
        },
        {
          id: 'zone9_editing_complete',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['x', 'yy'] },
          actions: [
            { type: 'showNPC', npcId: 'practice_spirit_3' },
            { type: 'showNarration', text: 'Editing mastery demonstrated. Excellence achieved.' },
          ],
        },
        {
          id: 'zone9_unlock_gate',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['h', 'l', 'w', 'b', 'x', 'yy', '/', ':w', 'mastery'] },
          actions: [
            { type: 'showNPC', npcId: 'final_encourager' },
            { type: 'unlockGate', targetZone: 'zone_10' },
            {
              type: 'showNarration',
              text: 'All skills mastered! The temple gates open before you.',
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
