'use client';

import { useState, useEffect } from 'react';
import {
  buildFretboard,
  findBestPosition,
  parentMajor,
  getXyzDisplayString,
  planXyzPositions,
  stringIndexToOrdinal,
  MODES,
  NOTE_NAMES_SHARP,
  STRING_NAMES,
  type Mode,
  type Challenge,
} from '@/lib/guitar';

function generateChallenge(): Challenge {
  const mode = MODES[Math.floor(Math.random() * MODES.length)] as Mode;
  const note = NOTE_NAMES_SHARP[Math.floor(Math.random() * NOTE_NAMES_SHARP.length)];
  const targetFret = Math.floor(Math.random() * 12) + 1;
  return { mode, note, targetFret };
}

function getOrdinalSuffix(num: number): string {
  if (num >= 11 && num <= 13) return 'th';
  const lastDigit = num % 10;
  if (lastDigit === 1) return 'st';
  if (lastDigit === 2) return 'nd';
  if (lastDigit === 3) return 'rd';
  return 'th';
}

export default function ScalePractice() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [showPosition, setShowPosition] = useState(false);
  const [showShape, setShowShape] = useState(false);
  const [fretboard] = useState(() => buildFretboard());

  useEffect(() => {
    setChallenge(generateChallenge());
  }, []);

  const handleNewChallenge = () => {
    setChallenge(generateChallenge());
    setShowKey(false);
    setShowPosition(false);
    setShowShape(false);
  };

  const toggleAll = () => {
    const newState = !(showKey && showPosition && showShape);
    setShowKey(newState);
    setShowPosition(newState);
    setShowShape(newState);
  };

  if (!challenge) {
    return <div className="text-gray-400">Loading...</div>;
  }

  const { mode, note, targetFret } = challenge;
  let position = null;
  let key = null;
  let xyzPattern = null;
  let xyzLayout = null;

  try {
    position = findBestPosition(note, targetFret, fretboard);
    key = parentMajor(mode, note);
    xyzPattern = getXyzDisplayString(mode);
    xyzLayout = planXyzPositions(mode, position.stringIndex, position.fret);
  } catch (e) {
    console.error(e);
  }

  const answersShown = [
    showKey && 'key',
    showPosition && 'position',
    showShape && 'shape'
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Challenge Display */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Challenge
          </h2>
          <div className="space-y-2 text-xl">
            <p className="text-gray-300">
              <span className="font-semibold text-blue-400">{mode}</span> mode
              {' | '}
              Note: <span className="font-semibold text-green-400">{note}</span>
              {' | '}
              Target fret: <span className="font-semibold text-yellow-400">{targetFret}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={() => setShowKey(!showKey)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              showKey
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Show Key
          </button>
          <button
            onClick={() => setShowPosition(!showPosition)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              showPosition
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Show Position
          </button>
          <button
            onClick={() => setShowShape(!showShape)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              showShape
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Show Shape
          </button>
          <button
            onClick={toggleAll}
            className="px-6 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Show All
          </button>
          <button
            onClick={handleNewChallenge}
            className="px-6 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            New Challenge
          </button>
        </div>

        {/* Answers */}
        <div className="space-y-6">
          {showKey && key && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-300 mb-2">Key:</h3>
              <p className="text-white text-lg">
                You are playing in the key of <span className="font-bold text-blue-400">{key}</span>
              </p>
            </div>
          )}

          {showPosition && position && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-300 mb-2">Position:</h3>
              <p className="text-white text-lg">
                <span className="font-bold">{stringIndexToOrdinal(position.stringIndex)}</span> string
                {' '}({position.stringName}), {position.fret}
                <sup>{getOrdinalSuffix(position.fret)}</sup> fret
              </p>
            </div>
          )}

          {showShape && xyzPattern && xyzLayout && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-300 mb-2">Shape:</h3>
              <p className="text-white text-2xl font-mono mb-4 tracking-wider">
                {xyzPattern}
              </p>
              <div className="mt-4">
                <p className="text-gray-300 mb-3 font-medium">3NPS/XYZ layout (low → high):</p>
                <div className="grid grid-cols-3 gap-3">
                  {xyzLayout.map((pos, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800 rounded px-3 py-2 text-sm font-mono"
                    >
                      <span className="text-yellow-400">{STRING_NAMES[pos.stringIndex]}</span>
                      {': '}
                      <span className="text-blue-400 font-bold">{pos.symbol}</span>
                      {' @ '}
                      <span className="text-green-400">{pos.fret}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {answersShown.length > 0 && (
            <div className="text-center pt-4 border-t border-gray-600">
              <p className="text-gray-400 text-sm">
                Showing: <span className="text-gray-200">{answersShown.join(', ')}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
