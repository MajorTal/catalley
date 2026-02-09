// music.js - Background music (loops a single WAV, like duckstreet)

let audio = null;
let musicVolume = 0.3;

export function initMusic() {
  audio = new Audio('sfx/background.wav');
  audio.loop = true;
  audio.volume = musicVolume;

  // Autoplay on first user interaction (browsers require gesture)
  const unlock = () => {
    audio.play().catch(() => {});
    document.removeEventListener('click', unlock);
    document.removeEventListener('keydown', unlock);
  };
  document.addEventListener('click', unlock);
  document.addEventListener('keydown', unlock);
}

export function setMusicVolume(v) {
  musicVolume = v;
  if (audio) audio.volume = v;
}

export function getMusicVolume() {
  return musicVolume;
}
