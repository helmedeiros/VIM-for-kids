import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone 10: The Syntax Temple
 * Final boss zone with coastal ruins where the Cursor faces the Bug King
 */
export class SyntaxTempleZone {
  static create() {
    const config = {
      zoneId: 'zone_10',
      name: '10. The Syntax Temple',
      biome: 'Coastal ruins, golden gates',
      skillFocus: ['all_vim_skills'],
      puzzleTheme: 'Apply all skills to save Textland',
      narration: [
        'The temple rises from the mist, ancient and corrupted...',
        'The Bug King awaits at the summit, chaos incarnate.',
        'Every skill you have learned will be tested here.',
        'This is your final trial, Cursor. Save Textland.',
      ],

      // Entry connects from Zone 9's gate at [25,0] - place entry at top-center
      cursorStartPosition: new Position(25, 0),

      tiles: {
        tileType: 'temple_floor',
        // 50x32 maze layout - temple with ascending levels
        layout: [
          // Row 0-5: Entry area
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          // Row 6-10: First temple level
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          // Row 11-15: Second temple level
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          // Row 16-20: Third temple level
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          // Row 21-25: Fourth temple level
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          // Row 26-31: Final temple summit with Bug King
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRPRRRRRRRRRRRRRRRRRRRRRRRR',
          'RRRRRRRRRRRRRRRRRRRRRRRRRBNRRRRRRRRRRRRRRRRRRRRRR', // Bug King Boss, Victory NPC
        ],
        legend: {
          R: 'ruins',
          P: 'path',
          B: 'boss_area',
          N: 'npc_spot',
        },
        specialTiles: [
          // Final boss challenge - no keys, just boss fight
          {
            type: 'boss_encounter',
            value: 'bug_king',
            position: [25, 31],
            description: 'The Bug King - Final Boss',
          },
        ],
        textLabels: [
          { text: 'TEMPLE', position: [25, 8] },
          { text: 'ASCEND', position: [25, 13] },
          { text: 'SUMMIT', position: [25, 18] },
          { text: 'FINAL', position: [25, 23] },
          { text: 'BUG KING', position: [25, 28] },
        ],
        gate: {
          locked: false, // No gate - this is the final zone
          position: null,
          leadsTo: null,
        },
      },
      npcs: [
        {
          id: 'bug_king_boss',
          appearsWhen: { zoneEntered: true },
          dialogue: [
            'SSSSSO... THE CURSSSSOR COMESSS AT LASSSST...',
            'I AM THE BUG KING! CORRUPTOR OF SSSSYNTAX!',
            'YOUR FEEBLE SSSKILLSSS CANNOT SSSTOP THE CHAOSSS!',
            'PREPARE TO BE OVERWRRRRRITTEN!',
          ],
          position: [25, 31],
          isBoss: true,
          health: 100,
          phases: [
            {
              id: 'movement_phase',
              requiredSkills: ['h', 'j', 'k', 'l'],
              dialogue: 'FIRSSST, I WILL SSSCRAMBLE YOUR MOVEMENT!',
            },
            {
              id: 'editing_phase',
              requiredSkills: ['x', 'dd', 'i', 'a'],
              dialogue: 'NOW I CORRUPT YOUR EDITING POWERSSS!',
            },
            {
              id: 'final_phase',
              requiredSkills: ['/', ':w', 'yy', 'p'],
              dialogue: 'THISSS ISSS THE END, CURSSSSOR!',
            },
          ],
        },
        {
          id: 'victory_spirit',
          appearsWhen: { bossDefeated: 'bug_king_boss' },
          dialogue: [
            'Victory! The Bug King is defeated!',
            'Textland is saved, and syntax flows freely once more.',
            'You have mastered all of VIM, noble Cursor.',
            'The world of text bows to your expertise. Well done!',
          ],
          position: [26, 31],
        },
      ],
      events: [
        {
          id: 'zone10_temple_entry',
          trigger: 'onZoneEnter',
          actions: [
            { type: 'showNarration', text: 'The temple trembles with corrupted power...' },
            { type: 'startBossMusic' },
            { type: 'enableAllSkills' },
          ],
        },
        {
          id: 'zone10_boss_encounter',
          trigger: 'onStepOnTile',
          conditions: { tileType: 'boss_area' },
          actions: [
            { type: 'startBossFight', bossId: 'bug_king_boss' },
            { type: 'showNarration', text: 'The final battle begins!' },
          ],
        },
        {
          id: 'zone10_boss_phase_1',
          trigger: 'onBossPhase',
          conditions: { phase: 'movement_phase' },
          actions: [
            { type: 'scrambleMovement' },
            { type: 'showNarration', text: 'The Bug King attacks your movement skills!' },
          ],
        },
        {
          id: 'zone10_boss_phase_2',
          trigger: 'onBossPhase',
          conditions: { phase: 'editing_phase' },
          actions: [
            { type: 'corruptEditing' },
            { type: 'showNarration', text: 'Your editing commands are under assault!' },
          ],
        },
        {
          id: 'zone10_boss_defeated',
          trigger: 'onBossDefeated',
          conditions: { bossId: 'bug_king_boss' },
          actions: [
            { type: 'showNPC', npcId: 'victory_spirit' },
            { type: 'playVictoryMusic' },
            {
              type: 'showNarration',
              text: 'The temple crumbles as order is restored to Textland!',
            },
            { type: 'showCredits' },
            { type: 'gameComplete' },
          ],
        },
      ],
    };

    return new Zone(config);
  }

  static getConfig() {
    return {
      zoneId: 'zone_10',
      name: '10. The Syntax Temple',
      biome: 'Coastal ruins, golden gates',
      skillFocus: ['all_vim_skills'],
      puzzleTheme: 'Apply all skills to save Textland',
    };
  }
}
