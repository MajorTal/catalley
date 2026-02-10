// music.js - Background music (loops a single WAV, like duckstreet)

let audio = null;
let musicVolume = 0.3;

export function initMusic() {
  audio = new Audio('sfx/background.wav');
  audio.loop = true;
  audio.volume = musicVolume;

  // Try to play immediately; if browser blocks, fall back to first interaction
  audio.play().catch(() => {
    const unlock = () => {
      audio.play().catch(() => {});
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
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
  if (audio) audio.pause();
}

export function resumeMusic() {
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
  audio.play().catch(() => {});
}
