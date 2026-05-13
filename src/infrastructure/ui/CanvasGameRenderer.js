import { GameRenderer } from '../../ports/output/GameRenderer.js';
import { Camera } from '../rendering/Camera.js';
import { GameLoop } from '../rendering/GameLoop.js';
import { EntityIndex } from '../rendering/EntityIndex.js';
import { SpriteSheet } from '../rendering/SpriteSheet.js';
import { TileAtlas } from '../rendering/TileAtlas.js';
import { TileRenderer } from '../rendering/TileRenderer.js';
import { CharacterSprites } from '../rendering/CharacterSprites.js';
import { TilePainter } from '../rendering/TilePainter.js';
import { MovementAnimator } from '../rendering/MovementAnimator.js';
import { AudioManager } from '../audio/AudioManager.js';
import { ParticleSystem } from '../rendering/ParticleSystem.js';
import { AnimatedTile } from '../rendering/AnimatedTile.js';
import { AutoTiler } from '../rendering/AutoTiler.js';
import { VimKeyInfo } from '../rendering/VimKeyInfo.js';
import { AssetLoader } from '../rendering/AssetLoader.js';
import { registerTilesetRegions } from '../rendering/TilesetRegions.js';
import {
  pickWallVariant,
  shouldDrawWallCap,
  shouldDrawCliffN,
  pickGrassEdges,
} from '../rendering/TileOverlayRules.js';

const RPG_TILESET_URL = '/assets/sprites/tileset-rpg.png';

/**
 * Canvas-based game renderer implementing the GameRenderer port.
 * Uses HTML5 Canvas for tile rendering with a rAF game loop.
 * DOM overlays handle UI chrome (messages, balloons, keys display).
 */
export class CanvasGameRenderer extends GameRenderer {
  constructor() {
    super();

    this._camera = new Camera(32);
    this._entityIndex = new EntityIndex();
    this._currentGameState = null;
    this._previousCursorKey = null;
    this._previousCollectedCount = 0;

    // DOM elements
    this._container = document.getElementById('game-container');
    this.gameBoard = this._createCanvas();
    this._collectedKeysDisplay = document.querySelector('.key-display');
    this._collectibleInventoryDisplay = document.querySelector('.collectible-display');

    // Initialize viewport
    this._camera.setViewportSize(window.innerWidth, window.innerHeight);
    this._resizeCanvas();

    window.addEventListener('resize', () => {
      this._camera.setViewportSize(window.innerWidth, window.innerHeight);
      this._resizeCanvas();
      this._gameLoop.requestRedraw();
    });

    // Canvas 2D context
    this._ctx = this.gameBoard.getContext('2d');

    // Game loop
    this._gameLoop = new GameLoop(
      (dt) => this._update(dt),
      (dt) => this._draw(dt)
    );
    this._gameLoop.start();

    // Message state
    this._currentMessage = null;
    this._messageTimeout = null;

    // Animation time tracker
    this._animationTime = 0;

    // Sprite rendering system
    this._tileAtlas = new TileAtlas();
    this._characterSprites = new CharacterSprites();
    this._tileRenderer = null;
    this._charSpriteSheet = null;

    // Movement animation
    this._movementAnimator = new MovementAnimator(0.1);
    this._lastCursorX = null;
    this._lastCursorY = null;
    this._facing = 's'; // direction the cursor character is facing

    // Audio
    this._audio = new AudioManager();
    this._prevCollectedCount = 0;
    this._prevGateOpen = null;

    // Visual effects systems
    this._particleSystem = new ParticleSystem();
    this._animatedTile = new AnimatedTile();
    this._autoTiler = new AutoTiler();

    // Paint tiles at runtime using Canvas 2D API
    this._initSprites();

    // Tile color fallback map (used until sprites load)
    this._tileColors = {
      water: '#1a8fc4',
      grass: '#3db84a',
      dirt: '#c9a66b',
      tree: '#1b7a1b',
      stone: '#9e9e90',
      path: '#e8c840',
      wall: '#4a5568',
      bridge: '#8b5e3c',
      sand: '#e8d060',
      ruins: '#7a8690',
      field: '#48c868',
      test_ground: '#9b6ab6',
      void: '#1a1a1a',
      boss_area: '#c83030',
      ramp_right: '#8b9dc3',
      ramp_left: '#8b9dc3',
      rock: '#7a7a7a',
    };
  }

