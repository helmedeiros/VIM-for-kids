import { GameType } from '../../../src/domain/value-objects/GameType.js';

describe('GameType', () => {
  describe('constructor', () => {
    it('should create a GameType with valid LEVEL_BASED type', () => {
      const gameType = new GameType(GameType.LEVEL_BASED);

      expect(gameType.type).toBe('level_based');
    });

    it('should create a GameType with valid TEXTLAND type', () => {
      const gameType = new GameType(GameType.TEXTLAND);

      expect(gameType.type).toBe('textland');
    });

    it('should throw error for invalid type', () => {
      expect(() => {
        new GameType('invalid_type');
      }).toThrow('Invalid game type: invalid_type');
    });
  });

  describe('static methods', () => {
    it('should provide LEVEL_BASED constant', () => {
      expect(GameType.LEVEL_BASED).toBe('level_based');
    });

    it('should provide TEXTLAND constant', () => {
      expect(GameType.TEXTLAND).toBe('textland');
    });

    it('should validate valid types', () => {
      expect(GameType.isValid(GameType.LEVEL_BASED)).toBe(true);
      expect(GameType.isValid(GameType.TEXTLAND)).toBe(true);
    });

    it('should reject invalid types', () => {
      expect(GameType.isValid('invalid')).toBe(false);
      expect(GameType.isValid(null)).toBe(false);
      expect(GameType.isValid(undefined)).toBe(false);
    });

    it('should create GameType from string', () => {
      const gameType = GameType.fromString('level_based');
      expect(gameType.type).toBe('level_based');
    });
  });

  describe('equals', () => {
    it('should return true for same types', () => {
      const type1 = new GameType(GameType.LEVEL_BASED);
      const type2 = new GameType(GameType.LEVEL_BASED);

      expect(type1.equals(type2)).toBe(true);
    });

    it('should return false for different types', () => {
      const type1 = new GameType(GameType.LEVEL_BASED);
      const type2 = new GameType(GameType.TEXTLAND);

      expect(type1.equals(type2)).toBe(false);
    });

    it('should return false when comparing with non-GameType', () => {
      const gameType = new GameType(GameType.LEVEL_BASED);

      expect(gameType.equals({})).toBe(false);
      expect(gameType.equals(null)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the type string', () => {
      const gameType = new GameType(GameType.LEVEL_BASED);
      expect(gameType.toString()).toBe('level_based');
    });
  });

  describe('type checking methods', () => {
    it('should correctly identify level-based games', () => {
      const levelBasedType = new GameType(GameType.LEVEL_BASED);
      const textlandType = new GameType(GameType.TEXTLAND);

      expect(levelBasedType.isLevelBased()).toBe(true);
      expect(textlandType.isLevelBased()).toBe(false);
    });

    it('should correctly identify textland games', () => {
      const levelBasedType = new GameType(GameType.LEVEL_BASED);
      const textlandType = new GameType(GameType.TEXTLAND);

      expect(levelBasedType.isTextland()).toBe(false);
      expect(textlandType.isTextland()).toBe(true);
    });
  });
});
