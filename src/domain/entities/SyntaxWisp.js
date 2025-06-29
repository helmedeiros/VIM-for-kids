import { Position } from '../value-objects/Position.js';

export class SyntaxWisp {
  constructor(position, advancedConcept, isOptional = true, isActivated = false) {
    if (!(position instanceof Position)) {
      throw new Error('SyntaxWisp position must be a Position instance');
    }
    if (typeof advancedConcept !== 'string' || advancedConcept.trim().length === 0) {
      throw new Error('SyntaxWisp advancedConcept must be a non-empty string');
    }
    if (typeof isOptional !== 'boolean') {
      throw new Error('isOptional must be a boolean');
    }
    if (typeof isActivated !== 'boolean') {
      throw new Error('isActivated must be a boolean');
    }

    this._position = position;
    this._advancedConcept = advancedConcept;
    this._isOptional = isOptional;
    this._isActivated = isActivated;
    this._name = 'Syntax Wisp';
    this._description = 'Optional lore spirit that explains advanced concepts';
    this._etherealLevel = Math.floor(Math.random() * 30) + 70; // 70-100 ethereal
    this._conceptDifficulty = this._calculateConceptDifficulty();

    // Visual appearance properties
    this._appearance = {
      symbol: '~',
      baseColor: '#DDA0DD', // Plum/ethereal purple
      glowColor: '#E6E6FA', // Lavender glow
      floatingGlyphs: ['\\', '/', '*', '.', '%', '@', '#'],
      cssClass: 'syntax-wisp',
      animationType: 'ethereal-float',
    };
  }

  get position() {
    return this._position;
  }

  get advancedConcept() {
    return this._advancedConcept;
  }

  get isOptional() {
    return this._isOptional;
  }

  get isActivated() {
    return this._isActivated;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get etherealLevel() {
    return this._etherealLevel;
  }

  get conceptDifficulty() {
    return this._conceptDifficulty;
  }

  get appearance() {
    return { ...this._appearance };
  }

  // Get the visual symbol based on activation state
  getVisualSymbol() {
    if (!this._isActivated) {
      return '·'; // Dim wisp when not activated
    }
    return this._appearance.symbol;
  }

  // Get floating glyph for animation
  getFloatingGlyph() {
    const glyphs = this._appearance.floatingGlyphs;
    return glyphs[Math.floor(Math.random() * glyphs.length)];
  }

  // Get ethereal-based opacity
  getEtherealOpacity() {
    const baseOpacity = this._isActivated ? 0.9 : 0.6;
    const etherealBonus = (this._etherealLevel / 100) * 0.3;
    return Math.min(1.0, baseOpacity + etherealBonus);
  }

  moveTo(newPosition) {
    if (!(newPosition instanceof Position)) {
      throw new Error('New position must be a Position instance');
    }
    return new SyntaxWisp(newPosition, this._advancedConcept, this._isOptional, this._isActivated);
  }

  activate() {
    return new SyntaxWisp(this._position, this._advancedConcept, this._isOptional, true);
  }

  deactivate() {
    return new SyntaxWisp(this._position, this._advancedConcept, this._isOptional, false);
  }

  shareLore() {
    if (!this._isActivated) {
      return null; // Cannot share lore when not activated
    }

    return {
      concept: this._advancedConcept,
      difficulty: this._conceptDifficulty,
      etherealLevel: this._etherealLevel,
      wisdom: this._generateWisdom(),
    };
  }

  _calculateConceptDifficulty() {
    // Simple difficulty calculation based on concept length and complexity indicators
    const complexityKeywords = ['regex', 'macro', 'plugin', 'buffer', 'register', 'mark', 'fold'];
    const hasComplexKeywords = complexityKeywords.some((keyword) =>
      this._advancedConcept.toLowerCase().includes(keyword)
    );

    const baseLength = this._advancedConcept.length;
    return hasComplexKeywords
      ? Math.min(10, Math.ceil(baseLength / 20) + 3)
      : Math.min(7, Math.ceil(baseLength / 30));
  }

  _generateWisdom() {
    const wisdomPrefixes = [
      'In the ethereal realm of code,',
      'Beyond the veil of syntax,',
      'Where keystrokes become incantations,',
      'In the ancient scrolls of VIM,',
      'Through the mists of text manipulation,',
    ];

    const randomPrefix = wisdomPrefixes[Math.floor(Math.random() * wisdomPrefixes.length)];
    return `${randomPrefix} ${this._advancedConcept}`;
  }

  canBeActivatedBy(player) {
    // For now, any player can activate, but this could be extended
    // to require certain achievements, keys collected, etc.
    return player !== null && player !== undefined;
  }

  equals(other) {
    return (
      other instanceof SyntaxWisp &&
      this._position.equals(other._position) &&
      this._advancedConcept === other._advancedConcept &&
      this._isActivated === other._isActivated
    );
  }

  // Static factory methods for different types of advanced concepts
  static createRegexWisp(position) {
    const concept =
      'Regular expressions in VIM: \\v enables very magic mode, \\< matches word boundaries, \\zs and \\ze mark match start and end.';
    return new SyntaxWisp(position, concept);
  }

  static createMacroWisp(position) {
    const concept =
      'VIM macros: Record with qq, stop with q, replay with @q. Chain macros with @@ to repeat last. Macros are stored in registers.';
    return new SyntaxWisp(position, concept);
  }

  static createBufferWisp(position) {
    const concept =
      'Buffer mastery: :ls lists buffers, :b<number> switches buffers, :bd deletes buffer. Hidden buffers retain undo history.';
    return new SyntaxWisp(position, concept);
  }

  static createMarkWisp(position) {
    const concept =
      "VIM marks: ma sets mark 'a', 'a returns to mark, `a returns to exact position. Capital marks work across files.";
    return new SyntaxWisp(position, concept);
  }

  static createFoldWisp(position) {
    const concept =
      'Text folding: zf creates fold, zo opens fold, zc closes fold, zR opens all, zM closes all. Folds organize complex code.';
    return new SyntaxWisp(position, concept);
  }
}
