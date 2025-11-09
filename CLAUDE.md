# Claude Developer Guide

This file is for AI assistants (like you!) working on this codebase.

## User Preferences

⚠️ **IMPORTANT**: The user expects you to **run tests and iterate until ALL tests pass**. Don't stop after one attempt. If tests fail, fix the issues and run them again. Keep iterating until everything works.

## Project Overview

**Guitar Scale Practice** - A browser-based guitar learning app built with Next.js and TypeScript.

- **Pure client-side**: All logic runs in the browser, no backend required
- **Interactive fretboard**: Realistic physics-based rendering
- **Circle of fifths colors**: Visual learning aid with 12 chromatic note colors
- **Web Audio API**: Interactive sound playback on hover

## Repository Structure

```
guitar/
├── app/                # Next.js app directory (pages & layouts)
├── components/         # React components
├── lib/guitar/         # Core guitar logic (TypeScript)
├── __tests__/          # Test suite (vitest)
├── package.json        # Dependencies & scripts
├── tsconfig.json       # TypeScript config
└── vitest.config.ts    # Test configuration
```

## Running the App

```bash
npm install             # Install dependencies (first time)
npm run dev             # Start dev server → http://localhost:3000
```

## Running Tests

```bash
npm test                # Run all 188 tests
```

**Expected: 188 tests passing** (as of latest commit)

## Making Changes

1. Edit files in `app/`, `components/`, or `lib/guitar/`
2. Run tests: `npm test`
3. **Iterate until all tests pass**
4. Run dev server to verify visually: `npm run dev`
5. Run build to verify production: `npm run build`

## Key Features

### 1. Major Triads Tab

Interactive visualization of all major triad voicings across the fretboard.

**Files:**
- `components/MajorTriads.tsx` - Main UI with circle of fifths key selector
- `components/LongFretboardDiagram.tsx` - Horizontal fretboard renderer (400+ lines)
- `lib/guitar/triads.ts` - Triad generation logic
  - `generateTriadsData()` - Main entry point
  - `buildMajorTriad()` - Generate [root, 3rd, 5th] pitch classes
  - `findAllTriadVoicings()` - Find all valid voicings on 3 strings
  - `select4PositionsCoordinated()` - Smart position selection algorithm

**Algorithm:**
- 4 string groups: 6-5-4, 5-4-3, 4-3-2, 3-2-1
- 4 positions per group (0-3) spanning frets 0-18
- Coordinated selection: Adjacent groups share notes where possible
- Position 0 prioritizes open strings (may not share notes - this is correct!)

### 2. Scale Practice Tab

Interactive challenges for practicing modes and scales.

**Files:**
- `components/ScalePractice.tsx` - Challenge UI with hints & scoring
- `lib/guitar/core.ts` - Scale logic
  - `parentMajor()` - Calculate parent key from mode
  - `findBestPosition()` - Find closest position to target fret
  - `getXyzDisplayString()` - Get 3NPS pattern for mode
  - `planXyzPositions()` - Calculate fret positions across strings

### 3. Physics-Based Rendering

**Files:**
- `lib/guitar/fretboard-physics.ts` - Calculations
  - `calculateFretYPositions()` - Exponentially decreasing fret spacing
  - `getStringThickness()` - Realistic string gauges (6th = 4.6x thicker than 1st)
  - `getNoteAtPosition()` - Calculate note at any string/fret

