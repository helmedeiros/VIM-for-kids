import { Zone } from '../../../domain/entities/Zone.js';

/**
 * Factory for Zone 1: Blinking Grove
 * Forest clearing where the Cursor learns basic movement (h, j, k, l)
 */
export class BlinkingGroveZone {
  static create() {
    const config = {
      zoneId: 'zone_1',
      name: '1. Blinking Grove',
      biome: 'Forest clearing (bottom left)',
      skillFocus: ['h', 'j', 'k', 'l'],
      puzzleTheme: 'Basic movement, bump-to-talk',
      narration: [
        'Once, the world was clear. Text flowed like rivers, perfectly aligned. But the Bugs came...',
        'Then, from the Blinking Grove, a spark appeared. A light not of fire… but of focus. You.',
        "✨ *Hello, Cursor.* You don't remember much. But the land does. And the land remembers you.",
        '> Try walking with the keys the wind left behind...',
      ],
      tiles: {
        tileType: 'forest_ground',
        specialTiles: [
          { type: 'vim_key', value: 'h', position: [3, 3] },
          { type: 'vim_key', value: 'j', position: [3, 4] },
          { type: 'vim_key', value: 'k', position: [4, 3] },
          { type: 'vim_key', value: 'l', position: [4, 4] },
        ],
        textLabels: [
          { text: 'Hello', position: [6, 5] },
          { text: 'world!', position: [6, 6] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          position: [8, 5],
          leadsTo: 'zone_2',
        },
      },
      npcs: [
        {
          id: 'caret_stone',
          appearsWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          dialogue: [
            'Very good, oh Shadowy One.',
            'You have learned the Four Motions: h, j, k, l – the Way of the Cursor.',
            'Your path continues through the gate.',
            'But beware: not all words are the same. Some are words. Others are WORDS.',
          ],
          position: [6, 3],
        },
      ],
      events: [
        {
          id: 'zone1_intro_lock',
          trigger: 'onZoneEnter',
          actions: [
            { type: 'disableMovement' },
            { type: 'showNarration', text: 'Try walking with the keys the wind left behind...' },
          ],
        },
        {
          id: 'zone1_unlock_gate',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['h', 'j', 'k', 'l'] },
          actions: [
            { type: 'showNPC', npcId: 'caret_stone' },
            { type: 'unlockGate', targetZone: 'zone_2' },
            { type: 'playMusic', track: 'zone1_complete' },
            { type: 'showNarration', text: 'And so begins your journey...' },
          ],
        },
      ],
    };

    return new Zone(config);
  }

  /**
   * Get the zone configuration object (without creating a Zone instance)
   * Useful for serialization or configuration inspection
   */
  static getConfig() {
    return {
      zoneId: 'zone_1',
      name: '1. Blinking Grove',
      biome: 'Forest clearing (bottom left)',
      skillFocus: ['h', 'j', 'k', 'l'],
      puzzleTheme: 'Basic movement, bump-to-talk',
      narration: [
        'Once, the world was clear. Text flowed like rivers, perfectly aligned. But the Bugs came...',
        'Then, from the Blinking Grove, a spark appeared. A light not of fire… but of focus. You.',
        "✨ *Hello, Cursor.* You don't remember much. But the land does. And the land remembers you.",
        '> Try walking with the keys the wind left behind...',
      ],
      tiles: {
        tileType: 'forest_ground',
        specialTiles: [
          { type: 'vim_key', value: 'h', position: [3, 3] },
          { type: 'vim_key', value: 'j', position: [3, 4] },
          { type: 'vim_key', value: 'k', position: [4, 3] },
          { type: 'vim_key', value: 'l', position: [4, 4] },
        ],
        textLabels: [
          { text: 'Hello', position: [6, 5] },
          { text: 'world!', position: [6, 6] },
        ],
        gate: {
          locked: true,
          unlocksWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          position: [8, 5],
          leadsTo: 'zone_2',
        },
      },
      npcs: [
        {
          id: 'caret_stone',
          appearsWhen: { collectedVimKeys: ['h', 'j', 'k', 'l'] },
          dialogue: [
            'Very good, oh Shadowy One.',
            'You have learned the Four Motions: h, j, k, l – the Way of the Cursor.',
            'Your path continues through the gate.',
            'But beware: not all words are the same. Some are words. Others are WORDS.',
          ],
          position: [6, 3],
        },
      ],
      events: [
        {
          id: 'zone1_intro_lock',
          trigger: 'onZoneEnter',
          actions: [
            { type: 'disableMovement' },
            { type: 'showNarration', text: 'Try walking with the keys the wind left behind...' },
          ],
        },
        {
          id: 'zone1_unlock_gate',
          trigger: 'onVimKeysCollected',
          conditions: { collectedKeys: ['h', 'j', 'k', 'l'] },
          actions: [
            { type: 'showNPC', npcId: 'caret_stone' },
            { type: 'unlockGate', targetZone: 'zone_2' },
            { type: 'playMusic', track: 'zone1_complete' },
            { type: 'showNarration', text: 'And so begins your journey...' },
          ],
        },
      ],
    };
  }
}
