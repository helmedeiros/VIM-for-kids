/**
 * Pure rules that decide which neighbor-aware overlay sprites to draw for a
 * given tile. Extracted from CanvasGameRenderer so the decisions can be
 * unit-tested without any canvas or DOM dependencies.
 *
 * Each function receives a `getNeighborName(dx, dy)` callback that returns
 * the tile name at the relative offset, or null/undefined when the
 * neighbor is out of bounds.
 */

const NON_PLAYABLE_NORTH = new Set(['water', 'void']);

export function pickWallVariant(getNeighborName) {
  // Vertical wall runs use the continuous-cobblestone sprite for every cell
  // whose south neighbor is also a wall. The bottom of a run (no wall south)
  // keeps the default sprite so its front face shows.
  return getNeighborName(0, 1) === 'wall' ? 'wall_mid' : 'wall';
}

export function shouldDrawWallCap(tileName, getNeighborName) {
  // The cobblestone overhang is stamped above every top-of-wall — a non-wall
  // cell whose south neighbor is a wall.
  if (tileName === 'wall') return false;
  return getNeighborName(0, 1) === 'wall';
}

export function shouldDrawCliffN(tileName, getNeighborName) {
  // Cliff edge appears on water cells whose north neighbor is non-water
  // playable terrain — making the playable area read as a higher elevation.
  if (tileName !== 'water') return false;
  const north = getNeighborName(0, -1);
  if (!north) return false;
  return !NON_PLAYABLE_NORTH.has(north);
}

export function pickGrassEdges(tileName, getNeighborName) {
  // For non-grass cells, return the directional grass-tuft overlays for every
  // cardinal neighbor that is grass — softens the boundary between grass and
  // adjacent paths, dirt, etc.
  if (tileName === 'grass') return [];
  const edges = [];
  if (getNeighborName(0, -1) === 'grass') edges.push('grass_edge_n');
  if (getNeighborName(1, 0) === 'grass') edges.push('grass_edge_e');
  if (getNeighborName(0, 1) === 'grass') edges.push('grass_edge_s');
  if (getNeighborName(-1, 0) === 'grass') edges.push('grass_edge_w');
  return edges;
}
