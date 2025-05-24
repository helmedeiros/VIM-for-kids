import { Player } from '../../../src/domain/entities/Player.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('Player', () => {
  describe('constructor', () => {
    it('should create player with default position (5, 2)', () => {
      const player = new Player();

      expect(player.position).toBeInstanceOf(Position);
      expect(player.position).toHavePosition(5, 2);
    });

    it('should create player with custom position', () => {
      const position = new Position(10, 8);
      const player = new Player(position);

      expect(player.position).toBe(position);
      expect(player.position).toHavePosition(10, 8);
    });

    it('should throw error for non-Position parameter', () => {
      expect(() => new Player({ x: 5, y: 2 })).toThrow('Player position must be a Position instance');
      expect(() => new Player(null)).toThrow('Player position must be a Position instance');
      expect(() => new Player('invalid')).toThrow('Player position must be a Position instance');
    });
  });

  describe('moveTo', () => {
    it('should return new player with updated position', () => {
      const originalPlayer = new Player(new Position(5, 3));
      const newPosition = new Position(6, 3);
      const movedPlayer = originalPlayer.moveTo(newPosition);

      expect(movedPlayer).toBeInstanceOf(Player);
      expect(movedPlayer.position).toBe(newPosition);
      expect(movedPlayer.position).toHavePosition(6, 3);
    });

    it('should not modify original player (immutability)', () => {
      const originalPosition = new Position(5, 3);
      const originalPlayer = new Player(originalPosition);
      const newPosition = new Position(6, 3);
      const movedPlayer = originalPlayer.moveTo(newPosition);

      expect(originalPlayer.position).toBe(originalPosition);
      expect(originalPlayer.position).toHavePosition(5, 3);
      expect(movedPlayer).not.toBe(originalPlayer);
    });

    it('should throw error for non-Position parameter', () => {
      const player = new Player();

      expect(() => player.moveTo({ x: 6, y: 3 })).toThrow('New position must be a Position instance');
      expect(() => player.moveTo(null)).toThrow('New position must be a Position instance');
      expect(() => player.moveTo('invalid')).toThrow('New position must be a Position instance');
    });

    it('should handle moving to same position', () => {
      const position = new Position(5, 3);
      const player = new Player(position);
      const movedPlayer = player.moveTo(position);

      expect(movedPlayer.position).toBe(position);
      expect(movedPlayer).not.toBe(player); // Still creates new instance
    });
  });

  describe('equals', () => {
    it('should return true for players with same position', () => {
      const position = new Position(5, 3);
      const player1 = new Player(position);
      const player2 = new Player(position);

      expect(player1.equals(player2)).toBe(true);
    });

    it('should return true for players with equivalent positions', () => {
      const player1 = new Player(new Position(5, 3));
      const player2 = new Player(new Position(5, 3));

      expect(player1.equals(player2)).toBe(true);
    });

    it('should return false for players with different positions', () => {
      const player1 = new Player(new Position(5, 3));
      const player2 = new Player(new Position(6, 3));
      const player3 = new Player(new Position(5, 4));

      expect(player1.equals(player2)).toBe(false);
      expect(player1.equals(player3)).toBe(false);
    });

    it('should return false for non-Player objects', () => {
      const player = new Player(new Position(5, 3));

      expect(player.equals({ position: new Position(5, 3) })).toBe(false);
      expect(player.equals(null)).toBe(false);
      expect(player.equals(undefined)).toBe(false);
    });
  });

  describe('position property', () => {
    it('should have immutable position property', () => {
      const player = new Player(new Position(5, 3));

      expect(() => {
        player.position = new Position(6, 3);
      }).toThrow();
    });

    it('should return the exact position instance', () => {
      const position = new Position(5, 3);
      const player = new Player(position);

      expect(player.position).toBe(position);
    });
  });

  describe('integration with Position', () => {
    it('should work with Position movement methods', () => {
      const player = new Player(new Position(5, 3));
      const newPosition = player.position.move(1, 0);
      const movedPlayer = player.moveTo(newPosition);

      expect(movedPlayer.position).toHavePosition(6, 3);
    });

    it('should maintain Position immutability', () => {
      const originalPosition = new Position(5, 3);
      const player = new Player(originalPosition);
      const movedPosition = originalPosition.move(1, 0);

      expect(player.position).toHavePosition(5, 3);
      expect(movedPosition).toHavePosition(6, 3);
      expect(player.position).toBe(originalPosition);
    });
  });
});
