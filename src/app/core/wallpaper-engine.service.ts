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
    const { pattern, paletteIndex, seed, darkMode, device } = params;
    const { w, h } = this.getDimensions(device);
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
      case 'desert-dunes':
        this.drawDunes(ctx, w, h, paletteIndex, darkMode);
        break;
      case 'mountains':
        this.drawMountains(ctx, w, h, paletteIndex, darkMode);
        break;
      case 'concentric-arcs':
        this.drawArcs(ctx, w, h, paletteIndex, darkMode);
        break;
    }
  }

  private drawFlowingHills(ctx: CanvasRenderingContext2D, w: number, h: number, paletteIndex: number, darkMode: boolean) {
    const layers = 6;
    const step = Math.max(2, Math.floor(w / 800));
    for (let l = 0; l < layers; l++) {
      const t = l / (layers - 1);
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += step) {
        const n = this.fbm(x * 0.0006 + l * 17.3, 4);
        const baseY = h * (0.3 + t * 0.6);
        const y = baseY + (n - 0.5) * h * 0.22;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = this.getColor(paletteIndex, t, !darkMode);
      ctx.fill();
    }
  }

  private drawSmoothWave(ctx: CanvasRenderingContext2D, w: number, h: number, paletteIndex: number, darkMode: boolean) {
    const layers = 7;
    const step = Math.max(2, Math.floor(w / 800));
    for (let l = 0; l < layers; l++) {
      const t = l / (layers - 1);
      ctx.beginPath();
      ctx.moveTo(0, h);
      const freq = 0.002 + l * 0.0004;
      const phase = l * 1.7;
      for (let x = 0; x <= w; x += step) {
        const y = h * (0.35 + t * 0.55) + Math.sin(x * freq + phase) * h * 0.08;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = this.getColor(paletteIndex, t, !darkMode);
      ctx.fill();
    }
  }

  private drawDunes(ctx: CanvasRenderingContext2D, w: number, h: number, paletteIndex: number, darkMode: boolean) {
    const layers = 6;
    const step = Math.max(2, Math.floor(w / 800));
    for (let l = 0; l < layers; l++) {
      const t = l / (layers - 1);
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += step) {
        const n1 = this.fbm(x * 0.0009 + l * 23.1, 3);
        const n2 = Math.pow(n1, 1.5);
        const baseY = h * (0.4 + t * 0.5);
        const y = baseY - n2 * h * 0.25;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = this.getColor(paletteIndex, t, !darkMode);
      ctx.fill();
    }
  }

  private drawMountains(ctx: CanvasRenderingContext2D, w: number, h: number, paletteIndex: number, darkMode: boolean) {
    const layers = 5;
    const step = Math.max(2, Math.floor(w / 600));
    for (let l = 0; l < layers; l++) {
      const t = l / (layers - 1);
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += step) {
        const n = this.fbm(x * 0.0012 + l * 31.7, 5);
        const jag = Math.abs(this.fbm(x * 0.004 + l * 7, 2) - 0.5) * 2;
        const baseY = h * (0.25 + t * 0.6);
        const y = baseY - jag * h * 0.3 * (1 - t * 0.5) + (n - 0.5) * h * 0.05;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = this.getColor(paletteIndex, t, !darkMode);
      ctx.fill();
    }
  }

  private drawArcs(ctx: CanvasRenderingContext2D, w: number, h: number, paletteIndex: number, darkMode: boolean) {
    const cx = w * 0.5, cy = h * 1.05;
    const maxR = Math.sqrt(w * w + h * h);
    const rings = 24;
    for (let i = rings; i >= 0; i--) {
      const t = i / rings;
      const r = t * maxR;
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI, 0, false);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = this.getColor(paletteIndex, 1 - t, !darkMode);
      ctx.fill();
    }
  }
}