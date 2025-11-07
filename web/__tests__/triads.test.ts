import { describe, it, expect } from 'vitest';
import {
  buildMajorTriad,
  identifyInversion,
  findAllTriadVoicings,
  select4Positions,
  generateTriadsData,
} from '../lib/guitar/triads';
import { buildFretboard } from '../lib/guitar';

describe('Major Triads Logic', () => {
  describe('buildMajorTriad', () => {
    it('builds C major triad', () => {
      const triad = buildMajorTriad('C');
      expect(triad).toEqual([0, 4, 7]); // C, E, G
    });

    it('builds D major triad', () => {
      const triad = buildMajorTriad('D');
      expect(triad).toEqual([2, 6, 9]); // D, F#, A
    });

    it('builds G major triad', () => {
      const triad = buildMajorTriad('G');
      expect(triad).toEqual([7, 11, 2]); // G, B, D
    });

    it('builds F# major triad', () => {
      const triad = buildMajorTriad('F#');
      expect(triad).toEqual([6, 10, 1]); // F#, A#, C#
    });
  });

  describe('identifyInversion', () => {
    const triadPcs: [number, number, number] = [0, 4, 7]; // C, E, G

    it('identifies root position', () => {
      const notes = [0, 4, 7]; // C, E, G
      expect(identifyInversion(notes, triadPcs)).toBe('root');
    });

    it('identifies first inversion', () => {
      const notes = [4, 7, 0]; // E, G, C
      expect(identifyInversion(notes, triadPcs)).toBe('first');
    });

    it('identifies second inversion', () => {
      const notes = [7, 0, 4]; // G, C, E
      expect(identifyInversion(notes, triadPcs)).toBe('second');
    });

    it('handles different note orders', () => {
      const notes1 = [7, 4, 0]; // G, E, C - still second inversion (lowest is G)
      expect(identifyInversion(notes1, triadPcs)).toBe('second');

      const notes2 = [0, 7, 4]; // C, G, E - root position (lowest is C)
      expect(identifyInversion(notes2, triadPcs)).toBe('root');
    });
  });

  describe('findAllTriadVoicings', () => {
    const fretboard = buildFretboard();
    const triadPcs: [number, number, number] = [0, 4, 7]; // C major
    const stringGroup: [number, number, number] = [3, 4, 5]; // Strings G-B-E

    it('finds multiple voicings', () => {
      const voicings = findAllTriadVoicings(triadPcs, stringGroup, fretboard);
      expect(voicings.length).toBeGreaterThan(0);
    });

    it('voicing structure is correct', () => {
      const voicings = findAllTriadVoicings(triadPcs, stringGroup, fretboard);
      const v = voicings[0];

      expect(v).toHaveProperty('strings');
      expect(v).toHaveProperty('frets');
      expect(v).toHaveProperty('notes');
      expect(v).toHaveProperty('noteNames');
      expect(v).toHaveProperty('inversion');
      expect(v).toHaveProperty('avgFret');

      expect(v.frets).toHaveLength(3);
      expect(v.notes).toHaveLength(3);
      expect(v.noteNames).toHaveLength(3);
    });

    it('all voicings contain all three triad notes', () => {
      const voicings = findAllTriadVoicings(triadPcs, stringGroup, fretboard);

      voicings.forEach(v => {
        const noteSet = new Set(v.notes);
        expect(noteSet.size).toBe(3);
        triadPcs.forEach(pc => {
          expect(noteSet.has(pc)).toBe(true);
        });
      });
    });

    it('finds open position voicing for C major on G-B-E strings', () => {
      const voicings = findAllTriadVoicings(triadPcs, stringGroup, fretboard);

      // Look for G(open), C(1st fret), E(open) = [0, 1, 0]
      const openVoicing = voicings.find(v =>
        v.frets[0] === 0 && v.frets[1] === 1 && v.frets[2] === 0
      );

      expect(openVoicing).toBeDefined();
      expect(openVoicing?.notes).toEqual([7, 0, 4]); // G, C, E
      expect(openVoicing?.inversion).toBe('second'); // 5-1-3 = 2nd inversion
    });

    it('respects max stretch constraint', () => {
      const voicings = findAllTriadVoicings(triadPcs, stringGroup, fretboard, 5);

      voicings.forEach(v => {
        const minFret = Math.min(...v.frets);
        const maxFret = Math.max(...v.frets);
        const stretch = maxFret - minFret;
        expect(stretch).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('select4Positions', () => {
    const fretboard = buildFretboard();
    const triadPcs: [number, number, number] = [0, 4, 7]; // C major
    const stringGroup: [number, number, number] = [3, 4, 5]; // Strings G-B-E

    it('selects up to 4 voicings', () => {
      const allVoicings = findAllTriadVoicings(triadPcs, stringGroup, fretboard);
      const selected = select4Positions(allVoicings);

      expect(selected.length).toBeGreaterThan(0);
      expect(selected.length).toBeLessThanOrEqual(4);
    });

    it('each selected voicing has a position field', () => {
      const allVoicings = findAllTriadVoicings(triadPcs, stringGroup, fretboard);
      const selected = select4Positions(allVoicings);

      selected.forEach(v => {
        expect(v).toHaveProperty('position');
        expect(v.position).toBeGreaterThanOrEqual(0);
        expect(v.position).toBeLessThanOrEqual(3);
      });
    });

    it('selected voicings are sorted by avg fret', () => {
      const allVoicings = findAllTriadVoicings(triadPcs, stringGroup, fretboard);
      const selected = select4Positions(allVoicings);

      if (selected.length > 1) {
        for (let i = 0; i < selected.length - 1; i++) {
          expect(selected[i].avgFret).toBeLessThanOrEqual(selected[i + 1].avgFret);
        }
      }
    });

    it('positions span the fretboard', () => {
      const allVoicings = findAllTriadVoicings(triadPcs, stringGroup, fretboard);
      const selected = select4Positions(allVoicings);

      if (selected.length >= 2) {
        // First position should be low on fretboard
        expect(selected[0].avgFret).toBeLessThan(6);

        // Last position should be higher
        expect(selected[selected.length - 1].avgFret).toBeGreaterThan(selected[0].avgFret);
      }
    });
  });

  describe('generateTriadsData', () => {
    it('generates data for C major', () => {
      const data = generateTriadsData('C');

      expect(data.key).toBe('C');
      expect(data.triadNotes).toEqual(['C', 'E', 'G']);
      expect(data.stringGroups).toHaveLength(4);
    });

    it('each string group has correct structure', () => {
      const data = generateTriadsData('C');

      data.stringGroups.forEach((group, idx) => {
        expect(group).toHaveProperty('strings');
        expect(group).toHaveProperty('stringNames');
        expect(group).toHaveProperty('voicings');

        expect(group.strings).toHaveLength(3);
        expect(group.stringNames).toHaveLength(3);
        expect(group.voicings.length).toBeGreaterThan(0);
        expect(group.voicings.length).toBeLessThanOrEqual(4);
      });
    });

    it('string groups are correct', () => {
      const data = generateTriadsData('C');

      expect(data.stringGroups[0].strings).toEqual([0, 1, 2]); // 6-5-4
      expect(data.stringGroups[1].strings).toEqual([1, 2, 3]); // 5-4-3
      expect(data.stringGroups[2].strings).toEqual([2, 3, 4]); // 4-3-2
      expect(data.stringGroups[3].strings).toEqual([3, 4, 5]); // 3-2-1

      expect(data.stringGroups[0].stringNames).toEqual(['E', 'A', 'D']);
      expect(data.stringGroups[3].stringNames).toEqual(['G', 'B', 'E']);
    });

    it('works for different keys', () => {
      const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D#', 'F#', 'G#', 'A#'];

      keys.forEach(key => {
        const data = generateTriadsData(key as any);
        expect(data.key).toBe(key);
        expect(data.stringGroups).toHaveLength(4);
      });
    });
  });
});
