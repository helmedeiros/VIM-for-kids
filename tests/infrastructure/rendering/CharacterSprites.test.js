import { CharacterSprites } from '../../../src/infrastructure/rendering/CharacterSprites.js';

describe('CharacterSprites', () => {
  let sprites;

  beforeEach(() => {
    sprites = new CharacterSprites();
  });

  describe('getCursorFrame', () => {
    it('returns first frame at time 0', () => {
      expect(sprites.getCursorFrame(0)).toBe(0);
    });

    it('cycles through blink frames', () => {
      expect(sprites.getCursorFrame(0)).toBe(0);
      expect(sprites.getCursorFrame(0.5)).toBe(1);
      expect(sprites.getCursorFrame(1.0)).toBe(2);
      expect(sprites.getCursorFrame(1.5)).toBe(3);
    });

    it('loops back to first frame', () => {
      expect(sprites.getCursorFrame(2.0)).toBe(0);
    });

    it('handles fractional time within frame', () => {
      expect(sprites.getCursorFrame(0.25)).toBe(0);
      expect(sprites.getCursorFrame(0.75)).toBe(1);
    });
  });

  describe('getVimKeyFrame', () => {
    it('returns vim key frame index', () => {
      expect(sprites.getVimKeyFrame()).toBe(4);
    });
  });

  describe('getCollectibleKeyFrame', () => {
    it('returns collectible key frame index', () => {
      expect(sprites.getCollectibleKeyFrame()).toBe(5);
    });
  });

  describe('getGateFrame', () => {
    it('returns open gate frame when open', () => {
      expect(sprites.getGateFrame(true)).toBe(6);
    });

    it('returns closed gate frame when closed', () => {
      expect(sprites.getGateFrame(false)).toBe(10);
    });
  });

  describe('getNPCFrame', () => {
    it('returns frame for caret_spirit', () => {
      expect(sprites.getNPCFrame('caret_spirit')).toBe(11);
    });

    it('returns frame for bug_king', () => {
      expect(sprites.getNPCFrame('bug_king')).toBe(13);
    });

    it('returns frame for bug_king_boss', () => {
      expect(sprites.getNPCFrame('bug_king_boss')).toBe(13);
    });

    it('maps legacy IDs to correct frames', () => {
      expect(sprites.getNPCFrame('mode_guardian')).toBe(15);
      expect(sprites.getNPCFrame('scribe_poet')).toBe(17);
      expect(sprites.getNPCFrame('reflection_spirit')).toBe(19);
    });

    it('returns default frame for unknown NPC', () => {
      expect(sprites.getNPCFrame('unknown_npc')).toBe(18);
    });
  });

  describe('hasNPC', () => {
    it('returns true for known NPCs', () => {
      expect(sprites.hasNPC('caret_spirit')).toBe(true);
      expect(sprites.hasNPC('bug_king')).toBe(true);
      expect(sprites.hasNPC('deletion_echo')).toBe(true);
    });

    it('returns false for unknown NPCs', () => {
      expect(sprites.hasNPC('unknown')).toBe(false);
    });
  });
});
