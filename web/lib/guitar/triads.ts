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
 * Uses a quartile-based approach to ensure even distribution:
 * - Position 0: ~0th percentile (lowest voicing)
 * - Position 1: ~25th percentile
 * - Position 2: ~50th percentile
 * - Position 3: ~100th percentile (highest voicing)
 *
 * This ensures we don't skip voicings in the middle range.
 *
 * @param voicings Array of voicings to select from
 * @returns Array of up to 4 voicings, each with added "position" key (0-3)
 */
function voicingsShareNotes(
  v1: Omit<TriadVoicing, 'position'>,
  v2: Omit<TriadVoicing, 'position'>
): boolean {
  // v1's last 2 notes should match v2's first 2 notes
  return (
    v1.notes[1] === v2.notes[0] &&
    v1.notes[2] === v2.notes[1] &&
    v1.frets[1] === v2.frets[0] &&
    v1.frets[2] === v2.frets[1]
  );
}

function findVoicingChains(
  allGroupVoicings: Array<Omit<TriadVoicing, 'position'>[]>
): Array<Omit<TriadVoicing, 'position'>[]> {
  const chains: Array<Omit<TriadVoicing, 'position'>[]> = [];

  // Start with every voicing in group 0
  for (const v0 of allGroupVoicings[0]) {
    for (const v1 of allGroupVoicings[1]) {
      if (!voicingsShareNotes(v0, v1)) continue;

      for (const v2 of allGroupVoicings[2]) {
        if (!voicingsShareNotes(v1, v2)) continue;

        for (const v3 of allGroupVoicings[3]) {
          if (!voicingsShareNotes(v2, v3)) continue;

          // Found a complete chain!
          chains.push([v0, v1, v2, v3]);
        }
      }
    }
  }

  return chains;
}

export function select4PositionsCoordinated(
  allGroupVoicings: Array<Omit<TriadVoicing, 'position'>[]>,
  triadPcs: [number, number, number]
): TriadVoicing[][] {
  // Find all valid chains
  const chains = findVoicingChains(allGroupVoicings);

  if (chains.length < 4) {
    // Fallback: not enough chains
    return allGroupVoicings.map(v => select4Positions(v));
  }

  // Group chains by inversion pattern
  const chainsByPattern: Record<InversionType, Array<{avgFret: number; chain: Omit<TriadVoicing, 'position'>[]}>> = {
    root: [],
    first: [],
    second: [],
    unknown: [],
  };

  for (const chain of chains) {
    const avgFret = chain.reduce((sum, v) => sum + v.avgFret, 0) / 4;
    const inv = chain[0].inversion;
    chainsByPattern[inv].push({ avgFret, chain });
  }

  // Sort chains within each inversion group by avg fret
  for (const inv in chainsByPattern) {
    chainsByPattern[inv as InversionType].sort((a, b) => a.avgFret - b.avgFret);
  }

  // Find best inversion for P0/P3
  const inversionTypes: InversionType[] = ['root', 'first', 'second'];
  let bestPairedInv: InversionType | null = null;
  let bestSpan = 0;

  for (const inv of inversionTypes) {
    const chainsList = chainsByPattern[inv];
    if (chainsList.length >= 2) {
      const span = chainsList[chainsList.length - 1].avgFret - chainsList[0].avgFret;
      if (span > bestSpan) {
        bestSpan = span;
        bestPairedInv = inv;
      }
    }
  }

  if (bestPairedInv === null) {
    return allGroupVoicings.map(v => select4Positions(v));
  }

  // Select 4 chains with inversion constraints
  const otherInvs = inversionTypes.filter(inv => inv !== bestPairedInv);
  const selectedChains: Array<Omit<TriadVoicing, 'position'>[]> = [];

  // Position 0: Lowest chain with paired inversion
  if (chainsByPattern[bestPairedInv].length > 0) {
    selectedChains.push(chainsByPattern[bestPairedInv][0].chain);
  }

  // Position 1: Chain from first "other" inversion
  if (otherInvs[0] && chainsByPattern[otherInvs[0]].length > 0) {
    const inv1Chains = chainsByPattern[otherInvs[0]];
    const idx = Math.min(inv1Chains.length - 1, Math.floor(inv1Chains.length / 3));
    selectedChains.push(inv1Chains[idx].chain);
  }

  // Position 2: Chain from second "other" inversion
  if (otherInvs.length > 1 && chainsByPattern[otherInvs[1]].length > 0) {
    const inv2Chains = chainsByPattern[otherInvs[1]];
    const idx = Math.max(0, Math.floor(inv2Chains.length * 2 / 3));
    selectedChains.push(inv2Chains[idx].chain);
  }

  // Position 3: Highest chain with paired inversion
  if (chainsByPattern[bestPairedInv].length > 0) {
    const chains = chainsByPattern[bestPairedInv];
    selectedChains.push(chains[chains.length - 1].chain);
  }

  // Convert chains to grouped format
  const result: TriadVoicing[][] = [[], [], [], []];
  selectedChains.forEach((chain, posIdx) => {
    chain.forEach((voicing, groupIdx) => {
      result[groupIdx].push({ ...voicing, position: posIdx });
    });
  });

  return result;
}

