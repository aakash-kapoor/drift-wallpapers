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
