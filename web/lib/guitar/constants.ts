// Guitar constants and mappings

export const NOTE_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const MODES = ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"] as const;

// 3NPS XYZ Pattern Mechanics (corrected mapping)
export const XYZ_BASE = ["X", "X", "X", "Y", "Y", "Z", "Z"] as const;

export const MODE_TO_START = {
  Ionian: 1,      // Start at idx 1 → X X Y Y Z Z
  Dorian: 6,      // Start at idx 6 → Z X X X Y Y
  Phrygian: 4,    // Start at idx 4 → Y Z Z X X X
  Lydian: 2,      // Start at idx 2 → X Y Y Z Z X
  Mixolydian: 0,  // Start at idx 0 → X X X Y Y Z
  Aeolian: 5,     // Start at idx 5 → Z Z X X X Y
  Locrian: 3      // Start at idx 3 → Y Y Z Z X X
} as const;

export const WINDOW_LEN = 6;

// Mode offsets for parent major calculation
export const MODE_OFFSETS = {
  Ionian: 0,    // 1st degree - no offset
  Dorian: 2,    // 2nd degree - subtract 2 semitones
  Phrygian: 4,  // 3rd degree - subtract 4 semitones
  Lydian: 5,    // 4th degree - subtract 5 semitones
  Mixolydian: 7, // 5th degree - subtract 7 semitones
  Aeolian: 9,   // 6th degree - subtract 9 semitones
  Locrian: 11   // 7th degree - subtract 11 semitones
} as const;

// Standard tuning: low to high (string 6 to string 1)
// Using MIDI note numbers for internal calculation
export const STRING_TUNING_MIDI = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4
export const STRING_NAMES = ["E", "A", "D", "G", "B", "E"]; // Open string names

export const STRING_ORDINALS = ["6th", "5th", "4th", "3rd", "2nd", "1st"];
