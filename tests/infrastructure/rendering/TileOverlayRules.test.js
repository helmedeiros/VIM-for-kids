import {
  pickWallVariant,
  shouldDrawWallCap,
  shouldDrawCliffN,
  pickGrassEdges,
} from '../../../src/infrastructure/rendering/TileOverlayRules.js';

// Build a fake `getNeighborName(dx, dy)` that returns names from a map keyed
// by `${dx},${dy}`. Any direction not in the map returns null (out of bounds).
const neighborsFrom = (map) => (dx, dy) => map[`${dx},${dy}`] ?? null;

describe('TileOverlayRules', () => {
  describe('pickWallVariant', () => {
    it('returns wall_mid when the south neighbor is also a wall', () => {
      const get = neighborsFrom({ '0,1': 'wall' });
      expect(pickWallVariant(get)).toBe('wall_mid');
    });

    it('returns wall when the south neighbor is non-wall', () => {
      const get = neighborsFrom({ '0,1': 'grass' });
      expect(pickWallVariant(get)).toBe('wall');
    });

    it('returns wall when the south neighbor is missing (edge of map)', () => {
      const get = neighborsFrom({});
      expect(pickWallVariant(get)).toBe('wall');
    });
  });

  describe('shouldDrawWallCap', () => {
    it('is true on a non-wall cell whose south is a wall', () => {
      const get = neighborsFrom({ '0,1': 'wall' });
      expect(shouldDrawWallCap('grass', get)).toBe(true);
    });

    it('is false on a wall cell even if south is a wall', () => {
      const get = neighborsFrom({ '0,1': 'wall' });
      expect(shouldDrawWallCap('wall', get)).toBe(false);
    });

    it('is false on a non-wall cell when south is non-wall', () => {
      const get = neighborsFrom({ '0,1': 'path' });
      expect(shouldDrawWallCap('grass', get)).toBe(false);
    });

    it('is false when south neighbor is missing', () => {
      const get = neighborsFrom({});
      expect(shouldDrawWallCap('grass', get)).toBe(false);
    });
  });

  describe('shouldDrawCliffN', () => {
    it('is true on water whose north neighbor is playable terrain', () => {
      const get = neighborsFrom({ '0,-1': 'grass' });
      expect(shouldDrawCliffN('water', get)).toBe(true);
    });

    it('is false on non-water cells', () => {
      const get = neighborsFrom({ '0,-1': 'grass' });
      expect(shouldDrawCliffN('grass', get)).toBe(false);
    });

    it('is false when north is also water', () => {
      const get = neighborsFrom({ '0,-1': 'water' });
      expect(shouldDrawCliffN('water', get)).toBe(false);
    });

    it('is false when north is void (off-map filler)', () => {
      const get = neighborsFrom({ '0,-1': 'void' });
      expect(shouldDrawCliffN('water', get)).toBe(false);
    });

    it('is false when north neighbor is missing (top edge of map)', () => {
      const get = neighborsFrom({});
      expect(shouldDrawCliffN('water', get)).toBe(false);
    });

    it.each(['path', 'dirt', 'sand', 'stone', 'wall', 'tree'])(
      'is true when north is %s (any non-water/non-void playable)',
      (name) => {
        const get = neighborsFrom({ '0,-1': name });
        expect(shouldDrawCliffN('water', get)).toBe(true);
      }
    );
  });

  describe('pickGrassEdges', () => {
    it('returns an empty array when the cell itself is grass', () => {
      const get = neighborsFrom({
        '0,-1': 'grass',
        '0,1': 'grass',
        '1,0': 'grass',
        '-1,0': 'grass',
      });
      expect(pickGrassEdges('grass', get)).toEqual([]);
    });

    it('returns an empty array when no neighbor is grass', () => {
      const get = neighborsFrom({
        '0,-1': 'path',
        '0,1': 'path',
        '1,0': 'path',
        '-1,0': 'path',
      });
      expect(pickGrassEdges('path', get)).toEqual([]);
    });

    it.each([
      ['0,-1', 'grass_edge_n'],
      ['1,0', 'grass_edge_e'],
      ['0,1', 'grass_edge_s'],
      ['-1,0', 'grass_edge_w'],
    ])('returns %s edge when neighbor at %s is grass', (key, expected) => {
      const get = neighborsFrom({ [key]: 'grass' });
      expect(pickGrassEdges('path', get)).toEqual([expected]);
    });

    it('returns multiple edges for multiple grass neighbors', () => {
      const get = neighborsFrom({
        '0,-1': 'grass',
        '1,0': 'grass',
      });
      expect(pickGrassEdges('path', get)).toEqual(['grass_edge_n', 'grass_edge_e']);
    });

    it('returns all four edges when surrounded by grass', () => {
      const get = neighborsFrom({
        '0,-1': 'grass',
        '1,0': 'grass',
        '0,1': 'grass',
        '-1,0': 'grass',
      });
      expect(pickGrassEdges('path', get)).toEqual([
        'grass_edge_n',
        'grass_edge_e',
        'grass_edge_s',
        'grass_edge_w',
      ]);
    });

    it('handles missing neighbors gracefully (returns no edges for them)', () => {
      const get = neighborsFrom({});
      expect(pickGrassEdges('path', get)).toEqual([]);
    });
  });
});
