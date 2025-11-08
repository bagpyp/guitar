'use client';

import React, { useState, useEffect } from 'react';
import LongFretboardDiagram from './LongFretboardDiagram';
import type { TriadsData } from '../lib/guitar/triads';
import { nameToPc } from '../lib/guitar';
import { getAllNoteColorsInCircleOfFifths } from '../lib/guitar/note-colors';

// Circle of fifths order
const CIRCLE_OF_FIFTHS_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

// Keyboard mapping: lowercase = natural, uppercase = sharp (E->F, B->C for sharps)
const KEY_TO_NOTE_MAP: Record<string, string> = {
  'c': 'C', 'C': 'C#',
  'd': 'D', 'D': 'D#',
  'e': 'E', 'E': 'F',   // E# = F
  'f': 'F', 'F': 'F#',
  'g': 'G', 'G': 'G#',
  'a': 'A', 'A': 'A#',
  'b': 'B', 'B': 'C',   // B# = C
};

const STRING_GROUP_LABELS = [
  'Strings 3-2-1 (G-B-E)',
  'Strings 4-3-2 (D-G-B)',
  'Strings 5-4-3 (A-D-G)',
  'Strings 6-5-4 (E-A-D)',
];

export default function MajorTriads() {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [triadsData, setTriadsData] = useState<TriadsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch triads data when key changes
  useEffect(() => {
    const fetchTriads = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:8000/api/triads/${selectedKey}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch triads: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setTriadsData(data);
      } catch (err) {
        console.error('Error fetching triads:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load triads. Is the API server running?'
        );
        setTriadsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTriads();
  }, [selectedKey]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const note = KEY_TO_NOTE_MAP[e.key];
      if (note) {
        setSelectedKey(note);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header - Circle of Fifths Key Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-blue-400">Major Triads</h2>

        {/* Circle of Fifths Keys */}
        <div className="flex gap-3 items-center">
          {CIRCLE_OF_FIFTHS_KEYS.map((key) => {
            const colorData = getAllNoteColorsInCircleOfFifths().find(c => c.name.split('/').includes(key));
            const isSelected = key === selectedKey;

            return (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                  isSelected ? 'scale-125 shadow-lg' : 'scale-100 opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: colorData?.bg,
                  color: colorData?.text,
                  border: isSelected ? '3px solid white' : 'none',
                }}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-400">Loading triads...</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <p className="text-sm text-gray-400 mt-2">
            Make sure the API server is running: <code className="text-yellow-400">python api.py</code>
          </p>
        </div>
      )}

      {/* Triads display - stacked vertically */}
      {triadsData && !loading && (
        <div className="w-full py-6">
          <div className="flex flex-col gap-16">
            {[...triadsData.stringGroups].reverse().map((group, groupIdx) => {
              // Convert triad note names to pitch classes
              const triadPcs: [number, number, number] = [
                nameToPc(triadsData.triadNotes[0] as any),
                nameToPc(triadsData.triadNotes[1] as any),
                nameToPc(triadsData.triadNotes[2] as any),
              ];

              // Reversed index for labels (0→3, 1→2, 2→1, 3→0)
              const labelIdx = 3 - groupIdx;

              return (
                <div key={groupIdx} className="flex-shrink-0">
                  <LongFretboardDiagram
                    voicings={group.voicings}
                    stringNames={group.stringNames}
                    stringGroupLabel={STRING_GROUP_LABELS[labelIdx]}
                    triadPcs={triadPcs}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
