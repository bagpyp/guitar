import { describe, it, expect } from 'vitest';
import {
  buildFretboard,
  findBestPosition,
  parentMajor,
  getXyzDisplayString,
  planXyzPositions,
  nameToPc,
  pcToSharpName,
  midiToPc,
} from '../lib/guitar';

describe('Guitar Core Logic', () => {
  describe('Note conversions', () => {
    it('converts note names to pitch classes', () => {
      expect(nameToPc('C')).toBe(0);
      expect(nameToPc('C#')).toBe(1);
      expect(nameToPc('D')).toBe(2);
      expect(nameToPc('A#')).toBe(10);
      expect(nameToPc('B')).toBe(11);
    });

    it('converts pitch classes to note names', () => {
      expect(pcToSharpName(0)).toBe('C');
      expect(pcToSharpName(1)).toBe('C#');
      expect(pcToSharpName(12)).toBe('C'); // wraps around
      expect(pcToSharpName(13)).toBe('C#');
    });

    it('converts MIDI notes to pitch classes', () => {
      expect(midiToPc(60)).toBe(0); // Middle C
      expect(midiToPc(61)).toBe(1); // C#
      expect(midiToPc(72)).toBe(0); // C one octave up
    });
  });

  describe('Parent major key calculation', () => {
    it('calculates parent major for Ionian', () => {
      expect(parentMajor('Ionian', 'C')).toBe('C');
      expect(parentMajor('Ionian', 'G')).toBe('G');
    });

    it('calculates parent major for Dorian', () => {
      expect(parentMajor('Dorian', 'D')).toBe('C'); // D Dorian is in C major
      expect(parentMajor('Dorian', 'G')).toBe('F'); // G Dorian is in F major
    });

    it('calculates parent major for Aeolian', () => {
      expect(parentMajor('Aeolian', 'A')).toBe('C'); // A Aeolian is in C major
      expect(parentMajor('Aeolian', 'E')).toBe('G'); // E Aeolian is in G major
    });

    it('calculates parent major for all modes', () => {
      // C major scale modes
      expect(parentMajor('Ionian', 'C')).toBe('C');
      expect(parentMajor('Dorian', 'D')).toBe('C');
      expect(parentMajor('Phrygian', 'E')).toBe('C');
      expect(parentMajor('Lydian', 'F')).toBe('C');
      expect(parentMajor('Mixolydian', 'G')).toBe('C');
      expect(parentMajor('Aeolian', 'A')).toBe('C');
      expect(parentMajor('Locrian', 'B')).toBe('C');
    });
  });

  describe('Fretboard building', () => {
    it('builds fretboard with correct dimensions', () => {
      const fretboard = buildFretboard();
      expect(Object.keys(fretboard).length).toBe(6); // 6 strings
      expect(Object.keys(fretboard[0]).length).toBe(21); // 21 frets (0-20)
    });

    it('has correct open string notes', () => {
      const fretboard = buildFretboard();
      expect(fretboard[0][0]).toBe(nameToPc('E')); // 6th string
      expect(fretboard[1][0]).toBe(nameToPc('A')); // 5th string
      expect(fretboard[2][0]).toBe(nameToPc('D')); // 4th string
      expect(fretboard[3][0]).toBe(nameToPc('G')); // 3rd string
      expect(fretboard[4][0]).toBe(nameToPc('B')); // 2nd string
      expect(fretboard[5][0]).toBe(nameToPc('E')); // 1st string
    });
  });

  describe('Position finding', () => {
    const fretboard = buildFretboard();

    it('finds best position for a note near target fret', () => {
      const position = findBestPosition('A', 5, fretboard);
      expect(position.fret).toBeGreaterThanOrEqual(0);
      expect(position.fret).toBeLessThanOrEqual(20);
      expect(position.stringIndex).toBeGreaterThanOrEqual(0);
      expect(position.stringIndex).toBeLessThanOrEqual(5);
    });

    it('prefers deeper strings on distance ties', () => {
      // A# at target fret 12
      // Should prefer 5th string fret 13 over 2nd string fret 11 (both distance 1)
      const position = findBestPosition('A#', 12, fretboard);
      expect(position.stringIndex).toBe(1); // 5th string (index 1)
      expect(position.fret).toBe(13);
    });

    it('throws error for invalid note', () => {
      expect(() => findBestPosition('Invalid', 5, fretboard)).toThrow();
    });
  });

  describe('XYZ patterns', () => {
    it('generates correct XYZ patterns for all modes', () => {
      const expectedPatterns = {
        Ionian: 'XXYYZZ',
        Dorian: 'ZXXXYY',
        Phrygian: 'YZZXXX',
        Lydian: 'XYYZZX',
        Mixolydian: 'XXXYYZ',
        Aeolian: 'ZZXXXY',
        Locrian: 'YYZZXX',
      };

      Object.entries(expectedPatterns).forEach(([mode, expected]) => {
        const actual = getXyzDisplayString(mode as any);
        expect(actual).toBe(expected);
      });
    });

    it('plans XYZ positions for all 6 strings', () => {
      const positions = planXyzPositions('Ionian', 2, 10);
      expect(positions.length).toBe(6);

      // Each position should have stringIndex, fret, and symbol
      positions.forEach(pos => {
        expect(pos).toHaveProperty('stringIndex');
        expect(pos).toHaveProperty('fret');
        expect(pos).toHaveProperty('symbol');
        expect(['X', 'Y', 'Z']).toContain(pos.symbol);
      });

      // Starting position should match
      expect(positions[2].fret).toBe(10);
      expect(positions[2].stringIndex).toBe(2);
    });

    it('applies fret shifts correctly in XYZ patterns', () => {
      const positions = planXyzPositions('Ionian', 0, 3);

      // Verify frets are reasonable (within playable range)
      positions.forEach(pos => {
        expect(pos.fret).toBeGreaterThanOrEqual(0);
        expect(pos.fret).toBeLessThanOrEqual(20);
      });
    });
  });
});
