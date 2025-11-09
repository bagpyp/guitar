/**
 * Note color mapping based on the Circle of Fifths
 *
 * Maps all 12 chromatic notes to distinct colors arranged around a color wheel,
 * following the circle of fifths progression for musical coherence.
 *
 * Circle of Fifths order: C → G → D → A → E → B → F#/Gb → Db → Ab → Eb → Bb → F → C
 *
 * This creates smooth harmonic relationships between adjacent colors:
 * - Related keys (perfect fifths apart) have similar hues
 * - Distant keys have contrasting colors
 */

/**
 * Note pitch classes mapped to their enharmonic equivalents
 * Uses sharps as canonical names, but maps flats to the same pitch class
 */
const NOTE_TO_PITCH_CLASS: Record<string, number> = {
  'C': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11,
};

/**
 * Circle of fifths color palette
 * Each color is carefully chosen to be visually distinct and aesthetically pleasing
 *
 * Colors progress through the spectrum following the circle of fifths:
 * C (red) → G (orange) → D (yellow) → A (lime) → E (green) → B (cyan)
 * → F#/Gb (blue) → C#/Db (indigo) → G#/Ab (violet) → D#/Eb (magenta)
 * → A#/Bb (pink) → F (red-orange)
 */
const CIRCLE_OF_FIFTHS_COLORS: Record<number, { bg: string; text: string; name: string }> = {
  0:  { bg: '#ef4444', text: '#ffffff', name: 'C' },   // Red - Starting point
  7:  { bg: '#f97316', text: '#ffffff', name: 'G' },   // Orange
  2:  { bg: '#eab308', text: '#000000', name: 'D' },   // Yellow (dark text for contrast)
  9:  { bg: '#84cc16', text: '#000000', name: 'A' },   // Lime
  4:  { bg: '#10b981', text: '#ffffff', name: 'E' },   // Green
  11: { bg: '#06b6d4', text: '#000000', name: 'B' },   // Cyan
  6:  { bg: '#3b82f6', text: '#ffffff', name: 'F#/Gb' }, // Blue
  1:  { bg: '#6366f1', text: '#ffffff', name: 'C#/Db' }, // Indigo
  8:  { bg: '#8b5cf6', text: '#ffffff', name: 'G#/Ab' }, // Violet
  3:  { bg: '#d946ef', text: '#ffffff', name: 'D#/Eb' }, // Magenta
  10: { bg: '#ec4899', text: '#ffffff', name: 'A#/Bb' }, // Pink
  5:  { bg: '#f43f5e', text: '#ffffff', name: 'F' },   // Rose/Red-pink
};

/**
 * Get the color for a note name
 *
 * @param noteName - Note name (e.g., "C", "C#", "Db", "F#")
 * @returns Color object with background, text color, and canonical name
 */
export function getNoteColor(noteName: string): { bg: string; text: string; name: string } {
  // Extract just the note name without octave (e.g., "C4" → "C", "F#3" → "F#")
  const noteOnly = noteName.replace(/[0-9]/g, '');

  const pitchClass = NOTE_TO_PITCH_CLASS[noteOnly];

  if (pitchClass === undefined) {
    console.warn(`Unknown note name: ${noteName}, defaulting to gray`);
    return { bg: '#6b7280', text: '#ffffff', name: noteOnly };
  }

  return CIRCLE_OF_FIFTHS_COLORS[pitchClass];
}

/**
 * Get all 12 chromatic note colors in circle of fifths order
 * Useful for creating comprehensive legends
 *
 * @returns Array of pitch classes in circle of fifths order with their colors
 */
export function getAllNoteColorsInCircleOfFifths(): Array<{
  pitchClass: number;
  bg: string;
  text: string;
  name: string;
}> {
  // Circle of fifths order starting from C
  const circleOrder = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

  return circleOrder.map(pc => ({
    pitchClass: pc,
    ...CIRCLE_OF_FIFTHS_COLORS[pc],
  }));
}

/**
 * Get colors for just the notes present in a given key's scale
 *
 * @param keyNotes - Array of note names in the key (e.g., ["C", "D", "E", "F", "G", "A", "B"])
 * @returns Array of colors for those notes in circle of fifths order
 */
export function getKeyNoteColors(keyNotes: string[]): Array<{
  noteName: string;
  bg: string;
  text: string;
}> {
  const noteSet = new Set(keyNotes.map(n => n.replace(/[0-9]/g, '')));

  return getAllNoteColorsInCircleOfFifths()
    .filter(({ name }) => {
      // Check if this note (or its enharmonic) is in the key
      const variants = name.split('/');
      return variants.some(v => noteSet.has(v));
    })
    .map(({ name, bg, text }) => ({
      noteName: name.split('/')[0], // Use first variant (sharp notation)
      bg,
      text,
    }));
}

/**
 * Get a color for a pitch class number (0-11)
 *
 * @param pitchClass - Pitch class (0=C, 1=C#, 2=D, etc.)
 * @returns Color object
 */
export function getPitchClassColor(pitchClass: number): { bg: string; text: string; name: string } {
  return CIRCLE_OF_FIFTHS_COLORS[pitchClass % 12];
}
