import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, getDocs, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Pattern, Device } from './wallpaper-engine.service';

export interface WallpaperConfig {
  pattern: Pattern;
  paletteIndex: number;
  seed: number;
  darkMode: boolean;
  device: Device;
}

export interface SavedWallpaper {
  id?: string;
  createdAt: Timestamp;
  config: WallpaperConfig;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebase);
  private auth = getAuth(this.app);
  private db = getFirestore(this.app);

  currentUser = signal<User | null>(null);
  authLoading = signal<boolean>(true);
  authError = signal<string | null>(null);

  constructor() {
    this.initAuth();
  }

  private initAuth() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.currentUser.set(user);
        this.authLoading.set(false);
      } else {
        try {
          this.authLoading.set(true);
          const credential = await signInAnonymously(this.auth);
          this.currentUser.set(credential.user);
          this.authError.set(null);
          this.authLoading.set(false);
        } catch (err: any) {
          console.error('Anonymous sign-in failed', err);
          this.authError.set(err.message || 'Authentication failed');
          this.authLoading.set(false);
        }
      }
    });
  }

  private getUid(): string {
    const user = this.currentUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }
    return user.uid;
  }

  private async waitForAuth(): Promise<string> {
    if (this.currentUser()) {
      return this.getUid();
    }
    return new Promise((resolve, reject) => {
      let resolved = false;
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        if (!resolved) {
          resolved = true;
          if (user) {
            resolve(user.uid);
          } else {
            reject(new Error('Failed to authenticate user'));
          }
        }
      }, (err) => {
        unsubscribe();
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      });
    });
  }

  async saveWallpaper(config: WallpaperConfig): Promise<string> {
    const uid = await this.waitForAuth();
    const wallpapersRef = collection(this.db, 'users', uid, 'wallpapers');
    const docRef = await addDoc(wallpapersRef, {
      config,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  async getWallpapers(): Promise<SavedWallpaper[]> {
    const uid = await this.waitForAuth();
    const wallpapersRef = collection(this.db, 'users', uid, 'wallpapers');
    const q = query(wallpapersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const wallpapers: SavedWallpaper[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      wallpapers.push({
        id: doc.id,
        createdAt: data['createdAt'] as Timestamp,
        config: data['config'] as WallpaperConfig
      });
    });
    return wallpapers;
  }

  async deleteWallpaper(id: string): Promise<void> {
    const uid = await this.waitForAuth();
    const docRef = doc(this.db, 'users', uid, 'wallpapers', id);
    await deleteDoc(docRef);
  }
}
