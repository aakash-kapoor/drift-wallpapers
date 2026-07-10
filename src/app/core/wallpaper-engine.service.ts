import { Injectable } from '@angular/core';
import { PALETTES } from './palette.data';

export type Pattern = 'flowing-hills' | 'smooth-wave' | 'sand-dunes' | 'mountains' | 'concentric-arcs' | 'desert-dunes';
export type Device = 'desktop' | 'iphone';

export const PATTERNS: Pattern[] = ['flowing-hills', 'smooth-wave', 'sand-dunes', 'mountains', 'concentric-arcs', 'desert-dunes'];
export const PATTERN_LABELS: Record<Pattern, string> = {
  'flowing-hills': 'Hills',
  'smooth-wave': 'Wave',
  'sand-dunes': 'Dunes',
  'mountains': 'Mountains',
  'concentric-arcs': 'Arcs',
  'desert-dunes': 'Desert'
};

export const DESKTOP_W = 3840, DESKTOP_H = 2160;
export const MOBILE_W = 1290, MOBILE_H = 2796;

interface DrawParams {
  pattern: Pattern;
  paletteIndex: number;
  seed: number;
  darkMode: boolean;
  device: Device;
  dimensions?: { w: number; h: number };
}

@Injectable({ providedIn: 'root' })
export class WallpaperEngineService {

  private _seed = 0;

  private mulberry32(a: number) {
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private noise(x: number): number {
    const ix = Math.floor(x);
    const fx = x - ix;
    const t = fx * fx * (3 - 2 * fx);
    const seedA = Math.sin(ix * 127.1 + this._seed * 0.01) * 43758.5453;
    const seedB = Math.sin((ix + 1) * 127.1 + this._seed * 0.01) * 43758.5453;
    const a = seedA - Math.floor(seedA);
    const b = seedB - Math.floor(seedB);
    return a + (b - a) * t;
  }

  private fbm(x: number, octaves = 4): number {
    let val = 0, amp = 0.5, freq = 1;
    for (let i = 0; i < octaves; i++) {
      val += amp * this.noise(x * freq);
      amp *= 0.5;
      freq *= 2.1;
    }
    return val;
  }

  private lerpColor(c1: string, c2: string, t: number): string {
    const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
    return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
  }

  private getColor(paletteIndex: number, t: number, inv: boolean): string {
    const colors = PALETTES[paletteIndex].colors;
    const ct = inv ? 1 - t : t;
    const idx = ct * (colors.length - 1);
    const i = Math.floor(idx);
    const f = idx - i;
    if (i >= colors.length - 1) return colors[colors.length - 1];
    if (i < 0) return colors[0];
    return this.lerpColor(colors[i], colors[i + 1], f);
  }

  private getBgColor(paletteIndex: number, inv: boolean): string {
    const colors = PALETTES[paletteIndex].colors;
    return inv ? colors[colors.length - 1] : colors[0];
  }

  getDimensions(device: Device): { w: number; h: number } {
    return device === 'desktop'
      ? { w: DESKTOP_W, h: DESKTOP_H }
      : { w: MOBILE_W, h: MOBILE_H };
  }

  draw(ctx: CanvasRenderingContext2D, params: DrawParams): void {
    const { pattern, paletteIndex, seed, darkMode, device, dimensions } = params;
    const { w, h } = dimensions ?? this.getDimensions(device);
    this._seed = seed;

    ctx.clearRect(0, 0, w, h);

    const bg = this.getBgColor(paletteIndex, !darkMode);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    switch (pattern) {
      case 'flowing-hills':
        this.drawFlowingHills(ctx, w, h, paletteIndex, darkMode);
        break;
      case 'smooth-wave':
        this.drawSmoothWave(ctx, w, h, paletteIndex, darkMode);
        break;
      case 'sand-dunes':
        this.drawDunes(ctx, w, h, paletteIndex, darkMode);
        break;
      case 'mountains':
        this.drawMountains(ctx, w, h, paletteIndex, darkMode);
        break;
      case 'concentric-arcs':
        this.drawArcs(ctx, w, h, paletteIndex, darkMode);
        break;
      case 'desert-dunes':
        this.drawDesertDunes(ctx, w, h, paletteIndex, darkMode);
        break;
    }
  }

  private drawPineTree(ctx: CanvasRenderingContext2D, x: number, bottomY: number, width: number, height: number, rng: () => number) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - width * 0.08, bottomY);
    ctx.lineTo(x - width * 0.08, bottomY - height * 0.15);
    ctx.lineTo(x + width * 0.08, bottomY - height * 0.15);
    ctx.lineTo(x + width * 0.08, bottomY);
    ctx.fill();