**Formula:** `position = scale_length × (1 - 2^(-fret/12))`
- Uses 648mm (25.5") scale length (Fender standard)
- 12th fret at natural halfway point (octave)

### 4. Circle of Fifths Colors

**File:** `lib/guitar/note-colors.ts`

Each of the 12 chromatic notes has a unique color:
- **C** → Red, **G** → Orange, **D** → Yellow, **A** → Lime
- **E** → Green, **B** → Cyan, **F#** → Blue, **C#** → Indigo
- **G#** → Violet, **D#** → Magenta, **A#** → Pink, **F** → Rose

All chromatic notes visible at 30% opacity, triad notes at 100% opacity.

### 5. Interactive Sound

**File:** `lib/guitar/sound.ts`

- **Web Audio API** with physics-based frequencies
- **Tuning:** A440 standard (1st string, fret 5 = 440 Hz)
- **Formula:** `frequency = open_string_freq × 2^(fret/12)`
- **Hover interaction:**
  - Hover note → Play single note (2 sec)
  - Hover near position (96px radius) → Play full chord (3 notes)
  - Direct hover takes precedence

### 6. Keyboard Navigation

Press keys to change selected root note:
- Lowercase letters → naturals: `c`→C, `d`→D, `e`→E, etc.
- Uppercase letters → sharps: `C`→C#, `D`→D#, `G`→G#, etc.
- Special: `E`→F (E#=F), `B`→C (B#=C)

## Test Suite (188 tests)

- `triads.test.ts` - 21 tests (triad generation)
- `fretboard-physics.test.ts` - 20 tests (physics calculations)
- `note-colors.test.ts` - 29 tests (circle of fifths colors)
- `fretboard-rendering.test.ts` - 46 tests (visual features)
- `position-note-sharing.test.ts` - 12 tests (coordinated selection)
- `hover-interaction.test.ts` - 21 tests (hover/click behavior)
- `sound.test.ts` - 24 tests (frequency accuracy)
- `guitar-logic.test.ts` - 15 tests (scale practice logic)

## Critical Constraints

### Voicing Validation

- **Fret range 0-18**: Voicings only for frets 0-18 (sound system limit)
- **Max 5-fret stretch**: `max(frets) - min(frets) ≤ 5`
- **All triad notes required**: Root, 3rd, and 5th must all be present
- **Only triad notes allowed**: No duplicates or extra notes

### Position 0 Open String Quirk ⚠️

**IMPORTANT**: Position 0 may NOT share notes between adjacent groups!

**Why?**
- Open string voicings (e.g., [0,0,0]) are the absolute lowest possible
- Open strings cannot share notes with "lower" positions (no negative frets!)
- Position 0 prioritizes playability over coordination

**Example (G major):**
- Group 2 Position 0: [0,0,0] (all open strings D-G-B)
- Group 3 Position 0: [4,3,3] (no lower voicing exists)
- These do NOT share notes - **this is correct!**

Positions 1-3 maintain note-sharing in coordinated mode.

### String Indexing

- **Data indexing**: `string_idx = 0` → 6th string (low E), `5` → 1st string (high E)
- **Visual display**: Reversed! String 1 at TOP, string 6 at BOTTOM
- Matches natural guitar viewing (thin strings "up", thick strings "down")

### Adjacent String Groups Share Strings

**This is geometrically correct!**

- **6-5-4** [0,1,2] and **5-4-3** [1,2,3] → Share strings 1 & 2 (A & D)
- **5-4-3** [1,2,3] and **4-3-2** [2,3,4] → Share strings 2 & 3 (D & G)
- **4-3-2** [2,3,4] and **3-2-1** [3,4,5] → Share strings 3 & 4 (G & B)

Same physical location on neck, so notes may appear in same spot across different fretboards.

## Common Patterns

### Adding a New Test

```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should do something', () => {
    // Arrange
    const input = 'C';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Debugging Failing Tests

1. Run specific test file: `npm test triads.test.ts`
2. Add `console.log()` statements to see intermediate values
3. Check test output carefully - it shows expected vs actual
4. Fix the code, run tests again
5. **Keep iterating until all tests pass**

## Development Workflow

1. Make a change
2. Run tests: `npm test`
3. **If tests fail**: Fix issues, run tests again
4. **Repeat step 3 until ALL tests pass**
5. Test visually: `npm run dev`
6. Build production: `npm run build`
7. Commit only when everything works

## Code Style

- **TypeScript**: Strongly typed, explicit types for function parameters
- **React**: Functional components with hooks
- **Tests**: Clear, descriptive names. One assertion per concept.
- **Keep it minimal**: No unnecessary abstractions

## Dependencies

- `next` - React framework
- `react` - UI library
- `vitest` - Testing framework
- All specified in `package.json`

Install: `npm install`

## Remember

🔄 **Always iterate on tests until they pass.** The user doesn't want you to stop after one failed attempt. Keep fixing and re-running until everything works!

📊 **Expected: 188 tests passing**

🎸 **This is a pure TypeScript project** - no Python, no backend, just browser-based JavaScript/TypeScript.
