import { Cursor } from '../../../src/domain/entities/Cursor.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('Cursor', () => {
  describe('constructor', () => {
    it('should create a cursor with default position and blinking state', () => {
      const cursor = new Cursor();

      expect(cursor.position).toHavePosition(5, 2);
      expect(cursor.isBlinking).toBe(true);
      expect(cursor.curiosityLevel).toBe(100);
      expect(cursor.name).toBe('Cursor');
      expect(cursor.description).toBe('The blinking protagonist, genderless and full of curiosity');
    });

    it('should create a cursor with custom position and blinking state', () => {
      const position = new Position(3, 4);
      const cursor = new Cursor(position, false);

      expect(cursor.position).toEqual(position);
      expect(cursor.isBlinking).toBe(false);
    });

    it('should throw error for invalid position', () => {
      expect(() => new Cursor('invalid')).toThrow('Cursor position must be a Position instance');
    });

    it('should throw error for invalid blinking state', () => {
      expect(() => new Cursor(new Position(1, 1), 'invalid')).toThrow(
        'isBlinking must be a boolean'
      );
    });
  });

  describe('moveTo', () => {
    it('should return new cursor with new position', () => {
      const cursor = new Cursor(new Position(1, 1), false);
      const newPosition = new Position(2, 2);
      const newCursor = cursor.moveTo(newPosition);

      expect(newCursor.position).toEqual(newPosition);
      expect(newCursor.isBlinking).toBe(false); // Should preserve other properties
      expect(newCursor).not.toBe(cursor); // Should be immutable
    });

    it('should throw error for invalid position', () => {
      const cursor = new Cursor();
      expect(() => cursor.moveTo('invalid')).toThrow('New position must be a Position instance');
    });

    it('should update remembered column by default', () => {
      const cursor = new Cursor(new Position(5, 5));
      const newPosition = new Position(10, 5);
      const newCursor = cursor.moveTo(newPosition);

      expect(newCursor.rememberedColumn).toBe(10);
    });

    it('should preserve remembered column when updateRememberedColumn is false', () => {
      const cursor = new Cursor(new Position(5, 5));
      const newPosition = new Position(10, 5);
      const newCursor = cursor.moveTo(newPosition, false);

      expect(newCursor.rememberedColumn).toBe(5);
    });
  });

  describe('moveToWithColumnMemory', () => {
    it('should preserve remembered column', () => {
      const cursor = new Cursor(new Position(5, 5));
      const newPosition = new Position(10, 7);
      const newCursor = cursor.moveToWithColumnMemory(newPosition);

      expect(newCursor.position).toEqual(newPosition);
      expect(newCursor.rememberedColumn).toBe(5); // Should preserve original column
    });
  });

  describe('rememberedColumn', () => {
    it('should initialize remembered column to current x position', () => {
      const cursor = new Cursor(new Position(8, 3));
      expect(cursor.rememberedColumn).toBe(8);
    });

    it('should allow setting custom remembered column', () => {
      const cursor = new Cursor(new Position(5, 5), true, 10);
      expect(cursor.rememberedColumn).toBe(10);
    });

    it('should throw error for invalid remembered column', () => {
      expect(() => new Cursor(new Position(1, 1), true, 'invalid')).toThrow(
        'rememberedColumn must be a number or null'
      );
    });
  });

  describe('toggleBlinking', () => {
    it('should toggle blinking state', () => {
      const cursor = new Cursor(new Position(1, 1), true);
      const toggledCursor = cursor.toggleBlinking();

      expect(toggledCursor.isBlinking).toBe(false);
      expect(toggledCursor.position).toEqual(cursor.position); // Should preserve position
    });

    it('should create new instance', () => {
      const cursor = new Cursor();
      const toggledCursor = cursor.toggleBlinking();

      expect(toggledCursor).not.toBe(cursor);
    });
  });

  describe('increaseCuriosity', () => {
    it('should increase curiosity level by default amount', () => {
      const cursor = new Cursor();
      cursor._curiosityLevel = 50; // Set to 50 for testing
      const newCursor = cursor.increaseCuriosity();

      expect(newCursor.curiosityLevel).toBe(60);
    });

    it('should increase curiosity level by custom amount', () => {
      const cursor = new Cursor();
      cursor._curiosityLevel = 30;
      const newCursor = cursor.increaseCuriosity(20);

      expect(newCursor.curiosityLevel).toBe(50);
    });

    it('should not exceed maximum curiosity level', () => {
      const cursor = new Cursor();
      cursor._curiosityLevel = 95;
      const newCursor = cursor.increaseCuriosity(20);

      expect(newCursor.curiosityLevel).toBe(100);
    });
  });

  describe('equals', () => {
    it('should return true for cursors with same position and blinking state', () => {
      const position = new Position(3, 4);
      const cursor1 = new Cursor(position, true);
      const cursor2 = new Cursor(position, true);

      expect(cursor1.equals(cursor2)).toBe(true);
    });

    it('should return false for cursors with different positions', () => {
      const cursor1 = new Cursor(new Position(1, 1), true);
      const cursor2 = new Cursor(new Position(2, 2), true);

      expect(cursor1.equals(cursor2)).toBe(false);
    });

    it('should return false for cursors with different blinking states', () => {
      const position = new Position(3, 4);
      const cursor1 = new Cursor(position, true);
      const cursor2 = new Cursor(position, false);

      expect(cursor1.equals(cursor2)).toBe(false);
    });

    it('should return false for cursors with different remembered columns', () => {
      const position = new Position(3, 4);
      const cursor1 = new Cursor(position, true, 5);
      const cursor2 = new Cursor(position, true, 8);

      expect(cursor1.equals(cursor2)).toBe(false);
    });

    it('should return false for non-cursor objects', () => {
      const cursor = new Cursor();
      expect(cursor.equals({})).toBe(false);
      expect(cursor.equals(null)).toBe(false);
    });
  });
});
