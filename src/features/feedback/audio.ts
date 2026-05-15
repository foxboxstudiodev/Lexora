export type SoundCue = 'select' | 'success' | 'error' | 'reward' | 'hint';

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const audioWindow = window as AudioWindow;
  const AudioContextCtor = window.AudioContext ?? audioWindow.webkitAudioContext;
  if (!AudioContextCtor) return null;

  if (!audioContext) {
    audioContext = new AudioContextCtor();
  }

  return audioContext;
}

const cueConfig: Record<SoundCue, { frequency: number; duration: number; type: OscillatorType; gain: number }> = {
  select: { frequency: 520, duration: 0.035, type: 'sine', gain: 0.025 },
  success: { frequency: 720, duration: 0.09, type: 'triangle', gain: 0.035 },
  reward: { frequency: 880, duration: 0.12, type: 'triangle', gain: 0.04 },
  hint: { frequency: 640, duration: 0.08, type: 'sine', gain: 0.032 },
  error: { frequency: 160, duration: 0.11, type: 'sawtooth', gain: 0.025 },
};

export function playSound(cue: SoundCue, enabled: boolean): void {
  if (!enabled) return;

  const context = getAudioContext();
  if (!context) return;

  const config = cueConfig[cue];
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = config.type;
  oscillator.frequency.setValueAtTime(config.frequency, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(config.gain, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + config.duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + config.duration);
}
