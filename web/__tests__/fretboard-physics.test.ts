import { describe, it, expect } from 'vitest';
import {
  getFretPosition,
  getFretSpacing,
  getStringThickness,
  calculateFretYPositions,
  getNoteYPosition,
  getNoteAtPosition,
} from '../lib/guitar/fretboard-physics';

describe('Fretboard Physics', () => {
  describe('getFretPosition', () => {
    it('should return 0 for the nut (fret 0)', () => {
      expect(getFretPosition(0)).toBe(0);
    });

    it('should return increasing distances for higher frets', () => {
      const fret1 = getFretPosition(1);
      const fret2 = getFretPosition(2);
      const fret12 = getFretPosition(12);

      expect(fret1).toBeGreaterThan(0);
      expect(fret2).toBeGreaterThan(fret1);
      expect(fret12).toBeGreaterThan(fret2);
    });

    it('should place 12th fret near halfway point of scale length', () => {
      const scaleLength = 648; // mm
      const fret12Pos = getFretPosition(12, scaleLength);

      // 12th fret should be very close to half the scale length
      expect(fret12Pos).toBeGreaterThan(scaleLength * 0.48);
      expect(fret12Pos).toBeLessThan(scaleLength * 0.52);
    });

    it('should have exponentially decreasing spacing (physics-based)', () => {
      const spacing1 = getFretSpacing(0);
      const spacing2 = getFretSpacing(1);
      const spacing12 = getFretSpacing(11);
      const spacing13 = getFretSpacing(12);

      // Each fret spacing should be smaller than the previous
      expect(spacing2).toBeLessThan(spacing1);
      expect(spacing13).toBeLessThan(spacing12);
    });
  });

  describe('getStringThickness', () => {
    it('should return thickest for 6th string (low E)', () => {
      const thickness6 = getStringThickness(0); // 6th string
      const thickness1 = getStringThickness(5); // 1st string

      expect(thickness6).toBeGreaterThan(thickness1);
    });

    it('should have decreasing thickness from 6th to 1st string', () => {
      const thicknesses = [0, 1, 2, 3, 4, 5].map(idx => getStringThickness(idx));

      // Verify all thicknesses are positive
      thicknesses.forEach(t => expect(t).toBeGreaterThan(0));

      // Verify decreasing from low to high strings
      for (let i = 0; i < thicknesses.length - 1; i++) {
        expect(thicknesses[i]).toBeGreaterThan(thicknesses[i + 1]);
      }
    });

    it('should scale with base width parameter', () => {
      const baseWidth1 = getStringThickness(0, 1.5);
      const baseWidth2 = getStringThickness(0, 3.0);

      expect(baseWidth2).toBeCloseTo(baseWidth1 * 2, 1);
    });
  });

  describe('calculateFretYPositions', () => {
    it('should return correct number of positions', () => {
      const positions = calculateFretYPositions(0, 18, 1000);
      expect(positions).toHaveLength(19); // 0-18 inclusive
    });

    it('should start at 0 and end near total height', () => {
      const height = 1000;
      const positions = calculateFretYPositions(0, 18, height);

      expect(positions[0]).toBe(0);
      expect(positions[positions.length - 1]).toBeCloseTo(height, 1);
    });

    it('should have increasing Y values', () => {
      const positions = calculateFretYPositions(0, 18, 1000);

      for (let i = 0; i < positions.length - 1; i++) {
        expect(positions[i + 1]).toBeGreaterThan(positions[i]);
      }
    });
  });

  describe('getNoteYPosition', () => {
    const fretYPositions = calculateFretYPositions(0, 18, 1000);

    it('should place open string at nut position', () => {
      const y = getNoteYPosition(0, fretYPositions, 0);
      expect(y).toBe(fretYPositions[0]);
    });

    it('should place notes between fret lines', () => {
      const y1 = getNoteYPosition(1, fretYPositions, 0);

      expect(y1).toBeGreaterThan(fretYPositions[0]);
      expect(y1).toBeLessThan(fretYPositions[1]);
    });

    it('should return midpoint between frets', () => {
      const y5 = getNoteYPosition(5, fretYPositions, 0);
      const expectedY = (fretYPositions[4] + fretYPositions[5]) / 2;

      expect(y5).toBeCloseTo(expectedY, 1);
    });
  });

  describe('getNoteAtPosition', () => {
    it('should return correct open string notes', () => {
      expect(getNoteAtPosition(0, 0).noteName).toBe('E');  // 6th string
      expect(getNoteAtPosition(1, 0).noteName).toBe('A');  // 5th string
      expect(getNoteAtPosition(2, 0).noteName).toBe('D');  // 4th string
      expect(getNoteAtPosition(3, 0).noteName).toBe('G');  // 3rd string
      expect(getNoteAtPosition(4, 0).noteName).toBe('B');  // 2nd string
      expect(getNoteAtPosition(5, 0).noteName).toBe('E');  // 1st string
    });

    it('should return correct notes at 5th fret', () => {
      expect(getNoteAtPosition(0, 5).noteName).toBe('A');  // 6th string, 5th fret
      expect(getNoteAtPosition(1, 5).noteName).toBe('D');  // 5th string, 5th fret
      expect(getNoteAtPosition(2, 5).noteName).toBe('G');  // 4th string, 5th fret
    });

    it('should return correct notes at 12th fret (octave)', () => {
      const openE = getNoteAtPosition(0, 0);
      const octaveE = getNoteAtPosition(0, 12);

      expect(openE.noteName).toBe(octaveE.noteName);
      expect(openE.pitchClass).toBe(octaveE.pitchClass);
    });

    it('should return pitch classes in range 0-11', () => {
      for (let string = 0; string < 6; string++) {
        for (let fret = 0; fret < 18; fret++) {
          const { pitchClass } = getNoteAtPosition(string, fret);
          expect(pitchClass).toBeGreaterThanOrEqual(0);
          expect(pitchClass).toBeLessThanOrEqual(11);
        }
      }
    });

    it('should handle chromatic scale correctly', () => {
      // Starting from open A string (5th string, fret 0), go up chromatically
      const notes = [];
      for (let fret = 0; fret < 12; fret++) {
        notes.push(getNoteAtPosition(1, fret).noteName);
      }

      const expected = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
      expect(notes).toEqual(expected);
    });
  });

  describe('Physics formula validation', () => {
    it('should use correct 12th root of 2 formula', () => {
      const scaleLength = 648;
      const fret1 = getFretPosition(1, scaleLength);

      // Manual calculation using formula: scale_length * (1 - 2^(-1/12))
      const expected = scaleLength * (1 - Math.pow(2, -1 / 12));

      expect(fret1).toBeCloseTo(expected, 5);
    });

    it('should maintain proper ratios between frets', () => {
      // Each fret should divide remaining string by 17.817 (12th root of 2 ratio)
      const spacing1 = getFretSpacing(0);
      const spacing2 = getFretSpacing(1);

      const ratio = spacing1 / spacing2;
      const expectedRatio = Math.pow(2, 1/12); // ≈ 1.0595

      expect(ratio).toBeCloseTo(expectedRatio, 2);
    });
  });
});