    const segments = 30;
    for (let i = 0; i < segments; i++) {
      const t = i / (segments - 1);
      const segHeight = height * 1;
      const topY = bottomY - height + (segHeight * t * 0.45);
      const currBottomY = bottomY - height + (segHeight * (t + 0.22));
      const currWidth = width * (0.25 + t * 0.75);

      ctx.beginPath();
      ctx.moveTo(x, topY);

      const jitterL = (rng() - 0.5) * (width * 0.08);
      const jitterR = (rng() - 0.5) * (width * 0.08);

      ctx.lineTo(x - currWidth / 2 + jitterL, currBottomY);
      ctx.lineTo(x + currWidth / 2 + jitterR, currBottomY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private drawFlowingHills(ctx: CanvasRenderingContext2D, w: number, h: number, paletteIndex: number, darkMode: boolean) {
    const layers = 5;
    const isDesktop = w > h;
    const rng = this.mulberry32(this._seed);

    for (let i = 0; i < layers; i++) {
      const t = (i + 1) / layers;
      const spacingFactor = isDesktop ? 0.40 : 0.33;
      const baseY = h * (0.5 + (i / layers) * spacingFactor);
      ctx.fillStyle = this.getColor(paletteIndex, t * 0.85 + 0.1, !darkMode);

      ctx.beginPath();
      ctx.moveTo(0, h + 2);

      const ridgePoints: { x: number; y: number }[] = [];
      const geometryStep = Math.max(4, Math.round(w / 120));

      for (let x = 0; x <= w + geometryStep; x += geometryStep) {
        const nx = x / w;
        let y;

        if (i < 2) {
          const mountainAmplitude = isDesktop ? 0.32 : 0.12;
          const mountainFreq = isDesktop ? 4.5 : 2.5;
          y = baseY + this.fbm(nx * mountainFreq + i * 4.5, 10) * h * mountainAmplitude - (isDesktop ? h * 0.12 : h * 0.05);
        } else {
          const hillAmplitude = isDesktop ? 0.16 : 0.06;
          const hillFreq = isDesktop ? 2.5 : 1.5;
          y = baseY + this.fbm(nx * hillFreq + i * 2.1, 8) * h * hillAmplitude - (isDesktop ? h * 0.01 : h * 0.02);
        }

        ridgePoints.push({ x, y });
        ctx.lineTo(x, y);
      }

      ctx.lineTo(w + 2, h + 2);
      ctx.closePath();
      ctx.fill();

      if (i >= 1) {
        let baseTreeWidth, baseTreeHeight;

        if (isDesktop) {
          baseTreeWidth = h * (0.045 + i * 0.004);
          baseTreeHeight = baseTreeWidth * (1 + rng() * 0.2);
        } else {
          baseTreeWidth = w * (0.12 + i * 0.004);
          baseTreeHeight = baseTreeWidth * (1 + rng() * 0.2);
        }

        const stepX = baseTreeWidth * 0.35;

        for (let x = 0; x <= w; x += stepX) {
          const pct = x / w;
          const ptIndex = Math.floor(pct * (ridgePoints.length - 1));
          const pt = ridgePoints[ptIndex] || ridgePoints[ridgePoints.length - 1];

          const rowsDown = isDesktop
            ? (i === 1 ? 3 : 5 + (layers - i))
            : (i === 1 ? 1 : 2 + (layers - i));

          for (let row = 0; row < rowsDown; row++) {
            const yOffset = row * (baseTreeHeight * 0.22);
            const currentBottomY = pt.y + yOffset;

            if (currentBottomY > h + 20) continue;

            const scale = isDesktop ? (0.65 + rng() * 1.1) : (0.8 + rng() * 0.4);
            const currentWidth = baseTreeWidth * (isDesktop ? Math.min(scale, 1.1) : scale);
            const currentHeight = baseTreeHeight * scale;
            const currentX = x + (rng() - 0.5) * (stepX * 0.5);

            this.drawPineTree(ctx, currentX, currentBottomY, currentWidth, currentHeight, rng);
          }
        }
      }
    }
  }

  private drawSmoothWave(ctx: CanvasRenderingContext2D, w: number, h: number, paletteIndex: number, darkMode: boolean) {
    const rng = this.mulberry32(this._seed);
    const layers = 8 + (Math.floor(rng() * 5));
    const centerX = w * (0.45 + rng() * 0.1);
    const baseY = h * (0.75 + rng() * 0.08);

    for (let i = layers; i >= 0; i--) {
      const t = i / layers;
      const spread = h * (0.8 + t * 1.8);
      const peakH = h * (0.05 + t * 0.3);
      const skew = rng() * 0.2 - 0.10;

      ctx.beginPath();
      ctx.moveTo(0, h + 2);
      ctx.lineTo(0, baseY + peakH * 0.5);

      const steps = 120;
      for (let s = 0; s <= steps; s++) {
        const st = s / steps;
        const x = st * w;
        const dist = (x - centerX) / spread;
        const bell = Math.exp(-dist * dist * 0.4);
        const asymmetry = 1 + skew * dist;
        const wave = bell * peakH * asymmetry;
        const micro = this.fbm((x / h) * 2 + i * 1.4, 3) * h * 0.008;
        const y = baseY - wave + micro;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(w + 2, h + 2);
      ctx.closePath();
      ctx.fillStyle = this.getColor(paletteIndex, 0.1 + (1 - t) * 0.8, !darkMode);
      ctx.fill();
    }
  }

  private drawDunes(ctx: CanvasRenderingContext2D, w: number, h: number, paletteIndex: number, darkMode: boolean) {
    const rng = this.mulberry32(this._seed);
    const layers = 7 + (Math.floor(rng() * 5));

    for (let i = 0; i < layers; i++) {
      const t = (i + 1) / layers;
      const baseY = h * (0.55 + t * 0.35);
      const freq = 0.5 + rng() * 0.8;
      const phase = rng() * 10;

      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const nx = x / h;
        const wave = Math.sin(nx * Math.PI * freq + phase) * h * 0.05;
        const n = this.fbm(nx * 0.8 + i * 2.1, 3) * h * 0.05;
        const y = baseY + wave + n;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = this.getColor(paletteIndex, t * 0.8 + 0.15, !darkMode);
      ctx.fill();
    }
  }

  private drawMountains(ctx: CanvasRenderingContext2D, w: number, h: number, paletteIndex: number, darkMode: boolean) {
    const rng = this.mulberry32(this._seed);
    const layers = 5 + (Math.floor(rng() * 3));

    for (let i = 0; i < layers; i++) {
      const t = (i + 1) / layers;
      const baseY = h * (0.55 + t * 0.35);
      const peakCount = 2 + (Math.floor(rng() * 2));
      const offset = rng() * 50;

      ctx.beginPath();
      ctx.moveTo(-2, h + 2);

      const peaks: { cx: number; peakH: number; width: number }[] = [];
      for (let p = 0; p < peakCount; p++) {
        peaks.push({
          cx: w * (0.1 + rng() * 0.8),
          peakH: h * (0.1 + rng() * 0.15) * (1 - i * 0.08),
          width: h * (0.6 + rng() * 0.6),
        });
      }

      for (let x = -2; x <= w + 2; x += 2) {
        let y = baseY;
        for (const p of peaks) {
          const dist = Math.abs(x - p.cx);
          if (dist < p.width) {
            const rise = (1 - dist / p.width);
            const sharpness = 1.3 + rng() * 0.3;
            const peakY = Math.pow(rise, sharpness) * p.peakH;
            y = Math.min(y, baseY - peakY);
          }
        }
        const micro = this.fbm((x / h) * 1.5 + i * 2.3 + offset, 3) * h * 0.008;
        ctx.lineTo(x, y + micro);
      }

      ctx.lineTo(w + 2, h + 2);
      ctx.closePath();
      ctx.fillStyle = this.getColor(paletteIndex, t * 0.8 + 0.12, !darkMode);
      ctx.fill();
    }
  }

  private drawArcs(ctx: CanvasRenderingContext2D, w: number, h: number, paletteIndex: number, darkMode: boolean) {
    const rng = this.mulberry32(this._seed);
    const maxR = h * 1.0;
    const originX = w * (0.45 + rng() * 0.1);
    const originY = h * 1.5;
    const rings = 14 + (Math.floor(rng() * 6));

    for (let i = rings; i >= 0; i--) {
      const t = i / rings;
      const r = maxR * t;

      ctx.beginPath();
      ctx.arc(originX, originY, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = this.getColor(paletteIndex, 0.1 + (1 - t) * 0.8, !darkMode);
      ctx.fill();
    }
  }

  private drawDesertDunes(ctx: CanvasRenderingContext2D, w: number, h: number, paletteIndex: number, darkMode: boolean) {
    const rng = this.mulberry32(this._seed);
    for (let i = 0; i < 15; i++) {
      const t = i / 15;
      ctx.beginPath();
      let x = w * rng(), y = h * (0.5 + rng() * 0.5);
      ctx.moveTo(x, y);
      for (let j = 0; j < 10; j++) {
        x += (rng() - 0.5) * w * 1;
        y += (rng() - 0.4) * h * 0.2;
        const cp1y = h * (0.5 + rng() * 0.5);
        const cp2y = h * (0.5 + rng() * 0.5);
        ctx.bezierCurveTo(w * rng(), cp1y, w * rng(), cp2y, x, y);
      }
      ctx.strokeStyle = this.getColor(paletteIndex, t, !darkMode);
      const scaleFactor = Math.max(1, h / 540);
      ctx.lineWidth = rng() * 3 * scaleFactor;
      ctx.stroke();
    }
  }
}