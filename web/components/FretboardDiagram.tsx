'use client';

import React, { useState } from 'react';
import type { TriadVoicing } from '../lib/guitar/triads';

interface FretboardDiagramProps {
  voicing: TriadVoicing;
  stringNames: string[]; // e.g., ["G", "B", "E"] for strings 3-2-1
}

/**
 * Color scheme for triad intervals
 * Root: Red/Orange, 3rd: Green, 5th: Blue
 */
const NOTE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  root: {
    bg: 'bg-red-500',
    border: 'border-red-600',
    text: 'text-white',
  },
  third: {
    bg: 'bg-green-500',
    border: 'border-green-600',
    text: 'text-white',
  },
  fifth: {
    bg: 'bg-blue-500',
    border: 'border-blue-600',
    text: 'text-white',
  },
};

/**
 * Get the interval name for a note in the triad
 */
function getIntervalName(noteIndex: number, triadNotes: number[]): 'root' | 'third' | 'fifth' {
  const [root, third, fifth] = triadNotes;
  const note = triadNotes[noteIndex];

  if (note === root) return 'root';
  if (note === third) return 'third';
  return 'fifth';
}

/**
 * SVG-based vertical fretboard diagram showing a triad voicing
 */
export default function FretboardDiagram({ voicing, stringNames }: FretboardDiagramProps) {
  const [hoveredFret, setHoveredFret] = useState<number | null>(null);

  const { frets, notes, noteNames, inversion } = voicing;

  // SVG dimensions
  const width = 200;
  const height = 300;
  const fretCount = Math.max(...frets) + 3; // Show a few frets beyond the highest note
  const minFret = Math.min(...frets);
  const displayFretCount = Math.min(fretCount - minFret + 1, 8); // Show max 8 frets

  const stringSpacing = width / 4; // Space for 3 strings with margins
  const fretHeight = height / (displayFretCount + 1);

  // Calculate positions
  const stringXPositions = [
    stringSpacing,
    stringSpacing * 2,
    stringSpacing * 3,
  ];

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
      {/* String names header */}
      <div className="flex gap-8 text-xs text-gray-400">
        {stringNames.map((name, idx) => (
          <span key={idx} className="w-8 text-center">
            {name}
          </span>
        ))}
      </div>

      {/* SVG Fretboard */}
      <svg
        width={width}
        height={height}
        className="bg-gray-900 rounded"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Fret lines */}
        {Array.from({ length: displayFretCount + 1 }).map((_, idx) => {
          const y = fretHeight * (idx + 1);
          const fretNum = minFret + idx;

          return (
            <g key={`fret-${idx}`}>
              <line
                x1={stringXPositions[0] - 20}
                y1={y}
                x2={stringXPositions[2] + 20}
                y2={y}
                stroke={idx === 0 ? '#9ca3af' : '#4b5563'}
                strokeWidth={idx === 0 ? 3 : 1}
              />
              {/* Fret numbers */}
              <text
                x={stringXPositions[0] - 35}
                y={y - fretHeight / 2}
                fill="#6b7280"
                fontSize="12"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {fretNum}
              </text>
            </g>
          );
        })}

        {/* String lines */}
        {stringXPositions.map((x, idx) => (
          <line
            key={`string-${idx}`}
            x1={x}
            y1={fretHeight}
            x2={x}
            y2={height - fretHeight / 2}
            stroke="#9ca3af"
            strokeWidth="2"
          />
        ))}

        {/* Finger dots */}
        {frets.map((fret, stringIdx) => {
          const x = stringXPositions[stringIdx];
          // Calculate Y position: fret 0 is on the nut line, fret N is between fret lines
          const y = fret === 0
            ? fretHeight / 2
            : fretHeight + (fret - minFret) * fretHeight + fretHeight / 2;

          const intervalName = getIntervalName(stringIdx, notes);
          const color = NOTE_COLORS[intervalName];
          const noteName = noteNames[stringIdx];

          const isHovered = hoveredFret === stringIdx;

          return (
            <g
              key={`dot-${stringIdx}`}
              onMouseEnter={() => setHoveredFret(stringIdx)}
              onMouseLeave={() => setHoveredFret(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Dot circle */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 18 : 15}
                className={`${color.bg} transition-all`}
                stroke={isHovered ? '#fbbf24' : color.border.replace('border-', '#')}
                strokeWidth={isHovered ? 3 : 2}
              />
              {/* Note name text */}
              <text
                x={x}
                y={y}
                fill="white"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
              >
                {noteName}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Inversion label and tooltip */}
      <div className="flex flex-col items-center gap-1 text-xs">
        <span className="text-gray-400 capitalize">
          {inversion === 'root' && 'Root Position'}
          {inversion === 'first' && '1st Inversion'}
          {inversion === 'second' && '2nd Inversion'}
        </span>
        {hoveredFret !== null && (
          <span className="text-yellow-400 font-medium">
            {noteNames[hoveredFret]} ({getIntervalName(hoveredFret, notes)})
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs mt-1">
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-full ${NOTE_COLORS.root.bg}`}></div>
          <span className="text-gray-400">Root</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-full ${NOTE_COLORS.third.bg}`}></div>
          <span className="text-gray-400">3rd</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-full ${NOTE_COLORS.fifth.bg}`}></div>
          <span className="text-gray-400">5th</span>
        </div>
      </div>
    </div>
  );
}
