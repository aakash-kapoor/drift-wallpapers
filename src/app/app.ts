import { Component, viewChild, signal, effect } from '@angular/core';
import { CanvasPreview } from './components/canvas-preview/canvas-preview';
import { ControlsPanel } from './components/controls-panel/controls-panel';
import { Pattern, Device, PATTERNS } from './core/wallpaper-engine.service';
import { PALETTES } from './core/palette.data';
import { FirebaseService, WallpaperConfig } from './core/firebase.service';
import { ToastService } from './core/toast.service';
import { HistoryModal } from './components/history-modal/history-modal';

@Component({
  selector: 'app-root',
  imports: [CanvasPreview, ControlsPanel, HistoryModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '[class.light-theme]': '!uiDarkMode()'
  }
})
export class App {
  canvasPreview = viewChild.required(CanvasPreview);

  pattern = signal<Pattern>('flowing-hills');
  paletteIndex = signal<number>(2);
  seed = signal<number>(this.randomSeed());
  darkMode = signal<boolean>(true);
  device = signal<Device>('desktop');
  uiDarkMode = signal<boolean>(this.loadUiDarkMode());
  linkCopied = signal(false);
  isHistoryOpen = signal<boolean>(false);

  constructor(
    public firebaseService: FirebaseService,
    public toastService: ToastService
  ) {
    this.loadFromUrl();

    effect(() => {
      const params = new URLSearchParams({
        p: this.pattern(),
        pal: String(this.paletteIndex()),
        seed: String(this.seed()),
        dev: this.device(),
        dark: this.darkMode() ? '1' : '0'
      });
      if (typeof window !== 'undefined') {
        history.replaceState(null, '', `?${params.toString()}`);
      }
    });
  }

  private loadFromUrl(): void {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('seed')) return;

    const p = params.get('p');
    if (p && (PATTERNS as string[]).includes(p)) this.pattern.set(p as Pattern);

    const pal = Number(params.get('pal'));
    if (!isNaN(pal) && pal >= 0 && pal < PALETTES.length) this.paletteIndex.set(pal);

    const seed = Number(params.get('seed'));
    if (!isNaN(seed)) this.seed.set(seed);

    const dev = params.get('dev');
    if (dev === 'desktop' || dev === 'iphone') this.device.set(dev as Device);

    this.darkMode.set(params.get('dark') === '1');
  }

  private loadUiDarkMode(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('drift-ui-dark-mode');
      return saved !== 'false';
    }
    return true;
  }

  toggleUiDarkMode(): void {
    const newVal = !this.uiDarkMode();
    this.uiDarkMode.set(newVal);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('drift-ui-dark-mode', String(newVal));
    }
  }

  private randomSeed(): number {
    return Math.floor(Math.random() * 1_000_000);
  }

  onGenerate(): void {
    this.seed.set(this.randomSeed());
  }

  onDownload(): void {
    this.canvasPreview().downloadPng();
  }

  onCopyLink(): void {
    navigator.clipboard.writeText(window.location.href);
    this.linkCopied.set(true);
    this.toastService.show('Link copied to clipboard', 'success');
    setTimeout(() => this.linkCopied.set(false), 1800);
  }

  async onSave(): Promise<void> {
    const config: WallpaperConfig = {
      pattern: this.pattern(),
      paletteIndex: this.paletteIndex(),
      seed: this.seed(),
      darkMode: this.darkMode(),
      device: this.device()
    };

    try {
      await this.firebaseService.saveWallpaper(config);
      this.toastService.show('Wallpaper saved to library', 'success');
    } catch (err: any) {
      console.error(err);
      this.toastService.show(err.message || 'Failed to save wallpaper', 'error');
    }
  }

  onLoadConfig(config: WallpaperConfig): void {
    this.pattern.set(config.pattern);
    this.paletteIndex.set(config.paletteIndex);
    this.seed.set(config.seed);
    this.darkMode.set(config.darkMode);
    this.device.set(config.device);
    this.toastService.show('Wallpaper loaded', 'info');
  }
}