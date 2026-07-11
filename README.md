# DRIFT — Minimal Procedural Wallpaper Generator

DRIFT is a premium, web-based minimal procedural wallpaper generator built with Angular, HTML5 Canvas, and Firebase. It lets you dynamically generate high-resolution wallpapers using advanced mathematically generated patterns and custom color palettes, and now comes with an elegant, cloud-sync library for saving your custom configurations.

## Features

- **Procedural Rendering**: Renders high-quality wallpapers dynamically using Canvas API. Includes 6 custom-designed generative patterns:
  - **Hills** (Flowing valleys and pine forests)
  - **Wave** (Smooth Gaussian-wave curves)
  - **Dunes** (Wavy sine-noise sand formations)
  - **Mountains** (Sharp peak outlines with micro-fractal noise)
  - **Arcs** (Calming concentric rings)
  - **Desert** (Intertwined Bezier dune lines)
- **Fluid Customization**: Instantly switch palettes, toggle wallpaper dark modes, or randomize seeds to generate infinite variations.
- **Tailored Outputs**: Download wallpapers optimized for **Desktop 4K** (3840×2160) or **iPhone** (1290×2796) aspect ratios.
- **Real-Time URL Sync & Sharing**: Instantly serializes all active configuration settings (pattern, seed, palette, dark mode, device configuration) into query parameters in real time. Sharing the URL recreates the exact wallpaper state.
- **Progressive Web App (PWA)**: Built with Angular Service Worker caching (`ngsw-config.json`) and a web app manifest for complete offline compatibility, fast startup, and native installation support.
- **Firebase Saved Library**:
  - **Anonymous Sign-In**: Silently registers users on startup, keeping their library sandboxed and synchronized.
  - **Firestore Integration**: Persists lightweight wallpaper configurations without high storage overhead.
  - **Zero-Storage Thumbnails**: Dynamically redraws saved wallpapers onto preview canvases on demand, keeping them infinitely crisp.
  - **Premium UI/UX Details**: 
    - Full-overlay glassmorphic history modal.
    - Smooth fade-in, backdrop dismiss, and `ESC` key bindings.
    - Locked body scrolling when the modal is active.
    - Inline deletion confirmation on thumbnail cards.
    - Human-readable relative date display (e.g. *Today*, *Yesterday*, *3 days ago*).

---

## Architecture

```
AppComponent
    │
    ├── CanvasPreview (Renders active wallpaper & exports PNG)
    │
    ├── ControlsPanel (Interactive seed/palette/device controls)
    │
    └── HistoryModal (Renders Firestore saved wallpaper cards)
            │
            ├── FirebaseService (Manages anonymous auth & wallpaper CRUD)
            ├── WallpaperEngineService (Renders procedural canvas patterns)
            └── ToastService (Triggers smooth temporary notifications)
```

---

## Development

### Setup & Installation

Ensure you have [Node.js](https://nodejs.org) installed, then run:

```bash
npm install
```

### Local Dev Server

Launch the development server:

```bash
npm start
```

Navigate to `http://localhost:4200/` in your browser. The application will auto-reload on file edits.

### Building for Production

Compile a production-optimized build:

```bash
npm run build
```

The output will be placed in the `dist/drift-wallpapers` directory.

### Testing

Run unit tests via Vitest:

```bash
npm run test
```

### Firebase Setup & Configuration

This project relies on Firebase for anonymous authentication and Firestore storage. To set it up for development:

1. **Create a Firebase Project**: Create a new project in the [Firebase Console](https://console.firebase.google.com).
2. **Add a Web App**: Register a new web app in your Firebase project.
3. **Configure Environment Files**:
   Copy the template environment file to create the local configuration files:
   ```bash
   cp src/environments/environment.template.ts src/environments/environment.ts
   cp src/environments/environment.template.ts src/environments/environment.prod.ts
   ```
   Fill in your Firebase project credentials (`apiKey`, `authDomain`, `projectId`, etc.) in both `environment.ts` and `environment.prod.ts`.
4. **Enable Anonymous Authentication**:
   In the Firebase Console, go to **Authentication** > **Sign-in method**, and enable the **Anonymous** provider.
5. **Set Up Firestore**:
   Create a Firestore database.
6. **Configure Firestore Security Rules**:
   Deploy the following security rules to ensure users can only access their own saved configurations:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/wallpapers/{wallpaperId} {
         allow read, write, delete: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Deployment

Deploy the application to Firebase Hosting:

```bash
# Install Firebase CLI globally if you haven't already
npm install -g firebase-tools

# Login and select your project
firebase login
firebase use --add

# Build and deploy the project
npm run build
firebase deploy
```
