Sharp-Sharp demo

Canonical entry: `index.html` (the compiled SPA in this folder).

Purpose: Shared expense tracker / split-bill app. The full-app entry is `index.html` (loads `assets/` bundles). A lightweight `demo.html` also exists as an alternate static entry; the site demo hub now uses the SPA (`index.html`) loaded lazily in an iframe.

Notes:
- The SPA is intended to be opened from `demos.html` only; remove direct nav links to keep it discoverable only from the demos hub.
- If you rebuild the app, ensure compiled assets remain in `sharp-sharp/assets/` and paths in `index.html` stay relative (`./assets/...`).
- If you experience slow initial loads, the demo hub lazily sets the iframe `src` on launch to reduce initial page weight.
