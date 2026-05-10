/**
 * Paints high-quality tiles at runtime using Canvas 2D API.
 * Each tile is painted once onto an offscreen canvas and cached.
 *
 * Visual style: GBA-era RPG aesthetic (Pokemon/Zelda) with
 * dark outlines, 3-4 shade depth, consistent top-left lighting,
 * and clear silhouettes that create a 2D-that-looks-3D effect.
 */
export class TilePainter {
  constructor(tileSize = 32, columns = 16) {
    this._ts = tileSize;
    this._columns = columns;
  }

  createTilesetCanvas() {
    const ts = this._ts;
    const canvas = document.createElement('canvas');
    canvas.width = this._columns * ts;
    canvas.height = ts;
    const ctx = canvas.getContext('2d');

    const painters = [
      (c) => this._paintWater(c),
      (c) => this._paintGrass(c),
      (c) => this._paintDirt(c),
      (c) => this._paintTree(c),
      (c) => this._paintStone(c),
      (c) => this._paintPath(c),
      (c) => this._paintWall(c),
      (c) => this._paintBridge(c),
      (c) => this._paintSand(c),
      (c) => this._paintRuins(c),
      (c) => this._paintField(c),
      (c) => this._paintTestGround(c),
      (c) => this._paintBossArea(c),
      (c) => this._paintRampRight(c),
      (c) => this._paintRampLeft(c),
      (c) => this._paintVoid(c),
    ];

    painters.forEach((paint, i) => {
      const tc = document.createElement('canvas');
      tc.width = ts;
      tc.height = ts;
      paint(tc.getContext('2d'));
      ctx.drawImage(tc, i * ts, 0);
    });

    return canvas;
  }

  createCharacterCanvas() {
    const ts = this._ts;
    const cols = 10;
    const rows = 2;
    const canvas = document.createElement('canvas');
    canvas.width = cols * ts;
    canvas.height = rows * ts;
    const ctx = canvas.getContext('2d');

    const painters = [
      (c) => this._paintCursor(c, 1.0),
      (c) => this._paintCursor(c, 0.82),
      (c) => this._paintCursor(c, 0.55),
      (c) => this._paintCursor(c, 0.82),
      (c) => this._paintVimKey(c),
      (c) => this._paintCollectibleKey(c),
      (c) => this._paintGateOpen(c),
      null, null, null,
      (c) => this._paintGateClosed(c),
      (c) => this._paintCaretSpirit(c),
      (c) => this._paintSyntaxWisp(c),
      (c) => this._paintBugKing(c),
      (c) => this._paintCaretStone(c),
      (c) => this._paintMazeScribe(c),
      (c) => this._paintDeletionEcho(c),
      (c) => this._paintInsertScribe(c),
      (c) => this._paintPracticeBuddy(c),
      (c) => this._paintMirrorSprite(c),
    ];

    painters.forEach((paint, i) => {
      if (!paint) return;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tc = document.createElement('canvas');
      tc.width = ts;
      tc.height = ts;
      paint(tc.getContext('2d'));
      ctx.drawImage(tc, col * ts, row * ts);
    });

    return canvas;
  }

  // ========== HELPERS ==========

  _outline(ctx, x, y, w, h, color = '#1a1a2e') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  _sphere(ctx, cx, cy, r, baseColor, highlightColor, shadowColor) {
    // Shadow
    const shadow = ctx.createRadialGradient(cx + r * 0.2, cy + r * 0.2, r * 0.1, cx, cy, r);
    shadow.addColorStop(0, highlightColor);
    shadow.addColorStop(0.5, baseColor);
    shadow.addColorStop(1, shadowColor);
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Specular highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== TILE PAINTERS ==========

  _paintWater(ctx) {
    const ts = this._ts;

    const bg = ctx.createLinearGradient(0, 0, ts, ts);
    bg.addColorStop(0, '#4888b8');
    bg.addColorStop(0.5, '#3878a0');
    bg.addColorStop(1, '#5090c0');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);

    // Diagonal hatch
    ctx.strokeStyle = 'rgba(80, 140, 190, 0.5)';
    ctx.lineWidth = 1;
    for (let i = -ts; i < ts * 2; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + ts, ts);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(50, 100, 150, 0.25)';
    for (let i = -ts; i < ts * 2; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i + ts, 0);
      ctx.lineTo(i, ts);
      ctx.stroke();
    }

