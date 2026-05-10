/**
 * Smoothly interpolates cursor position between tiles using ease-out curve.
 * Provides sub-tile pixel positions for the game loop to render.
 */
export class MovementAnimator {
  constructor(duration = 0.12) {
    this._duration = duration;
    this._fromX = 0;
    this._fromY = 0;
    this._toX = 0;
    this._toY = 0;
    this._elapsed = 0;
    this._animating = false;
  }

  get isAnimating() {
    return this._animating;
  }

  startMove(fromX, fromY, toX, toY) {
    this._fromX = fromX;
    this._fromY = fromY;
    this._toX = toX;
    this._toY = toY;
    this._elapsed = 0;
    this._animating = true;
  }

  update(deltaTime) {
    if (!this._animating) return;

    this._elapsed += deltaTime;
    if (this._elapsed >= this._duration) {
      this._elapsed = this._duration;
      this._animating = false;
    }
  }

  getCurrentPosition() {
    if (!this._animating && this._elapsed >= this._duration) {
      return { x: this._toX, y: this._toY };
    }

    const t = Math.min(this._elapsed / this._duration, 1);
    // Ease-out cubic: 1 - (1-t)^3
    const eased = 1 - Math.pow(1 - t, 3);

    return {
      x: this._fromX + (this._toX - this._fromX) * eased,
      y: this._fromY + (this._toY - this._fromY) * eased,
    };
  }

  getTargetPosition() {
    return { x: this._toX, y: this._toY };
  }
}
