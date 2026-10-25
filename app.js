const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion) document.documentElement.classList.add('js-motion');
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Locally synthesized birthday music: no external audio requests or broken song links.
let audioContext, master, melodyTimer, soundEnabled = false;
const soundButton = document.getElementById('sound');
const tune = [[67,.45],[67,.15],[69,.6],[67,.6],[72,.6],[71,1.2],[67,.45],[67,.15],[69,.6],[67,.6],[74,.6],[72,1.2],[67,.45],[67,.15],[79,.6],[76,.6],[72,.6],[71,.6],[69,1.2],[77,.45],[77,.15],[76,.6],[72,.6],[74,.6],[72,1.5]];
function note(midi, start, duration, volume = .16) {
  const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
  oscillator.type = 'sine'; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + .025);
  gain.gain.exponentialRampToValueAtTime(.001, start + duration + .4);
  oscillator.connect(gain); gain.connect(master); oscillator.start(start); oscillator.stop(start + duration + .5);
}
function scheduleMelody() {
  let time = audioContext.currentTime + .15;
  tune.forEach(([pitch, duration], index) => {
    note(pitch, time, duration * 1.15);
    if (index % 6 === 0) [48,52,55].forEach(p => note(p, time, 2, .035));
    time += duration * 1.15;
  });
  melodyTimer = setTimeout(() => { if (soundEnabled) scheduleMelody(); }, (time - audioContext.currentTime + 3) * 1000);
}
async function setSound(enabled) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      master = audioContext.createGain(); master.gain.value = .65; master.connect(audioContext.destination);
    }
    if (enabled) await audioContext.resume();
    else await audioContext.suspend();
    soundEnabled = enabled;
    if (enabled && !melodyTimer) scheduleMelody();
    soundButton.setAttribute('aria-pressed', String(enabled));
    soundButton.querySelector('span').textContent = enabled ? 'Sound on' : 'Sound off';
  } catch { soundButton.querySelector('span').textContent = 'Tap to retry'; }
}
soundButton.addEventListener('click', () => setSound(!soundEnabled));
document.getElementById('open').addEventListener('click', () => {
  setSound(true);
  document.getElementById('dedication').scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
});

const filmObserver = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
  if (isIntersecting && !document.hidden) target.play().catch(() => {});
  else target.pause();
}), { threshold: .4 });
VIDEOS.forEach((src, i) => {
  const card = document.createElement('article'); card.className = 'film-card';
  const video = document.createElement('video');
  video.src = src; video.muted = true; video.loop = true; video.playsInline = true;
  video.autoplay = !reducedMotion; video.controls = true; video.preload = 'metadata';
  video.setAttribute('aria-label', `Our memory film ${i + 1}`);
  const label = document.createElement('div'); label.className = 'film-label';
  label.innerHTML = `<span>▶ OUR LITTLE FILM / 0${i + 1}</span><span>US, IN MOTION ♡</span>`;
  card.append(video, label); document.getElementById('films').append(card);
  if (!reducedMotion) filmObserver.observe(video);
  // Keep the soundtrack from competing with a video's original audio.
  video.addEventListener('volumechange', () => { if (!video.muted && soundEnabled) setSound(false); });
});
const captions = ['my favourite kind of magic', 'a little moment, a lot of love', 'you make ordinary beautiful', 'this feeling, forever', 'a page from our story', 'right where I want to be'];
// The original opening photo stays in the album; the cover is a bespoke illustration.
const photoOrder = [...PHOTOS.slice(1), PHOTOS[0]];
let shown = 0;
const lightbox = document.getElementById('lightbox');
function addPhotos() {
  photoOrder.slice(shown, shown + 9).forEach((src, offset) => {
    const index = shown + offset;
    const card = document.createElement('button'); card.className = 'photo';
    card.setAttribute('aria-label', `Open memory ${index + 1}`);
    const img = document.createElement('img'); img.src = src; img.alt = `A cherished memory of Uzra, ${index + 1}`;
    img.loading = 'lazy'; img.decoding = 'async'; img.width = 600; img.height = 750;
    const caption = document.createElement('p'); caption.textContent = captions[index % captions.length];
    card.append(img, caption);
    card.addEventListener('click', () => {
      const full = document.getElementById('full-photo'); full.src = src; full.alt = img.alt;
      lightbox.showModal();
    });
    document.getElementById('gallery').append(card);
  });
  shown = Math.min(shown + 9, photoOrder.length);
  document.getElementById('more').hidden = shown === photoOrder.length;
}
addPhotos();
document.getElementById('more').addEventListener('click', addPhotos);
document.getElementById('close-photo').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
let wished = false;
document.getElementById('candle').addEventListener('click', event => {
  if (wished) return;
  wished = true; event.currentTarget.classList.add('blown');
  event.currentTarget.setAttribute('aria-label', 'Your birthday wish has been made');
  document.getElementById('wish-message').textContent = 'May every beautiful thing you wished for find you. ♡';
  if (soundEnabled) [72,76,79,84].forEach((pitch, i) => note(pitch, audioContext.currentTime + i * .15, 1));
  if (!reducedMotion) for (let i = 0; i < 70; i++) {
    const confetto = document.createElement('i'); confetto.className = 'confetto';
    confetto.style.cssText = `--x:${Math.random() * 100}%;--c:${['#a45c63','#a3ae8b','#d5b677','#e7c2b0'][i % 4]};--d:${3 + Math.random() * 3}s;animation-delay:${Math.random() * .8}s`;
    document.getElementById('confetti').append(confetto); setTimeout(() => confetto.remove(), 7000);
  }
});
let resumeSound = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    resumeSound = soundEnabled;
    if (audioContext && soundEnabled) audioContext.suspend();
    document.querySelectorAll('video').forEach(video => video.pause());
  } else {
    if (resumeSound && soundEnabled) audioContext.resume().catch(() => {});
    if (!reducedMotion) document.querySelectorAll('video').forEach(video => {
      const rect = video.getBoundingClientRect();
      if (rect.top < innerHeight * .6 && rect.bottom > innerHeight * .4) video.play().catch(() => {});
    });
  }
});