  _initSprites() {
    try {
      const ts = this._camera.tileSize;
      const painter = new TilePainter(ts, 28);

      const tilesetCanvas = painter.createTilesetCanvas();
      const tilesetSheet = new SpriteSheet(tilesetCanvas, ts, ts, 28);
      this._tileRenderer = new TileRenderer(tilesetSheet, this._tileAtlas, ts);

      // Register the 1x1 procedural decoration sprites (frames 25-27 of the
      // tileset canvas) as TileAtlas regions so they can be used as
      // Decoration regionName values without needing a separate PNG.
      const proceduralDecorations = {
        flower_cluster: 25,
        mushroom: 26,
        tall_grass: 27,
      };
      for (const [name, frame] of Object.entries(proceduralDecorations)) {
        this._tileAtlas.registerRegion(name, {
          image: tilesetCanvas,
          sx: frame * ts,
          sy: 0,
          sw: ts,
          sh: ts,
        });
      }

      const charsCanvas = painter.createCharacterCanvas();
      this._charSpriteSheet = new SpriteSheet(charsCanvas, ts, ts, 11);

      this._gameLoop.requestRedraw();
    } catch (error) {
      console.warn('Failed to paint sprites, using color fallback:', error);
    }

    this._loadRpgTileset();
  }

  _loadRpgTileset() {
    const loader = new AssetLoader();
    loader
      .loadImage(RPG_TILESET_URL)
      .then((image) => {
        registerTilesetRegions(this._tileAtlas, image);
        this._gameLoop.requestRedraw();
      })
      .catch((error) => {
        console.warn('RPG tileset unavailable, using procedural tiles:', error.message);
      });
  }

  get spritesLoaded() {
    return this._tileRenderer !== null && this._charSpriteSheet !== null;
  }

  _createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'gameBoardCanvas';
    canvas.className = 'game-board-canvas';
    canvas.setAttribute('tabindex', '0');

    // Insert canvas into game container (alongside existing gameBoard div)
    const existingBoard = document.getElementById('gameBoard');
    if (existingBoard) {
      existingBoard.style.display = 'none';
      existingBoard.parentNode.insertBefore(canvas, existingBoard);
    } else if (this._container) {
      this._container.appendChild(canvas);
    }

