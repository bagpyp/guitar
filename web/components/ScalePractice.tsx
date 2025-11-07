'use client';

import { useState, useEffect } from 'react';
import { stringIndexToOrdinal, STRING_NAMES } from '@/lib/guitar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Challenge {
  mode: string;
  note: string;
  targetFret: number;
}

interface Position {
  stringIndex: number;
  stringName: string;
  fret: number;
  distance: number;
}

interface XYZPosition {
  stringIndex: number;
  fret: number;
  symbol: string;
}

interface Answer {
  key: string;
  position: Position;
  xyzPattern: string;
  xyzLayout: XYZPosition[];
}

async function generateChallenge(): Promise<Challenge> {
  const response = await fetch(`${API_URL}/api/challenge`);
  if (!response.ok) throw new Error('Failed to fetch challenge');
  return response.json();
}

async function getAnswer(challenge: Challenge): Promise<Answer> {
  const response = await fetch(`${API_URL}/api/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(challenge),
  });
  if (!response.ok) throw new Error('Failed to fetch answer');
  return response.json();
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
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [showPosition, setShowPosition] = useState(false);
  const [showShape, setShowShape] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNewChallenge();
  }, []);

  const loadNewChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      const newChallenge = await generateChallenge();
      setChallenge(newChallenge);
      setAnswer(null);
      setShowKey(false);
      setShowPosition(false);
      setShowShape(false);
    } catch (e) {
      setError('Failed to load challenge. Is the API server running?');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAnswer = async () => {
    if (!challenge || answer) return;
    try {
      const result = await getAnswer(challenge);
      setAnswer(result);
    } catch (e) {
      setError('Failed to load answer');
      console.error(e);
    }
  };

  const handleShowKey = async () => {
    if (!answer) await loadAnswer();
    setShowKey(!showKey);
  };

  const handleShowPosition = async () => {
    if (!answer) await loadAnswer();
    setShowPosition(!showPosition);
  };

  const handleShowShape = async () => {
    if (!answer) await loadAnswer();
    setShowShape(!showShape);
  };

  const toggleAll = async () => {
    if (!answer) await loadAnswer();
    const newState = !(showKey && showPosition && showShape);
    setShowKey(newState);
    setShowPosition(newState);
    setShowShape(newState);
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={loadNewChallenge}
          className="px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!challenge) {
    return <div className="text-gray-400">No challenge loaded</div>;
  }

  const { mode, note, targetFret } = challenge;

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
            onClick={handleShowKey}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              showKey
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Show Key
          </button>
          <button
            onClick={handleShowPosition}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              showPosition
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Show Position
          </button>
          <button
            onClick={handleShowShape}
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
            onClick={loadNewChallenge}
            className="px-6 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            New Challenge
          </button>
        </div>

        {/* Answers */}
        <div className="space-y-6">
          {showKey && answer && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-300 mb-2">Key:</h3>
              <p className="text-white text-lg">
                You are playing in the key of <span className="font-bold text-blue-400">{answer.key}</span>
              </p>
            </div>
          )}

          {showPosition && answer && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-300 mb-2">Position:</h3>
              <p className="text-white text-lg">
                <span className="font-bold">{stringIndexToOrdinal(answer.position.stringIndex)}</span> string
                {' '}({answer.position.stringName}), {answer.position.fret}
                <sup>{getOrdinalSuffix(answer.position.fret)}</sup> fret
              </p>
            </div>
          )}

          {showShape && answer && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-300 mb-2">Shape:</h3>
              <p className="text-white text-2xl font-mono mb-4 tracking-wider">
                {answer.xyzPattern}
              </p>
              <div className="mt-4">
                <p className="text-gray-300 mb-3 font-medium">3NPS/XYZ layout (low → high):</p>
                <div className="grid grid-cols-3 gap-3">
                  {answer.xyzLayout.map((pos, idx) => (
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
