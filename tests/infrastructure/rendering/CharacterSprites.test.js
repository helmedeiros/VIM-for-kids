import { CharacterSprites } from '../../../src/infrastructure/rendering/CharacterSprites.js';

describe('CharacterSprites', () => {
  let sprites;

  beforeEach(() => {
    sprites = new CharacterSprites();
  });

  describe('getCursorFrame', () => {
    it('returns idle south frame at time 0 by default', () => {
      expect(sprites.getCursorFrame(0)).toBe(0);
    });

    it('uses the slow idle interval when not moving', () => {
      // Default idle interval is 0.6s. Phase alternates each interval.
      expect(sprites.getCursorFrame(0)).toBe(0);
      expect(sprites.getCursorFrame(0.59)).toBe(0);
      expect(sprites.getCursorFrame(0.6)).toBe(1);
      expect(sprites.getCursorFrame(1.2)).toBe(0);
    });

    it('uses the fast walk interval when moving', () => {
      // Walk interval is 0.18s, so frames flip much faster.
      expect(sprites.getCursorFrame(0, 's', true)).toBe(0);
      expect(sprites.getCursorFrame(0.18, 's', true)).toBe(1);
      expect(sprites.getCursorFrame(0.36, 's', true)).toBe(0);
    });

    it.each([
      ['s', 0],
      ['n', 2],
      ['e', 4],
      ['w', 6],
    ])('idle frame for direction %s is %i', (direction, expected) => {
      expect(sprites.getCursorFrame(0, direction)).toBe(expected);
    });

    it.each([
      ['s', 1],
      ['n', 3],
      ['e', 5],
      ['w', 7],
    ])('step frame for direction %s is %i', (direction, expected) => {
      // Past the first idle interval the phase is 1
      expect(sprites.getCursorFrame(0.6, direction)).toBe(expected);
    });

    it('treats unknown directions as south', () => {
      expect(sprites.getCursorFrame(0, 'bogus')).toBe(0);
    });
  });

  describe('getVimKeyFrame', () => {
    it('returns vim key frame index', () => {
      expect(sprites.getVimKeyFrame()).toBe(8);
    });
  });

  describe('getCollectibleKeyFrame', () => {
    it('returns collectible key frame index', () => {
      expect(sprites.getCollectibleKeyFrame()).toBe(9);
    });
  });

  describe('getGateFrame', () => {
    it('returns open gate frame when open', () => {
      expect(sprites.getGateFrame(true)).toBe(10);
    });

    it('returns closed gate frame when closed', () => {
      expect(sprites.getGateFrame(false)).toBe(11);
    });
  });

  describe('getNPCFrame', () => {
    it('returns frame for caret_spirit', () => {
      expect(sprites.getNPCFrame('caret_spirit')).toBe(12);
    });

    it('returns frame for bug_king', () => {
      expect(sprites.getNPCFrame('bug_king')).toBe(14);
    });

    it('returns frame for bug_king_boss', () => {
      expect(sprites.getNPCFrame('bug_king_boss')).toBe(14);
    });

    it('maps legacy IDs to correct frames', () => {
      expect(sprites.getNPCFrame('mode_guardian')).toBe(16);
      expect(sprites.getNPCFrame('scribe_poet')).toBe(18);
      expect(sprites.getNPCFrame('reflection_spirit')).toBe(20);
    });

    it('returns default frame for unknown NPC', () => {
      expect(sprites.getNPCFrame('unknown_npc')).toBe(19);
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
