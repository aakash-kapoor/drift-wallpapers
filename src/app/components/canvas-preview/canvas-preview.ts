import { Component, ElementRef, viewChild, input, output, effect, signal, OnInit, OnDestroy } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { WallpaperEngineService, Pattern, Device } from '../../core/wallpaper-engine.service';

@Component({
  selector: 'app-canvas-preview',
  imports: [DatePipe, UpperCasePipe],
  templateUrl: './canvas-preview.html',
  styleUrl: './canvas-preview.css',
})
export class CanvasPreview implements OnInit, OnDestroy {
  desktopCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('desktopCanvas');
  mobileCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('mobileCanvas');

  pattern = input.required<Pattern>();
  paletteIndex = input.required<number>();
  seed = input.required<number>();
  darkMode = input.required<boolean>();
  device = input.required<Device>();
  deviceSelect = output<Device>();

  currentTime = signal<Date>(new Date());
  private timerId?: any;

  constructor(private engine: WallpaperEngineService) {
    effect(() => {
      const deskCanvas = this.desktopCanvas().nativeElement;
      const mobCanvas = this.mobileCanvas().nativeElement;
      const baseParams = {
        pattern: this.pattern(),
        paletteIndex: this.paletteIndex(),
        seed: this.seed(),
        darkMode: this.darkMode()
      };
      this.redraw(deskCanvas, { ...baseParams, device: 'desktop' });
      this.redraw(mobCanvas, { ...baseParams, device: 'iphone' });
    });
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.timerId = setInterval(() => {
        this.currentTime.set(new Date());
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  private redraw(canvas: HTMLCanvasElement, params: { pattern: Pattern; paletteIndex: number; seed: number; darkMode: boolean; device: Device }): void {
    const w = params.device === 'desktop' ? 960 : 290;
    const h = params.device === 'desktop' ? 540 : 628;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.engine.draw(ctx, { ...params, dimensions: { w, h } });
  }

  selectDevice(d: Device): void {
    this.deviceSelect.emit(d);
  }

  downloadPng(): void {
    const activeDevice = this.device();
    const { w, h } = this.engine.getDimensions(activeDevice);

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = w;
    exportCanvas.height = h;
    const ctx = exportCanvas.getContext('2d');

    if (ctx) {
      this.engine.draw(ctx, {
        pattern: this.pattern(),
        paletteIndex: this.paletteIndex(),
        seed: this.seed(),
        darkMode: this.darkMode(),
        device: activeDevice,
        dimensions: { w, h }
      });

      exportCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drift-${activeDevice}-${this.pattern()}-${this.seed()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    }
  }
}