import { Component, viewChild, signal } from '@angular/core';
import { CanvasPreview } from './components/canvas-preview/canvas-preview';
import { ControlsPanel } from './components/controls-panel/controls-panel';
import { Pattern, Device } from './core/wallpaper-engine.service';

@Component({
  selector: 'app-root',
  imports: [CanvasPreview, ControlsPanel],
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
}