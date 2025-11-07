/**
 * Major Triads - Voicing generation and utilities
 */

import { nameToPc, pcToSharpName, buildFretboard } from './core';
import type { NoteName } from './types';

export type InversionType = 'root' | 'first' | 'second' | 'unknown';

export interface TriadVoicing {
  position: number; // 0, 1, 2, or 3
  strings: number[]; // [low_string_idx, mid_string_idx, high_string_idx]
  frets: number[]; // [fret1, fret2, fret3]
  notes: number[]; // [pc1, pc2, pc3] - pitch classes
  noteNames: string[]; // ["C", "E", "G"]
  inversion: InversionType;
  avgFret: number;
}

export interface StringGroupTriads {
  strings: number[]; // e.g., [0, 1, 2] for strings 6-5-4
  stringNames: string[]; // e.g., ["E", "A", "D"]
  voicings: TriadVoicing[]; // 4 voicings (positions 0-3)
}

export interface TriadsData {
  key: string; // e.g., "C"
  triadNotes: string[]; // ["C", "E", "G"]
  stringGroups: StringGroupTriads[]; // 4 string groups
}

/**
 * Build major triad pitch classes
 * Returns: [root_pc, third_pc, fifth_pc]
 */
export function buildMajorTriad(rootName: NoteName): [number, number, number] {
  const rootPc = nameToPc(rootName);
  const thirdPc = (rootPc + 4) % 12; // Major third (4 semitones)
  const fifthPc = (rootPc + 7) % 12; // Perfect fifth (7 semitones)
  return [rootPc, thirdPc, fifthPc];
}

/**
 * Identify which inversion type based on lowest note
 *
 * @param notes [low, mid, high] pitch classes from low to high strings
 * @param triadPcs [root, third, fifth] pitch classes
 * @returns "root", "first", "second", or "unknown"
 */
export function identifyInversion(
  notes: number[],
  triadPcs: [number, number, number]
): InversionType {
  const [rootPc, thirdPc, fifthPc] = triadPcs;
  const lowestNote = notes[0];

  if (lowestNote === rootPc) {
    return 'root';
  } else if (lowestNote === thirdPc) {
    return 'first';
  } else if (lowestNote === fifthPc) {
    return 'second';
  } else {
    return 'unknown';
  }
}

/**
 * Find all valid triad voicings on a 3-string group
 *
 * @param triadPcs [root, third, fifth] pitch classes
 * @param stringGroup [low_string_idx, mid_string_idx, high_string_idx]
 * @param fretboard Fretboard mapping from buildFretboard()
 * @param maxStretch Maximum fret span allowed (default 5)
 * @returns Array of voicing objects
 */
export function findAllTriadVoicings(
  triadPcs: [number, number, number],
  stringGroup: [number, number, number],
  fretboard: Record<number, Record<number, number>>,
  maxStretch: number = 5
): Omit<TriadVoicing, 'position'>[] {
  const voicings: Omit<TriadVoicing, 'position'>[] = [];
  const triadSet = new Set(triadPcs);

  // Try all combinations of frets on the 3 strings
  for (let fret1 = 0; fret1 <= 20; fret1++) {
    // Low string
    const note1 = fretboard[stringGroup[0]][fret1];
    if (!triadSet.has(note1)) continue;

    for (let fret2 = 0; fret2 <= 20; fret2++) {
      // Mid string
      const note2 = fretboard[stringGroup[1]][fret2];
      if (!triadSet.has(note2)) continue;

      for (let fret3 = 0; fret3 <= 20; fret3++) {
        // High string
        const note3 = fretboard[stringGroup[2]][fret3];
        if (!triadSet.has(note3)) continue;

        // Check that all three unique triad notes are present
        const notes = [note1, note2, note3];
        const noteSet = new Set(notes);
        if (noteSet.size !== triadSet.size || ![...triadSet].every(pc => noteSet.has(pc))) {
          continue;
        }

        // Check fret stretch constraint
        const minFret = Math.min(fret1, fret2, fret3);
        const maxFret = Math.max(fret1, fret2, fret3);
        if (maxFret - minFret > maxStretch) {
          continue;
        }

        // Valid voicing found
        const avgFret = (fret1 + fret2 + fret3) / 3.0;
        const inversion = identifyInversion(notes, triadPcs);
        const noteNames = notes.map(pc => pcToSharpName(pc));

        voicings.push({
          strings: [...stringGroup],
          frets: [fret1, fret2, fret3],
          notes: [...notes],
          noteNames,
          inversion,
          avgFret,
        });
      }
    }
  }

  return voicings;
}

