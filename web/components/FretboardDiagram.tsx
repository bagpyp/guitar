'use client';

import React, { useState } from 'react';
import type { TriadVoicing } from '../lib/guitar/triads';
import { calculateFretYPositions, getNoteYPosition, getStringThickness } from '../lib/guitar/fretboard-physics';
import { getNoteColor } from '../lib/guitar/note-colors';

interface FretboardDiagramProps {
  voicing: TriadVoicing;
  stringNames: string[]; // e.g., ["G", "B", "E"] for strings 3-2-1
  triadPcs: [number, number, number]; // [root, third, fifth] pitch classes
}

/**
 * Get the interval name for a note pitch class (for hover info)
 */
function getIntervalName(notePc: number, triadPcs: [number, number, number]): 'root' | 'third' | 'fifth' {
  const [root, third, fifth] = triadPcs;

  if (notePc === root) return 'root';
  if (notePc === third) return 'third';
  return 'fifth';
}

/**
 * SVG-based vertical fretboard diagram showing a triad voicing
 */
export default function FretboardDiagram({ voicing, stringNames, triadPcs }: FretboardDiagramProps) {
  const [hoveredFret, setHoveredFret] = useState<number | null>(null);

  const { frets, notes, noteNames, inversion } = voicing;

  // SVG dimensions
  const width = 200;
  const height = 300;
  const minFret = Math.min(...frets);
  const maxFret = Math.max(...frets);
  const displayFretCount = Math.min(maxFret - minFret + 3, 8); // Show a few frets beyond, max 8 frets

  const stringSpacing = width / 4; // Space for 3 strings with margins

  // Calculate physics-based fret positions
  const fretYPositions = calculateFretYPositions(minFret, displayFretCount, height);

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
          const y = fretYPositions[idx];
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
              {idx < displayFretCount && (
                <text
                  x={stringXPositions[0] - 35}
                  y={(y + fretYPositions[idx + 1]) / 2}
                  fill="#6b7280"
                  fontSize="12"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {fretNum}
                </text>
              )}
            </g>
          );
        })}

        {/* String lines - with varying thickness based on string gauge */}
        {stringXPositions.map((x, idx) => {
          // Map local string index to global string index based on voicing.strings
          const globalStringIdx = voicing.strings[idx];
          const thickness = getStringThickness(globalStringIdx, 1.5);
          return (
            <line
              key={`string-${idx}`}
              x1={x}
              y1={fretYPositions[0]}
              x2={x}
              y2={fretYPositions[displayFretCount]}
              stroke="#9ca3af"
              strokeWidth={thickness}
            />
          );
        })}

        {/* Finger dots */}
        {frets.map((fret, stringIdx) => {
          const x = stringXPositions[stringIdx];
          // Calculate Y position using physics-based positioning
          const y = getNoteYPosition(fret, fretYPositions, minFret);

          const notePc = notes[stringIdx];
          const intervalName = getIntervalName(notePc, triadPcs);
          const noteName = noteNames[stringIdx];
          const noteColor = getNoteColor(noteName);

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
                fill={noteColor.bg}
                stroke={isHovered ? '#fbbf24' : noteColor.bg}
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all"
              />
              {/* Note name text */}
              <text
                x={x}
                y={y}
                fill={noteColor.text}
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
            {noteNames[hoveredFret]} ({getIntervalName(notes[hoveredFret], triadPcs)})
          </span>
        )}
      </div>

      {/* Note legend - show the notes in this voicing */}
      <div className="flex gap-3 text-xs mt-1">
        {noteNames.map((name, idx) => {
          const noteColor = getNoteColor(name);
          const intervalName = getIntervalName(notes[idx], triadPcs);
          return (
            <div key={idx} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: noteColor.bg }}
              />
              <span className="text-gray-400">{name} ({intervalName})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
