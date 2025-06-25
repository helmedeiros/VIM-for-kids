import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 8: Command Cavern
 * Rocky cave walls where the Cursor learns command mode
 */
export class CommandCavernZone {
  static create() {
    const config = {
      zoneId: 'zone_8',
      name: '8. Command Cavern',
      biome: 'Rocky cave walls',
      skillFocus: [':w', ':q', ':x', ':help'],
      puzzleTheme: 'Mastering command mode',
      narration: [
        'Ancient terminal doors block the paths...',
        'The cavern speaks only in the language of command.',
        'Learn the sacred phrases to unlock the depths.',
        'The Syntax Spirit demands exact precision.',
      ],

      // Entry connects from Zone 7's gate at [25,0] - place entry at top-center
      cursorStartPosition: new Position(25, 0),

      tiles: {
        tileType: 'cave_floor',
        // 50x32 maze layout - rocky cavern with terminal doors
        layout: [
          // Row 0-5: Entry area
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          // Row 6-10: First terminal chamber
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          // Row 11-15: Second terminal chamber with commands
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          // Row 16-20: Third terminal chamber
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          // Row 21-25: Fourth terminal chamber
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          // Row 26-31: Final chamber with exit
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRGNRRRRRRRRRRRRRRRRRRRRRR', // Gate, NPC
        ],
        legend: {
          R: 'rock',
          P: 'path',
          K: 'vim_key_spot',
          G: 'gate',
          N: 'npc_spot',
        },
        specialTiles: [
          {
            type: 'vim_key',
            value: ':w',
            position: [25, 8],
            description: ':w - write (save) file',
          },
          { type: 'vim_key', value: ':q', position: [25, 13], description: ':q - quit vim' },
          { type: 'vim_key', value: ':x', position: [25, 18], description: ':x - save and exit' },
          { type: 'vim_key', value: ':help', position: [25, 23], description: ':help - show help' },
        ],
        textLabels: [
          { text: 'write', position: [20, 10] },
          { text: 'quit', position: [30, 15] },
          { text: 'save-exit', position: [20, 20] },
          { text: 'help', position: [30, 25] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: [':w', ':q', ':x', ':help'] },
          position: [25, 31],
          leadsTo: 'zone_9',
        },
      },
      npcs: [
        {
          id: 'syntax_spirit',
          appearsWhen: { collectedVimKeys: [':w', ':q', ':x', ':help'] },
          dialogue: [
            'Excellent, Cursor. The ancient commands are yours.',
            ':w to write, :q to quit, :x to save and exit, :help for guidance.',
            'Command mode is the language of power and precision.',
            'The cavern yields to your mastery. The playground awaits your skills.',
          ],
          position: [26, 31],
        },
      ],
      events: [
        {
          id: 'zone8_cavern_entry',
          trigger: 'onZoneEnter',
          actions: [
            { type: 'showNarration', text: 'Terminal doors hum with electric energy...' },
            { type: 'enableCommandMode' },
          ],
        },
        {
          id: 'zone8_write_command',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: ':w' },
          actions: [
            { type: 'showNarration', text: 'Write command mastered! Your changes are preserved.' },
          ],
        },
        {
          id: 'zone8_quit_command',
          trigger: 'onVimKeyCollected',
          conditions: { collectedKey: ':q' },
          actions: [
            { type: 'showNarration', text: 'Quit command learned! You can leave when ready.' },
          ],
        },
        {
          id: 'zone8_unlock_gate',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: [':w', ':q', ':x', ':help'] },
          actions: [
            { type: 'showNPC', npcId: 'syntax_spirit' },
            { type: 'unlockGate', targetZone: 'zone_9' },
            { type: 'showNarration', text: 'The terminal doors slide open with a mechanical hum.' },
          ],
        },
      ],
    };

    return new Zone(config);
  }

  static getConfig() {
    return {
      zoneId: 'zone_8',
      name: '8. Command Cavern',
      biome: 'Rocky cave walls',
      skillFocus: [':w', ':q', ':x', ':help'],
      puzzleTheme: 'Mastering command mode',
    };
  }
}
