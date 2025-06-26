import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 9: Playground of Practice
 * Testing grounds and sandbox where the Cursor reinforces all skills
 */
export class PlaygroundOfPracticeZone {
  static create() {
    const config = {
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
          id: 'practice_spirit_1',
          appearsWhen: { collectedVimKeys: ['h', 'l'] },
          dialogue: [
            'Good work on movement! Keep practicing.',
            'Remember: muscle memory is key to VIM mastery.',
          ],
          position: [10, 8],
        },
        {
          id: 'practice_spirit_2',
          appearsWhen: { collectedVimKeys: ['w', 'b'] },
          dialogue: [
            'Word navigation mastered! You are progressing well.',
            'Combine these skills for maximum efficiency.',
          ],
          position: [40, 13],
        },
        {
          id: 'practice_spirit_3',
          appearsWhen: { collectedVimKeys: ['x', 'yy'] },
          dialogue: [
            'Editing skills sharp! You can shape text at will.',
            'The power of creation and destruction is yours.',
          ],
          position: [25, 18],
        },
        {
          id: 'final_encourager',
          appearsWhen: { collectedVimKeys: ['h', 'l', 'w', 'b', 'x', 'yy', '/', ':w', 'mastery'] },
          dialogue: [
            'Incredible, Cursor! You have mastered all the skills.',
            'Movement, navigation, editing, searching, commands - all yours.',
            'You are ready for the final challenge. Face the Bug King!',
            'The Syntax Temple awaits your arrival.',
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
    };
  }
}
