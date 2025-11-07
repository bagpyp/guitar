'use client';

import React, { useState, useEffect } from 'react';
import FretboardDiagram from './FretboardDiagram';
import LongFretboardDiagram from './LongFretboardDiagram';
import type { TriadsData } from '../lib/guitar/triads';
import { nameToPc } from '../lib/guitar';

const ALL_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const STRING_GROUP_LABELS = [
  'Strings 6-5-4 (E-A-D)',
  'Strings 5-4-3 (A-D-G)',
  'Strings 4-3-2 (D-G-B)',
  'Strings 3-2-1 (G-B-E)',
];

type ViewMode = 'compact' | 'long-neck';

export default function MajorTriads() {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [triadsData, setTriadsData] = useState<TriadsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('long-neck');

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

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-400">Major Triads</h2>
            <p className="text-sm text-gray-400 mt-1">
              Explore 4 voicings across 4 string groups for each key
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-1 border border-gray-600">
              <button
                onClick={() => setViewMode('long-neck')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                  viewMode === 'long-neck'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Long Neck
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                  viewMode === 'compact'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Compact
              </button>
            </div>

            {/* Key Selector */}
            <div className="flex items-center gap-3">
              <label htmlFor="key-select" className="text-sm text-gray-400">
                Key:
              </label>
              <select
                id="key-select"
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {ALL_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {key} major
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Triad notes display */}
        {triadsData && !loading && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Triad notes:</span>
            <div className="flex gap-2">
              {triadsData.triadNotes.map((note, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30 font-medium"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}
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

      {/* Triads display */}
      {triadsData && !loading && (
        <>
          {/* Long Neck View */}
          {viewMode === 'long-neck' && (
            <div className="w-full overflow-x-auto bg-gray-900/30 py-6 rounded-lg">
              <div className="flex gap-6" style={{ flexDirection: 'row', flexWrap: 'nowrap', display: 'flex' }}>
                {triadsData.stringGroups.map((group, groupIdx) => {
                  // Convert triad note names to pitch classes
                  const triadPcs: [number, number, number] = [
                    nameToPc(triadsData.triadNotes[0] as any),
                    nameToPc(triadsData.triadNotes[1] as any),
                    nameToPc(triadsData.triadNotes[2] as any),
                  ];

                  return (
                    <div key={groupIdx} className="flex-shrink-0">
                      <LongFretboardDiagram
                        voicings={group.voicings}
                        stringNames={group.stringNames}
                        stringGroupLabel={STRING_GROUP_LABELS[groupIdx]}
                        triadPcs={triadPcs}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Compact View */}
          {viewMode === 'compact' && (
            <div className="space-y-8">
              {triadsData.stringGroups.map((group, groupIdx) => {
                // Convert triad note names to pitch classes
                const triadPcs: [number, number, number] = [
                  nameToPc(triadsData.triadNotes[0] as any),
                  nameToPc(triadsData.triadNotes[1] as any),
                  nameToPc(triadsData.triadNotes[2] as any),
                ];

                return (
                  <div key={groupIdx} className="space-y-4">
                    {/* String group header */}
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-200">
                        {STRING_GROUP_LABELS[groupIdx]}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {group.voicings.length} position{group.voicings.length !== 1 ? 's' : ''} available
                      </p>
                    </div>

                    {/* Voicings grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {group.voicings.map((voicing, voicingIdx) => (
                        <div key={voicingIdx} className="space-y-2">
                          {/* Position label */}
                          <div className="text-center">
                            <span className="inline-block px-3 py-1 bg-gray-700 text-gray-300 rounded-md text-sm font-medium">
                              Position {voicing.position}
                            </span>
                          </div>

                          {/* Fretboard diagram */}
                          <FretboardDiagram
                            voicing={voicing}
                            stringNames={group.stringNames}
                            triadPcs={triadPcs}
                          />

                          {/* Fret info */}
                          <div className="text-center text-xs text-gray-500">
                            Frets: {voicing.frets.join('-')}
                          </div>
                        </div>
                      ))}

                    {/* Empty slots if fewer than 4 voicings */}
                    {group.voicings.length < 4 &&
                      Array.from({ length: 4 - group.voicings.length }).map((_, idx) => (
                        <div
                          key={`empty-${idx}`}
                          className="flex items-center justify-center p-6 bg-gray-800/50 rounded-lg border border-gray-700 border-dashed"
                        >
                          <span className="text-gray-600 text-sm">No voicing found</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">How to use:</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• <strong>Long Neck View:</strong> See all 4 positions for each string group on one unified neck</li>
          <li>• <strong>Compact View:</strong> Individual fretboard diagrams for each position</li>
          <li>• Select a key from the dropdown to view all major triad voicings</li>
          <li>• Hover over dots to see note names, intervals, and position info</li>
          <li>• Click position buttons to highlight/isolate specific positions</li>
          <li>• Colors: <span className="text-red-400">Red = Root</span>, <span className="text-yellow-400">Yellow = 3rd</span>, <span className="text-blue-400">Blue = 5th</span></li>
          <li>• Position rings show which voicing (P0, P1, P2, P3) each shape belongs to</li>
        </ul>
      </div>
    </div>
  );
}
