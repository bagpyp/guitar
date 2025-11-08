/**
 * Guitar sound generation using Web Audio API
 * Calculates correct frequencies for each string/fret and plays tones
 */

/**
 * Standard guitar tuning frequencies in Hz (based on equal temperament)
 * These are the scientifically correct frequencies for standard tuning
 *
 * String 6 (low E):  E2 = 82.41 Hz
 * String 5 (A):      A2 = 110.00 Hz
 * String 4 (D):      D3 = 146.83 Hz
 * String 3 (G):      G3 = 196.00 Hz
 * String 2 (B):      B3 = 246.94 Hz
 * String 1 (high E): E4 = 329.63 Hz
 */
const OPEN_STRING_FREQUENCIES = [
  82.41,  // String 6 (index 0): E2
  110.00, // String 5 (index 1): A2
  146.83, // String 4 (index 2): D3
  196.00, // String 3 (index 3): G3
  246.94, // String 2 (index 4): B3
  329.63, // String 1 (index 5): E4
];

/**
 * Calculate the frequency of a note at a specific string and fret
 *
 * Uses equal temperament formula: f = f0 × 2^(n/12)
 * where f0 is the open string frequency and n is the number of frets
 *
 * @param stringIndex - String index (0 = 6th string/low E, 5 = 1st string/high E)
 * @param fret - Fret number (0 = open string, 1-18 = fretted)
 * @returns Frequency in Hz
 */
export function calculateNoteFrequency(stringIndex: number, fret: number): number {
  if (stringIndex < 0 || stringIndex > 5) {
    throw new Error(`Invalid string index: ${stringIndex}. Must be 0-5.`);
  }

  if (fret < 0 || fret > 18) {
    throw new Error(`Invalid fret: ${fret}. Must be 0-18.`);
  }

  const openStringFreq = OPEN_STRING_FREQUENCIES[stringIndex];

  // Each fret raises pitch by one semitone (half step)
  // 2^(1/12) ≈ 1.0595 is the frequency ratio for one semitone
  const frequency = openStringFreq * Math.pow(2, fret / 12);

  return frequency;
}

/**
 * Web Audio API context (singleton)
 * Created lazily on first use
 */
let audioContext: AudioContext | null = null;

/**
 * Get or create the audio context
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Active oscillators (for stopping previous sounds)
 */
let activeOscillators: OscillatorNode[] = [];

/**
 * Stop all currently playing sounds
 */
export function stopAllSounds(): void {
  activeOscillators.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {
      // Oscillator may already be stopped
    }
  });
  activeOscillators = [];
}

/**
 * Play a single note
 *
 * @param stringIndex - String index (0-5)
 * @param fret - Fret number (0-18)
 * @param duration - Duration in seconds (default 2.0)
 */
export function playNote(stringIndex: number, fret: number, duration: number = 2.0): void {
  stopAllSounds();

  const frequency = calculateNoteFrequency(stringIndex, fret);
  const ctx = getAudioContext();

  // Create oscillator for the tone
  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine'; // Smooth guitar-like tone
  oscillator.frequency.value = frequency;

  // Create gain node for volume control and envelope
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;

  // Connect: oscillator → gain → output
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // ADSR envelope (simple attack and decay)
  const now = ctx.currentTime;
  const attackTime = 0.01; // 10ms attack
  const decayTime = 0.1; // 100ms decay
  const sustainLevel = 0.15; // Quiet volume (not too loud)
  const releaseTime = 0.5; // 500ms release

  // Attack
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + attackTime);

  // Decay to sustain
  gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);

  // Release
  gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  // Start and schedule stop
  oscillator.start(now);
  oscillator.stop(now + duration);

  activeOscillators.push(oscillator);

  // Clean up after sound finishes
  oscillator.onended = () => {
    oscillator.disconnect();
    activeOscillators = activeOscillators.filter(osc => osc !== oscillator);
  };
}

/**
 * Play a chord (multiple notes simultaneously)
 *
 * @param notes - Array of {stringIndex, fret} objects
 * @param duration - Duration in seconds (default 2.0)
 */
export function playChord(notes: Array<{ stringIndex: number; fret: number }>, duration: number = 2.0): void {
  stopAllSounds();

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  notes.forEach(({ stringIndex, fret }) => {
    const frequency = calculateNoteFrequency(stringIndex, fret);

    // Create oscillator
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Create gain node
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // ADSR envelope (softer for chords)
    const attackTime = 0.01;
    const decayTime = 0.1;
    const sustainLevel = 0.1; // Quieter for chords (multiple notes)
    const releaseTime = 0.5;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);

    activeOscillators.push(oscillator);

    oscillator.onended = () => {
      oscillator.disconnect();
      activeOscillators = activeOscillators.filter(osc => osc !== oscillator);
    };
  });
}

/**
 * Resume audio context if it's suspended (required by browser autoplay policies)
 * Call this on user interaction (e.g., first click/hover)
 */
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}
