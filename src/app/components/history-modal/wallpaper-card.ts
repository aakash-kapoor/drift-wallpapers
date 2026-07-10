import { Component, ElementRef, viewChild, input, output, signal, AfterViewInit } from '@angular/core';
import { WallpaperEngineService, PATTERN_LABELS } from '../../core/wallpaper-engine.service';
import { WallpaperConfig } from '../../core/firebase.service';

@Component({
  selector: 'app-wallpaper-card',
  standalone: true,
  template: `
    <div class="wallpaper-card">
      <div class="canvas-container">
        <canvas #canvas width="220" height="140"></canvas>
      </div>
      <div class="card-footer">
        <div class="card-meta">
          <span class="card-date">{{ relativeDate() }}</span>
          <span class="card-pattern">{{ label() }}</span>
        </div>
        
        <div class="card-actions">
          @if (confirmDelete()) {
            <div class="confirm-actions">
              <span class="confirm-text">Delete?</span>
              <button class="btn-confirm-yes" (click)="onDeleteConfirm($event)">Yes</button>
              <button class="btn-confirm-no" (click)="onDeleteCancel($event)">No</button>
            </div>
          } @else {
            <button class="btn-card-load" (click)="load.emit(config())">Load</button>
            <button class="btn-card-delete" (click)="confirmDelete.set(true)">Delete</button>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './wallpaper-card.css'
})
export class WallpaperCard implements AfterViewInit {
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  config = input.required<WallpaperConfig>();
  createdAt = input.required<any>();
  
  load = output<WallpaperConfig>();
  delete = output<void>();

  confirmDelete = signal(false);

  constructor(private engine: WallpaperEngineService) {}

  ngAfterViewInit() {
    this.drawThumbnail();
  }

  drawThumbnail() {
    const canvasEl = this.canvas().nativeElement;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    this.engine.draw(ctx, {
      ...this.config(),
      dimensions: { w: 220, h: 140 }
    });
  }

  label(): string {
    return PATTERN_LABELS[this.config().pattern] || this.config().pattern;
  }

  relativeDate(): string {
    const timestamp = this.createdAt();
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      if (now.getDate() === date.getDate()) {
        return 'Today';
      } else {
        return 'Yesterday';
      }
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? 'Last week' : `${weeks} weeks ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? 'Last month' : `${months} months ago`;
    }
  }

  onDeleteConfirm(event: Event) {
    event.stopPropagation();
    this.delete.emit();
    this.confirmDelete.set(false);
  }

  onDeleteCancel(event: Event) {
    event.stopPropagation();
    this.confirmDelete.set(false);
  }
}
