// Web Audio API Oscillating Emergency Rescue Siren Generator
let audioCtx = null;
let oscillator = null;
let gainNode = null;
let sirenInterval = null;

export const startEmergencySiren = () => {
  if (oscillator) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  oscillator = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(700, audioCtx.currentTime);

  let highFreq = false;
  sirenInterval = setInterval(() => {
    if (oscillator && audioCtx) {
      const targetFreq = highFreq ? 700 : 1200;
      oscillator.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.3);
      highFreq = !highFreq;
    }
  }, 400);

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start();
};

export const stopEmergencySiren = () => {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (oscillator) {
    try {
      oscillator.stop();
      oscillator.disconnect();
    } catch (e) {
      console.error('Siren stop error:', e);
    }
    oscillator = null;
  }
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch (e) {
      console.error('AudioContext close error:', e);
    }
    audioCtx = null;
  }
};
