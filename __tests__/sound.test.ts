import { describe, it, expect } from 'vitest';
import { calculateNoteFrequency } from '../lib/guitar/sound';

/**
 * Tests for guitar sound generation and frequency calculations
 * Ensures all notes are at the correct pitch relative to each other
 */
describe('Guitar Sound System', () => {
  describe('Open string frequencies', () => {
    it('should have correct frequency for open 6th string (E2)', () => {
      const freq = calculateNoteFrequency(0, 0);
      expect(freq).toBeCloseTo(82.41, 1); // E2
    });

    it('should have correct frequency for open 5th string (A2)', () => {
      const freq = calculateNoteFrequency(1, 0);
      expect(freq).toBeCloseTo(110.00, 1); // A2
    });

    it('should have correct frequency for open 4th string (D3)', () => {
      const freq = calculateNoteFrequency(2, 0);
      expect(freq).toBeCloseTo(146.83, 1); // D3
    });

    it('should have correct frequency for open 3rd string (G3)', () => {
      const freq = calculateNoteFrequency(3, 0);
      expect(freq).toBeCloseTo(196.00, 1); // G3
    });

    it('should have correct frequency for open 2nd string (B3)', () => {
      const freq = calculateNoteFrequency(4, 0);
      expect(freq).toBeCloseTo(246.94, 1); // B3
    });

    it('should have correct frequency for open 1st string (E4)', () => {
      const freq = calculateNoteFrequency(5, 0);
      expect(freq).toBeCloseTo(329.63, 1); // E4
    });
  });

  describe('Fretted note frequencies', () => {
    it('should calculate 12th fret as octave (2x frequency)', () => {
      const openE = calculateNoteFrequency(0, 0); // E2
      const fret12E = calculateNoteFrequency(0, 12); // E3

      expect(fret12E).toBeCloseTo(openE * 2, 1);
    });

    it('should calculate 5th fret on 6th string as A2 (same as open 5th string)', () => {
      const openA = calculateNoteFrequency(1, 0); // Open 5th string (A2)
      const fret5E = calculateNoteFrequency(0, 5); // 5th fret on 6th string (E + 5 semitones = A)

      expect(fret5E).toBeCloseTo(openA, 1);
    });

    it('should have each fret raise pitch by semitone ratio', () => {
      const freq0 = calculateNoteFrequency(0, 0);
      const freq1 = calculateNoteFrequency(0, 1);

      const ratio = freq1 / freq0;
      const expectedRatio = Math.pow(2, 1/12); // 2^(1/12) ≈ 1.0595

      expect(ratio).toBeCloseTo(expectedRatio, 4);
    });

    it('should maintain relative pitch across all strings', () => {
      // Open strings should be in ascending order (low to high)
      const frequencies = [0, 1, 2, 3, 4, 5].map(s => calculateNoteFrequency(s, 0));

      for (let i = 0; i < frequencies.length - 1; i++) {
        expect(frequencies[i]).toBeLessThan(frequencies[i + 1]);
      }
    });
  });

  describe('High fret limit', () => {
    it('should support up to fret 18', () => {
      // Should not throw error
      const freq = calculateNoteFrequency(0, 18);
      expect(freq).toBeGreaterThan(0);
    });

    it('should reject frets above 18', () => {
      expect(() => calculateNoteFrequency(0, 19)).toThrow();
      expect(() => calculateNoteFrequency(0, 24)).toThrow();
    });

    it('should have highest note at 1st string, fret 18', () => {
      const highestNote = calculateNoteFrequency(5, 18); // E4 + 18 semitones
      const expectedFreq = 329.63 * Math.pow(2, 18/12); // E4 × 2^(18/12)

      expect(highestNote).toBeCloseTo(expectedFreq, 1);

      // Verify this is indeed the highest note on the fretboard
      for (let string = 0; string < 6; string++) {
        for (let fret = 0; fret <= 18; fret++) {
          const freq = calculateNoteFrequency(string, fret);
          expect(freq).toBeLessThanOrEqual(highestNote);
        }
      }
    });
  });

  describe('Relative pitch verification', () => {
    it('should never have a lower string produce higher pitch than higher string at same fret', () => {
      // String 6 (index 0) should always be lower than string 1 (index 5) at same fret
      for (let fret = 0; fret <= 18; fret++) {
        const string6 = calculateNoteFrequency(0, fret);
        const string1 = calculateNoteFrequency(5, fret);

        expect(string6).toBeLessThan(string1);
      }
    });

    it('should have correct intervals between strings', () => {
      // Standard tuning intervals:
      // 6→5: Perfect 4th (5 semitones)
      // 5→4: Perfect 4th (5 semitones)
      // 4→3: Perfect 4th (5 semitones)
      // 3→2: Major 3rd (4 semitones)  ← Different!
      // 2→1: Perfect 4th (5 semitones)

      const intervals = [
        { from: 0, to: 1, semitones: 5 }, // E→A
        { from: 1, to: 2, semitones: 5 }, // A→D
        { from: 2, to: 3, semitones: 5 }, // D→G
        { from: 3, to: 4, semitones: 4 }, // G→B (major 3rd!)
        { from: 4, to: 5, semitones: 5 }, // B→E
      ];

      intervals.forEach(({ from, to, semitones }) => {
        const freqFrom = calculateNoteFrequency(from, 0);
        const freqTo = calculateNoteFrequency(to, 0);

        const ratio = freqTo / freqFrom;
        const expectedRatio = Math.pow(2, semitones / 12);

        expect(ratio).toBeCloseTo(expectedRatio, 3);
      });
    });
  });

  describe('Special cases', () => {
    it('should handle boundary conditions', () => {
      // Lowest note
      const lowest = calculateNoteFrequency(0, 0);
      expect(lowest).toBeCloseTo(82.41, 1);

      // Highest note
      const highest = calculateNoteFrequency(5, 18);
      expect(highest).toBeGreaterThan(lowest);
      expect(highest).toBeLessThan(2000); // Reasonable upper bound
    });

    it('should throw error for invalid string index', () => {
      expect(() => calculateNoteFrequency(-1, 0)).toThrow();
      expect(() => calculateNoteFrequency(6, 0)).toThrow();
    });

    it('should throw error for invalid fret', () => {
      expect(() => calculateNoteFrequency(0, -1)).toThrow();
      expect(() => calculateNoteFrequency(0, 19)).toThrow();
    });
  });

  describe('Octave relationships', () => {
    it('should have correct octave spacing', () => {
      // 12 frets = 1 octave (2x frequency)
      for (let string = 0; string < 6; string++) {
        const openFreq = calculateNoteFrequency(string, 0);
        const octaveFreq = calculateNoteFrequency(string, 12);

        expect(octaveFreq / openFreq).toBeCloseTo(2.0, 2);
      }
    });

    it('should have E4 on 1st string be octave above E3 on 4th string fret 2', () => {
      const e4 = calculateNoteFrequency(5, 0); // 1st string open = E4
      const e3 = calculateNoteFrequency(2, 2); // 4th string (D3) + 2 frets = E3

      expect(e4 / e3).toBeCloseTo(2.0, 2);
    });
  });

  describe('Equal temperament verification', () => {
    it('should use equal temperament tuning (12th root of 2)', () => {
      // Each semitone should be exactly 2^(1/12) ratio
      const baseFreq = calculateNoteFrequency(0, 0);

      for (let fret = 1; fret <= 12; fret++) {
        const freq = calculateNoteFrequency(0, fret);
        const expectedFreq = baseFreq * Math.pow(2, fret / 12);

        expect(freq).toBeCloseTo(expectedFreq, 5);
      }
    });

    it('should have A440 standard at correct position', () => {
      // A4 = 440 Hz is the standard tuning reference
      // On guitar: 1st string (E4), fret 5 = A4
      const a4 = calculateNoteFrequency(5, 5);

      expect(a4).toBeCloseTo(440.0, 1);
    });
  });

  describe('Frequency range validation', () => {
    it('should have all notes in guitar frequency range', () => {
      // Guitar range: ~82 Hz (low E) to ~988 Hz (high E at fret 18)
      for (let string = 0; string < 6; string++) {
        for (let fret = 0; fret <= 18; fret++) {
          const freq = calculateNoteFrequency(string, fret);

          expect(freq).toBeGreaterThanOrEqual(82); // Low E2
          expect(freq).toBeLessThanOrEqual(1000); // Reasonable upper bound
        }
      }
    });

    it('should maintain reasonable frequency progression', () => {
      // Each fret should increase frequency, never decrease
      for (let string = 0; string < 6; string++) {
        for (let fret = 0; fret < 18; fret++) {
          const currentFreq = calculateNoteFrequency(string, fret);
          const nextFreq = calculateNoteFrequency(string, fret + 1);

          expect(nextFreq).toBeGreaterThan(currentFreq);
        }
      }
    });
  });
});