    return canvas;
  }

  _resizeCanvas() {
    const w = this._camera.viewportWidth * this._camera.tileSize;
    const h = this._camera.viewportHeight * this._camera.tileSize;
    this.gameBoard.width = w;
    this.gameBoard.height = h;
    this.gameBoard.style.width = `${w}px`;
    this.gameBoard.style.height = `${h}px`;
  }

  // --- GameRenderer port methods ---

  render(gameState) {
    this._currentGameState = gameState;
    this._entityIndex.rebuild(gameState);

    const cursorX = gameState.cursor.position.x;
    const cursorY = gameState.cursor.position.y;

    // Detect cursor movement for animation and audio
    if (this._lastCursorX !== null && (this._lastCursorX !== cursorX || this._lastCursorY !== cursorY)) {
      this._movementAnimator.startMove(this._lastCursorX, this._lastCursorY, cursorX, cursorY);
      this._audio.playSound('move');
      // Update facing direction based on the move's dominant axis. The
      // character stays facing this direction until the next move, so
      // when the player stops the avatar still looks the right way.
      const dx = cursorX - this._lastCursorX;
      const dy = cursorY - this._lastCursorY;
      if (Math.abs(dx) >= Math.abs(dy)) {
        if (dx > 0) this._facing = 'e';
        else if (dx < 0) this._facing = 'w';
      } else {
        if (dy > 0) this._facing = 's';
        else if (dy < 0) this._facing = 'n';
      }
    }
    this._lastCursorX = cursorX;
    this._lastCursorY = cursorY;

    // Detect key collection for audio + particles
    const collectedCount = gameState.collectedKeys.size + (gameState.collectedCollectibleKeys ? gameState.collectedCollectibleKeys.size : 0);
    if (collectedCount > this._prevCollectedCount) {
      this._audio.playSound('collect');
      // Emit sparkle at cursor screen position
      const bounds = this._camera.getVisibleBounds();
      const ts = this._camera.tileSize;
      const sparkleX = (cursorX - bounds.startX) * ts + ts / 2;
      const sparkleY = (cursorY - bounds.startY) * ts + ts / 2;
      this._particleSystem.emit('sparkle', sparkleX, sparkleY, 12);
    }
    this._prevCollectedCount = collectedCount;

    // Detect gate open for audio
    if (gameState.gate) {
      if (this._prevGateOpen === false && gameState.gate.isOpen) {
        this._audio.playSound('gate_open');
      }
      this._prevGateOpen = gameState.gate.isOpen;
    }

    // Update camera
    const mapBounds = {
      width: gameState.map.width || gameState.map.size,
      height: gameState.map.height || gameState.map.size,
    };
    this._camera.update(gameState.cursor.position, mapBounds);

    // Request redraw
    this._gameLoop.requestRedraw();

    // Update UI overlays
    this.updateCollectedKeysDisplay(gameState.collectedKeys);
    this.updateCollectibleInventoryDisplay(gameState.collectedCollectibleKeys || new Set());
  }

  updateCollectedKeysDisplay(collectedKeys) {
    if (!this._collectedKeysDisplay) return;
    this._collectedKeysDisplay.innerHTML = '';

    if (collectedKeys.size === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'No keys collected yet!';
      empty.style.color = '#95a5a6';
      empty.style.fontStyle = 'italic';
      this._collectedKeysDisplay.appendChild(empty);
    } else {
      collectedKeys.forEach((keyName) => {
        const el = document.createElement('div');
        el.className = 'collected-key clickable';
        el.textContent = keyName;
        el.title = `Click to learn about ${keyName}`;
        el.addEventListener('click', () => {
          this._showVimKeyExplanation({ key: keyName, description: '' });
        });
        this._collectedKeysDisplay.appendChild(el);
      });
    }

    // Also update help modal's "Your Keys" section
    VimKeyInfo.updateHelpKeys(collectedKeys, (vk) => this._showVimKeyExplanation(vk));
  }

  updateCollectibleInventoryDisplay(collectedCollectibleKeys) {
    if (!this._collectibleInventoryDisplay) return;
    this._collectibleInventoryDisplay.innerHTML = '';

    if (collectedCollectibleKeys.size === 0) {
      const empty = document.createElement('div');
      empty.className = 'collectible-empty-message';
      empty.textContent = 'No special keys found yet!';
      this._collectibleInventoryDisplay.appendChild(empty);
    } else {
      collectedCollectibleKeys.forEach((keyId) => {
        const el = document.createElement('div');
        el.className = 'collected-collectible-key';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'collectible-key-name';
        nameSpan.textContent = this._formatKeyName(keyId);
        el.appendChild(nameSpan);
        el.title = `Collected: ${this._formatKeyName(keyId)}`;
        this._collectibleInventoryDisplay.appendChild(el);
      });
    }
  }

  showKeyInfo(key) {
    if (key && key.type === 'collectible_key') {
      this._showCollectibleKeyFeedback(key);
    } else if (key && key.key && key.description) {
      this._showVimKeyExplanation(key);
    }
  }

  showMessage(message, options = {}) {
    const { duration = 4000, position = 'center', type = 'info', speaker = null } = options;
    this.hideMessage();

    const el = document.createElement('div');
    el.className = `message-bubble ${type}`;
    el.setAttribute('data-position', position);

    if (speaker) {
      const speakerEl = document.createElement('div');
      speakerEl.className = 'message-speaker';
      speakerEl.textContent = speaker;
      el.appendChild(speakerEl);
    }

    const textEl = document.createElement('div');
    textEl.className = 'message-text';
    textEl.textContent = message;
    el.appendChild(textEl);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'message-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => this.hideMessage();
    el.appendChild(closeBtn);

    const container = this._container || document.body;
    container.appendChild(el);
    this._currentMessage = el;

    if (duration > 0) {
      this._messageTimeout = setTimeout(() => this.hideMessage(), duration);
    }

    return el;
  }

  hideMessage() {
    if (this._currentMessage) {
      this._currentMessage.remove();
      this._currentMessage = null;
    }
    if (this._messageTimeout) {
      clearTimeout(this._messageTimeout);
      this._messageTimeout = null;
    }
  }

  // --- Additional methods used by application code ---

  focus() {
    this.gameBoard.focus();
  }

  resetCamera() {
    this._camera.reset();
    this._lastCursorX = null;
    this._lastCursorY = null;
    this._prevCollectedCount = 0;
    this._prevGateOpen = null;
    this.clearAllOverlays();
  }

  showNPCDialogue(npc, dialogue, options = {}) {
    const text = Array.isArray(dialogue) ? dialogue.join(' ') : String(dialogue);
    return this.showNPCBalloon(npc, text, options);
  }

  showNPCBalloon(npc, message, options = {}) {
    const { duration = 4000 } = options;
    this.fadeOutExistingBalloons();

    const balloon = document.createElement('div');
    balloon.className = 'npc-balloon';
    balloon.textContent = message;

    const container = this._container || document.body;
    balloon.style.position = 'absolute';
    balloon.style.visibility = 'hidden';
    container.appendChild(balloon);

    // Position directly above the NPC tile
    if (this._currentGameState && npc) {
      const npcPos = this._findNPCScreenPosition(npc);
      if (npcPos) {
        const canvasRect = this.gameBoard.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const balloonRect = balloon.getBoundingClientRect();
        const ts = this._camera.tileSize;

        // NPC center in page coords
        const npcCenterX = canvasRect.left + npcPos.x + ts / 2;
        const npcTopY = canvasRect.top + npcPos.y;

        // Position balloon centered above NPC
        const balloonLeft = npcCenterX - containerRect.left;
        const balloonTop = npcTopY - containerRect.top - balloonRect.height - 18;

        balloon.style.left = `${balloonLeft}px`;
        balloon.style.top = `${Math.max(balloonTop, 10)}px`;
        balloon.style.transform = 'translateX(-50%)';
      }
    }

    balloon.style.visibility = 'visible';

    if (duration > 0) {
      setTimeout(() => {
        if (balloon.parentNode) balloon.remove();
      }, duration);
    }

    return balloon;
  }

  fadeOutExistingBalloons() {
    const container = this._container || document.body;
    const balloons = container.querySelectorAll('.npc-balloon');
    balloons.forEach((b) => {
      if (!b.classList.contains('fade-out')) {
        b.classList.add('fade-out');
        setTimeout(() => {
          if (b.parentNode) b.remove();
        }, 300);
      }
    });
  }

  showNPCMessage(message, options = {}) {
    const { duration = 4000, position = 'center', type = 'info', speaker = null } = options;
    this.hideMessage();

    const el = document.createElement('div');
    el.className = `message-bubble ${type}`;
    el.setAttribute('data-position', position);

    if (speaker) {
      const speakerEl = document.createElement('div');
      speakerEl.className = 'message-speaker';
      speakerEl.textContent = speaker;
      el.appendChild(speakerEl);
    }

    const textEl = document.createElement('div');
    textEl.className = 'message-text';
    textEl.textContent = message;
    el.appendChild(textEl);

    const container = this._container || document.body;
    container.appendChild(el);
    this._currentMessage = el;

    if (duration > 0) {
      this._messageTimeout = setTimeout(() => this.hideMessage(), duration);
    }

    return el;
  }

  cleanup() {
    this._gameLoop.stop();
    window.removeEventListener('resize', this._resizeHandler);
    if (this.gameBoard && this.gameBoard.parentNode) {
      this.gameBoard.parentNode.removeChild(this.gameBoard);
    }
  }

  // --- Private: Game loop callbacks ---

  _update(deltaTime) {
    this._animationTime += deltaTime;

    // Interpolate camera for smooth scrolling
    if (this._camera.interpolate()) {
      this._gameLoop.requestRedraw();
    }

    // Tick movement animation
    if (this._movementAnimator.isAnimating) {
      this._movementAnimator.update(deltaTime);
      this._gameLoop.requestRedraw();
    }

    // Tick particle system
    if (this._particleSystem.particleCount > 0) {
      this._particleSystem.update(deltaTime);
      this._gameLoop.requestRedraw();
    }

    // Continuous redraw for animated tiles (water, field)
    this._gameLoop.requestRedraw();
  }

  _draw(_deltaTime) {
    if (!this._currentGameState) return;

    const ctx = this._ctx;
    const ts = this._camera.tileSize;
    const bounds = this._camera.getVisibleBounds();
    const gameState = this._currentGameState;
    const map = gameState.map;
    const mapWidth = map.width || map.size;
    const mapHeight = map.height || map.size;

    // Clear
    ctx.clearRect(0, 0, this.gameBoard.width, this.gameBoard.height);

    // Draw tiles
    for (let row = bounds.startY; row < bounds.endY; row++) {
      for (let col = bounds.startX; col < bounds.endX; col++) {
        const screenX = (col - bounds.startX) * ts;
        const screenY = (row - bounds.startY) * ts;

        // Determine tile type
        let tileName = 'water';
        if (col >= 0 && col < mapWidth && row >= 0 && row < mapHeight) {
          const pos = { x: col, y: row, equals: () => false };
          // Use getTileAt with a minimal position-like object
          try {
            const tileType = map.getTileAt(
              new (Object.getPrototypeOf(gameState.cursor.position).constructor)(col, row)
            );
            tileName = tileType.name;
          } catch {
            tileName = 'water';
          }
        }

        // Pure overlay decisions delegated to TileOverlayRules
        const getNeighborName = this._neighborGetter(map, mapWidth, mapHeight, col, row, gameState);
        const renderName =
          tileName === 'wall' ? pickWallVariant(getNeighborName) : tileName;

        // Draw tile (sprite or colored rectangle fallback). Rock sprites
        // have a transparent background, so paint a path tile beneath them
        // first — the rock then reads as a boulder placed on the floor.
        if (this._tileRenderer) {
          if (renderName === 'rock') {
            this._tileRenderer.drawTile(ctx, 'path', screenX, screenY);
          }
          this._tileRenderer.drawTile(ctx, renderName, screenX, screenY);
        } else {
          ctx.fillStyle = this._tileColors[renderName] || this._tileColors[tileName] || '#1a8fc4';
          ctx.fillRect(screenX, screenY, ts, ts);
        }

        // Animated tile overlay (water shimmer, field sway)
        if (this._animatedTile.isAnimated(tileName)) {
          const frameOffset = this._animatedTile.getFrameOffset(tileName, this._animationTime);
          if (frameOffset > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.03 * frameOffset})`;
            ctx.fillRect(screenX, screenY, ts, ts);
          }
        }

        // Auto-tiler edge transitions
        this._drawAutoTileTransition(ctx, col, row, screenX, screenY, ts, tileName, map, mapWidth, mapHeight, gameState);

        // Neighbor-aware overlays — cliff edge on water above playable land,
        // grass tufts on non-grass cells adjacent to grass.
        if (this._tileRenderer) {
          if (shouldDrawCliffN(tileName, getNeighborName)) {
            this._tileRenderer.drawTile(ctx, 'cliff_n', screenX, screenY);
          }
          for (const edge of pickGrassEdges(tileName, getNeighborName)) {
            this._tileRenderer.drawTile(ctx, edge, screenX, screenY);
          }
        }

        // Draw entities at this position
        this._drawEntitiesAt(ctx, col, row, screenX, screenY, ts);
      }
    }

    // Decorations split by Y relative to the cursor so the cursor walks
    // BEHIND tall sprites (boulders, trees) at or south of its row, and
    // IN FRONT OF decorations that are strictly north of it.
    const cursorY = gameState.cursor.position.y;
    this._drawDecorations(ctx, map, bounds, ts, (deco) => deco.baseY < cursorY);

    // Draw cursor on top of the north-pass decorations.
    this._drawCursor(ctx, gameState.cursor, bounds, ts);

    // South-pass decorations now draw OVER the cursor — the boulder's
    // upper half occludes the cursor when it stands behind a 2x2 rock.
    this._drawDecorations(ctx, map, bounds, ts, (deco) => deco.baseY >= cursorY);

    // Wall overhang pass — drawn AFTER the cursor so the cobblestone cap of
    // bottom-of-run walls visually extends up into the cell to the north and
    // occludes part of the cursor when the cursor stands directly above a wall.
    this._drawWallOverhang(ctx, map, bounds, ts, gameState);

    // Draw particles on top of everything
    this._particleSystem.draw(ctx);
  }

  _drawWallOverhang(ctx, map, bounds, ts, gameState) {
    if (!this._tileRenderer) return;
    const mapWidth = map.width || map.size;
    const mapHeight = map.height || map.size;
    for (let row = bounds.startY; row < bounds.endY; row++) {
      for (let col = bounds.startX; col < bounds.endX; col++) {
        const getNeighborName = this._neighborGetter(map, mapWidth, mapHeight, col, row, gameState);
        const cellName = getNeighborName(0, 0);
        if (!shouldDrawWallCap(cellName, getNeighborName)) continue;

        const screenX = (col - bounds.startX) * ts;
        const screenY = (row - bounds.startY) * ts;
        this._tileRenderer.drawTile(ctx, 'wall_cap', screenX, screenY);
      }
    }
  }

  _neighborGetter(map, mapWidth, mapHeight, col, row, gameState) {
    const PositionClass = Object.getPrototypeOf(gameState.cursor.position).constructor;
    return (dx, dy) => {
      const nx = col + dx;
      const ny = row + dy;
      if (nx < 0 || nx >= mapWidth || ny < 0 || ny >= mapHeight) return null;
      try {
        const t = map.getTileAt(new PositionClass(nx, ny));
        return t ? t.name : null;
      } catch {
        return null;
      }
    };
  }

  _drawDecorations(ctx, map, bounds, ts, filter) {
    if (!this._tileRenderer || typeof map.getDecorationsInBounds !== 'function') return;
    const visible = map.getDecorationsInBounds(bounds);
    if (visible.length === 0) return;
    const picked = typeof filter === 'function' ? visible.filter(filter) : visible;
    const sorted = [...picked].sort((a, b) => a.anchor.y - b.anchor.y);
    for (const decoration of sorted) {
      const screenX = (decoration.anchor.x - bounds.startX) * ts;
      const screenY = (decoration.anchor.y - bounds.startY) * ts;
      this._tileRenderer.drawDecoration(ctx, decoration, screenX, screenY);
    }
  }

  _drawAutoTileTransition(ctx, col, row, screenX, screenY, ts, tileName, map, mapWidth, mapHeight, gameState) {
    const PositionClass = Object.getPrototypeOf(gameState.cursor.position).constructor;
    const getNeighborName = (nx, ny) => {
      if (nx < 0 || nx >= mapWidth || ny < 0 || ny >= mapHeight) return 'water';
      try {
        return map.getTileAt(new PositionClass(nx, ny)).name;
      } catch {
        return 'water';
      }
    };

    const north = getNeighborName(col, row - 1);
    const east = getNeighborName(col + 1, row);
    const south = getNeighborName(col, row + 1);
    const west = getNeighborName(col - 1, row);

    const mask = this._autoTiler.computeMask(tileName, north, east, south, west);
    if (mask > 0) {
      // Determine dominant neighbor group for color
      const neighborTile = (mask & 1) ? north : (mask & 2) ? east : (mask & 4) ? south : west;
      const neighborGroup = this._autoTiler.getGroup(neighborTile);
      this._autoTiler.drawTransition(ctx, mask, screenX, screenY, ts, neighborGroup);
    }
  }

  _drawEntitiesAt(ctx, worldX, worldY, screenX, screenY, ts) {
    const half = ts / 2;
    const hasCharSprites = this._charSpriteSheet !== null;

    // VIM Key
    const key = this._entityIndex.getKeyAt(worldX, worldY);
    if (key) {
      if (hasCharSprites) {
        this._drawCharSprite(ctx, this._characterSprites.getVimKeyFrame(), screenX, screenY, ts);
        // Draw key letter on top of keycap
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 16px Arial, Helvetica, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(key.key, screenX + half, screenY + half);
      } else {
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(key.key, screenX + half, screenY + half);
      }
    }

    // Collectible Key
    const ck = this._entityIndex.getCollectibleAt(worldX, worldY);
    if (ck) {
      if (hasCharSprites) {
        this._drawCharSprite(
          ctx,
          this._characterSprites.getCollectibleKeyFrame(),
          screenX,
          screenY,
          ts
        );
      } else {
        ctx.fillStyle = ck.color || '#FFD700';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\uD83D\uDD11', screenX + half, screenY + half);
      }
    }

    // Gate
    const gate = this._entityIndex.getGateAt(worldX, worldY);
    if (gate) {
      if (hasCharSprites) {
        this._drawCharSprite(
          ctx,
          this._characterSprites.getGateFrame(gate.isOpen),
          screenX,
          screenY,
          ts
        );
      } else {
        ctx.fillStyle = gate.isOpen ? '#27ae60' : '#e74c3c';
        ctx.fillRect(screenX + 4, screenY + 4, ts - 8, ts - 8);
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          gate.isOpen ? '\uD83D\uDEAA' : '\uD83D\uDEA7',
          screenX + half,
          screenY + half
        );
      }
    }

    // Secondary Gate
    const sg = this._entityIndex.getSecondaryGateAt(worldX, worldY);
    if (sg) {
      if (hasCharSprites) {
        this._drawCharSprite(
          ctx,
          this._characterSprites.getGateFrame(false),
          screenX,
          screenY,
          ts
        );
      } else {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX + 2, screenY + 2, ts - 4, ts - 4);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(screenX + ts * 0.75, screenY + half, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Text Label
    const label = this._entityIndex.getTextLabelAt(worldX, worldY);
    if (label) {
      ctx.font = 'bold 13px Arial, Helvetica, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#333333';
      ctx.fillText(label.text, screenX + half, screenY + half);
    }

    // NPC
    const npc = this._entityIndex.getNPCAt(worldX, worldY);
    if (npc) {
      const npcSpriteId = this._characterSprites.hasNPC(npc.id) ? npc.id : (npc.type || '');
      if (hasCharSprites && this._characterSprites.hasNPC(npcSpriteId)) {
        // Match the cursor's 1.35x overflow rendering: feet anchored at
        // the cell's bottom edge, head spills up into the cell above.
        // Plus a 1-pixel idle bob with per-NPC phase so adjacent NPCs
        // don't bob in unison.
        const scale = 1.35;
        const destSize = ts * scale;
        const overflowX = (destSize - ts) / 2;
        const overflowY = destSize - ts;
        const phaseSeed = (worldX * 7 + worldY * 13) % 4;
        const bob = Math.floor(this._animationTime / 0.45 + phaseSeed) % 2 === 0 ? 0 : -1;
        const frame = this._charSpriteSheet.getFrame(
          this._characterSprites.getNPCFrame(npcSpriteId)
        );
        ctx.drawImage(
          frame.image,
          frame.sx,
          frame.sy,
          frame.sw,
          frame.sh,
          screenX - overflowX,
          screenY - overflowY + bob,
          destSize,
          destSize
        );
      } else {
        const symbol =
          npc.getVisualSymbol && typeof npc.getVisualSymbol === 'function'
            ? npc.getVisualSymbol()
            : this._getNpcFallbackSymbol(npc);
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, screenX + half, screenY + half);
      }
    }
  }

  _drawCursor(ctx, cursor, bounds, ts) {
    // Use animated position if movement animation is active
    let cx, cy;
    if (this._movementAnimator.isAnimating) {
      const animPos = this._movementAnimator.getCurrentPosition();
      cx = animPos.x;
      cy = animPos.y;
    } else {
      cx = cursor.position.x;
      cy = cursor.position.y;
    }

    if (cx >= bounds.startX - 1 && cx < bounds.endX + 1 && cy >= bounds.startY - 1 && cy < bounds.endY + 1) {
      const screenX = (cx - bounds.startX) * ts;
      const screenY = (cy - bounds.startY) * ts;

      if (this._charSpriteSheet) {
        const cursorFrame = this._characterSprites.getCursorFrame(
          this._animationTime,
          this._facing,
          this._movementAnimator.isAnimating
        );
        // Pokemon-style sprite that overflows its grid cell: render the
        // 32x32 source at 1.35x size, anchored at the cell's bottom edge
        // (feet stay aligned with the grid; head spills above the cell).
        const scale = 1.35;
        const destSize = ts * scale;
        const overflowX = (destSize - ts) / 2;
        const overflowY = destSize - ts;
        const frame = this._charSpriteSheet.getFrame(cursorFrame);
        ctx.drawImage(
          frame.image,
          frame.sx,
          frame.sy,
          frame.sw,
          frame.sh,
          screenX - overflowX,
          screenY - overflowY,
          destSize,
          destSize
        );
      } else {
        ctx.fillStyle = 'rgba(243, 156, 18, 0.85)';
        ctx.fillRect(screenX, screenY, ts, ts);
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u25CF', screenX + ts / 2, screenY + ts / 2);
      }
    }
  }

  _drawCharSprite(ctx, frameIndex, screenX, screenY, ts) {
    const frame = this._charSpriteSheet.getFrame(frameIndex);
    ctx.drawImage(frame.image, frame.sx, frame.sy, frame.sw, frame.sh, screenX, screenY, ts, ts);
  }

  // --- Private: Helpers ---

  _formatKeyName(keyId) {
    return keyId
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  _showCollectibleKeyFeedback(collectibleKey) {
    const el = document.createElement('div');
    el.className = 'key-collection-feedback';
    el.textContent = `Found ${this._formatKeyName(collectibleKey.keyId)}!`;
    document.body.appendChild(el);
    setTimeout(() => {
      if (document.body.contains(el)) document.body.removeChild(el);
    }, 2000);
  }

  showLevelComplete(nextLevelId) {
    this.clearAllOverlays();
    return new Promise((resolve) => {
      const overlay = VimKeyInfo.createLevelCompleteOverlay(nextLevelId, () => {
        this.focus();
        resolve();
      });
      (this._container || document.body).appendChild(overlay);
    });
  }

  clearAllOverlays() {
    const overlay = document.getElementById('vimKeyExplanation');
    if (overlay) overlay.remove();
    this.hideMessage();
    this.fadeOutExistingBalloons();
  }

  showLockedGateHint(gateType) {
    // Don't show if one is already visible or was shown recently
    const existing = document.getElementById('vimKeyExplanation');
    if (existing) return;
    if (this._gateHintCooldown) return;

    this._gateHintCooldown = true;
    setTimeout(() => { this._gateHintCooldown = false; }, 5000);

    const overlay = VimKeyInfo.createLockedGateOverlay(gateType, () => this.focus());
    const container = this._container || document.body;
    container.appendChild(overlay);
  }

  showCollectibleKeyIntro(collectibleKey) {
    const existing = document.getElementById('vimKeyExplanation');
    if (existing) existing.remove();

    const overlay = VimKeyInfo.createCollectibleIntroOverlay(collectibleKey, () => this.focus());
    const container = this._container || document.body;
    container.appendChild(overlay);
  }

  _showVimKeyExplanation(vimKey) {
    const existing = document.getElementById('vimKeyExplanation');
    if (existing) existing.remove();

    const overlay = VimKeyInfo.createOverlay(vimKey, () => this.focus());
    const container = this._container || document.body;
    container.appendChild(overlay);
  }

  _getNpcFallbackSymbol(npc) {
    const symbols = {
      caret_spirit: '\uD83D\uDD25',
      syntax_wisp: '~',
      bug_king: '\u265B',
      bug_king_boss: '\u265B',
      caret_stone: '\uD83D\uDDFF',
      maze_scribe: '\uD83D\uDCDC',
      mode_guardian: '\uD83D\uDCDC',
      deletion_echo: '\uD83D\uDC7B',
      insert_scribe: '\u270F\uFE0F',
      scribe_poet: '\u270F\uFE0F',
      the_yanker: '\uD83C\uDF89',
      mirror_sprite: '\uD83D\uDCA7',
      reflection_spirit: '\uD83D\uDCA7',
      practice_buddy: '\uD83C\uDF89',
      practice_spirit_1: '\uD83C\uDF89',
      practice_spirit_2: '\uD83C\uDF89',
      practice_spirit_3: '\uD83C\uDF89',
      final_encourager: '\uD83C\uDF89',
      syntax_spirit: '\uD83D\uDCDC',
      word_witch: '\uD83D\uDC7B',
    };
    if (npc.id && symbols[npc.id]) return symbols[npc.id];
    if (npc.type && symbols[npc.type]) return symbols[npc.type];
    return '\uD83E\uDDD9\u200D\u2642\uFE0F';
  }

  _findNPCScreenPosition(npc) {
    if (!npc || !npc.position) return null;
    const npcX = Array.isArray(npc.position) ? npc.position[0] : npc.position.x;
    const npcY = Array.isArray(npc.position) ? npc.position[1] : npc.position.y;
    return this._camera.worldToScreen(npcX, npcY);
  }
}
