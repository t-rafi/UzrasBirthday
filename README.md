# For Uzra — October 26

A personal birthday surprise from Rafi: illustrated cover, a memory album, two films, a handwritten letter, and an interactive birthday wish.

Open `index.html` through any static server (for example `python -m http.server 4173`). No build step or dependencies are needed. GitHub Pages can serve the repository root directly.

- `style.css`: responsive design and reduced-motion support.
- `app.js`: photo viewer, progressive gallery, candle confetti, viewport video playback, and a locally synthesized birthday melody.
- `memories.js` and `assets/`: original photos and videos extracted from the old embedded page.

Audio starts after tapping **Open your surprise** or **Sound off**, because browsers require a user gesture for audible playback. Videos play muted when visible, with native controls for sound. Unmuting a film pauses the birthday music. Visitors who prefer reduced motion can start videos manually.

Edit the personal letter directly in `index.html`. No personal media is sent to external services.
