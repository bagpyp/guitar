import { describe, it, expect } from 'vitest';
import { findAllTriadVoicings, select4PositionsCoordinated, buildMajorTriad } from '../lib/guitar/triads';
import { buildFretboard } from '../lib/guitar/core';

/**
 * Test that adjacent string groups share notes correctly for the same position
 *
 * Since adjacent string groups share 2 strings, the same position should have:
 * - Last 2 notes of group k = First 2 notes of group k+1
 *
 * For example:
 * - Group 0 (strings 6-5-4): [0,1,2]
 * - Group 1 (strings 5-4-3): [1,2,3]
 * - They share strings [1,2]
 *
 * So position 0 in group 0 should have the same notes on strings [1,2]
 * as position 0 in group 1 on strings [1,2]
 */
describe('Position Note Sharing Between Adjacent Groups', () => {
  const testKey = 'C';
  const triadPcs = buildMajorTriad('C' as any); // [0, 4, 7] - C, E, G
  const fretboard = buildFretboard();

  // Define the 4 string groups
  const stringGroups = [
    [0, 1, 2], // 6-5-4 (E-A-D)
    [1, 2, 3], // 5-4-3 (A-D-G)
    [2, 3, 4], // 4-3-2 (D-G-B)
    [3, 4, 5], // 3-2-1 (G-B-E)
  ];

  // Get all voicings for each group
  const allVoicingsPerGroup = stringGroups.map(strings =>
    findAllTriadVoicings(triadPcs, strings as [number, number, number], fretboard)
  );

  // Use coordinated selection
  const allGroupVoicings = select4PositionsCoordinated(allVoicingsPerGroup, triadPcs);

  describe('Adjacent group note sharing for all positions', () => {
    // Test all adjacent group pairs (0→1, 1→2, 2→3)
    for (let groupIdx = 0; groupIdx < 3; groupIdx++) {
      const currentGroup = allGroupVoicings[groupIdx];
      const nextGroup = allGroupVoicings[groupIdx + 1];
      const currentStrings = stringGroups[groupIdx];
      const nextStrings = stringGroups[groupIdx + 1];

      // Test all 4 positions (0, 1, 2, 3)
      for (let posIdx = 0; posIdx < 4; posIdx++) {
        it(`should share notes for position ${posIdx} between group ${groupIdx} and ${groupIdx + 1}`, () => {
          const currentVoicing = currentGroup.find(v => v.position === posIdx);
          const nextVoicing = nextGroup.find(v => v.position === posIdx);

          // Both positions should exist
          expect(currentVoicing).toBeDefined();
          expect(nextVoicing).toBeDefined();

          if (!currentVoicing || !nextVoicing) return;

          // Current group: strings [a, b, c], we want notes on [b, c]
          // Next group: strings [b, c, d], we want notes on [b, c]
          const sharedStringIndices = [1, 2]; // b and c in both groups

          // Get notes from current group's last 2 strings
          const currentSharedNotes = [
            currentVoicing.notes[1], // Note on string b (index 1 in current group)
            currentVoicing.notes[2], // Note on string c (index 2 in current group)
          ];

          // Get notes from next group's first 2 strings
          const nextSharedNotes = [
            nextVoicing.notes[0], // Note on string b (index 0 in next group)
            nextVoicing.notes[1], // Note on string c (index 1 in next group)
          ];

          // These should be identical
          expect(currentSharedNotes).toEqual(nextSharedNotes);

          // Also verify the frets are the same on shared strings
          const currentSharedFrets = [
            currentVoicing.frets[1],
            currentVoicing.frets[2],
          ];

          const nextSharedFrets = [
            nextVoicing.frets[0],
            nextVoicing.frets[1],
          ];

          expect(currentSharedFrets).toEqual(nextSharedFrets);
        });
      }
    }
  });

  describe('Inversion pairing constraint', () => {
    it('should have positions 0 and 3 with same inversion type', () => {
      allGroupVoicings.forEach((groupVoicings, groupIdx) => {
        const pos0 = groupVoicings.find(v => v.position === 0);
        const pos3 = groupVoicings.find(v => v.position === 3);

        if (pos0 && pos3) {
          expect(pos0.inversion).toBe(pos3.inversion);
        }
      });
    });

    it('should have positions 1 and 2 with different inversions from 0/3', () => {
      allGroupVoicings.forEach((groupVoicings, groupIdx) => {
        const pos0 = groupVoicings.find(v => v.position === 0);
        const pos1 = groupVoicings.find(v => v.position === 1);
        const pos2 = groupVoicings.find(v => v.position === 2);

        if (pos0 && pos1 && pos2) {
          // Positions 1 and 2 should not have the same inversion as 0
          expect(pos1.inversion).not.toBe(pos0.inversion);
          expect(pos2.inversion).not.toBe(pos0.inversion);

          // Positions 1 and 2 should be different from each other
          expect(pos1.inversion).not.toBe(pos2.inversion);
        }
      });
    });
  });

  describe('Detailed C major position 3 verification', () => {
    it('should have matching notes on strings 4-3 between groups 2 and 3', () => {
      // Group 2: Strings 4-3-2 (D-G-B) [indices 2,3,4]
      // Group 3: Strings 3-2-1 (G-B-E) [indices 3,4,5]
      // Shared strings: 3 and 4 (G and B)

      const group2 = allGroupVoicings[2];
      const group3 = allGroupVoicings[3];

      const group2Pos3 = group2.find(v => v.position === 3);
      const group3Pos3 = group3.find(v => v.position === 3);

      expect(group2Pos3).toBeDefined();
      expect(group3Pos3).toBeDefined();

      if (!group2Pos3 || !group3Pos3) return;

      // Group 2, position 3: last 2 notes (on strings G and B)
      const group2SharedNotes = [group2Pos3.notes[1], group2Pos3.notes[2]];
      const group2SharedFrets = [group2Pos3.frets[1], group2Pos3.frets[2]];

      // Group 3, position 3: first 2 notes (on strings G and B)
      const group3SharedNotes = [group3Pos3.notes[0], group3Pos3.notes[1]];
      const group3SharedFrets = [group3Pos3.frets[0], group3Pos3.frets[1]];

      console.log('Group 2 (4-3-2), Position 3:');
      console.log('  Frets:', group2Pos3.frets);
      console.log('  Notes:', group2Pos3.notes);
      console.log('  Note names:', group2Pos3.noteNames);
      console.log('  Shared (last 2):', { notes: group2SharedNotes, frets: group2SharedFrets });

      console.log('Group 3 (3-2-1), Position 3:');
      console.log('  Frets:', group3Pos3.frets);
      console.log('  Notes:', group3Pos3.notes);
      console.log('  Note names:', group3Pos3.noteNames);
      console.log('  Shared (first 2):', { notes: group3SharedNotes, frets: group3SharedFrets });

      expect(group2SharedNotes).toEqual(group3SharedNotes);
      expect(group2SharedFrets).toEqual(group3SharedFrets);
    });
  });
});