/**
 * Select 4 representative voicings spanning the fretboard (positions 0-3)
 *
 * Buckets voicings by average fret into 4 ranges:
 * - Position 0: avg_fret 0-5.5 (open/low frets)
 * - Position 1: avg_fret 4.5-9.5 (mid-low)
 * - Position 2: avg_fret 8.5-13.5 (mid-high)
 * - Position 3: avg_fret 11.5+ (high)
 *
 * @param voicings Array of voicings to select from
 * @returns Array of up to 4 voicings, each with added "position" key (0-3)
 */
export function select4Positions(
  voicings: Omit<TriadVoicing, 'position'>[]
): TriadVoicing[] {
  if (voicings.length === 0) {
    return [];
  }

  // Sort by average fret
  const sortedVoicings = [...voicings].sort((a, b) => a.avgFret - b.avgFret);

  // Define position ranges (with slight overlap for flexibility)
  const positionRanges: [number, number][] = [
    [0, 5.5], // Position 0: open/low
    [4.5, 9.5], // Position 1: mid-low
    [8.5, 13.5], // Position 2: mid-high
    [11.5, 21], // Position 3: high
  ];

  const selected: TriadVoicing[] = [];
  const usedIndices = new Set<number>();

  for (let positionIdx = 0; positionIdx < positionRanges.length; positionIdx++) {
    const [minAvg, maxAvg] = positionRanges[positionIdx];

    // Find voicings in this range that haven't been used
    const candidateIdx = sortedVoicings.findIndex(
      (v, idx) => !usedIndices.has(idx) && v.avgFret >= minAvg && v.avgFret < maxAvg
    );

    if (candidateIdx !== -1) {
      const voicing = { ...sortedVoicings[candidateIdx], position: positionIdx };
      selected.push(voicing);
      usedIndices.add(candidateIdx);
    }
  }

  // If we found fewer than 4, try to fill with remaining voicings
  if (selected.length < 4) {
    for (let idx = 0; idx < sortedVoicings.length && selected.length < 4; idx++) {
      if (!usedIndices.has(idx)) {
        const voicing = { ...sortedVoicings[idx], position: selected.length };
        selected.push(voicing);
        usedIndices.add(idx);
      }
    }
  }

  return selected.slice(0, 4);
}

/**
 * Generate all triad voicings for a key (4 string groups × 4 positions)
 * This is the main function to use for generating triad data
 */
export function generateTriadsData(key: NoteName): TriadsData {
  const triadPcs = buildMajorTriad(key);
  const triadNoteNames = triadPcs.map(pc => pcToSharpName(pc));
  const fretboard = buildFretboard();

  // Define the 4 string groups (adjacent 3-string sets)
  const stringGroupsData: Array<[number, number, number]> = [
    [0, 1, 2], // Strings 6-5-4 (E-A-D)
    [1, 2, 3], // Strings 5-4-3 (A-D-G)
    [2, 3, 4], // Strings 4-3-2 (D-G-B)
    [3, 4, 5], // Strings 3-2-1 (G-B-E)
  ];

  const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];

  const stringGroups: StringGroupTriads[] = stringGroupsData.map(stringGroupIndices => {
    const groupStringNames = stringGroupIndices.map(idx => STRING_NAMES[idx]);

    // Find all voicings on this string group
    const allVoicings = findAllTriadVoicings(triadPcs, stringGroupIndices, fretboard);

    // Select 4 representative positions
    const selectedVoicings = select4Positions(allVoicings);

    return {
      strings: [...stringGroupIndices],
      stringNames: groupStringNames,
      voicings: selectedVoicings,
    };
  });

  return {
    key,
    triadNotes: triadNoteNames,
    stringGroups,
  };
}
