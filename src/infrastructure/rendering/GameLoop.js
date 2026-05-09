/**
 * Game loop using requestAnimationFrame for smooth 60fps rendering.
 * Calculates deltaTime between frames and invokes update/draw callbacks.
 */
export class GameLoop {
  constructor(updateFn, drawFn) {
    if (typeof updateFn !== 'function') {
      throw new Error('updateFn must be a function');
    }
    if (typeof drawFn !== 'function') {
      throw new Error('drawFn must be a function');
    }

    this._updateFn = updateFn;
    this._drawFn = drawFn;
    this._animationFrameId = null;
    this._lastTimestamp = null;
    this._running = false;
    this._needsRedraw = true;

    this._tick = this._tick.bind(this);
  }

  get isRunning() {
    return this._running;
  }

  start() {
    if (this._running) return;

    this._running = true;
    this._lastTimestamp = null;
    this._animationFrameId = requestAnimationFrame(this._tick);
  }

  stop() {
    if (!this._running) return;

    this._running = false;
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
    this._lastTimestamp = null;
  }

  requestRedraw() {
    this._needsRedraw = true;
  }

  _tick(timestamp) {
    if (!this._running) return;

    const deltaTime = this._lastTimestamp !== null ? (timestamp - this._lastTimestamp) / 1000 : 0;
    this._lastTimestamp = timestamp;

    // Cap deltaTime to prevent spiral of death after tab switch
    const cappedDeltaTime = Math.min(deltaTime, 0.1);

    this._updateFn(cappedDeltaTime);

    if (this._needsRedraw) {
      this._drawFn(cappedDeltaTime);
      this._needsRedraw = false;
    }

    this._animationFrameId = requestAnimationFrame(this._tick);
  }
}
