const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const steps = [...document.querySelectorAll('main > .step')];
let currentStep = 0;
function goStep(index) {
  if (index < 0 || index >= steps.length) return;
  document.querySelectorAll('video').forEach(video => video.pause());
  steps.forEach((step, i) => { step.hidden = i !== index; step.inert = i !== index; });
  currentStep = index;
  document.getElementById('step-count').textContent = `${String(index + 1).padStart(2, '0')} / 06`;
  document.getElementById('back').hidden = index === 0;
  window.scrollTo({ top: 0, behavior: 'instant' });
  const heading = steps[index].querySelector('h1, h2, .big-quote');
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}
document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => goStep(currentStep + 1)));
document.getElementById('back').addEventListener('click', () => goStep(currentStep - 1));
document.querySelectorAll('[data-home]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); goStep(0); }));
document.getElementById('restart').addEventListener('click', () => {
  wished = false;
  document.getElementById('candle').classList.remove('blown');
  document.getElementById('candle').setAttribute('aria-label', 'Blow out the candle and make a birthday wish');
  document.getElementById('wish-message').textContent = 'wish kore candle ta chhuye de ☺';
  goStep(0);
});

// Locally synthesized birthday music: no external audio requests or broken song links.
let audioContext, master, melodyTimer, soundEnabled = false, nextMelodyAt = 0;
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
  nextMelodyAt = time + 3;
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
    if (enabled && !melodyTimer) {
      scheduleMelody();
      melodyTimer = setInterval(() => {
        if (soundEnabled && audioContext.state === 'running' && audioContext.currentTime >= nextMelodyAt) scheduleMelody();
      }, 500);
    }
    soundButton.setAttribute('aria-pressed', String(enabled));
    soundButton.querySelector('span').textContent = enabled ? 'Sound on' : 'Sound off';
  } catch { soundButton.querySelector('span').textContent = 'Tap to retry'; }
}
soundButton.addEventListener('click', () => setSound(!soundEnabled));
document.getElementById('open').addEventListener('click', () => {
  setSound(true);
  goStep(1);
});

const filmObserver = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
  if (isIntersecting && !document.hidden && !target.closest('.step').hidden) target.play().catch(() => {});
  else target.pause();
}), { threshold: .4 });
VIDEOS.forEach((src, i) => {
  const card = document.createElement('article'); card.className = 'film-card';
  const video = document.createElement('video');
  video.src = src; video.muted = true; video.loop = true; video.playsInline = true;
  video.autoplay = false; video.controls = true; video.preload = 'metadata';
  video.setAttribute('aria-label', `Our memory film ${i + 1}`);
  const label = document.createElement('div'); label.className = 'film-label';
  label.innerHTML = `<span>▶ VIDEO / 0${i + 1}</span><span>AMRA ♡</span>`;
  card.append(video, label); document.getElementById('films').append(card);
  if (!reducedMotion) filmObserver.observe(video);
  // Keep the soundtrack from competing with a video's original audio.
  video.addEventListener('volumechange', () => { if (!video.muted && soundEnabled) setSound(false); });
});
const photoOrder = [...PHOTOS.slice(1), PHOTOS[0]];
let photoIndex = 0;
const lightbox = document.getElementById('lightbox');
const photoCard = document.createElement('button'); photoCard.className = 'photo';
const albumImage = document.createElement('img'); albumImage.decoding = 'async';
photoCard.append(albumImage); document.getElementById('gallery').append(photoCard);
function showPhoto(index) {
  photoIndex = (index + photoOrder.length) % photoOrder.length;
  albumImage.src = photoOrder[photoIndex]; albumImage.alt = `Amader chhobi ${photoIndex + 1}`;
  photoCard.setAttribute('aria-label', `Open photo ${photoIndex + 1}`);
  document.getElementById('photo-count').textContent = `${String(photoIndex + 1).padStart(2, '0')} / ${photoOrder.length}`;
}
showPhoto(0);
document.getElementById('previous-photo').addEventListener('click', () => showPhoto(photoIndex - 1));
document.getElementById('next-photo').addEventListener('click', () => showPhoto(photoIndex + 1));
photoCard.addEventListener('click', () => {
  const full = document.getElementById('full-photo'); full.src = albumImage.src; full.alt = albumImage.alt;
  lightbox.showModal();
});
document.addEventListener('keydown', event => {
  if (currentStep !== 3 || lightbox.open) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
});
document.getElementById('close-photo').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
let wished = false;
document.getElementById('candle').addEventListener('click', event => {
  if (wished) return;
  wished = true; event.currentTarget.classList.add('blown');
  event.currentTarget.setAttribute('aria-label', 'Your birthday wish has been made');
  document.getElementById('wish-message').textContent = 'Tor shob bhalo ichha puron hok, Uzra. Ameen. ♡';
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
      if (!video.closest('.step').hidden && rect.top < innerHeight * .6 && rect.bottom > innerHeight * .4) video.play().catch(() => {});
    });
  }
});
