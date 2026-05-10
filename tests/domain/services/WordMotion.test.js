import { WordMotion } from '../../../src/domain/services/WordMotion.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

function label(x, y, text, group) {
  return { position: new Position(x, y), text, group };
}

describe('WordMotion.findNextWordStart', () => {
  it('returns null for empty text labels', () => {
    expect(WordMotion.findNextWordStart(new Position(0, 0), [])).toBeNull();
    expect(WordMotion.findNextWordStart(new Position(0, 0), null)).toBeNull();
  });

  it('jumps to next word on the same row', () => {
    // "There will" — words at x=0..4 ("There"), gap at x=5, x=6..9 ("will")
    const labels = [
      label(0, 3, 'T'), label(1, 3, 'h'), label(2, 3, 'e'), label(3, 3, 'r'), label(4, 3, 'e'),
      label(6, 3, 'w'), label(7, 3, 'i'), label(8, 3, 'l'), label(9, 3, 'l'),
    ];
    const target = WordMotion.findNextWordStart(new Position(0, 3), labels);
    expect(target).toEqual(new Position(6, 3));
  });

  it('jumps from middle of a word to the next word start', () => {
    const labels = [
      label(0, 3, 'T'), label(1, 3, 'h'), label(2, 3, 'e'), label(3, 3, 'r'), label(4, 3, 'e'),
      label(6, 3, 'w'), label(7, 3, 'i'), label(8, 3, 'l'), label(9, 3, 'l'),
    ];
    const target = WordMotion.findNextWordStart(new Position(2, 3), labels);
    expect(target).toEqual(new Position(6, 3));
  });

  it('skips whitespace gaps between words', () => {
    // "a    time" with gap
    const labels = [
      label(0, 5, 'a'),
      label(5, 5, 't'), label(6, 5, 'i'), label(7, 5, 'm'), label(8, 5, 'e'),
    ];
    const target = WordMotion.findNextWordStart(new Position(0, 5), labels);
    expect(target).toEqual(new Position(5, 5));
  });

  it('treats punctuation as a separate word', () => {
    // "time," — "time" is one word, "," is the next word (no gap, but class change)
    const labels = [
      label(0, 5, 't'), label(1, 5, 'i'), label(2, 5, 'm'), label(3, 5, 'e'),
      label(4, 5, ','),
    ];
    const target = WordMotion.findNextWordStart(new Position(0, 5), labels);
    expect(target).toEqual(new Position(4, 5));
  });

  it('treats underscore as a word character', () => {
    // "One_word" — single word
    const labels = [
      label(0, 7, 'O'), label(1, 7, 'n'), label(2, 7, 'e'),
      label(3, 7, '_'),
      label(4, 7, 'w'), label(5, 7, 'o'), label(6, 7, 'r'), label(7, 7, 'd'),
      label(9, 7, 'x'),
    ];
    const target = WordMotion.findNextWordStart(new Position(0, 7), labels);
    expect(target).toEqual(new Position(9, 7));
  });

  it('wraps to the next row when no more words on current row', () => {
    const labels = [
      label(5, 3, 'a'),
      label(0, 5, 'b'), label(1, 5, 'c'),
    ];
    const target = WordMotion.findNextWordStart(new Position(5, 3), labels);
    expect(target).toEqual(new Position(0, 5));
  });

  it('returns null when there are no words after cursor', () => {
    const labels = [label(0, 3, 'a')];
    expect(WordMotion.findNextWordStart(new Position(5, 3), labels)).toBeNull();
  });

  it('finds the first word on a row when cursor is to the left of all labels', () => {
    const labels = [label(10, 3, 'a'), label(11, 3, 'b')];
    const target = WordMotion.findNextWordStart(new Position(0, 3), labels);
    expect(target).toEqual(new Position(10, 3));
  });

  describe('with an isWalkable predicate', () => {
    it('returns the target when the path on the row is clear', () => {
      const labels = [label(0, 3, 'a'), label(5, 3, 'b')];
      const target = WordMotion.findNextWordStart(
        new Position(0, 3),
        labels,
        () => true
      );
      expect(target).toEqual(new Position(5, 3));
    });

    it('routes around a single non-walkable tile when an alternate path exists', () => {
      const labels = [label(0, 3, 'a'), label(5, 3, 'b')];
      // Block one cell on the direct path; flood-fill can detour via adjacent rows.
      const isWalkable = (pos) => !(pos.x === 3 && pos.y === 3);
      const target = WordMotion.findNextWordStart(new Position(0, 3), labels, isWalkable);
      expect(target).toEqual(new Position(5, 3));
    });

    it('returns null when a wall fully isolates the cursor from the target', () => {
      const labels = [label(0, 3, 'a'), label(5, 3, 'b')];
      // Block the entire column 3 — splits the text into two disconnected regions.
      const isWalkable = (pos) => pos.x !== 3;
      const target = WordMotion.findNextWordStart(new Position(0, 3), labels, isWalkable);
      expect(target).toBeNull();
    });

    it('wraps to the next row when the rows are connected', () => {
      const labels = [label(0, 3, 'a'), label(0, 5, 'b')];
      const target = WordMotion.findNextWordStart(new Position(0, 3), labels, () => true);
      expect(target).toEqual(new Position(0, 5));
    });

    it('refuses to wrap when a barrier row fully separates the two text rows', () => {
      const labels = [label(0, 3, 'a'), label(0, 5, 'b')];
      // Block the entire row 4 — the two text rows become disconnected regions.
      const isWalkable = (pos) => pos.y !== 4;
      const target = WordMotion.findNextWordStart(new Position(0, 3), labels, isWalkable);
      expect(target).toBeNull();
    });

    it('wraps to the next row when no predicate is supplied (default behaviour)', () => {
      const labels = [label(0, 3, 'a'), label(0, 5, 'b')];
      const target = WordMotion.findNextWordStart(new Position(0, 3), labels);
      expect(target).toEqual(new Position(0, 5));
    });
  });

  describe('with text groups', () => {
    it('only considers labels in the same group as the cursor', () => {
      const labels = [
        label(0, 3, 'a', 'poem'),
        label(5, 3, 'b', 'aside'), // different group — should be ignored
        label(10, 3, 'c', 'poem'),
      ];
      const target = WordMotion.findNextWordStart(new Position(0, 3), labels);
      expect(target).toEqual(new Position(10, 3));
    });

    it('returns null when no in-group target exists past the cursor', () => {
      const labels = [
        label(0, 3, 'a', 'poem'),
        label(5, 3, 'b', 'aside'),
      ];
      const target = WordMotion.findNextWordStart(new Position(0, 3), labels);
      expect(target).toBeNull();
    });

    it('treats undefined and null groups as the same implicit group', () => {
      const labels = [label(0, 3, 'a'), label(5, 3, 'b', null)];
      const target = WordMotion.findNextWordStart(new Position(0, 3), labels);
      expect(target).toEqual(new Position(5, 3));
    });
  });
});

