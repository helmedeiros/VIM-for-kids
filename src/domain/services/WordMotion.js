import { Position } from '../value-objects/Position.js';

// Vim 'w' / 'e' word definition: a "word" is a maximal run of [A-Za-z0-9_],
// OR a maximal run of non-blank non-word chars. A class change without a gap
// also starts a new word (so "time," yields two words: "time" and ",").
//
// Motion is confined to the cursor's text "group" — labels sharing the same
// `group` identifier. This lets level designers isolate conceptually-distinct
// text blocks (e.g. a poem vs an aside) that happen to share a walkable region.
// Labels without a group share an implicit null-group.
//
// When isWalkable is supplied, the motion is also confined to the cursor's
// connected walkable region: any target unreachable by a 4-connected flood-fill
// (bounded by the in-group textLabel bounding box) is skipped — water and walls
// remain hard borders even within a group.
export const WordMotion = {
  findNextWordStart(cursor, textLabels, isWalkable = null) {
    return findNext(cursor, textLabels, isWalkable, collectWordStarts);
  },

  findNextWordEnd(cursor, textLabels, isWalkable = null) {
    return findNext(cursor, textLabels, isWalkable, collectWordEnds);
  },
};

function findNext(cursor, textLabels, isWalkable, xExtractor) {
  if (!textLabels || textLabels.length === 0) return null;

  const cursorLabel = textLabels.find((l) => l.position.equals(cursor));
  const cursorGroup = cursorLabel ? (cursorLabel.group ?? null) : null;
  const eligibleLabels = textLabels.filter((l) => (l.group ?? null) === cursorGroup);

  const candidates = collectCandidates(cursor, eligibleLabels, xExtractor);
  if (candidates.length === 0) return null;

  if (!isWalkable) return candidates[0];

  const reachable = computeReachable(cursor, eligibleLabels, isWalkable);
  for (const target of candidates) {
    if (reachable.has(keyOf(target))) return target;
  }
  return null;
}

function collectCandidates(cursor, textLabels, xExtractor) {
  const byRow = new Map();
  for (const label of textLabels) {
    const y = label.position.y;
    if (!byRow.has(y)) byRow.set(y, []);
    byRow.get(y).push(label);
  }

  const forwardRows = [...byRow.keys()].filter((y) => y >= cursor.y).sort((a, b) => a - b);
  const result = [];

  for (const y of forwardRows) {
    const sortedLabels = byRow.get(y).sort((a, b) => a.position.x - b.position.x);
    for (const x of xExtractor(sortedLabels)) {
      if (y === cursor.y && x <= cursor.x) continue;
      result.push(new Position(x, y));
    }
  }

  return result;
}

function computeReachable(cursor, textLabels, isWalkable) {
  let minX = cursor.x;
  let maxX = cursor.x;
  let minY = cursor.y;
  let maxY = cursor.y;
  for (const label of textLabels) {
    const { x, y } = label.position;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  // Small buffer so the flood can route around obstacles just outside the text region.
  minX -= 2;
  maxX += 2;
  minY -= 2;
  maxY += 2;

  const visited = new Set();
  visited.add(keyOf(cursor));
  const stack = [cursor];

  while (stack.length) {
    const p = stack.pop();
    for (const [dx, dy] of NEIGHBOURS) {
      const nx = p.x + dx;
      const ny = p.y + dy;
      if (nx < minX || nx > maxX || ny < minY || ny > maxY) continue;
      const k = `${nx},${ny}`;
      if (visited.has(k)) continue;
      const next = new Position(nx, ny);
      if (!isWalkable(next)) continue;
      visited.add(k);
      stack.push(next);
    }
  }

  return visited;
}

const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function collectWordStarts(sortedRowLabels) {
  const starts = [];
  let prevX = null;
  let prevClass = null;
  for (const label of sortedRowLabels) {
    const x = label.position.x;
    const cls = charClass(label.text);
    const isNewWord = prevX === null || x !== prevX + 1 || cls !== prevClass;
    if (isNewWord) starts.push(x);
    prevX = x;
    prevClass = cls;
  }
  return starts;
}

function collectWordEnds(sortedRowLabels) {
  const ends = [];
  let prevX = null;
  let prevClass = null;
  let currentEnd = null;
  for (const label of sortedRowLabels) {
    const x = label.position.x;
    const cls = charClass(label.text);
    const continues = prevX !== null && x === prevX + 1 && cls === prevClass;
    if (!continues && currentEnd !== null) ends.push(currentEnd);
    currentEnd = x;
    prevX = x;
    prevClass = cls;
  }
  if (currentEnd !== null) ends.push(currentEnd);
  return ends;
}

function keyOf(pos) {
  return `${pos.x},${pos.y}`;
}

function charClass(ch) {
  return /^[A-Za-z0-9_]$/.test(ch) ? 'word' : 'punct';
}
