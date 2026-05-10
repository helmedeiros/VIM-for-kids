/**
 * Maps game entities (cursor, NPCs, keys, gates) to character sprite sheet frames.
 * Handles time-based animation cycling for animated entities.
 */
export class CharacterSprites {
  constructor() {
    // Frame layout in characters.png sprite sheet (16x16, 10 columns):
    // Row 0: cursor (4 blink frames), vim keys (h, j, k, l), collectible key, gate open
    // Row 1: gate closed, NPCs (caret_spirit, syntax_wisp, bug_king, caret_stone,
    //         maze_scribe, deletion_echo, insert_scribe, mirror_sprite, practice_buddy)

    this._cursorFrames = [0, 1, 2, 3];
    this._cursorBlinkInterval = 0.5; // seconds per frame

    this._vimKeyFrame = 4;
    this._collectibleKeyFrame = 5;
    this._gateOpenFrame = 6;
    this._gateClosedFrame = 10;

    this._npcFrames = {
      caret_spirit: 11,
      syntax_wisp: 12,
      bug_king: 13,
      bug_king_boss: 13,
      caret_stone: 14,
      maze_scribe: 15,
      mode_guardian: 15,
      deletion_echo: 16,
      insert_scribe: 17,
      scribe_poet: 17,
      the_yanker: 18,
      mirror_sprite: 19,
      reflection_spirit: 19,
      practice_buddy: 18,
      practice_spirit_1: 18,
      practice_spirit_2: 18,
      practice_spirit_3: 18,
      final_encourager: 18,
      syntax_spirit: 15,
      word_witch: 16,
    };

    this._defaultNpcFrame = 18;
  }

  getCursorFrame(time) {
    const frameIndex = Math.floor(time / this._cursorBlinkInterval) % this._cursorFrames.length;
    return this._cursorFrames[frameIndex];
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