describe('WordMotion.findNextWordEnd', () => {
  it('returns null for empty text labels', () => {
    expect(WordMotion.findNextWordEnd(new Position(0, 0), [])).toBeNull();
    expect(WordMotion.findNextWordEnd(new Position(0, 0), null)).toBeNull();
  });

  it('jumps from the start of a word to the end of the same word', () => {
    const labels = [
      label(0, 3, 'T'), label(1, 3, 'h'), label(2, 3, 'e'),
      label(4, 3, 'c'), label(5, 3, 'a'), label(6, 3, 't'),
    ];
    const target = WordMotion.findNextWordEnd(new Position(0, 3), labels);
    expect(target).toEqual(new Position(2, 3));
  });

  it('jumps from the middle of a word to the end of the same word', () => {
    const labels = [
      label(0, 3, 'T'), label(1, 3, 'h'), label(2, 3, 'e'),
      label(4, 3, 'c'), label(5, 3, 'a'), label(6, 3, 't'),
    ];
    const target = WordMotion.findNextWordEnd(new Position(1, 3), labels);
    expect(target).toEqual(new Position(2, 3));
  });

  it('jumps from the end of a word to the end of the next word', () => {
    const labels = [
      label(0, 3, 'T'), label(1, 3, 'h'), label(2, 3, 'e'),
      label(4, 3, 'c'), label(5, 3, 'a'), label(6, 3, 't'),
    ];
    const target = WordMotion.findNextWordEnd(new Position(2, 3), labels);
    expect(target).toEqual(new Position(6, 3));
  });

  it('treats punctuation as a separate word with its own end', () => {
    const labels = [
      label(0, 3, 'h'), label(1, 3, 'i'), label(2, 3, '!'),
    ];
    const target = WordMotion.findNextWordEnd(new Position(0, 3), labels);
    expect(target).toEqual(new Position(1, 3));
  });

  it('wraps to the next row when no more word ends remain on current row', () => {
    const labels = [
      label(0, 3, 'a'),
      label(0, 5, 'b'), label(1, 5, 'c'),
    ];
    const target = WordMotion.findNextWordEnd(new Position(0, 3), labels);
    expect(target).toEqual(new Position(1, 5));
  });

  it('returns null when no further word ends exist', () => {
    const labels = [label(0, 3, 'a')];
    expect(WordMotion.findNextWordEnd(new Position(0, 3), labels)).toBeNull();
  });

  it('only considers labels in the same group as the cursor', () => {
    const labels = [
      label(0, 3, 'a', 'poem'),
      label(5, 3, 'b', 'aside'),
      label(10, 3, 'c', 'poem'), label(11, 3, 'd', 'poem'),
    ];
    const target = WordMotion.findNextWordEnd(new Position(0, 3), labels);
    expect(target).toEqual(new Position(11, 3));
  });

  it('refuses to jump when target is unreachable via the walkability predicate', () => {
    const labels = [
      label(0, 3, 'a'),
      label(5, 3, 'b'), label(6, 3, 'c'),
    ];
    const isWalkable = (pos) => pos.x !== 3;
    const target = WordMotion.findNextWordEnd(new Position(0, 3), labels, isWalkable);
    expect(target).toBeNull();
  });
});