export function select4Positions(
  voicings: Omit<TriadVoicing, 'position'>[]
): TriadVoicing[] {
  if (voicings.length === 0) {
    return [];
  }

  // Sort by average fret
  const sortedVoicings = [...voicings].sort((a, b) => a.avgFret - b.avgFret);
  const n = sortedVoicings.length;

  if (n <= 4) {
    // If 4 or fewer voicings, use them all
    return sortedVoicings.map((v, idx) => ({ ...v, position: idx }));
  }

  // Group voicings by inversion type
  const byInversion: Record<InversionType, Array<Omit<TriadVoicing, 'position'>>> = {
    root: [],
    first: [],
    second: [],
    unknown: [],
  };

  sortedVoicings.forEach(v => {
    byInversion[v.inversion].push(v);
  });

  // Find which inversion type has voicings in both low and high ranges
  // This will be used for positions 0 & 3
  const inversionTypes: InversionType[] = ['root', 'first', 'second'];
  let bestPairedInversion: InversionType | null = null;
  let bestSpan = 0;

  for (const invType of inversionTypes) {
    const invVoicings = byInversion[invType];
    if (invVoicings.length >= 2) {
      const span = invVoicings[invVoicings.length - 1].avgFret - invVoicings[0].avgFret;
      if (span > bestSpan) {
        bestSpan = span;
        bestPairedInversion = invType;
      }
    }
  }

  // Fallback: if no inversion spans well, use old algorithm
  if (bestPairedInversion === null || bestSpan < 3) {
    const indices = [
      0,
      Math.round((n - 1) / 4),
      Math.round((2 * (n - 1)) / 4),
      Math.round((3 * (n - 1)) / 4),
    ];
    return indices.map((voicingIdx, positionIdx) => ({
      ...sortedVoicings[voicingIdx],
      position: positionIdx,
    }));
  }

  // Get the other two inversions for positions 1 & 2
  const otherInversions = inversionTypes.filter(inv => inv !== bestPairedInversion);

  // Select positions with inversion constraints
  const selected: TriadVoicing[] = [];

  // Position 0: Lowest voicing with paired inversion
  const pairedVoicings = byInversion[bestPairedInversion];
  if (pairedVoicings.length > 0) {
    selected.push({ ...pairedVoicings[0], position: 0 });
  }

  // Position 1: Lower voicing from first "other" inversion
  if (otherInversions[0] && byInversion[otherInversions[0]].length > 0) {
    const inv1Voicings = byInversion[otherInversions[0]];
    const idx = Math.min(inv1Voicings.length - 1, Math.floor(inv1Voicings.length / 3));
    selected.push({ ...inv1Voicings[idx], position: 1 });
  }

  // Position 2: Higher voicing from second "other" inversion
  if (otherInversions.length > 1 && byInversion[otherInversions[1]].length > 0) {
    const inv2Voicings = byInversion[otherInversions[1]];
    const idx = Math.max(0, Math.floor(inv2Voicings.length * 2 / 3));
    selected.push({ ...inv2Voicings[idx], position: 2 });
  }

  // Position 3: Highest voicing with paired inversion
  if (pairedVoicings.length > 0) {
    selected.push({ ...pairedVoicings[pairedVoicings.length - 1], position: 3 });
  }

  return selected;
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

  // Find all voicings for all groups first (for coordination)
  const allGroupVoicings = stringGroupsData.map(stringGroupIndices =>
    findAllTriadVoicings(triadPcs, stringGroupIndices, fretboard)
  );

  // Select positions using coordinated algorithm
  const selectedByGroup = select4PositionsCoordinated(allGroupVoicings, triadPcs);

  const stringGroups: StringGroupTriads[] = stringGroupsData.map((stringGroupIndices, groupIdx) => {
    const groupStringNames = stringGroupIndices.map(idx => STRING_NAMES[idx]);
    const selectedVoicings = selectedByGroup[groupIdx];

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
