/**
 * Maps game entities (cursor, NPCs, keys, gates) to character sprite sheet frames.
 * Handles time-based animation cycling for animated entities.
 */
export class CharacterSprites {
  constructor() {
    // Character canvas layout (11 cols × 2 rows = 22 frames):
    // Row 0: cursor 8 frames (4 directions × 2 walk phases), then
    //        vim_key (8), collectible_key (9), gate_open (10).
    // Row 1: gate_closed (11), NPCs caret_spirit (12) through mirror_sprite (20).
    //
    // Cursor frame index = directionOffset + phase, where
    //   directionOffset: s=0, n=2, e=4, w=6
    //   phase:           0 = idle, 1 = step

    this._cursorDirectionOffset = { s: 0, n: 2, e: 4, w: 6 };
    this._cursorWalkInterval = 0.18; // seconds per walk frame while moving
    this._cursorIdleInterval = 0.6; // seconds per frame while standing still

    this._vimKeyFrame = 8;
    this._collectibleKeyFrame = 9;
    this._gateOpenFrame = 10;
    this._gateClosedFrame = 11;

    this._npcFrames = {
      caret_spirit: 12,
      syntax_wisp: 13,
      bug_king: 14,
      bug_king_boss: 14,
      caret_stone: 15,
      maze_scribe: 16,
      mode_guardian: 16,
      deletion_echo: 17,
      insert_scribe: 18,
      scribe_poet: 18,
      the_yanker: 19,
      mirror_sprite: 20,
      reflection_spirit: 20,
      practice_buddy: 19,
      practice_spirit_1: 19,
      practice_spirit_2: 19,
      practice_spirit_3: 19,
      final_encourager: 19,
      syntax_spirit: 16,
      word_witch: 17,
      pixel_snake: 21,
    };

    this._defaultNpcFrame = 19;
  }

  getCursorFrame(time, direction = 's', moving = false) {
    const dirOffset = this._cursorDirectionOffset[direction] ?? 0;
    const interval = moving ? this._cursorWalkInterval : this._cursorIdleInterval;
    const phase = Math.floor(time / interval) % 2;
    return dirOffset + phase;
  }

  getVimKeyFrame() {
    return this._vimKeyFrame;
  }

  getCollectibleKeyFrame() {
    return this._collectibleKeyFrame;
  }

  getGateFrame(isOpen) {
    return isOpen ? this._gateOpenFrame : this._gateClosedFrame;
  }

  getNPCFrame(npcId) {
    return this._npcFrames[npcId] !== undefined ? this._npcFrames[npcId] : this._defaultNpcFrame;
  }

  hasNPC(npcId) {
    return npcId in this._npcFrames;
  }
}
