document.documentElement.classList.add('js');

const revealItems = document.querySelectorAll('.reveal-on-scroll');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// ---- müzik çalar ----
const tracks = [
  { title: 'That’s All My Fault', kind: 'original', src: 'muzik/Yunus TAŞ - That\'s All My Fault.mp3' },
  { title: 'Risen remix', kind: 'remix', src: 'muzik/Yunus TAŞ - Risen remix.mp3' },
  { title: 'Revisiting the H E L L', kind: 'original', src: 'muzik/Yunus TAŞ - Revisiting the H E L L.mp3' },
  { title: 'An Ultrakill Remix', kind: 'fan-made remix', src: 'muzik/Yunus TAS - An Ultrakill Remix.mp3' },
  { title: 'There Is No Escape', kind: 'original', src: 'muzik/Yunus TAS - There Is No Escape.mp3' },
  { title: 'As Malicious As You', kind: 'original', src: 'muzik/Yunus TAS - As Malicious As You.mp3' },
];

const playerEl = document.querySelector('.player');
if (playerEl) {
  const audio = new Audio();
  audio.preload = 'none';
  const listEl = document.getElementById('player-list');
  const titleEl = document.getElementById('player-title');
  const kindEl = document.getElementById('player-kind');
  const toggleBtn = document.getElementById('player-toggle');
  const fillEl = document.getElementById('player-progress-fill');
  const progressEl = document.getElementById('player-progress');
  const currentEl = document.getElementById('player-current');
  const totalEl = document.getElementById('player-total');
  let index = -1;

  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  };

  tracks.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'player-row';
    li.innerHTML = '<span class="player-row-num">' + String(i + 1).padStart(2, '0') + '</span>'
      + '<span class="player-row-title"></span>'
      + '<span class="player-row-kind"></span>'
      + '<span class="player-row-time">—</span>';
    li.querySelector('.player-row-title').textContent = t.title;
    li.querySelector('.player-row-kind').textContent = t.kind;
    li.addEventListener('click', () => (i === index && !audio.paused) ? audio.pause() : play(i));
    listEl.appendChild(li);
  });
  const rows = [...listEl.children];

  function loadMeta(i) {
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.src = tracks[i].src;
    probe.addEventListener('loadedmetadata', () => {
      tracks[i].duration = probe.duration;
      rows[i].querySelector('.player-row-time').textContent = fmt(probe.duration);
      if (i === index) totalEl.textContent = fmt(probe.duration);
    });
  }
  tracks.forEach((_, i) => loadMeta(i));

  function play(i) {
    if (i !== index) {
      index = i;
      audio.src = tracks[i].src;
      rows.forEach((r, n) => r.classList.toggle('is-active', n === i));
      titleEl.textContent = tracks[i].title;
      kindEl.textContent = tracks[i].kind;
      totalEl.textContent = fmt(tracks[i].duration);
    }
    audio.play();
  }

  toggleBtn.addEventListener('click', () => {
    if (index === -1) return play(0);
    audio.paused ? audio.play() : audio.pause();
  });
  document.getElementById('player-prev').addEventListener('click', () => play((index - 1 + tracks.length) % tracks.length || 0));
  document.getElementById('player-next').addEventListener('click', () => play((index + 1) % tracks.length));

  audio.addEventListener('play', () => { playerEl.classList.add('is-playing'); toggleBtn.textContent = '❚❚'; toggleBtn.setAttribute('aria-label', 'Duraklat'); });
  audio.addEventListener('pause', () => { playerEl.classList.remove('is-playing'); toggleBtn.textContent = '▶'; toggleBtn.setAttribute('aria-label', 'Çal'); });
  audio.addEventListener('ended', () => play((index + 1) % tracks.length));
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    fillEl.style.width = (audio.currentTime / audio.duration) * 100 + '%';
    currentEl.textContent = fmt(audio.currentTime);
  });
  progressEl.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = progressEl.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });
}
