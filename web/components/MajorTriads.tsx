'use client';

import React, { useState, useEffect, useMemo } from 'react';
import LongFretboardDiagram from './LongFretboardDiagram';
import { generateTriadsData } from '../lib/guitar/triads';
import type { TriadsData } from '../lib/guitar/triads';
import { nameToPc } from '../lib/guitar';
import { getAllNoteColorsInCircleOfFifths, getNoteColor } from '../lib/guitar/note-colors';
import { DIMENSIONS } from '../lib/guitar/fretboard-dimensions';
import type { NoteName } from '../lib/guitar/types';

// Circle of fifths order
const CIRCLE_OF_FIFTHS_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

// Keyboard mapping:
// - lowercase = natural (c = C, d = D, etc.)
// - Shift + key = sharp (C = C#, D = D#, etc.)
// - Ctrl + key = flat (Ctrl+D = Db, Ctrl+E = Eb, etc.)
const KEY_TO_NOTE_MAP: Record<string, string> = {
  'c': 'C', 'C': 'C#',
  'd': 'D', 'D': 'D#',
  'e': 'E', 'E': 'F',   // E# = F
  'f': 'F', 'F': 'F#',
  'g': 'G', 'G': 'G#',
  'a': 'A', 'A': 'A#',
  'b': 'B', 'B': 'C',   // B# = C
};

// Ctrl + key = flat equivalents (enharmonic spellings)
const CTRL_KEY_TO_FLAT_MAP: Record<string, string> = {
  'd': 'C#',  // Db = C#
  'e': 'D#',  // Eb = D#
  'g': 'F#',  // Gb = F#
  'a': 'G#',  // Ab = G#
  'b': 'A#',  // Bb = A#
};

const STRING_GROUP_LABELS = [
  'Strings 3-2-1 (G-B-E)',
  'Strings 4-3-2 (D-G-B)',
  'Strings 5-4-3 (A-D-G)',
  'Strings 6-5-4 (E-A-D)',
];

export default function MajorTriads() {
  const [selectedKey, setSelectedKey] = useState<string>('C');

  // Generate triads data locally (no API needed!)
  const triadsData = useMemo(() => {
    return generateTriadsData(selectedKey as NoteName);
  }, [selectedKey]);

  // Calculate which notes are in the current triad (1, 3, 5)
  const getTriadNotes = (rootKey: string): { root: number; third: number; fifth: number } => {
    const rootPc = nameToPc(rootKey as any);
    return {
      root: rootPc,
      third: (rootPc + 4) % 12,  // Major third = 4 semitones
      fifth: (rootPc + 7) % 12,  // Perfect fifth = 7 semitones
    };
  };

  const triadNotes = getTriadNotes(selectedKey);

  // Get interval label for a note (1, 3, 5, or null)
  const getIntervalLabel = (noteName: string): '1' | '3' | '5' | null => {
    const notePc = nameToPc(noteName as any);
    if (notePc === triadNotes.root) return '1';
    if (notePc === triadNotes.third) return '3';
    if (notePc === triadNotes.fifth) return '5';
    return null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+key (flats)
      if (e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey) {
        const flatNote = CTRL_KEY_TO_FLAT_MAP[e.key.toLowerCase()];
        if (flatNote) {
          e.preventDefault(); // Prevent browser shortcuts
          setSelectedKey(flatNote);
          return;
        }
      }

      // Check for regular keys (naturals and sharps)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const note = KEY_TO_NOTE_MAP[e.key];
        if (note) {
          setSelectedKey(note);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-2 p-2 w-full">
      {/* Circle of Fifths Visual Selector */}
      <div className="w-full max-w-[900px] mx-auto">
          <svg
            width="100%"
            height="100"
            viewBox="0 0 900 100"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* SVG Filters for golden glow */}
            <defs>
              <filter id="selector-golden-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {CIRCLE_OF_FIFTHS_KEYS.map((key, index) => {
              const x = 65 + (index * 70); // Properly centered (65px margins on both sides)
              const y = 50; // Vertical center
              const colorData = getNoteColor(key);
              const isSelected = key === selectedKey;
              const intervalLabel = getIntervalLabel(key);

              // All notes same size - only selected gets golden halo
              const radius = DIMENSIONS.noteRadius * DIMENSIONS.defaultTriadNoteMultiplier;

              return (
                <g key={key}>
                  {/* Golden halo for selected note */}
                  {isSelected && (
                    <g pointerEvents="none">
                      {/* Outer glow ring */}
                      <circle
                        cx={x}
                        cy={y}
                        r={radius + DIMENSIONS.rootNoteRingOffset + 3}
                        fill="none"
                        stroke="#ffd700"
                        strokeWidth={1}
                        opacity={0.3}
                        filter="url(#selector-golden-glow)"
                      />
                      {/* Middle glow ring */}
                      <circle
                        cx={x}
                        cy={y}
                        r={radius + DIMENSIONS.rootNoteRingOffset + 1.5}
                        fill="none"
                        stroke="#ffd700"
                        strokeWidth={1.5}
                        opacity={0.5}
                        filter="url(#selector-golden-glow)"
                      />
                      {/* Main bright ring */}
                      <circle
                        cx={x}
                        cy={y}
                        r={radius + DIMENSIONS.rootNoteRingOffset}
                        fill="none"
                        stroke="#ffd700"
                        strokeWidth={DIMENSIONS.rootNoteRingWidth}
                        opacity={0.9}
                        filter="url(#selector-golden-glow)"
                      />
                    </g>
                  )}

                  {/* Interval label (1, 3, 5) below note */}
                  {intervalLabel && (
                    <text
                      x={x}
                      y={y + radius + 18}
                      fill="#4a3020"
                      fontSize="20"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      pointerEvents="none"
                    >
                      {intervalLabel}
                    </text>
                  )}

                  {/* Note circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={colorData.bg}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedKey(key)}
                  />

                  {/* Note name text */}
                  <text
                    x={x}
                    y={y}
                    fill={colorData.text}
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                  >
                    {key}
                  </text>
                </g>
              );
            })}
          </svg>
      </div>

      {/* Triads display - stacked vertically */}
      {triadsData && (
        <div className="w-full">
          <div className="flex flex-col gap-1">
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
