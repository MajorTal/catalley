// music.js - Background music (loops a single WAV, like duckstreet)

let audio = null;
let musicVolume = 0.3;
let paused = false;

export function initMusic() {
  audio = new Audio('sfx/background.wav');
  audio.loop = true;
  audio.volume = musicVolume;

  // Try to play immediately; if browser blocks, fall back to first interaction
  audio.play().catch(() => {
    const unlock = () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      if (!paused) audio.play().catch(() => {});
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
  });
}

export function setMusicVolume(v) {
  musicVolume = v;
  if (audio) audio.volume = v;
}

export function getMusicVolume() {
  return musicVolume;
}

export function pauseMusic() {
  paused = true;
  if (audio) audio.pause();
}

export function resumeMusic() {
  paused = false;
  if (audio) audio.play().catch(() => {});
}

export function replaceMusic(blobUrl) {
  if (audio) {
    audio.pause();
    audio.removeAttribute('src');
  }
  audio = new Audio(blobUrl);
  audio.loop = true;
  audio.volume = musicVolume;
  if (!paused) audio.play().catch(() => {});
}