describe('WordMotion.findPreviousWordStart', () => {
  it('returns null for empty text labels', () => {
    expect(WordMotion.findPreviousWordStart(new Position(0, 0), [])).toBeNull();
    expect(WordMotion.findPreviousWordStart(new Position(0, 0), null)).toBeNull();
  });

  it('jumps from the middle of a word back to the start of the same word', () => {
    const labels = [
      label(0, 3, 'T'), label(1, 3, 'h'), label(2, 3, 'e'),
      label(4, 3, 'c'), label(5, 3, 'a'), label(6, 3, 't'),
    ];
    const target = WordMotion.findPreviousWordStart(new Position(5, 3), labels);
    expect(target).toEqual(new Position(4, 3));
  });

  it('jumps from the end of a word back to its start', () => {
    const labels = [
      label(0, 3, 'T'), label(1, 3, 'h'), label(2, 3, 'e'),
      label(4, 3, 'c'), label(5, 3, 'a'), label(6, 3, 't'),
    ];
    const target = WordMotion.findPreviousWordStart(new Position(6, 3), labels);
    expect(target).toEqual(new Position(4, 3));
  });

  it('jumps from the start of a word back to the start of the previous word', () => {
    const labels = [
      label(0, 3, 'T'), label(1, 3, 'h'), label(2, 3, 'e'),
      label(4, 3, 'c'), label(5, 3, 'a'), label(6, 3, 't'),
    ];
    const target = WordMotion.findPreviousWordStart(new Position(4, 3), labels);
    expect(target).toEqual(new Position(0, 3));
  });

  it('treats punctuation as a separate word', () => {
    // "hi!" — 'hi' word at 0-1, '!' word at 2
    const labels = [
      label(0, 3, 'h'), label(1, 3, 'i'), label(2, 3, '!'),
    ];
    const target = WordMotion.findPreviousWordStart(new Position(2, 3), labels);
    expect(target).toEqual(new Position(0, 3));
  });

  it('wraps to the previous row when no more word starts remain backwards on current row', () => {
    const labels = [
      label(5, 3, 'a'), label(7, 3, 'b'), label(8, 3, 'c'),
      label(0, 5, 'd'),
    ];
    const target = WordMotion.findPreviousWordStart(new Position(0, 5), labels);
    // From start of row 5's single word, b wraps to the LAST word on row 3 ("bc" at x=7).
    expect(target).toEqual(new Position(7, 3));
  });

  it('returns null when no earlier words exist', () => {
    const labels = [label(5, 3, 'a')];
    expect(WordMotion.findPreviousWordStart(new Position(5, 3), labels)).toBeNull();
  });

  it('only considers labels in the same group as the cursor', () => {
    const labels = [
      label(0, 3, 'a', 'poem'),
      label(5, 3, 'b', 'aside'), // different group — should be ignored
      label(10, 3, 'c', 'poem'),
    ];
    // Cursor on 'c' (poem). Previous poem word is at x=0, NOT the aside at x=5.
    const target = WordMotion.findPreviousWordStart(new Position(10, 3), labels);
    expect(target).toEqual(new Position(0, 3));
  });

  it('returns null when a wall fully isolates the cursor from the previous word', () => {
    const labels = [label(0, 3, 'a'), label(5, 3, 'b')];
    // Block the entire column 3 — two disconnected regions.
    const isWalkable = (pos) => pos.x !== 3;
    const target = WordMotion.findPreviousWordStart(new Position(5, 3), labels, isWalkable);
    expect(target).toBeNull();
  });
});
