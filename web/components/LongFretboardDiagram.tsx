'use client';

import React, { useState, useEffect } from 'react';
import type { TriadVoicing } from '../lib/guitar/triads';
import { calculateFretYPositions, getNoteYPosition, getStringThickness, getNoteAtPosition } from '../lib/guitar/fretboard-physics';
import { getNoteColor, getAllNoteColorsInCircleOfFifths } from '../lib/guitar/note-colors';
import { playNote, playChord, stopAllSounds, resumeAudioContext } from '../lib/guitar/sound';

interface LongFretboardDiagramProps {
  voicings: TriadVoicing[]; // All 4 positions for this string group
  stringNames: string[]; // e.g., ["G", "B", "E"] for strings 3-2-1
  stringGroupLabel: string; // e.g., "Strings 3-2-1 (G-B-E)"
  triadPcs: [number, number, number]; // [root, third, fifth] pitch classes
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
 * Get the interval name for a note pitch class (for hover info)
 */
function getIntervalName(notePc: number, triadPcs: [number, number, number]): 'root' | 'third' | 'fifth' {
  const [root, third, fifth] = triadPcs;

  if (notePc === root) return 'root';
  if (notePc === third) return 'third';
  return 'fifth';
}

/**
 * Long vertical fretboard showing all voicings for a string group on one unified neck
 */
export default function LongFretboardDiagram({
  voicings,
  stringNames,
  stringGroupLabel,
  triadPcs,
}: LongFretboardDiagramProps) {
  const [hoveredDot, setHoveredDot] = useState<{
    voicingIdx: number;
    stringIdx: number;
  } | null>(null);
  const [hoveredNearPosition, setHoveredNearPosition] = useState<number | null>(null);
  const [highlightedPosition, setHighlightedPosition] = useState<number | null>(null);

  // Get the string group indices (e.g., [3, 4, 5] for strings 3-2-1)
  const stringGroupIndices = voicings.length > 0 ? voicings[0].strings : [3, 4, 5];

  // Resume audio context on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      resumeAudioContext();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      stopAllSounds();
    };
  }, []);

  // Play sound when hovering over a specific note
  useEffect(() => {
    if (hoveredDot !== null) {
      const voicing = voicings[hoveredDot.voicingIdx];
      const globalStringIdx = stringGroupIndices[hoveredDot.stringIdx];
      const fret = voicing.frets[hoveredDot.stringIdx];

      playNote(globalStringIdx, fret, 2.0);
    } else {
      stopAllSounds();
    }
  }, [hoveredDot, voicings, stringGroupIndices]);

  // Play chord when hovering near a position (but not on a specific note)
  useEffect(() => {
    if (hoveredNearPosition !== null && hoveredDot === null) {
      // Find all voicings in this position
      const positionVoicings = voicings.filter(v => v.position === hoveredNearPosition);

      if (positionVoicings.length > 0) {
        // Play the first voicing as a chord (they should all be the same position)
        const voicing = positionVoicings[0];
        const chordNotes = voicing.frets.map((fret, localIdx) => ({
          stringIndex: stringGroupIndices[localIdx],
          fret,
        }));

        playChord(chordNotes, 2.0);
      }
    } else if (hoveredNearPosition === null && hoveredDot === null) {
      stopAllSounds();
    }
  }, [hoveredNearPosition, hoveredDot, voicings, stringGroupIndices]);

  // SVG dimensions - rotated 90 degrees (now horizontal)
  const width = 1400; // Full page width (frets span left-right)
  const height = 400; // Compact height (strings span top-bottom)
  const numFrets = 18; // Show frets 0-17 (cut off high frets near sound hole)
  const startFret = 0;
  const stringSpacing = height / 7; // Space for 6 strings with margins

  // Calculate physics-based fret positions (now horizontal X positions)
  const fretXPositions = calculateFretYPositions(startFret, numFrets, width);

  // All 6 guitar strings (6th to 1st)
  const allStringNames = ['E', 'A', 'D', 'G', 'B', 'E'];

  // Calculate string Y positions for all 6 strings (now vertical)
  // Reversed: string 1 (index 5) at top, string 6 (index 0) at bottom
  const allStringYPositions = [
    stringSpacing * 6, // String 6 (index 0) - bottom (thickest)
    stringSpacing * 5, // String 5 (index 1)
    stringSpacing * 4, // String 4 (index 2)
    stringSpacing * 3, // String 3 (index 3)
    stringSpacing * 2, // String 2 (index 4)
    stringSpacing * 1, // String 1 (index 5) - top (thinnest)
  ];

  // Determine which strings are active (part of this group)
  const activeStringIndices = new Set(stringGroupIndices);

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
    <div className="flex flex-col items-center gap-4 p-6 rounded-lg border w-full" style={{ backgroundColor: '#d4a574', borderColor: '#b8935f' }}>
      {/* SVG Long Fretboard */}
      <div className="relative w-full">
        <div className="w-full overflow-x-auto">
        <svg
          width={width}
          height={height}
          className="rounded-lg"
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Fretboard wood - slightly narrower than frets */}
          <rect
            x={0}
            y={allStringYPositions[5] - 15}
            width={width}
            height={allStringYPositions[0] - allStringYPositions[5] + 30}
            fill="#3d2817"
            rx={8}
          />

          {/* Fret lines - now vertical */}
          {Array.from({ length: numFrets + 1 }).map((_, fretIdx) => {
            const x = fretXPositions[fretIdx];
            const isNut = fretIdx === 0;

            return (
              <g key={`fret-${fretIdx}`}>
                {/* Fret line - spans all 6 strings vertically */}
                <line
                  x1={x}
                  y1={allStringYPositions[5] - 20}
                  x2={x}
                  y2={allStringYPositions[0] + 20}
                  stroke={isNut ? '#e8dcc8' : '#b8b8b8'}
                  strokeWidth={isNut ? 4 : 2}
                />
                {/* Fret markers (3, 5, 7, 9, 15, 17) - pearl inlays */}
                {[3, 5, 7, 9, 15, 17].includes(fretIdx) && fretIdx < numFrets && (
                  <circle
                    cx={getNoteYPosition(fretIdx, fretXPositions, startFret)}
                    cy={height / 2}
                    r={10}
                    fill="#f5f5dc"
                    opacity={0.95}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                )}
                {/* Double dots at 12th fret - pearl inlays */}
                {fretIdx === 12 && (
                  <>
                    <circle
                      cx={getNoteYPosition(12, fretXPositions, startFret)}
                      cy={(allStringYPositions[1] + allStringYPositions[2]) / 2}
                      r={10}
                      fill="#f5f5dc"
                      opacity={0.95}
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                    <circle
                      cx={getNoteYPosition(12, fretXPositions, startFret)}
                      cy={(allStringYPositions[3] + allStringYPositions[4]) / 2}
                      r={10}
                      fill="#f5f5dc"
                      opacity={0.95}
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* String lines - all 6 strings horizontal with varying thickness and realistic colors */}
          {allStringYPositions.map((y, stringIdx) => {
            const isActive = activeStringIndices.has(stringIdx);
            const thickness = getStringThickness(stringIdx, isActive ? 1.8 : 1.2);

            // Realistic string colors:
            // Strings 0-3 (6th-E, 5th-A, 4th-D, 3rd-G): Bronze/brass wound strings
            // Strings 4-5 (2nd-B, 1st-E): Silver/steel plain strings
            const isBrassWound = stringIdx <= 3;
            const brassColor = '#cd7f32'; // Bronze color
            const silverColor = '#c0c0c0'; // Silver/steel color
            const stringColor = isBrassWound ? brassColor : silverColor;

            return (
              <line
                key={`string-${stringIdx}`}
                x1={fretXPositions[0]}
                y1={y}
                x2={fretXPositions[numFrets]}
                y2={y}
                stroke={stringColor}
                strokeWidth={thickness}
                opacity={1}
              />
            );
          })}

          {/* Chromatic background - all notes on ALL 6 strings (faint) */}
          <g>
            {allStringYPositions.map((y, globalStringIdx) => {
              return Array.from({ length: numFrets + 1 }).map((_, fretIdx) => {
                const x = getNoteYPosition(fretIdx, fretXPositions, startFret);
                const { noteName } = getNoteAtPosition(globalStringIdx, fretIdx);
                const noteColor = getNoteColor(noteName);

                return (
                  <g key={`chromatic-${globalStringIdx}-${fretIdx}`}>
                    {/* Chromatic note dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={16}
                      fill={noteColor.bg}
                      opacity={0.3}
                    />
                    {/* Note name text */}
                    <text
                      x={x}
                      y={y}
                      fill={noteColor.text}
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      pointerEvents="none"
                      opacity={0.3}
                    >
                      {noteName}
                    </text>
                  </g>
                );
              });
            })}
          </g>

          {/* Layer 1: Position hover detection areas (background) */}
          <g>
            {voicings.map((voicing, voicingIdx) => {
              return voicing.frets.map((fret, localStringIdx) => {
                const globalStringIdx = stringGroupIndices[localStringIdx];
                const y = allStringYPositions[globalStringIdx];
                const x = getNoteYPosition(fret, fretXPositions, startFret);

                const key = `${fret}-${localStringIdx}`;
                const dotsAtPosition = dotPositions.get(key) || [];
                const dotIndex = dotsAtPosition.findIndex(
                  (d) => d.voicingIdx === voicingIdx && d.stringIdx === localStringIdx
                );
                const offsetX = dotsAtPosition.length > 1 ? (dotIndex - 0.5) * 8 : 0;

                return (
                  <circle
                    key={`position-hover-${voicingIdx}-${localStringIdx}`}
                    cx={x + offsetX}
                    cy={y}
                    r={96}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => {
                      setHoveredNearPosition(voicing.position);
                    }}
                    onMouseLeave={() => {
                      setHoveredNearPosition(null);
                    }}
                  />
                );
              });
            })}
          </g>

          {/* Layer 2: Voicing dots - triad notes on active strings (foreground) */}
          {voicings.map((voicing, voicingIdx) => {
            const positionColor = POSITION_COLORS[voicing.position];

            // All triad notes always at 100% opacity
            const opacity = 1.0;

            return (
              <g key={`voicing-${voicingIdx}`} opacity={opacity}>
                {voicing.frets.map((fret, localStringIdx) => {
                  // Map local string index (0-2) to global string index (0-5)
                  const globalStringIdx = stringGroupIndices[localStringIdx];
                  const y = allStringYPositions[globalStringIdx];
                  const x = getNoteYPosition(fret, fretXPositions, startFret);

                  const notePc = voicing.notes[localStringIdx];
                  const intervalName = getIntervalName(notePc, triadPcs);
                  const noteName = voicing.noteNames[localStringIdx];
                  const noteColor = getNoteColor(noteName);
                  const isRoot = intervalName === 'root';

                  const isDirectHover =
                    hoveredDot?.voicingIdx === voicingIdx &&
                    hoveredDot?.stringIdx === localStringIdx;

                  // Check if another note in the SAME position is directly hovered
                  const isSamePositionAsDirectHover =
                    hoveredDot !== null &&
                    !isDirectHover && // NOT this note
                    voicing.position === voicings[hoveredDot.voicingIdx].position; // Same position

                  const isPositionHovered = hoveredNearPosition === voicing.position;

                  // Check if multiple dots at same position
                  const key = `${fret}-${localStringIdx}`;
                  const dotsAtPosition = dotPositions.get(key) || [];
                  const dotIndex = dotsAtPosition.findIndex(
                    (d) => d.voicingIdx === voicingIdx && d.stringIdx === localStringIdx
                  );
                  const offsetX = dotsAtPosition.length > 1 ? (dotIndex - 0.5) * 8 : 0;

                  // Size logic with proper precedence:
                  // 1. Direct hover on THIS note: 1.6x (takes precedence)
                  // 2. Direct hover on ANOTHER note in this position: 1.3x (position active)
                  // 3. Near hover (within 96px) of any note in this position: 1.3x (position active)
                  // 4. Normal: 16px (1.0x)
                  let radius = 16;
                  if (isDirectHover) {
                    radius = 16 * 1.6; // 25.6px - this note is directly hovered
                  } else if (isSamePositionAsDirectHover || isPositionHovered) {
                    radius = 16 * 1.3; // 20.8px - position is active
                  }

                  return (
                    <g
                      key={`dot-${voicingIdx}-${localStringIdx}`}
                      transform={`translate(${offsetX}, 0)`}
                    >
                      {/* Root note gold ring */}
                      {isRoot && (
                        <circle
                          cx={x}
                          cy={y}
                          r={radius + 3}
                          fill="none"
                          stroke="#ffd700"
                          strokeWidth={2}
                          pointerEvents="none"
                        />
                      )}
                      {/* Note color dot - handles direct hover */}
                      <circle
                        cx={x}
                        cy={y}
                        r={radius}
                        fill={noteColor.bg}
                        stroke={isDirectHover ? '#fbbf24' : 'none'}
                        strokeWidth={isDirectHover ? 3 : 0}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => {
                          setHoveredDot({ voicingIdx, stringIdx: localStringIdx });
                          setHighlightedPosition(voicing.position);
                        }}
                        onMouseLeave={() => {
                          setHoveredDot(null);
                          setHighlightedPosition(null);
                        }}
                      />
                      {/* Note name text */}
                      <text
                        x={x}
                        y={y}
                        fill={noteColor.text}
                        fontSize={isDirectHover ? '14' : '12'}
                        fontWeight={isRoot ? 'bold' : 'bold'}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        pointerEvents="none"
                      >
                        {noteName}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Inversion symbols below fretboard as SVG text */}
          {voicings.map((voicing, voicingIdx) => {
            // Get X position of LEFTMOST note (lowest fret) in this voicing
            const minFret = Math.min(...voicing.frets);
            const leftmostX = getNoteYPosition(minFret, fretXPositions, startFret);

            // Map inversion to music theory symbol
            // Root position: △ (triangle/delta)
            // First inversion: ¹ (superscript 1)
            // Second inversion: ² (superscript 2)
            const inversionSymbol = voicing.inversion === 'root' ? '△' :
                                   voicing.inversion === 'first' ? '¹' :
                                   '²';

            return (
              <text
                key={`inversion-${voicingIdx}`}
                x={leftmostX}
                y={height - 10}
                fill="#4a3020"
                fontSize="24"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {inversionSymbol}
              </text>
            );
          })}
        </svg>
        </div>
      </div>
    </div>
  );
}
