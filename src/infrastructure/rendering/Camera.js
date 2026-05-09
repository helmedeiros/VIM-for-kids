/**
 * Camera system for viewport management and smooth scrolling.
 * Pure math — no DOM dependency. Extracted from DOMGameRenderer camera logic.
 */
export class Camera {
  constructor(tileSize = 32) {
    this._tileSize = tileSize;
    this._x = 0;
    this._y = 0;
    this._targetX = 0;
    this._targetY = 0;
    this._viewportWidth = 15;
    this._viewportHeight = 10;
    this._scrollThreshold = 0.7;
    this._smoothingFactor = 0.15;
    this._isInitialized = false;
    this._lastCursorKey = null;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get viewportWidth() {
    return this._viewportWidth;
  }

  get viewportHeight() {
    return this._viewportHeight;
  }

  get tileSize() {
    return this._tileSize;
  }

  get isInitialized() {
    return this._isInitialized;
  }

  setViewportSize(screenWidth, screenHeight, uiOffset = 120) {
    const usableHeight = screenHeight - uiOffset;
    this._viewportWidth = Math.max(Math.floor(screenWidth / this._tileSize), 15);
    this._viewportHeight = Math.max(Math.floor(usableHeight / this._tileSize), 10);
  }

  update(cursorPosition, mapBounds, zoneBounds = null) {
    const cursorKey = `${cursorPosition.x},${cursorPosition.y}`;

    if (this._shouldCenterOnZone(cursorKey, cursorPosition)) {
      this._centerOnZone(cursorPosition, mapBounds, zoneBounds);
      this._lastCursorKey = cursorKey;
      return true;
    }

    if (this._lastCursorKey !== cursorKey) {
      this._updateScrolling(cursorPosition, mapBounds);
      this._lastCursorKey = cursorKey;
    }
    return false;
  }

  interpolate() {
    const dx = this._targetX - this._x;
    const dy = this._targetY - this._y;

    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
      this._x = this._targetX;
      this._y = this._targetY;
      return false; // no movement
    }

    this._x += dx * this._smoothingFactor;
    this._y += dy * this._smoothingFactor;
    return true; // still moving
  }

  getVisibleBounds() {
    const startX = Math.floor(this._x);
    const startY = Math.floor(this._y);
    return {
      startX,
      startY,
      endX: startX + this._viewportWidth,
      endY: startY + this._viewportHeight,
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this._x) * this._tileSize,
      y: (worldY - this._y) * this._tileSize,
    };
  }

  reset() {
    this._x = 0;
    this._y = 0;
    this._targetX = 0;
    this._targetY = 0;
    this._isInitialized = false;
    this._lastCursorKey = null;
  }

  _shouldCenterOnZone(cursorKey, cursorPosition) {
    if (!this._isInitialized) return true;
    if (this._lastCursorKey === cursorKey) return false;

    const prev = this._lastCursorKey ? this._lastCursorKey.split(',').map(Number) : [0, 0];
    const manhattan = Math.abs(cursorPosition.x - prev[0]) + Math.abs(cursorPosition.y - prev[1]);
    return manhattan > 5;
  }

  _centerOnZone(cursorPosition, mapBounds, zoneBounds) {
    const centerX = Math.floor(this._viewportWidth / 2);
    const centerY = Math.floor(this._viewportHeight / 2);

    let targetX;
    if (zoneBounds) {
      targetX = zoneBounds.minX - centerX;
    } else {
      targetX = cursorPosition.x - centerX;
    }

    const targetY = Math.max(
      0,
      Math.min(cursorPosition.y - centerY, mapBounds.height - this._viewportHeight)
    );

    this._x = targetX;
    this._y = targetY;
    this._targetX = targetX;
    this._targetY = targetY;
    this._isInitialized = true;
  }

  _updateScrolling(cursorPosition, mapBounds) {
    const centerX = Math.floor(this._viewportWidth / 2);
    const centerY = Math.floor(this._viewportHeight / 2);
    const threshX = Math.floor(this._viewportWidth * this._scrollThreshold);
    const threshY = Math.floor(this._viewportHeight * this._scrollThreshold);

    const cursorViewX = cursorPosition.x - this._x;
    const cursorViewY = cursorPosition.y - this._y;

    let newTargetX = this._targetX;
    let newTargetY = this._targetY;

    if (cursorViewX >= threshX) {
      newTargetX = cursorPosition.x - threshX;
    } else if (cursorViewX <= this._viewportWidth - threshX) {
      newTargetX = cursorPosition.x - (this._viewportWidth - threshX);
    }

    if (cursorViewY >= threshY) {
      newTargetY = cursorPosition.y - threshY;
    } else if (cursorViewY <= this._viewportHeight - threshY) {
      newTargetY = cursorPosition.y - (this._viewportHeight - threshY);
    }

    this._targetX = Math.min(newTargetX, mapBounds.width - this._viewportWidth);
    this._targetY = Math.max(0, Math.min(newTargetY, mapBounds.height - this._viewportHeight));
  }
}
