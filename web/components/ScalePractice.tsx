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
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);

  useEffect(() => {
    loadNewChallenge();
  }, []);

  const loadNewChallenge = async () => {
    try {
      setLoading(true);
      setError(null);

      // Award points if previous challenge was completed (any hint shown)
      if (challenge && (showKey || showPosition || showShape)) {
        const hintsUsed = [showKey, showPosition, showShape].filter(Boolean).length;
        const points = Math.max(10 - (hintsUsed * 2), 4); // 10 points max, min 4
        setScore(prev => prev + points);
        setStreak(prev => prev + 1);
        setTotalChallenges(prev => prev + 1);
      } else if (challenge) {
        // Started new challenge without showing any hints (skip)
        setStreak(0);
      }

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
    return (
      <div className="max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl p-12 border-4 border-gray-700">
          <div className="text-6xl mb-4 animate-pulse">🎸</div>
          <div className="text-2xl text-gray-300 font-bold">Loading Challenge...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-br from-red-900/30 to-red-950/30 rounded-2xl shadow-2xl p-12 border-4 border-red-600">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-300 text-2xl mb-6 font-bold">{error}</p>
          <button
            onClick={loadNewChallenge}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-300"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl p-12 border-4 border-gray-700">
          <div className="text-gray-400 text-xl">No challenge loaded</div>
        </div>
      </div>
    );
  }

  const { mode, note, targetFret } = challenge;

  const answersShown = [
    showKey && 'key',
    showPosition && 'position',
    showShape && 'shape'
  ].filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Game Stats Header */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 shadow-xl border-2 border-purple-400">
          <div className="text-purple-200 text-sm font-semibold uppercase tracking-wide">Score</div>
          <div className="text-4xl font-bold text-white mt-1">{score}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 shadow-xl border-2 border-orange-400">
          <div className="text-orange-100 text-sm font-semibold uppercase tracking-wide">Streak</div>
          <div className="text-4xl font-bold text-white mt-1">{streak} 🔥</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 shadow-xl border-2 border-blue-400">
          <div className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Completed</div>
          <div className="text-4xl font-bold text-white mt-1">{totalChallenges}</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl p-8 border-4 border-gray-700">
        {/* Challenge Display */}
        <div className="text-center mb-8 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl p-6 border-2 border-blue-500/50 shadow-lg">
          <div className="text-xl font-bold mb-3 text-blue-300 uppercase tracking-wider">🎯 Current Challenge</div>
          <div className="flex justify-center items-center gap-6 flex-wrap text-2xl">
            <div className="bg-blue-600/30 rounded-lg px-6 py-3 border-2 border-blue-400">
              <span className="text-blue-200 text-sm block mb-1">Mode</span>
              <span className="font-bold text-blue-300 text-3xl">{mode}</span>
            </div>
            <div className="bg-green-600/30 rounded-lg px-6 py-3 border-2 border-green-400">
              <span className="text-green-200 text-sm block mb-1">Note</span>
              <span className="font-bold text-green-300 text-3xl">{note}</span>
            </div>
            <div className="bg-yellow-600/30 rounded-lg px-6 py-3 border-2 border-yellow-400">
              <span className="text-yellow-200 text-sm block mb-1">Target Fret</span>
              <span className="font-bold text-yellow-300 text-3xl">{targetFret}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={handleShowKey}
            className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 ${
              showKey
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-300 shadow-blue-500/50'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 border-gray-600 hover:border-gray-500'
            }`}
          >
            🔑 {showKey ? 'Key Shown' : 'Show Key'}
          </button>
          <button
            onClick={handleShowPosition}
            className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 ${
              showPosition
                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white border-green-300 shadow-green-500/50'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 border-gray-600 hover:border-gray-500'
            }`}
          >
            📍 {showPosition ? 'Position Shown' : 'Show Position'}
          </button>
          <button
            onClick={handleShowShape}
            className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 ${
              showShape
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white border-yellow-300 shadow-yellow-500/50'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 border-gray-600 hover:border-gray-500'
            }`}
          >
            ⭐ {showShape ? 'Shape Shown' : 'Show Shape'}
          </button>
          <button
            onClick={toggleAll}
            className="px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-300 shadow-purple-500/50"
          >
            💡 Show All
          </button>
          <button
            onClick={loadNewChallenge}
            className="px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-300 shadow-green-500/50 text-lg"
          >
            ➡️ Next Challenge
          </button>
        </div>

        {/* Answers */}
        <div className="space-y-4">
          {showKey && answer && (
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-xl p-6 border-2 border-blue-500 shadow-lg shadow-blue-500/30 animate-in slide-in-from-top">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">🔑</span>
                <h3 className="font-bold text-xl text-blue-300">KEY REVEALED</h3>
              </div>
              <p className="text-white text-2xl font-bold">
                You are playing in the key of <span className="text-blue-400 text-3xl bg-blue-500/20 px-3 py-1 rounded-lg">{answer.key}</span>
              </p>
              <div className="mt-2 text-blue-200 text-sm">-2 points for this hint</div>
            </div>
          )}

          {showPosition && answer && (
            <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 rounded-xl p-6 border-2 border-green-500 shadow-lg shadow-green-500/30 animate-in slide-in-from-top">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">📍</span>
                <h3 className="font-bold text-xl text-green-300">POSITION REVEALED</h3>
              </div>
              <p className="text-white text-2xl font-bold">
                <span className="text-green-400 bg-green-500/20 px-3 py-1 rounded-lg">{stringIndexToOrdinal(answer.position.stringIndex)} string ({answer.position.stringName})</span>
                {' at '}
                <span className="text-green-400 bg-green-500/20 px-3 py-1 rounded-lg">{answer.position.fret}<sup>{getOrdinalSuffix(answer.position.fret)}</sup> fret</span>
              </p>
              <div className="mt-2 text-green-200 text-sm">-2 points for this hint</div>
            </div>
          )}

          {showShape && answer && (
            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 rounded-xl p-6 border-2 border-yellow-500 shadow-lg shadow-yellow-500/30 animate-in slide-in-from-top">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">⭐</span>
                <h3 className="font-bold text-xl text-yellow-300">SHAPE REVEALED</h3>
              </div>
              <p className="text-white text-4xl font-mono mb-4 tracking-wider text-center bg-yellow-500/20 rounded-lg py-3">
                {answer.xyzPattern}
              </p>
              <div className="mt-4 bg-black/30 rounded-lg p-4">
                <p className="text-yellow-200 mb-3 font-bold">3NPS/XYZ Layout (low → high):</p>
                <div className="grid grid-cols-3 gap-3">
                  {answer.xyzLayout.map((pos, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg px-4 py-3 text-sm font-mono border border-yellow-600/50 shadow-md"
                    >
                      <span className="text-yellow-300 font-bold">{STRING_NAMES[pos.stringIndex]}</span>
                      {': '}
                      <span className="text-blue-300 font-bold text-lg">{pos.symbol}</span>
                      {' @ '}
                      <span className="text-green-300 font-bold">{pos.fret}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-yellow-200 text-sm">-2 points for this hint</div>
            </div>
          )}

          {answersShown.length > 0 && (
            <div className="text-center pt-6 border-t-2 border-gray-600/50">
              <p className="text-gray-300 text-sm font-semibold">
                💡 Hints Used: <span className="text-white bg-gray-700 px-3 py-1 rounded-lg">{answersShown.join(', ')}</span>
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Fewer hints = More points! Try to solve it yourself first.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
