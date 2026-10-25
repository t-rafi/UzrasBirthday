// Playback stays inline on iPhone and follows the visible memory card.
(() => {
  const gallery = document.getElementById('s3');
  const videos = [...document.querySelectorAll('#vidRow video')];
  const ratios = new Map(videos.map(video => [video, 0]));
  let activeVideo = null;
  const retries = new Map();
  document.querySelectorAll('.section').forEach(section => {
    section.inert = !section.classList.contains('active');
    section.setAttribute('aria-hidden', String(section.inert));
  });
  const envelope = document.getElementById('envWrap');
  envelope.tabIndex = 0; envelope.setAttribute('role', 'button'); envelope.setAttribute('aria-label', 'Open your letter');
  envelope.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); envelope.click(); }
  });
  function isGalleryOpen() { return gallery.classList.contains('active') && !document.hidden; }
  async function play(video) {
    if (!isGalleryOpen()) return;
    try {
      await video.play();
      if (!isGalleryOpen() || activeVideo !== video) video.pause();
      else retries.get(video).hidden = true;
    } catch {
      if (isGalleryOpen() && activeVideo === video) retries.get(video).hidden = false;
    }
  }
  function chooseVideo(force = false) {
    let next = null, best = .25;
    if (isGalleryOpen()) for (const [video, ratio] of ratios) {
      if (ratio > best) { next = video; best = ratio; }
    }
    if (next === activeVideo && !force) return;
    activeVideo = next;
    videos.forEach(video => { if (video !== next) video.pause(); });
    if (next) play(next);
  }
  videos.forEach((video, index) => {
    const actions = document.createElement('div'); actions.className = 'video-actions';
    const number = document.createElement('span'); number.className = 'video-number'; number.textContent = `memory ${index + 1}`;
    const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'video-retry';
    retry.textContent = '▶ tap to play'; retry.hidden = true; retries.set(video, retry);
    retry.addEventListener('click', () => { activeVideo = video; play(video); });
    const sound = document.createElement('button'); sound.type = 'button'; sound.className = 'video-sound';
    function updateSound() { sound.textContent = video.muted ? '♫ video sound on' : '♫ video sound off'; sound.setAttribute('aria-pressed', String(!video.muted)); }
    updateSound();
    sound.addEventListener('click', () => {
      video.muted = !video.muted;
      activeVideo = video;
      videos.forEach(other => { if (other !== video) other.pause(); });
      play(video);
    });
    video.addEventListener('volumechange', updateSound);
    video.addEventListener('play', () => {
      activeVideo = video;
      videos.forEach(other => { if (other !== video) other.pause(); });
      retry.hidden = true;
    });
    actions.append(number, retry, sound); video.parentElement.append(actions);
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => ratios.set(entry.target, entry.intersectionRatio));
    chooseVideo();
  }, { root: gallery, threshold: [0,.25,.4,.6,.8,1] });
  videos.forEach(video => observer.observe(video));
  document.addEventListener('sectionchange', () => {
    if (!isGalleryOpen()) { activeVideo = null; videos.forEach(video => video.pause()); }
    else {
      // Call play within the navigation tap as well as the visibility observer.
      ratios.set(videos[0], 1); ratios.set(videos[1], 0); chooseVideo(true);
    }
  });
  document.addEventListener('visibilitychange', () => { chooseVideo(true); tryPlayAll(); });
})();
