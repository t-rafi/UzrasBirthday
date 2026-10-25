# For Uzra — October 26

A personal birthday surprise from Rafi, presented as six separate screens:
opening → birthday greeting → videos → photo album → personal letter → candle wish.

Only the active screen is visible. Continue buttons move forward, and the footer button goes back. The album has previous/next photo controls, keyboard arrows, and a full-size viewer. The last screen can restart the experience.

Run `python -m http.server 4173` and open http://localhost:4173. No build step is needed; GitHub Pages serves the repository root.

- `index.html`: screens and original personal letter.
- `style.css`: responsive design, transitions, and reduced-motion support.
- `app.js`: step navigation, album, candle, video playback, and locally synthesized birthday melody.
- `memories.js` and `assets/`: original 30 photos and two videos.

Music starts after the opening button or sound button is tapped. Videos play muted on the video screen and pause when leaving it. Native controls allow original video sound; unmuting pauses the melody. Reduced-motion visitors start videos manually.
