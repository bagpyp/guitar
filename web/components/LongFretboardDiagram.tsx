'use client';

import React, { useState } from 'react';
import type { TriadVoicing } from '../lib/guitar/triads';

interface LongFretboardDiagramProps {
  voicings: TriadVoicing[]; // All 4 positions for this string group
  stringNames: string[]; // e.g., ["G", "B", "E"] for strings 3-2-1
  stringGroupLabel: string; // e.g., "Strings 3-2-1 (G-B-E)"
}

/**
 * Position colors for distinguishing different voicings
 */
const POSITION_COLORS = [
  { bg: '#8b5cf6', label: 'Position 0', border: '#7c3aed' }, // Purple
  { bg: '#3b82f6', label: 'Position 1', border: '#2563eb' }, // Blue
  { bg: '#10b981', label: 'Position 2', border: '#059669' }, // Green
  { bg: '#f59e0b', label: 'Position 3', border: '#d97706' }, // Amber
];

/**
 * Note role colors for the dots
 */
const NOTE_ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  root: { bg: '#ef4444', text: '#ffffff' },   // Red
  third: { bg: '#10b981', text: '#ffffff' },  // Green
  fifth: { bg: '#3b82f6', text: '#ffffff' },  // Blue
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
 * Long vertical fretboard showing all voicings for a string group on one unified neck
 */
