import { Position } from '../value-objects/Position.js';

export class CaretSpirit {
  constructor(position, knowledge, isDiscovered = false) {
    if (!(position instanceof Position)) {
      throw new Error('CaretSpirit position must be a Position instance');
    }
    if (typeof knowledge !== 'string' || knowledge.trim().length === 0) {
      throw new Error('CaretSpirit knowledge must be a non-empty string');
    }
    if (typeof isDiscovered !== 'boolean') {
      throw new Error('isDiscovered must be a boolean');
    }

    this._position = position;
    this._knowledge = knowledge;
    this._isDiscovered = isDiscovered;
    this._name = 'Caret Spirit';
    this._description = 'Guardian of VIM knowledge scattered across the land';
    this._wisdomLevel = Math.floor(Math.random() * 50) + 50; // 50-100 wisdom

    // Visual appearance properties
    this._appearance = {
      symbol: '🔥', // Primary: Flame emoji (we'll color it cyan with CSS)
      alternativeSymbols: ['♦', '◆', '▲', '🕯️', '🔮'], // Backup symbols for different platforms
      baseColor: '#40E0D0', // Turquoise/cyan to match the pixel art
      glowColor: '#E0FFFF', // Light cyan glow
      accentColor: '#87CEEB', // Sky blue for depth
      floatingGlyphs: [':', 'w', 'q', 'h', 'j', 'k', 'l', '^'],
      cssClass: 'caret-spirit',
      animationType: 'flame-wisdom',
    };
  }

  get position() {
    return this._position;
  }

  get knowledge() {
    return this._knowledge;
  }

  get isDiscovered() {
    return this._isDiscovered;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get wisdomLevel() {
    return this._wisdomLevel;
  }

  get appearance() {
    return { ...this._appearance };
  }

  // Get the visual symbol based on discovery state
  getVisualSymbol() {
    if (!this._isDiscovered) {
      return '?'; // Mystery until discovered
    }
    return this._appearance.symbol;
  }

  // Get alternative visual symbol for fallback
  getAlternativeSymbol(index = 0) {
    if (!this._isDiscovered) {
      return '?';
    }
    const alternatives = this._appearance.alternativeSymbols;
    return alternatives[index % alternatives.length];
  }

  // Get floating glyph for animation
  getFloatingGlyph() {
    const glyphs = this._appearance.floatingGlyphs;
    return glyphs[Math.floor(Math.random() * glyphs.length)];
  }

  // Get wisdom-based glow intensity
  getGlowIntensity() {
    return Math.floor((this._wisdomLevel / 100) * 10); // 0-10 scale
  }

  moveTo(newPosition) {
    if (!(newPosition instanceof Position)) {
      throw new Error('New position must be a Position instance');
    }
    return new CaretSpirit(newPosition, this._knowledge, this._isDiscovered);
  }

  discover() {
    return new CaretSpirit(this._position, this._knowledge, true);
  }

  shareKnowledge() {
    if (!this._isDiscovered) {
      throw new Error('Cannot share knowledge with an undiscovered CaretSpirit');
    }
    return {
      wisdom: this._knowledge,
      level: this._wisdomLevel,
      spirit: this._name,
    };
  }

  equals(other) {
    return (
      other instanceof CaretSpirit &&
      this._position.equals(other._position) &&
      this._knowledge === other._knowledge
    );
  }

  // Static factory methods for different types of knowledge
  static createVimMovementGuardian(position) {
    const knowledge =
      'Master the sacred movement keys: h moves left, j moves down, k moves up, l moves right. These are the foundation of all VIM wisdom.';
    return new CaretSpirit(position, knowledge);
  }

  static createVimCommandGuardian(position) {
    const knowledge =
      'Beyond movement lies power: i for insert, : for command mode, / for search. Each keystroke is a spell of text manipulation.';
    return new CaretSpirit(position, knowledge);
  }

  static createVimEditGuardian(position) {
    const knowledge =
      'Transform text with purpose: dd to delete a line, yy to copy, p to paste. The editor becomes extension of thought.';
    return new CaretSpirit(position, knowledge);
  }
}
