// A soft birthday melody, started by the opening gesture.
(() => {
  const button = document.getElementById('musicToggle');
  const melody = [[67,.45],[67,.15],[69,.6],[67,.6],[72,.6],[71,1.2],[67,.45],[67,.15],[69,.6],[67,.6],[74,.6],[72,1.2],[67,.45],[67,.15],[79,.6],[76,.6],[72,.6],[71,.6],[69,1.2],[77,.45],[77,.15],[76,.6],[72,.6],[74,.6],[72,1.5]];
  let context, output, enabled = false, started = false, nextAt = 0, timer;
  const galleryVideos = [...document.querySelectorAll('#vidRow video')];
  const videoHasSound = () => galleryVideos.some(v => !v.paused && !v.ended && !v.muted && v.volume > 0);
  function tone(pitch, at, duration, volume) {
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = 440 * 2 ** ((pitch - 69) / 12);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration + .7);
    oscillator.connect(gain); gain.connect(output);
    oscillator.start(at); oscillator.stop(at + duration + .8);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  function schedule() {
    let at = context.currentTime + .15;
    melody.forEach(([pitch, duration], index) => {
      tone(pitch, at, duration * 1.35, .15);
      tone(pitch + 12, at, duration * .7, .018);
      if (index % 6 === 0) [48,52,55].forEach(p => tone(p, at, 2.5, .025));
      at += duration * 1.35;
    });
    nextAt = at + 4;
  }
  async function sync() {
    if (!context) return;
    try {
      if (enabled && !document.hidden && !videoHasSound()) await context.resume();
      else await context.suspend();
    } catch { /* A later tap can retry a browser-blocked resume. */ }
  }
  async function setMusic(value) {
    try {
      if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        output = context.createGain(); output.gain.value = .6; output.connect(context.destination);
      }
      enabled = value;
      await sync();
      if (enabled && !timer) {
        schedule();
        timer = setInterval(() => {
          if (enabled && context.state === 'running' && context.currentTime >= nextAt) schedule();
        }, 500);
      }
      button.textContent = enabled ? '♫ sound on' : '♫ sound off';
      button.setAttribute('aria-pressed', String(enabled));
      button.setAttribute('aria-label', enabled ? 'Pause birthday music' : 'Play birthday music');
    } catch {
      enabled = false;
      button.textContent = '♫ tap to retry';
      button.setAttribute('aria-pressed', 'false');
    }
  }
  button.addEventListener('click', () => { started = true; setMusic(!enabled); });
  function startOnce() { if (!started) { started = true; setMusic(true); } }
  document.getElementById('btnOpen').addEventListener('click', startOnce);
  document.getElementById('envWrap').addEventListener('click', startOnce);
  galleryVideos.forEach(video => ['play','pause','ended','volumechange'].forEach(event => video.addEventListener(event, sync)));
  document.addEventListener('visibilitychange', sync);
})();
