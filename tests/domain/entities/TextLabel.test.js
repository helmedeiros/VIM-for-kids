import { TextLabel } from '../../../src/domain/entities/TextLabel.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('TextLabel', () => {
  let textLabel;
  const testPosition = new Position(3, 4);
  const testText = 'H';

  beforeEach(() => {
    textLabel = new TextLabel(testPosition, testText);
  });

  describe('initialization', () => {
    it('should create text label with position and text', () => {
      expect(textLabel.position).toEqual(testPosition);
      expect(textLabel.text).toBe(testText);
    });

    it('should have text label type', () => {
      expect(textLabel.type).toBe('textLabel');
    });

    it('should create label with single character', () => {
      const singleChar = new TextLabel(new Position(1, 1), 'A');
      expect(singleChar.text).toBe('A');
    });

    it('should create label with space character', () => {
      const spaceLabel = new TextLabel(new Position(1, 1), ' ');
      expect(spaceLabel.text).toBe(' ');
    });

    it('should create label with special characters', () => {
      const specialLabel = new TextLabel(new Position(1, 1), '!');
      expect(specialLabel.text).toBe('!');
    });
  });

  describe('properties', () => {
    it('should have immutable position', () => {
      const originalPosition = textLabel.position;

      expect(() => {
        textLabel.position = new Position(5, 5);
      }).toThrow();

      expect(textLabel.position).toEqual(originalPosition);
    });

    it('should have immutable text', () => {
      const originalText = textLabel.text;

      expect(() => {
        textLabel.text = 'Changed';
      }).toThrow();

      expect(textLabel.text).toBe(originalText);
    });
  });

  describe('display properties', () => {
    it('should be visible by default', () => {
      expect(textLabel.isVisible).toBe(true);
    });

    it('should have appropriate styling properties', () => {
      expect(textLabel.color).toBe('#2c3e50'); // Dark color for readability
      expect(textLabel.fontSize).toBe('12px');
    });
  });

  describe('validation', () => {
    it('should throw error for invalid position', () => {
      expect(() => {
        new TextLabel(null, 'A');
      }).toThrow('Position must be a valid Position object');
    });

    it('should throw error for empty text', () => {
      expect(() => {
        new TextLabel(new Position(1, 1), '');
      }).toThrow('Text must be a non-empty string');
    });

    it('should throw error for null text', () => {
      expect(() => {
        new TextLabel(new Position(1, 1), null);
      }).toThrow('Text must be a non-empty string');
    });
  });

  describe('equality', () => {
    it('should be equal to another TextLabel with same position and text', () => {
      const other = new TextLabel(testPosition, testText);
      expect(textLabel.equals(other)).toBe(true);
    });

    it('should not be equal to TextLabel with different position', () => {
      const other = new TextLabel(new Position(5, 5), testText);
      expect(textLabel.equals(other)).toBe(false);
    });

    it('should not be equal to TextLabel with different text', () => {
      const other = new TextLabel(testPosition, 'B');
      expect(textLabel.equals(other)).toBe(false);
    });

    it('should not be equal to non-TextLabel objects', () => {
      expect(textLabel.equals({ position: testPosition, text: testText })).toBe(false);
      expect(textLabel.equals(null)).toBe(false);
    });
  });
});