    // Wave highlights
    ctx.strokeStyle = 'rgba(130, 190, 230, 0.45)';
    ctx.lineWidth = 1.5;
    for (const yBase of [9, 22]) {
      ctx.beginPath();
      for (let x = 0; x < ts; x++) {
        const y = yBase + Math.sin(x * 0.35) * 2;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  _paintGrass(ctx) {
    const ts = this._ts;
    ctx.fillStyle = '#58a848';
    ctx.fillRect(0, 0, ts, ts);

    // Subtle checkerboard depth
    ctx.fillStyle = 'rgba(75, 180, 65, 0.25)';
    ctx.fillRect(0, 0, ts / 2, ts / 2);
    ctx.fillRect(ts / 2, ts / 2, ts / 2, ts / 2);
    ctx.fillStyle = 'rgba(60, 145, 50, 0.2)';
    ctx.fillRect(ts / 2, 0, ts / 2, ts / 2);
    ctx.fillRect(0, ts / 2, ts / 2, ts / 2);

    // Blade clusters (light tips)
    ctx.fillStyle = '#70c860';
    const blades = [[3, 4], [9, 2], [16, 6], [22, 3], [28, 5],
      [5, 14], [13, 11], [20, 15], [27, 12],
      [2, 23], [10, 20], [17, 25], [24, 21], [29, 27]];
    blades.forEach(([bx, by]) => {
      ctx.fillRect(bx, by, 2, 1);
      ctx.fillRect(bx, by + 1, 1, 2);
    });

    // Dark grass shadows
    ctx.fillStyle = 'rgba(40, 120, 35, 0.3)';
    [[7, 8], [19, 18], [4, 27], [25, 8]].forEach(([sx, sy]) => {
      ctx.fillRect(sx, sy, 3, 2);
    });
  }

  _paintDirt(ctx) {
    const ts = this._ts;
    const bg = ctx.createLinearGradient(0, 0, ts, ts);
    bg.addColorStop(0, '#c8a868');
    bg.addColorStop(1, '#b89858');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);

    // Pebbles with highlight/shadow (3D rocks)
    [[7, 8, 3], [20, 5, 2.5], [26, 18, 3], [12, 24, 2], [5, 16, 2]].forEach(([px, py, r]) => {
      this._sphere(ctx, px, py, r, '#a08050', '#c0a070', '#806838');
    });

    // Light speckles
    ctx.fillStyle = 'rgba(210, 190, 140, 0.4)';
    [[3, 3], [15, 14], [28, 10], [10, 28]].forEach(([sx, sy]) => ctx.fillRect(sx, sy, 2, 2));
  }

  _paintTree(ctx) {
    const ts = this._ts;

    // Ground beneath
    ctx.fillStyle = '#4a9840';
    ctx.fillRect(0, 0, ts, ts);
    ctx.fillStyle = 'rgba(55, 130, 45, 0.3)';
    ctx.fillRect(0, 0, ts / 2, ts / 2);
    ctx.fillRect(ts / 2, ts / 2, ts / 2, ts / 2);

    // Shadow on ground
    ctx.fillStyle = 'rgba(20, 50, 15, 0.35)';
    ctx.beginPath();
    ctx.ellipse(ts / 2 + 2, ts - 3, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk with 3D shading
    const trunkG = ctx.createLinearGradient(12, 0, 20, 0);
    trunkG.addColorStop(0, '#5a3820');
    trunkG.addColorStop(0.3, '#7a5838');
    trunkG.addColorStop(0.7, '#6a4828');
    trunkG.addColorStop(1, '#4a2810');
    ctx.fillStyle = trunkG;
    ctx.fillRect(13, 18, 6, 14);
    // Trunk outline
    ctx.strokeStyle = '#2a1808';
    ctx.lineWidth = 1;
    ctx.strokeRect(13, 18, 6, 14);

    // Canopy layers (bottom to top, each smaller and lighter) - Pokemon tree style
    const layers = [
      { y: 16, rx: 14, ry: 8, base: '#2a8030', hi: '#40a048', sh: '#1a6020' },
      { y: 11, rx: 12, ry: 7, base: '#38a040', hi: '#58c060', sh: '#288830' },
      { y: 6, rx: 9, ry: 6, base: '#48b850', hi: '#68d870', sh: '#30a038' },
    ];

    layers.forEach(({ y, rx, ry, base, hi, sh }) => {
      // Main canopy shape
      const g = ctx.createRadialGradient(ts / 2 - 2, y - 1, 0, ts / 2, y, Math.max(rx, ry));
      g.addColorStop(0, hi);
      g.addColorStop(0.6, base);
      g.addColorStop(1, sh);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(ts / 2, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outline
      ctx.strokeStyle = '#1a4018';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ts / 2, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Specular highlight on top layer
    ctx.fillStyle = 'rgba(180, 255, 180, 0.3)';
    ctx.beginPath();
    ctx.ellipse(ts / 2 - 3, 3, 4, 2.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  _paintStone(ctx) {
    const ts = this._ts;
    ctx.fillStyle = '#d0ccbe';
    ctx.fillRect(0, 0, ts, ts);

    const bh = 8, bw = 16;
    for (let row = 0; row < ts / bh; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = -1; col < ts / bw + 1; col++) {
        const bx = col * bw + offset;
        const by = row * bh;
        const shade = ((row * 3 + col * 7) % 5) * 3;

        // Brick face gradient (top-left lit)
        const g = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
        g.addColorStop(0, `rgb(${218 + shade}, ${214 + shade}, ${204 + shade})`);
        g.addColorStop(1, `rgb(${195 + shade}, ${191 + shade}, ${181 + shade})`);
        ctx.fillStyle = g;
        ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);

        // Top-left highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(bx + 1, by + 1, bw - 2, 1);
        ctx.fillRect(bx + 1, by + 1, 1, bh - 2);

        // Bottom-right shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(bx + 1, by + bh - 2, bw - 2, 1);
        ctx.fillRect(bx + bw - 2, by + 1, 1, bh - 2);
      }
    }

    // Mortar
    ctx.fillStyle = '#a8a498';
    for (let row = 0; row <= ts / bh; row++) ctx.fillRect(0, row * bh, ts, 1);
    for (let row = 0; row < ts / bh; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = -1; col < ts / bw + 2; col++) ctx.fillRect(col * bw + offset, row * bh, 1, bh);
    }
  }

  _paintPath(ctx) {
    const ts = this._ts;
    const bg = ctx.createLinearGradient(0, 0, ts, ts);
    bg.addColorStop(0, '#d8c878');
    bg.addColorStop(1, '#c8b860');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);

    ctx.fillStyle = 'rgba(190,170,100,0.25)';
    [[5, 7, 2.5], [18, 14, 2], [27, 24, 2], [10, 26, 1.5]].forEach(([px, py, r]) => {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(230,220,160,0.3)';
    [[12, 4], [24, 18], [6, 20]].forEach(([sx, sy]) => ctx.fillRect(sx, sy, 3, 2));
  }

  _paintWall(ctx) {
    const ts = this._ts;
    const faceW = 24, faceH = 24;

    // Main brick face
    ctx.fillStyle = '#5a6878';
    ctx.fillRect(0, 0, faceW, faceH);

    const bh = 6, bw = 12;
    for (let row = 0; row < faceH / bh; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = -1; col < faceW / bw + 1; col++) {
        const bx = col * bw + offset;
        const by = row * bh;
        const shade = ((row + col) % 3) * 2;
        ctx.fillStyle = `rgb(${90 + shade}, ${105 + shade}, ${118 + shade})`;
        ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
        // Per-brick highlight
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(bx + 1, by + 1, bw - 2, 1);
        ctx.fillRect(bx + 1, by + 1, 1, bh - 2);
        // Per-brick shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(bx + 1, by + bh - 2, bw - 2, 1);
        ctx.fillRect(bx + bw - 2, by + 1, 1, bh - 2);
      }
    }
    // Mortar
    ctx.fillStyle = '#3a4858';
    for (let row = 0; row <= faceH / bh; row++) ctx.fillRect(0, row * bh, faceW, 1);
    for (let row = 0; row < faceH / bh; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = -1; col < faceW / bw + 2; col++) ctx.fillRect(col * bw + offset, row * bh, 1, bh);
    }

    // Right face (3D depth)
    const rf = ctx.createLinearGradient(faceW, 0, ts, 0);
    rf.addColorStop(0, '#4a5565');
    rf.addColorStop(1, '#252d38');
    ctx.fillStyle = rf;
    ctx.fillRect(faceW, 0, ts - faceW, faceH);
    // Vertical mortar on right face
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let row = 0; row <= faceH / bh; row++) ctx.fillRect(faceW, row * bh, ts - faceW, 1);

    // Bottom face (3D depth)
    const bf = ctx.createLinearGradient(0, faceH, 0, ts);
    bf.addColorStop(0, '#4a5565');
    bf.addColorStop(1, '#252d38');
    ctx.fillStyle = bf;
    ctx.fillRect(0, faceH, faceW, ts - faceH);

    // Corner
    ctx.fillStyle = '#1a2028';
    ctx.fillRect(faceW, faceH, ts - faceW, ts - faceH);

    // Top-left edge highlight
    ctx.fillStyle = 'rgba(160, 180, 200, 0.3)';
    ctx.fillRect(0, 0, faceW, 1);
    ctx.fillRect(0, 0, 1, faceH);
  }

  _paintBridge(ctx) {
    const ts = this._ts;
    ctx.fillStyle = '#8b6845';
    ctx.fillRect(0, 0, ts, ts);

    for (let y = 0; y < ts; y += 8) {
      ctx.fillStyle = '#6b4828';
      ctx.fillRect(0, y, ts, 2);
      ctx.fillStyle = 'rgba(200,160,100,0.2)';
      ctx.fillRect(0, y + 2, ts, 1);
    }
    ctx.strokeStyle = 'rgba(160,120,80,0.2)';
    ctx.lineWidth = 1;
    for (let y = 3; y < ts; y += 8) {
      ctx.beginPath();
      for (let x = 0; x < ts; x++) {
        const gy = y + Math.sin(x * 0.4) * 0.8;
        x === 0 ? ctx.moveTo(x, gy) : ctx.lineTo(x, gy);
      }
      ctx.stroke();
    }
  }

  _paintSand(ctx) {
    const ts = this._ts;
    const bg = ctx.createRadialGradient(ts / 2, ts / 2, 0, ts / 2, ts / 2, ts * 0.8);
    bg.addColorStop(0, '#e4d480');
    bg.addColorStop(1, '#d8c870');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);
    ctx.fillStyle = 'rgba(180,160,80,0.15)';
    [[8, 6, 2.5], [22, 20, 3], [14, 28, 2]].forEach(([px, py, r]) => {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  _paintRuins(ctx) {
    this._paintStone(ctx);
    // Cracks with shadow
    ctx.strokeStyle = 'rgba(40, 40, 30, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.lineTo(14, 14);
    ctx.lineTo(10, 24);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(24, 6);
    ctx.lineTo(20, 16);
    ctx.stroke();
    // Moss
    ctx.fillStyle = 'rgba(70, 150, 50, 0.5)';
    ctx.beginPath();
    ctx.arc(4, 26, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(26, 5, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  _paintField(ctx) {
    const ts = this._ts;
    ctx.fillStyle = '#50b858';
    ctx.fillRect(0, 0, ts, ts);
    // Crop rows
    for (let y = 0; y < ts; y += 6) {
      ctx.fillStyle = '#68d070';
      for (let x = 0; x < ts; x += 4) ctx.fillRect(x + 1, y, 2, 4);
      ctx.fillStyle = 'rgba(40, 140, 45, 0.3)';
      ctx.fillRect(0, y + 4, ts, 2);
    }
  }

  _paintTestGround(ctx) {
    const ts = this._ts;
    const bg = ctx.createLinearGradient(0, 0, ts, ts);
    bg.addColorStop(0, '#b090c8');
    bg.addColorStop(1, '#a080b8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);
    ctx.fillStyle = 'rgba(180, 150, 210, 0.25)';
    for (let y = 0; y < ts; y += 4) for (let x = 0; x < ts; x += 4)
      if ((x + y) % 8 === 0) ctx.fillRect(x, y, 2, 2);
  }

  _paintBossArea(ctx) {
    const ts = this._ts;
    const bg = ctx.createRadialGradient(ts / 2, ts / 2, 0, ts / 2, ts / 2, ts * 0.6);
    bg.addColorStop(0, '#d04040');
    bg.addColorStop(1, '#901818');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);
    ctx.strokeStyle = '#601010';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, ts - 2, ts - 2);
    ctx.fillStyle = 'rgba(255, 80, 60, 0.15)';
    ctx.fillRect(4, 4, ts - 8, ts - 8);
  }

  _paintRampRight(ctx) {
    const ts = this._ts;
    // Left half is ground
    ctx.fillStyle = '#90a0b8';
    ctx.fillRect(0, 0, ts, ts);

    // Right half is wall with brick pattern
    ctx.fillStyle = '#5a6878';
    ctx.fillRect(ts / 2, 0, ts / 2, ts);
    const bh = 6, bw = 8;
    for (let row = 0; row < ts / bh; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = 0; col < ts / 2 / bw + 1; col++) {
        const bx = ts / 2 + col * bw + offset;
        const by = row * bh;
        ctx.fillStyle = `rgb(${90 + (row + col) % 3 * 2}, ${105 + (row + col) % 3 * 2}, ${118 + (row + col) % 3 * 2})`;
        ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(bx + 1, by + 1, bw - 2, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(bx + 1, by + bh - 2, bw - 2, 1);
      }
      ctx.fillStyle = '#3a4858';
      ctx.fillRect(ts / 2, row * bh, ts / 2, 1);
    }

    // Slope gradient transition
    const slope = ctx.createLinearGradient(ts / 2 - 4, 0, ts / 2 + 4, 0);
    slope.addColorStop(0, '#90a0b8');
    slope.addColorStop(1, '#4a5868');
    ctx.fillStyle = slope;
    ctx.fillRect(ts / 2 - 4, 0, 8, ts);
  }

  _paintRampLeft(ctx) {
    const ts = this._ts;
    // Right half is ground
    ctx.fillStyle = '#90a0b8';
    ctx.fillRect(0, 0, ts, ts);

    // Left half is wall with brick pattern
    ctx.fillStyle = '#5a6878';
    ctx.fillRect(0, 0, ts / 2, ts);
    const bh = 6, bw = 8;
    for (let row = 0; row < ts / bh; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = -1; col < ts / 2 / bw + 1; col++) {
        const bx = col * bw + offset;
        const by = row * bh;
        if (bx + bw <= 0 || bx >= ts / 2) continue;
        ctx.fillStyle = `rgb(${90 + (row + col) % 3 * 2}, ${105 + (row + col) % 3 * 2}, ${118 + (row + col) % 3 * 2})`;
        ctx.fillRect(Math.max(0, bx + 1), by + 1, Math.min(bw - 2, ts / 2 - bx - 1), bh - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(Math.max(0, bx + 1), by + 1, Math.min(bw - 2, ts / 2 - bx - 1), 1);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(Math.max(0, bx + 1), by + bh - 2, Math.min(bw - 2, ts / 2 - bx - 1), 1);
      }
      ctx.fillStyle = '#3a4858';
      ctx.fillRect(0, row * bh, ts / 2, 1);
    }

    // Slope gradient transition
    const slope = ctx.createLinearGradient(ts / 2 - 4, 0, ts / 2 + 4, 0);
    slope.addColorStop(0, '#4a5868');
    slope.addColorStop(1, '#90a0b8');
    ctx.fillStyle = slope;
    ctx.fillRect(ts / 2 - 4, 0, 8, ts);
  }

  _paintVoid(ctx) {
    ctx.fillStyle = '#0e0e14';
    ctx.fillRect(0, 0, this._ts, this._ts);
  }

  // ========== CHARACTER / ENTITY PAINTERS ==========

  _paintCursor(ctx, opacity) {
    const ts = this._ts;
    ctx.globalAlpha = opacity;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(ts / 2 + 1, ts - 3, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bg = ctx.createLinearGradient(6, 0, ts - 6, 0);
    bg.addColorStop(0, '#e8e0d0');
    bg.addColorStop(0.15, '#ffffff');
    bg.addColorStop(0.85, '#f0f0e8');
    bg.addColorStop(1, '#d8d0c0');
    ctx.fillStyle = bg;
    ctx.fillRect(6, 2, ts - 12, ts - 6);

    // Outline
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 2, ts - 12, ts - 6);

    // Cursor bar
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(9, 5, 3, ts - 12);

    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(8, 3, ts - 16, 2);

    ctx.globalAlpha = 1;
  }

  _paintVimKey(ctx) {
    const ts = this._ts;

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(7, 6, ts - 11, ts - 8);

    // Keycap face
    const face = ctx.createLinearGradient(0, 3, 0, ts - 4);
    face.addColorStop(0, '#ffffff');
    face.addColorStop(0.1, '#f4f4f4');
    face.addColorStop(0.85, '#e0e0e0');
    face.addColorStop(1, '#c8c8c8');
    ctx.fillStyle = face;
    ctx.fillRect(5, 3, ts - 11, ts - 8);

    // Outline
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5, 3, ts - 11, ts - 8);

    // Top shine
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(7, 4, ts - 15, 2);
  }

  _paintCollectibleKey(ctx) {
    const ts = this._ts;

    // Ring
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(11, 11, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(11, 11, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Shaft
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(16, 9, 12, 3);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(16, 12, 12, 1);

    // Teeth
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(23, 12, 2, 4);
    ctx.fillRect(27, 12, 2, 4);

    // Outline
    ctx.strokeStyle = '#705000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(11, 11, 7.5, 0, Math.PI * 2);
    ctx.stroke();

    // Shine
    ctx.fillStyle = 'rgba(255,255,220,0.7)';
    ctx.beginPath();
    ctx.arc(8, 8, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  _paintGateOpen(ctx) {
    const ts = this._ts;
    // Pillars
    [[4, 9], [ts - 10, ts - 10]].forEach(([x]) => {
      const pg = ctx.createLinearGradient(x, 0, x + 6, 0);
      pg.addColorStop(0, '#1a8038');
      pg.addColorStop(0.5, '#28a848');
      pg.addColorStop(1, '#1a7030');
      ctx.fillStyle = pg;
      ctx.fillRect(x, 3, 6, ts - 3);
      ctx.strokeStyle = '#0a4018';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, 3, 6, ts - 3);
    });
    // Right pillar
    const pg2 = ctx.createLinearGradient(ts - 10, 0, ts - 4, 0);
    pg2.addColorStop(0, '#1a8038');
    pg2.addColorStop(0.5, '#28a848');
    pg2.addColorStop(1, '#1a7030');
    ctx.fillStyle = pg2;
    ctx.fillRect(ts - 10, 3, 6, ts - 3);
    ctx.strokeStyle = '#0a4018';
    ctx.lineWidth = 1;
    ctx.strokeRect(ts - 10, 3, 6, ts - 3);
    // Arch
    ctx.fillStyle = '#28a848';
    ctx.fillRect(4, 3, ts - 8, 4);
    ctx.strokeStyle = '#0a4018';
    ctx.strokeRect(4, 3, ts - 8, 4);
    // Opening
    ctx.fillStyle = '#0a2810';
    ctx.fillRect(10, 7, ts - 20, ts - 7);
  }

  _paintGateClosed(ctx) {
    const ts = this._ts;
    // Door
    const door = ctx.createLinearGradient(6, 0, ts - 6, 0);
    door.addColorStop(0, '#7a3a0e');
    door.addColorStop(0.3, '#a0622d');
    door.addColorStop(0.7, '#965828');
    door.addColorStop(1, '#6a2e08');
    ctx.fillStyle = door;
    ctx.fillRect(5, 2, ts - 10, ts - 3);
    // Frame
    ctx.strokeStyle = '#3a1808';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 2, ts - 10, ts - 3);
    // Panels with 3D inset
    [[8, 5, 7, 10], [ts - 15, 5, 7, 10], [8, 18, 7, 9], [ts - 15, 18, 7, 9]].forEach(([px, py, pw, ph]) => {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(px, py, pw, 1);
      ctx.fillRect(px, py, 1, ph);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(px, py + ph - 1, pw, 1);
      ctx.fillRect(px + pw - 1, py, 1, ph);
    });
    // Knob
    const knob = ctx.createRadialGradient(ts - 10, 16, 0, ts - 10, 16, 3.5);
    knob.addColorStop(0, '#ffe860');
    knob.addColorStop(1, '#b88a18');
    ctx.fillStyle = knob;
    ctx.beginPath();
    ctx.arc(ts - 10, 16, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#705000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ts - 10, 16, 3.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ===== NPC PAINTERS (RPG sprite-character style) =====

  _paintCaretSpirit(ctx) {
    const ts = this._ts;
    // Flame body with 3D glow layers
    const layers = [
      { y: ts - 6, rx: 10, ry: 12, color: '#1a6060' },
      { y: ts - 8, rx: 8, ry: 11, color: '#28a0a0' },
      { y: ts - 10, rx: 6, ry: 9, color: '#40d8d8' },
      { y: ts - 12, rx: 4, ry: 6, color: '#90f0f0' },
    ];
    layers.forEach(({ y, rx, ry, color }) => {
      const g = ctx.createRadialGradient(ts / 2, y - 2, 0, ts / 2, y, Math.max(rx, ry));
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(ts / 2, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // Flame tip
    ctx.fillStyle = '#e0ffff';
    ctx.beginPath();
    ctx.moveTo(ts / 2, 2);
    ctx.quadraticCurveTo(ts / 2 + 4, 10, ts / 2, 14);
    ctx.quadraticCurveTo(ts / 2 - 4, 10, ts / 2, 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#e0ffff';
    ctx.fillRect(12, 18, 3, 3);
    ctx.fillRect(19, 18, 3, 3);
    ctx.fillStyle = '#0a3030';
    ctx.fillRect(13, 19, 1, 1);
    ctx.fillRect(20, 19, 1, 1);
    // Outline
    ctx.strokeStyle = '#0a4040';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ts / 2, 1);
    ctx.quadraticCurveTo(ts - 4, ts / 2, ts - 6, ts - 4);
    ctx.quadraticCurveTo(ts / 2, ts, 6, ts - 4);
    ctx.quadraticCurveTo(4, ts / 2, ts / 2, 1);
    ctx.stroke();
  }

  _paintSyntaxWisp(ctx) {
    const ts = this._ts;
    // Ethereal body
    const body = ctx.createRadialGradient(ts / 2, ts / 2, 0, ts / 2, ts / 2, 14);
    body.addColorStop(0, '#e8d8f0');
    body.addColorStop(0.4, '#c8a0e0');
    body.addColorStop(0.8, '#a070c0');
    body.addColorStop(1, 'rgba(100,50,140,0)');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(ts / 2, ts / 2, 14, 0, Math.PI * 2);
    ctx.fill();
    // Wispy tendrils
    ctx.strokeStyle = 'rgba(180,140,220,0.5)';
    ctx.lineWidth = 2;
    [[0, -3], [2, 2], [-2, 1]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(ts / 2 + dx, ts / 2 + 8 + dy);
      ctx.quadraticCurveTo(ts / 2 + dx + 4, ts - 2, ts / 2 + dx - 2, ts + 2);
      ctx.stroke();
    });
    // Tilde symbol
    ctx.fillStyle = '#e6e6fa';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('~', ts / 2, ts / 2 - 1);
    // Outline
    ctx.strokeStyle = '#4a2868';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ts / 2, ts / 2, 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  _paintBugKing(ctx) {
    const ts = this._ts;
    // Body (dark red robe)
    const robe = ctx.createLinearGradient(7, 12, ts - 7, 12);
    robe.addColorStop(0, '#701010');
    robe.addColorStop(0.5, '#b02020');
    robe.addColorStop(1, '#801515');
    ctx.fillStyle = robe;
    ctx.fillRect(7, 12, ts - 14, 16);
    ctx.strokeStyle = '#401010';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(7, 12, ts - 14, 16);

    // Crown
    ctx.fillStyle = '#c02020';
    ctx.beginPath();
    ctx.moveTo(7, 12);
    ctx.lineTo(7, 5);
    ctx.lineTo(11, 10);
    ctx.lineTo(16, 2);
    ctx.lineTo(21, 10);
    ctx.lineTo(25, 5);
    ctx.lineTo(25, 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#401010';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Gold trim
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(7, 12, ts - 14, 2);
    // Jewels
    [[9, 5], [16, 2], [23, 5]].forEach(([jx, jy]) => {
      this._sphere(ctx, jx, jy, 2.5, '#ffd700', '#fff8b0', '#b8860b');
    });

    // Eyes
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(11, 17, 4, 3);
    ctx.fillRect(19, 17, 4, 3);
    ctx.fillStyle = '#400000';
    ctx.fillRect(12, 18, 2, 1);
    ctx.fillRect(20, 18, 2, 1);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(ts / 2, ts - 2, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _paintCaretStone(ctx) {
    const ts = this._ts;
    // 3D rock body
    this._sphere(ctx, ts / 2, ts / 2 + 2, 13, '#788870', '#98a890', '#586858');
    // Moss patches
    ctx.fillStyle = 'rgba(60, 140, 50, 0.6)';
    ctx.beginPath();
    ctx.arc(8, 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(25, 10, 3, 0, Math.PI * 2);
    ctx.fill();
    // Ancient face carved in stone
    ctx.fillStyle = '#405040';
    ctx.fillRect(11, 13, 3, 4);
    ctx.fillRect(20, 13, 3, 4);
    ctx.fillRect(13, 21, 8, 2);
    // Caret symbol on forehead
    ctx.fillStyle = '#a0c8a0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('^', ts / 2, 10);
  }

  _paintMazeScribe(ctx) {
    const ts = this._ts;
    // Body (robed figure)
    const robe = ctx.createLinearGradient(8, 8, ts - 8, 8);
    robe.addColorStop(0, '#8b5e3c');
    robe.addColorStop(0.5, '#b07848');
    robe.addColorStop(1, '#8b5e3c');
    ctx.fillStyle = robe;
    // Robe shape
    ctx.beginPath();
    ctx.moveTo(ts / 2, 4);
    ctx.quadraticCurveTo(ts - 6, 10, ts - 6, ts - 4);
    ctx.lineTo(6, ts - 4);
    ctx.quadraticCurveTo(6, 10, ts / 2, 4);
    ctx.fill();
    ctx.strokeStyle = '#4a2e18';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Scroll
    ctx.fillStyle = '#f5deb3';
    ctx.fillRect(18, 14, 8, 12);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(17, 13, 2, 14);
    ctx.fillRect(26, 13, 2, 14);
    // Face
    ctx.fillStyle = '#ffe0b0';
    ctx.beginPath();
    ctx.arc(ts / 2, 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a2e18';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#2a1808';
    ctx.fillRect(14, 9, 2, 2);
    ctx.fillRect(18, 9, 2, 2);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(ts / 2, ts - 2, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _paintDeletionEcho(ctx) {
    const ts = this._ts;
    // Ghost body
    ctx.fillStyle = 'rgba(160, 180, 180, 0.7)';
    ctx.beginPath();
    ctx.arc(ts / 2, 12, 10, Math.PI, 0);
    ctx.lineTo(ts / 2 + 10, 24);
    // Wavy bottom
    for (let x = ts / 2 + 10; x >= ts / 2 - 10; x -= 4) {
      ctx.lineTo(x, x % 8 < 4 ? 27 : 23);
    }
    ctx.closePath();
    ctx.fill();
    // Outline
    ctx.strokeStyle = 'rgba(80, 100, 100, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Eyes
    ctx.fillStyle = '#ff3030';
    ctx.beginPath();
    ctx.arc(13, 12, 2.5, 0, Math.PI * 2);
    ctx.arc(21, 12, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#800000';
    ctx.beginPath();
    ctx.arc(13, 12, 1, 0, Math.PI * 2);
    ctx.arc(21, 12, 1, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.fillStyle = 'rgba(60, 80, 80, 0.5)';
    ctx.beginPath();
    ctx.ellipse(ts / 2 + 1, 18, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _paintInsertScribe(ctx) {
    const ts = this._ts;
    // Body (blue robed figure)
    const robe = ctx.createLinearGradient(8, 8, ts - 8, 8);
    robe.addColorStop(0, '#2a4aa0');
    robe.addColorStop(0.5, '#4169e1');
    robe.addColorStop(1, '#2a4aa0');
    ctx.fillStyle = robe;
    ctx.beginPath();
    ctx.moveTo(ts / 2, 4);
    ctx.quadraticCurveTo(ts - 6, 10, ts - 6, ts - 4);
    ctx.lineTo(6, ts - 4);
    ctx.quadraticCurveTo(6, 10, ts / 2, 4);
    ctx.fill();
    ctx.strokeStyle = '#1a2868';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Quill in hand
    ctx.strokeStyle = '#4a80ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22, 10);
    ctx.lineTo(26, 22);
    ctx.stroke();
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(25, 22, 3, 3);
    // Face
    ctx.fillStyle = '#ffe0b0';
    ctx.beginPath();
    ctx.arc(ts / 2, 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a2868';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#1a1a40';
    ctx.fillRect(14, 9, 2, 2);
    ctx.fillRect(18, 9, 2, 2);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(ts / 2, ts - 2, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _paintPracticeBuddy(ctx) {
    const ts = this._ts;
    const cx = ts / 2, cy = ts / 2;

    // Bright yellow background circle for visibility
    ctx.fillStyle = '#ffe040';
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Star body — vivid hot pink
    ctx.fillStyle = '#ff1493';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? 12 : 5;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    // Dark outline
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Face — white eyes with dark pupils
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 1, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 3, cy - 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(cx - 2.5, cy - 0.5, 1.2, 0, Math.PI * 2);
    ctx.arc(cx + 3.5, cy - 0.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // Smile
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + 1, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  _paintMirrorSprite(ctx) {
    const ts = this._ts;
    const cx = ts / 2, cy = ts / 2 + 2;

    // Droplet body
    ctx.beginPath();
    ctx.moveTo(cx, 3);
    ctx.quadraticCurveTo(cx + 14, cy, cx, ts - 4);
    ctx.quadraticCurveTo(cx - 14, cy, cx, 3);
    ctx.closePath();
    const dropG = ctx.createRadialGradient(cx - 3, cy - 2, 0, cx, cy, 14);
    dropG.addColorStop(0, '#d0e8ff');
    dropG.addColorStop(0.5, '#88b0d8');
    dropG.addColorStop(1, '#5080a8');
    ctx.fillStyle = dropG;
    ctx.fill();
    // Outline
    ctx.strokeStyle = '#284060';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Specular
    ctx.fillStyle = 'rgba(240,250,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy - 4, 3, 4, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#1a3050';
    ctx.beginPath();
    ctx.arc(cx - 3, cy, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 3, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
