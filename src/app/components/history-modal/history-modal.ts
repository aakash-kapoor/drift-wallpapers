import { Component, input, output, signal, effect, HostListener } from '@angular/core';
import { FirebaseService, SavedWallpaper, WallpaperConfig } from '../../core/firebase.service';
import { ToastService } from '../../core/toast.service';
import { WallpaperCard } from './wallpaper-card';

@Component({
  selector: 'app-history-modal',
  standalone: true,
  imports: [WallpaperCard],
  templateUrl: './history-modal.html',
  styleUrl: './history-modal.css'
})
export class HistoryModal {
  isOpen = input.required<boolean>();
  
  close = output<void>();
  loadConfig = output<WallpaperConfig>();

  wallpapers = signal<SavedWallpaper[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private firebaseService: FirebaseService,
    private toastService: ToastService
  ) {
    effect(() => {
      if (this.isOpen()) {
        this.loadWallpapers();
        this.lockScroll(true);
      } else {
        this.lockScroll(false);
      }
    });
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.isOpen()) {
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent) {
    this.close.emit();
  }

  async loadWallpapers() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const items = await this.firebaseService.getWallpapers();
      this.wallpapers.set(items);
    } catch (err: any) {
      console.error(err);
      this.error.set(err.message || 'Failed to load wallpapers');
      this.toastService.show('Failed to fetch wallpapers', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  onLoad(config: WallpaperConfig) {
    this.loadConfig.emit(config);
    this.close.emit();
  }

  async onDelete(id: string) {
    try {
      await this.firebaseService.deleteWallpaper(id);
      this.wallpapers.update(items => items.filter(item => item.id !== id));
      this.toastService.show('Wallpaper deleted', 'success');
    } catch (err: any) {
      console.error(err);
      this.toastService.show('Failed to delete wallpaper', 'error');
    }
  }

  private lockScroll(lock: boolean) {
    if (typeof document !== 'undefined') {
      if (lock) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    }
  }
}