export default function LongFretboardDiagram({
  voicings,
  stringNames,
  stringGroupLabel,
}: LongFretboardDiagramProps) {
  const [hoveredDot, setHoveredDot] = useState<{
    voicingIdx: number;
    stringIdx: number;
  } | null>(null);
  const [highlightedPosition, setHighlightedPosition] = useState<number | null>(null);

  // SVG dimensions for long neck
  const width = 300;
  const height = 1000;
  const numFrets = 21; // Show frets 0-20
  const fretHeight = height / (numFrets + 1);
  const stringSpacing = width / 5; // Space for 3 strings with margins

  // Calculate string X positions
  const stringXPositions = [
    stringSpacing * 1.5,
    stringSpacing * 2.5,
    stringSpacing * 3.5,
  ];

  // Group all dots by fret and string to detect overlaps
  const dotPositions = new Map<string, Array<{ voicingIdx: number; stringIdx: number }>>();
  voicings.forEach((voicing, vIdx) => {
    voicing.frets.forEach((fret, sIdx) => {
      const key = `${fret}-${sIdx}`;
      if (!dotPositions.has(key)) {
        dotPositions.set(key, []);
      }
      dotPositions.get(key)!.push({ voicingIdx: vIdx, stringIdx: sIdx });
    });
  });

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-800 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-200">{stringGroupLabel}</h3>
        <p className="text-sm text-gray-400 mt-1">All {voicings.length} positions on one neck</p>
      </div>

      {/* String names header */}
      <div className="flex gap-16 text-sm text-gray-400 font-medium">
        {stringNames.map((name, idx) => (
          <span key={idx} className="w-8 text-center">
            {name}
          </span>
        ))}
      </div>

      {/* SVG Long Fretboard */}
      <div className="relative">
        <svg
          width={width}
          height={height}
          className="bg-gray-900 rounded-lg"
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Fret lines */}
          {Array.from({ length: numFrets + 1 }).map((_, fretIdx) => {
            const y = fretHeight * (fretIdx + 1);
            const isNut = fretIdx === 0;

            return (
              <g key={`fret-${fretIdx}`}>
                {/* Fret line */}
                <line
                  x1={stringXPositions[0] - 40}
                  y1={y}
                  x2={stringXPositions[2] + 40}
                  y2={y}
                  stroke={isNut ? '#9ca3af' : '#4b5563'}
                  strokeWidth={isNut ? 4 : 1.5}
                />
                {/* Fret number */}
                {fretIdx % 2 === 0 && (
                  <text
                    x={stringXPositions[0] - 60}
                    y={y - fretHeight / 2}
                    fill="#6b7280"
                    fontSize="14"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {fretIdx}
                  </text>
                )}
                {/* Fret markers (3, 5, 7, 9, 12, 15, 17, 19) */}
                {[3, 5, 7, 9, 15, 17, 19].includes(fretIdx) && (
                  <circle
                    cx={width / 2}
                    cy={y - fretHeight / 2}
                    r={6}
                    fill="#374151"
                    opacity={0.5}
                  />
                )}
                {/* Double dots at 12th fret */}
                {fretIdx === 12 && (
                  <>
                    <circle
                      cx={stringSpacing * 2}
                      cy={y - fretHeight / 2}
                      r={6}
                      fill="#374151"
                      opacity={0.5}
                    />
                    <circle
                      cx={stringSpacing * 3}
                      cy={y - fretHeight / 2}
                      r={6}
                      fill="#374151"
                      opacity={0.5}
                    />
                  </>
                )}
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
              strokeWidth="2.5"
            />
          ))}

          {/* Voicing dots */}
          {voicings.map((voicing, voicingIdx) => {
            const positionColor = POSITION_COLORS[voicing.position];
            const isHighlighted =
              highlightedPosition === null || highlightedPosition === voicing.position;
            const opacity = isHighlighted ? 1 : 0.2;

            return (
              <g key={`voicing-${voicingIdx}`} opacity={opacity}>
                {voicing.frets.map((fret, stringIdx) => {
                  const x = stringXPositions[stringIdx];
                  const y =
                    fret === 0
                      ? fretHeight / 2
                      : fretHeight + fret * fretHeight - fretHeight / 2;

                  const intervalName = getIntervalName(stringIdx, voicing.notes);
                  const noteColor = NOTE_ROLE_COLORS[intervalName];
                  const noteName = voicing.noteNames[stringIdx];

                  const isHovered =
                    hoveredDot?.voicingIdx === voicingIdx &&
                    hoveredDot?.stringIdx === stringIdx;

                  // Check if multiple dots at same position
                  const key = `${fret}-${stringIdx}`;
                  const dotsAtPosition = dotPositions.get(key) || [];
                  const dotIndex = dotsAtPosition.findIndex(
                    (d) => d.voicingIdx === voicingIdx && d.stringIdx === stringIdx
                  );
                  const offsetX = dotsAtPosition.length > 1 ? (dotIndex - 0.5) * 8 : 0;

                  return (
                    <g
                      key={`dot-${voicingIdx}-${stringIdx}`}
                      onMouseEnter={() => {
                        setHoveredDot({ voicingIdx, stringIdx });
                        setHighlightedPosition(voicing.position);
                      }}
                      onMouseLeave={() => {
                        setHoveredDot(null);
                        setHighlightedPosition(null);
                      }}
                      style={{ cursor: 'pointer' }}
                      transform={`translate(${offsetX}, 0)`}
                    >
                      {/* Position ring (outer) */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 24 : 20}
                        fill="none"
                        stroke={positionColor.border}
                        strokeWidth={isHovered ? 3 : 2}
                        opacity={0.8}
                      />
                      {/* Note color dot (inner) */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 16 : 14}
                        fill={noteColor.bg}
                        stroke={isHovered ? '#fbbf24' : 'none'}
                        strokeWidth={isHovered ? 2 : 0}
                      />
                      {/* Note name text */}
                      <text
                        x={x}
                        y={y}
                        fill={noteColor.text}
                        fontSize={isHovered ? '13' : '12'}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        pointerEvents="none"
                      >
                        {noteName}
                      </text>
                      {/* Position label */}
                      <text
                        x={x}
                        y={y + (isHovered ? 38 : 34)}
                        fill={positionColor.bg}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        P{voicing.position}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Hover info overlay */}
        {hoveredDot !== null && (
          <div className="absolute top-4 left-4 bg-gray-900/95 border border-gray-700 rounded-lg p-3 shadow-xl">
            <div className="text-sm space-y-1">
              <div className="font-semibold text-yellow-400">
                {POSITION_COLORS[voicings[hoveredDot.voicingIdx].position].label}
              </div>
              <div className="text-gray-300">
                Note: {voicings[hoveredDot.voicingIdx].noteNames[hoveredDot.stringIdx]}
              </div>
              <div className="text-gray-400 text-xs">
                Interval: {getIntervalName(hoveredDot.stringIdx, voicings[hoveredDot.voicingIdx].notes)}
              </div>
              <div className="text-gray-400 text-xs">
                Inversion: {voicings[hoveredDot.voicingIdx].inversion}
              </div>
              <div className="text-gray-500 text-xs">
                Frets: {voicings[hoveredDot.voicingIdx].frets.join('-')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Position legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {POSITION_COLORS.map((color, idx) => (
          <button
            key={idx}
            onClick={() =>
              setHighlightedPosition(highlightedPosition === idx ? null : idx)
            }
            onMouseEnter={() => setHighlightedPosition(idx)}
            onMouseLeave={() => setHighlightedPosition(null)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border-2 transition-all ${
              highlightedPosition === idx || highlightedPosition === null
                ? 'opacity-100 scale-105'
                : 'opacity-40 scale-100'
            }`}
            style={{
              borderColor: color.border,
              backgroundColor: `${color.bg}20`,
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2"
              style={{
                backgroundColor: color.bg,
                borderColor: color.border,
              }}
            />
            <span className="text-xs font-medium text-gray-300">{color.label}</span>
          </button>
        ))}
      </div>

      {/* Note role legend */}
      <div className="flex gap-4 text-xs mt-2 pt-3 border-t border-gray-700">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NOTE_ROLE_COLORS.root.bg }} />
          <span className="text-gray-400">Root</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NOTE_ROLE_COLORS.third.bg }} />
          <span className="text-gray-400">3rd</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NOTE_ROLE_COLORS.fifth.bg }} />
          <span className="text-gray-400">5th</span>
        </div>
      </div>
    </div>
  );
}
