import { Decoration } from '../../../src/domain/value-objects/Decoration.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('Decoration', () => {
  describe('construction', () => {
    it('builds a decoration with anchor, regionName, footprint, blocking', () => {
      const d = new Decoration({
        regionName: 'tree_big',
        anchor: new Position(5, 7),
        footprintW: 2,
        footprintH: 2,
        blocking: true,
      });

      expect(d.regionName).toBe('tree_big');
      expect(d.anchor.equals(new Position(5, 7))).toBe(true);
      expect(d.footprintW).toBe(2);
      expect(d.footprintH).toBe(2);
      expect(d.blocking).toBe(true);
    });

    it('defaults blocking to false when omitted', () => {
      const d = new Decoration({
        regionName: 'flower_bed',
        anchor: new Position(0, 0),
        footprintW: 1,
        footprintH: 1,
      });
      expect(d.blocking).toBe(false);
    });

    it('throws when regionName is missing', () => {
      expect(
        () =>
          new Decoration({
            anchor: new Position(0, 0),
            footprintW: 1,
            footprintH: 1,
          })
      ).toThrow(/regionName/);
    });

    it('throws when anchor is not a Position', () => {
      expect(
        () =>
          new Decoration({
            regionName: 'x',
            anchor: { x: 0, y: 0 },
            footprintW: 1,
            footprintH: 1,
          })
      ).toThrow(/Position/);
    });

    it('throws when footprint is not a positive integer', () => {
      const base = { regionName: 'x', anchor: new Position(0, 0) };
      expect(() => new Decoration({ ...base, footprintW: 0, footprintH: 1 })).toThrow(/footprint/);
      expect(() => new Decoration({ ...base, footprintW: 1, footprintH: -1 })).toThrow(/footprint/);
      expect(() => new Decoration({ ...base, footprintW: 1.5, footprintH: 1 })).toThrow(
        /footprint/
      );
    });
  });

  describe('occupies(position)', () => {
    const d = new Decoration({
      regionName: 'tree',
      anchor: new Position(3, 4),
      footprintW: 2,
      footprintH: 3,
    });

    it('returns true for every cell inside the footprint rectangle', () => {
      expect(d.occupies(new Position(3, 4))).toBe(true);
      expect(d.occupies(new Position(4, 4))).toBe(true);
      expect(d.occupies(new Position(3, 5))).toBe(true);
      expect(d.occupies(new Position(4, 6))).toBe(true);
    });

    it('returns false for cells outside the footprint', () => {
      expect(d.occupies(new Position(2, 4))).toBe(false);
      expect(d.occupies(new Position(5, 4))).toBe(false);
      expect(d.occupies(new Position(3, 3))).toBe(false);
      expect(d.occupies(new Position(3, 7))).toBe(false);
    });
  });

  describe('blocks(position)', () => {
    it('returns true for every occupied cell when collisionFootprintH is omitted', () => {
      const d = new Decoration({
        regionName: 'tree_2x2',
        anchor: new Position(5, 5),
        footprintW: 2,
        footprintH: 2,
        blocking: true,
      });

      expect(d.blocks(new Position(5, 5))).toBe(true);
      expect(d.blocks(new Position(6, 5))).toBe(true);
      expect(d.blocks(new Position(5, 6))).toBe(true);
      expect(d.blocks(new Position(6, 6))).toBe(true);
    });

    it('returns false for every cell when blocking is false', () => {
      const d = new Decoration({
        regionName: 'flowers',
        anchor: new Position(5, 5),
        footprintW: 2,
        footprintH: 2,
      });
      expect(d.blocks(new Position(5, 5))).toBe(false);
      expect(d.blocks(new Position(6, 6))).toBe(false);
    });

    it('with collisionFootprintH=1 only the bottom row of a 2x2 blocks', () => {
      const d = new Decoration({
        regionName: 'rock_2x2',
        anchor: new Position(10, 4),
        footprintW: 2,
        footprintH: 2,
        blocking: true,
        collisionFootprintH: 1,
      });

      // Top row is visually occupied but NOT blocking — player can pass.
      expect(d.occupies(new Position(10, 4))).toBe(true);
      expect(d.occupies(new Position(11, 4))).toBe(true);
      expect(d.blocks(new Position(10, 4))).toBe(false);
      expect(d.blocks(new Position(11, 4))).toBe(false);

      // Bottom row blocks.
      expect(d.blocks(new Position(10, 5))).toBe(true);
      expect(d.blocks(new Position(11, 5))).toBe(true);
    });

    it('with collisionFootprintYOffset shifts the collision band up so the front rows are walk-over', () => {
      // 3x4 house: top row = roof (walk-behind), middle 2 rows = walls+door (block),
      // bottom row = shadow on the sand (walk-over from in front).
      const d = new Decoration({
        regionName: 'house_orange',
        anchor: new Position(30, 6),
        footprintW: 3,
        footprintH: 4,
        blocking: true,
        collisionFootprintH: 2,
        collisionFootprintYOffset: 1,
      });

      // Top row (roof): walk-behind
      expect(d.blocks(new Position(30, 6))).toBe(false);
      expect(d.blocks(new Position(32, 6))).toBe(false);
      // Walls + door (rows 7-8): block
      expect(d.blocks(new Position(30, 7))).toBe(true);
      expect(d.blocks(new Position(31, 7))).toBe(true);
      expect(d.blocks(new Position(32, 8))).toBe(true);
      // Bottom shadow row (row 9): walk-over — player can stand in front of the door
      expect(d.blocks(new Position(30, 9))).toBe(false);
      expect(d.blocks(new Position(31, 9))).toBe(false);
      expect(d.blocks(new Position(32, 9))).toBe(false);
    });

    it('exposes baseY = anchor.y + footprintH - 1 for render-order sorting', () => {
      const d = new Decoration({
        regionName: 'rock_2x2',
        anchor: new Position(0, 4),
        footprintW: 2,
        footprintH: 2,
      });
      expect(d.baseY).toBe(5);
    });

    it('renderScale defaults to 1.0 and accepts a smaller value', () => {
      const a = new Decoration({
        regionName: 'rock_2x2',
        anchor: new Position(0, 0),
        footprintW: 2,
        footprintH: 2,
      });
      expect(a.renderScale).toBe(1.0);

      const b = new Decoration({
        regionName: 'rock_2x2',
        anchor: new Position(0, 0),
        footprintW: 2,
        footprintH: 2,
        renderScale: 0.8,
      });
      expect(b.renderScale).toBe(0.8);
    });
  });

  describe('overlapsBounds', () => {
    const d = new Decoration({
      regionName: 'tree',
      anchor: new Position(5, 5),
      footprintW: 2,
      footprintH: 2,
    });

    it('returns true when the footprint intersects the bounds', () => {
      expect(d.overlapsBounds({ startX: 0, startY: 0, endX: 10, endY: 10 })).toBe(true);
      expect(d.overlapsBounds({ startX: 6, startY: 6, endX: 10, endY: 10 })).toBe(true);
      expect(d.overlapsBounds({ startX: 5, startY: 5, endX: 6, endY: 6 })).toBe(true);
    });

    it('returns false when the footprint is fully outside the bounds', () => {
      expect(d.overlapsBounds({ startX: 0, startY: 0, endX: 5, endY: 5 })).toBe(false);
      expect(d.overlapsBounds({ startX: 7, startY: 0, endX: 10, endY: 10 })).toBe(false);
      expect(d.overlapsBounds({ startX: 0, startY: 7, endX: 10, endY: 10 })).toBe(false);
    });
  });
});
