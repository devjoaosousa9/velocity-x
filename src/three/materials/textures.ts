import * as THREE from 'three';

/**
 * Procedural micro-relief maps drawn on a 2D canvas at runtime - zero bytes of
 * texture download. Used as bump maps on the upper.
 */
function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

export function createKnitTexture(size = 256) {
  return canvasTexture(size, (ctx, s) => {
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(0, 0, s, s);
    const cols = 16;
    const rows = 16;
    const cw = s / cols;
    const rh = s / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cw;
        const y = r * rh;
        // A knit stitch reads as two leaning loops forming a "V".
        const g = ctx.createLinearGradient(x, y, x + cw, y + rh);
        g.addColorStop(0, '#d8d8d8');
        g.addColorStop(1, '#7a7a7a');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x + cw * 0.3, y + rh * 0.5, cw * 0.22, rh * 0.46, -0.45, 0, Math.PI * 2);
        ctx.ellipse(x + cw * 0.7, y + rh * 0.5, cw * 0.22, rh * 0.46, 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Ventilation ports in a sparse grid.
    ctx.fillStyle = '#202020';
    for (let r = 1; r < rows; r += 4) {
      for (let c = 2 + (r % 8 === 1 ? 0 : 2); c < cols; c += 4) {
        ctx.beginPath();
        ctx.arc(c * cw, r * rh, cw * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

export function createWeaveTexture(size = 256) {
  return canvasTexture(size, (ctx, s) => {
    const n = 16;
    const cell = s / n;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const horizontal = (r + c) % 2 === 0;
        const g = horizontal
          ? ctx.createLinearGradient(c * cell, r * cell, c * cell, (r + 1) * cell)
          : ctx.createLinearGradient(c * cell, r * cell, (c + 1) * cell, r * cell);
        g.addColorStop(0, '#5c5c5c');
        g.addColorStop(0.5, '#e6e6e6');
        g.addColorStop(1, '#5c5c5c');
        ctx.fillStyle = g;
        ctx.fillRect(c * cell, r * cell, cell, cell);
      }
    }
  });
}
