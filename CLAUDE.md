# Claude Developer Guide

This file is for AI assistants (like you!) working on this codebase.

## User Preferences

⚠️ **IMPORTANT**: The user expects you to **run tests and iterate until ALL tests pass**. Don't stop after one attempt. If tests fail, fix the issues and run them again. Keep iterating until everything works.

## Repository Structure

```
guitar/
├── main.py              # Console app (standalone, no server)
├── api.py               # FastAPI server (REST API for web UI)
├── test_*.py            # Python tests (pytest)
├── pyproject.toml       # Poetry config + dependencies
├── .venv/               # Python virtual environment
└── web/                 # Next.js frontend
    ├── app/             # Next.js pages
    ├── components/      # React components
    ├── lib/guitar/      # Shared TypeScript utilities
    └── __tests__/       # TypeScript tests (vitest)
```

## Architecture

**Two modes:**
1. **Console App** (`main.py`) - Standalone CLI, no server needed
2. **Web App** - Pure browser-based application:
   - Frontend: Next.js app on port 3000
   - All logic runs client-side in TypeScript (no backend required!)
   - API server (`api.py`) remains in codebase for Python-only use cases, but web UI doesn't need it

**Web UI Features:**
1. **Scale Practice Tab** - Original feature for practicing modes/scales
2. **Major Triads Tab** - Interactive triad visualization with:
   - **Horizontal fretboard layout**: Frets span left→right (nut to fret 17)
   - **4 string groups stacked vertically**: 3-2-1 (top) to 6-5-4 (bottom)
   - **4 positions per group** (0-3) with coordinated selection
   - **Circle of fifths colors**: Each of 12 chromatic notes has unique color
   - **Interactive sound**: Hover to play notes/chords with Web Audio API
   - **Realistic rendering**: Physics-based fret spacing, brass/silver strings
   - **Inversion symbols**: △ (root), ¹ (1st), ² (2nd) below fretboard

## Running Tests

### Python Tests

```bash
# From repo root
.venv/bin/pytest -v

# Expected: 46 tests passing (as of latest commit)
```

### TypeScript Tests

```bash
# From web/ directory
cd web
npm test

# Expected: 188 tests passing (as of latest commit)
```

### Full Test Suite

```bash
# Run both Python and TypeScript tests
.venv/bin/pytest -v && cd web && npm test && cd ..
```

## Running the App

### Console App (No Server)

```bash
python main.py
# Or: .venv/bin/python main.py
```

### Web App (Browser Only - No Backend Required!)

```bash
cd web
npm run dev
# UI runs on http://localhost:3000
# All logic runs in the browser - no API server needed!
```

### API Server (Optional - Python Only)

The FastAPI server (`api.py`) is still available for Python-only use cases:

```bash
.venv/bin/python api.py
# Server runs on http://localhost:8000
# Note: Web UI doesn't need this - it runs entirely in the browser
```

## Making Changes

### Python Backend Changes

1. Edit `main.py` (console logic) or `api.py` (optional API endpoints)
2. Run Python tests: `.venv/bin/pytest -v`
3. **Iterate until all tests pass**
4. Note: Web UI uses TypeScript implementations, not Python API

### Frontend Changes

1. Edit files in `web/app/`, `web/components/`, or `web/lib/guitar/`
2. Run TypeScript tests: `cd web && npm test`
3. **Iterate until all tests pass**
4. Test with running API server to verify integration

### Adding New Features

1. Write tests FIRST (TDD approach preferred)
2. Python tests: Create `test_feature_name.py`
3. TypeScript tests: Add to `web/__tests__/`
4. Implement feature
5. Run tests and iterate until all pass
6. Run full test suite to ensure no regressions

## Dependencies

### Python (via Poetry)

```bash
# Install/update dependencies
.venv/bin/pip install <package>

# Or update pyproject.toml and:
poetry install
```

Current dependencies:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation
- `pytest` - Testing (dev)
- `httpx` - HTTP client (dev)

### TypeScript (via npm)

```bash
cd web
npm install <package>
```

Current dependencies:
- `next` - React framework
- `react` - UI library
- `vitest` - Testing

## Test-Driven Development Loop

**The user expects this workflow:**

1. Make a change
2. Run relevant tests
3. **If tests fail:** Fix issues, run tests again
4. **Repeat step 3 until ALL tests pass**
5. Run full test suite (both Python and TypeScript)
6. Only stop when everything is green ✅

Example:
```bash
# Make change to api.py
.venv/bin/pytest -v
# ❌ 2 tests failed

# Fix the issues
.venv/bin/pytest -v
# ❌ 1 test failed

# Fix the last issue
.venv/bin/pytest -v
# ✅ All 12 tests passed

# Now verify frontend still works
cd web && npm test
# ✅ All 15 tests passed

# Done! Commit the changes
```

## Integration Testing

To test the web app:

1. Start web UI: `cd web && npm run dev`
2. Open `http://localhost:3000` in browser
3. Click buttons and verify behavior
4. All logic runs in the browser - no backend needed!

## Common Issues

### "Module not found" in Python
- Virtual environment not activated or dependencies missing
- Run: `.venv/bin/pip install fastapi uvicorn pydantic pytest httpx`

### TypeScript errors in web/
- Dependencies not installed
- Run: `cd web && npm install --ignore-scripts`

## Poetry Scripts

```bash
poetry run guitar   # Run console app
poetry run serve    # Run API server
```

## Code Style

- Python: Simple, functional style. No unnecessary abstractions.
- TypeScript: React functional components with hooks.
- Tests: Clear, descriptive names. One assertion per concept.
- Keep it minimal and readable.

## Features

### Major Triads (Latest Feature)

**What it does:**
- Shows all major triad voicings for any key across 4 string groups
- Each string group displays 4 positions (0-3) spanning the fretboard
- Two view modes: Long Neck (unified fretboard) and Compact (separate diagrams)

**Key Files:**

⚡ **Architecture Note**: The web UI runs entirely in the browser! All TypeScript implementations mirror the Python logic, so both frontend and backend have complete, independent implementations of the triad generation and scale practice features.

*Python (Console App & Optional API):*
- `main.py`: Core triad logic with coordinated position selection
  - `build_major_triad()`: Generate [root, 3rd, 5th] pitch classes
  - `find_all_triad_voicings()`: Find all valid voicings on 3 strings
  - `find_voicing_chains()`: Find sequences that share notes across groups
  - `select_4_positions_coordinated()`: Select positions with inversion constraints
  - `voicings_share_notes()`: Check if adjacent groups share notes
- `api.py`: `GET /api/triads/{key}` endpoint (optional - web UI doesn't use this)

*TypeScript (Web UI - Runs Entirely in Browser):*
- `web/lib/guitar/triads.ts`: Complete triad logic (mirrors Python)
  - `generateTriadsData()`: Main function used by web UI
  - `buildMajorTriad()`, `findAllTriadVoicings()`, `select4PositionsCoordinated()`, etc.
- `web/lib/guitar/core.ts`: Scale practice logic
  - `parentMajor()`, `findBestPosition()`, `getXyzDisplayString()`, `planXyzPositions()`
  - All functions used for generating challenges and answers in browser
- `web/lib/guitar/fretboard-physics.ts`: Physics calculations
  - `calculateFretYPositions()`: Exponentially decreasing fret spacing
  - `getStringThickness()`: Realistic string gauges
  - `getNoteAtPosition()`: Calculate note at any string/fret
- `web/lib/guitar/note-colors.ts`: Circle of fifths color mapping
- `web/lib/guitar/sound.ts`: Web Audio API sound generation
  - `calculateNoteFrequency()`: Physics-based Hz calculations
  - `playNote()`, `playChord()`: Sound playback with ADSR envelope
- `web/components/LongFretboardDiagram.tsx`: Horizontal fretboard (400+ lines)
- `web/components/MajorTriads.tsx`: Main UI with circle of fifths key selector

*Tests (234 total):*
- Python: 46 tests across 9 files
  - `test_triads.py`: 9 tests (basic triad generation)
  - `test_triad_validation.py`: 7 tests (voicing validation)
  - `test_c_major_positions.py`: 4 tests (C major regression)
  - `test_g_major_positions.py`: 7 tests (G major comprehensive)
  - `test_integration_c_g_major.py`: 4 tests (**IMMUTABLE - DO NOT CHANGE**)
  - Other test files for scale practice features
- TypeScript: 188 tests across 8 files
  - `triads.test.ts`: 21 tests (triad generation)
  - `fretboard-physics.test.ts`: 20 tests (physics calculations)
  - `note-colors.test.ts`: 29 tests (circle of fifths colors)
  - `fretboard-rendering.test.ts`: 46 tests (visual features)
  - `position-note-sharing.test.ts`: 12 tests (coordinated selection)
  - `hover-interaction.test.ts`: 21 tests (hover/click behavior)
  - `sound.test.ts`: 24 tests (frequency accuracy)
  - `guitar-logic.test.ts`: 15 tests (original features)

**Critical Algorithm: Coordinated Position Selection**

⚠️ **IMPORTANT**: Position selection uses a **coordinated chain-finding approach** with special handling for Position 0!

**Two Modes:**

1. **Coordinated Mode** (when ≥4 chains found):
   - Selects 4 chains that share notes across adjacent groups
   - Groups chains by inversion type
   - Position 0 & 3 have matching inversions (creates symmetry)
   - Positions 1 & 2 use the other two inversions

2. **Fallback Mode** (when <4 chains found):
   - Uses independent selection per group via `select_4_positions()`
   - **CRITICAL QUIRK**: Position 0 gets overridden with absolute lowest voicing
   - This ensures open string voicings are never skipped
   - Positions 1-3 use quartile-based distribution

**The Position 0 Open String Quirk:**

⚠️ **IMPORTANT DISCOVERY**: Position 0 may NOT share notes between adjacent groups!

**Why?**
- Open string voicings (e.g., [0,0,0]) are the absolute lowest for many groups
- Open strings cannot share notes with lower positions (no negative frets!)
- Example: G major Group 2 has [0,0,0], but Group 3 has no voicing that low
- **Solution**: Position 0 uses absolute lowest per group, even if it breaks note-sharing

**When Note-Sharing Applies:**
- ✅ Positions 1-3 in coordinated mode (all chains share notes)
- ✅ Positions 1-3 in fallback mode (quartile selection from same voicing pool)
- ❌ Position 0 in fallback mode (prioritizes open strings over coordination)

**Example (G major):**
```python
Position 0 (NOT coordinated - open string priority):
  Group 0: [3, 2, 0]   # avg=1.7
  Group 1: [2, 0, 0]   # avg=0.7 (includes open strings)
  Group 2: [0, 0, 0]   # avg=0.0 (all open - LOWEST POSSIBLE!)
  Group 3: [4, 3, 3]   # avg=3.3 (no lower voicing available)

Position 1 (coordinated in fallback):
  Group 0: [7, 5, 5]
  Group 1: [5, 5, 4]   # Shares [5,5] with Group 0
  Group 2: [5, 4, 3]   # Shares [5,4] with Group 1
  Group 3: [7, 8, 7]   # Shares [4,3] with Group 2
```

**Key Functions:**
- `find_voicing_chains()`: Finds all valid [v0,v1,v2,v3] sequences
- `voicings_share_notes()`: Checks if v1.notes[1:3] == v2.notes[0:2]
- `select_4_positions_coordinated()`: Main selection with Position 0 override
- `select_4_positions()`: Fallback using quartile-based distribution

### Voicing Constraints & Validation

- **Fret range 0-18**: Voicings are generated only for frets 0-18 (was 0-20, caused sound system crash)
  - Frontend sound system only accepts frets 0-18
  - Backend and frontend must match this constraint
  - Changed in `main.py` line 409 and `triads.ts` line 87
- **Max 5-fret stretch**: Voicings with `max(frets) - min(frets) > 5` are filtered out
- **All 3 triad notes required**: Root, 3rd, and 5th must all be present (no duplicates, no missing)
- **Only triad notes allowed**: Every note must be in {root, 3rd, 5th} pitch class set
- **Inversion detection**: Based on lowest note (low string = low pitch)
  - Root position (△): lowest note is root
  - 1st inversion (¹): lowest note is 3rd
  - 2nd inversion (²): lowest note is 5th

### Circle of Fifths Color System

**NEW**: Each of the 12 chromatic notes has its own color based on circle of fifths:

- **C** → Red (#ef4444)
- **G** → Orange (#f97316)
- **D** → Yellow (#eab308)
- **A** → Lime (#84cc16)
- **E** → Green (#10b981)
- **B** → Cyan (#06b6d4)
- **F#/Gb** → Blue (#3b82f6)
- **C#/Db** → Indigo (#6366f1)
- **G#/Ab** → Violet (#8b5cf6)
- **D#/Eb** → Magenta (#d946ef)
- **A#/Bb** → Pink (#ec4899)
- **F** → Rose (#f43f5e)

**All notes on fretboard are visible:**
- Chromatic background: 16px radius, 30% opacity (all 6 strings × 18 frets)
- Triad notes: 16px radius, 100% opacity, overlaid on chromatic background
- Colors identify **pitch class** (C, D, E, etc.), not interval role
- Root notes get gold ring (#ffd700) for easy identification

**Implementation:** `web/lib/guitar/note-colors.ts`

### 10. Keyboard Navigation

**Circle of fifths key selector** (visual buttons at top):
- Lowercase letters → natural notes: `c`→C, `d`→D, `e`→E, etc.
- Uppercase letters → sharp notes: `C`→C#, `D`→D#, `G`→G#, etc.
- Special cases: `E`→F (E# = F), `B`→C (B# = C)
- Selected key scales to 1.25x with white border

**Implementation**: `web/components/MajorTriads.tsx`

## Known Issues & Gotchas

### 1. Position 0 Open String Quirk ⚠️ CRITICAL

**THE WEIRD QUIRK**: Position 0 may NOT share notes between adjacent groups!

**Why this happens:**
- Open string voicings (like [0,0,0]) are the absolute lowest possible
- Open strings cannot share notes with even lower positions (no negative frets!)
- Some groups have open string voicings, others don't
- **Fallback mode override**: Position 0 always uses the absolute lowest voicing per group

**Examples:**
- **G major Group 2**: Position 0 = [0,0,0] (all open strings D-G-B)
- **G major Group 3**: Position 0 = [4,3,3] (no lower voicing exists)
- These two positions do NOT share notes - that's CORRECT!

**Important Notes:**
- This is NOT a bug - it's a fundamental constraint of guitar physics
- Position 0 prioritizes playability (open strings) over coordination
- Positions 1-3 still maintain note-sharing in most cases
- Integration tests in `test_integration_c_g_major.py` lock this behavior

**Code Location:**
- Python: `main.py` lines 514-534 (fallback mode Position 0 override)
- TypeScript: `triads.ts` lines 196-216 (fallback mode Position 0 override)

### 2. Coordinated Selection Performance
The chain-finding algorithm is O(n^4) where n = voicings per group (typically 5-7).
With ~6 voicings per group: 6^4 = 1,296 iterations. Fast enough for real-time, but:
- If adding more string groups, consider optimizing
- Current implementation finds ~3-5 chains for most keys
- Fallback to independent selection if < 4 chains found (e.g., G major)

### 3. Integration Tests - NEVER MODIFY ⚠️

**File: `test_integration_c_g_major.py`**

These tests lock in the **exact, known-good behavior** for C and G major:
- All 16 C major voicings (4 groups × 4 positions)
- G major Groups 0 & 3 (8 voicings)
- G major Group 2 Position 0 = [0,0,0] (open strings)
- G major Group 1 Position 1 = [5,5,4] (mid-range voicing)

**⚠️ NEVER EVER CHANGE THESE TESTS ⚠️**

If these tests fail, the algorithm is broken. Fix the algorithm, not the tests.
These represent the working state that users depend on.

**Why they exist:**
- During development, the algorithm was breaking C major while trying to fix G major
- These tests ensure C major always works correctly
- They catch regressions immediately
- They document the expected behavior permanently

### 4. Python/TypeScript Parity
The triad and scale logic exist in both Python and TypeScript:
- Python: `main.py` (used by console app and optional API)
- TypeScript: `web/lib/guitar/triads.ts` and `web/lib/guitar/core.ts` (used by browser-based web UI)

**Important**: The web UI uses only the TypeScript implementations. If you update Python logic, also update TypeScript to maintain parity. Tests exist for both implementations.

### 5. String Indexing and Display Order
- **Data indexing**: `string_idx = 0` → 6th string (low E), `string_idx = 5` → 1st string (high E)
- **Visual display**: Reversed! String 1 (high E) at TOP, string 6 (low E) at BOTTOM
- `allStringYPositions[5]` = top position, `allStringYPositions[0]` = bottom position
- Matches natural guitar viewing perspective (thin strings "up", thick strings "down")

### 6. API Endpoint Returns 16 Voicings
`GET /api/triads/{key}` returns 4 string groups × 4 positions = 16 voicings total. If a string group has fewer than 4 valid voicings, some positions may be missing.

### 7. Note Sharing Verification

**With coordinated selection, adjacent groups share notes on overlapping strings (Positions 1-3).**

Tests in `position-note-sharing.test.ts` verify:
- For positions **1-3** (Position 0 may break sharing due to open string priority)
- For each adjacent group pair (0→1, 1→2, 2→3)
- Last 2 notes of group k == First 2 notes of group k+1
- Both notes AND frets must match

**Note**: Position 0 is exempt from this requirement due to the open string quirk (see Gotcha #1).

### 8. String Groups Share Strings (This is CORRECT!)

**IMPORTANT**: Adjacent string groups share 2 strings. This means some notes WILL appear in the same location across different fretboards. **This is geometrically correct and expected!**

String group overlaps:
- **6-5-4** [0,1,2] and **5-4-3** [1,2,3] → Share strings 1 & 2 (A & D)
- **5-4-3** [1,2,3] and **4-3-2** [2,3,4] → Share strings 2 & 3 (D & G)
- **4-3-2** [2,3,4] and **3-2-1** [3,4,5] → Share strings 3 & 4 (G & B)

Example: At fret 5, groups 4-3-2 and 3-2-1 both have:
- String 3 (G) fret 5 = C
- String 4 (B) fret 5 = E

This is NOT a bug! It's the same physical location on the guitar neck, so different voicings can share notes on their overlapping strings.

**Validation**: Every voicing must contain ONLY the root, 3rd, and 5th of the key (e.g., C major = C, E, G only). See `test_triad_validation.py` for comprehensive checks.

### 9. Horizontal Fretboard Layout

**Orientation:**
- Fretboards rotated 90° from original vertical design
- Frets run left→right (nut at left, high frets at right)
- Strings run top→bottom (treble strings high, bass strings low)
- String groups stacked vertically (3-2-1 on top, 6-5-4 on bottom)
- SVG dimensions: 1400×400px (full page width)

**All 6 strings shown:**
- Chromatic notes visible on all 6 strings
- Active strings (3 per group): Bronze (6-5-4-3) or silver (2-1) colors
- Realistic string thickness: 6th string 4.6x thicker than 1st string
- All strings at 100% opacity always

### 10. Physics-Based Rendering

**Fret spacing formula**: `position = scale_length × (1 - 2^(-fret/12))`
- Uses 648mm (25.5") scale length (Fender standard)
- Creates exponentially decreasing spacing (fret 1 tallest → fret 17 shortest)
- 12th fret at natural halfway point (octave position)

**String thickness**: Based on actual gauge measurements
- 6th string: .046" (4.6x baseline)
- 1st string: .010" (1.0x baseline)
- Implemented in `getStringThickness()`

**Note positioning**: Notes at 65% between frets (left of fret line)
- Matches realistic finger placement on guitar
- Function: `getNoteYPosition()` returns fret_prev + (fret_current - fret_prev) × 0.65

**Visual details:**
- Rosewood fretboard (#3d2817)
- Natural wood guitar body (#d4a574)
- Nickel-silver frets (#b8b8b8), bone nut (#e8dcc8)
- Pearl inlay markers (#f5f5dc) at frets 3, 5, 7, 9, 12 (double), 15, 17
- Frets extend 5px beyond fretboard wood (realistic overhang)

### 11. Interactive Sound System

**Web Audio API** with physics-based frequency generation:

**Tuning reference**: A440 standard (1st string, fret 5 = 440 Hz)

**Open string frequencies** (scientifically accurate):
- String 6 (E2): 82.41 Hz
- String 5 (A2): 110.00 Hz
- String 4 (D3): 146.83 Hz
- String 3 (G3): 196.00 Hz
- String 2 (B3): 246.94 Hz
- String 1 (E4): 329.63 Hz

**Formula**: `frequency = open_string_freq × 2^(fret/12)`
- Equal temperament (2^(1/12) semitone ratio)
- 12th fret = perfect octave (2x frequency)
- Verified up to fret 18 (no notes higher than they should be)

**Playback behavior**:
- **Hover individual note**: plays single note (2 sec duration)
- **Hover near position** (96px radius): plays full chord (all 3 notes)
- **Direct hover takes precedence**: stops chord, plays just that note
- ADSR envelope: 10ms attack, 100ms decay, quiet sustain, 500ms release
- Auto-stops previous sounds when hovering new notes

**Implementation**: `web/lib/guitar/sound.ts`

### 12. Multi-Level Hover Interactions

**Hover zones** (proper precedence):
1. **Position hover** (96px radius): All notes in position grow to 1.3x
2. **Direct note hover** (26px radius): That note grows to 1.6x + yellow border
3. **Other notes in same position**: Stay at 1.3x (position remains active)

**Layered rendering** (fixes overlapping notes):
- Layer 1 (background): All 96px position hover circles
- Layer 2 (foreground): Visible notes with direct hover handlers
- Ensures all notes are individually hoverable even when tightly packed

**Visual feedback**:
- Normal: 16px
- Position active: 20.8px (1.3x)
- Direct hover: 25.6px (1.6x) + yellow border
- Root notes: Gold ring (#ffd700) always visible

## Recent Fixes & Algorithm Evolution

### Fret Range Crash Fix (Nov 2025)

**Problem**: Hovering over certain high positions in G major caused crash:
```
Error: Invalid fret: 19. Must be 0-18.
```

**Root Cause**: Backend generated voicings with frets 0-20, frontend sound system only accepts 0-18.

**Fix**: Changed `range(21)` to `range(19)` in both `main.py` and `triads.ts`.

**Files Changed**:
- `main.py` line 409: `for fret1 in range(19):`  # Was range(21)
- `triads.ts` line 87: `for (let fret1 = 0; fret1 <= 18; fret1++)`  # Was <= 20

### Position 0 Open String Discovery (Nov 2025)

**Problem**: G major was skipping important open string voicings:
- Group 2 (D-G-B): Was showing [5,4,3] instead of [0,0,0]
- Group 1 (A-D-G): Was skipping [5,5,4]

**Root Cause Discovery**: The algorithm required note-sharing between adjacent groups, but open strings break this pattern! Open string voicings can't share notes with "lower" positions because negative frets don't exist.

**Fix**: Position 0 now always uses the absolute lowest voicing per group, even in fallback mode. This overrides the inversion-based selection to prioritize open strings.

**Files Changed**:
- `main.py` lines 514-534: Fallback mode Position 0 override
- `triads.ts` lines 196-216: Fallback mode Position 0 override
- `main.py` lines 604-658: Simplified `select_4_positions()` to use quartiles

**Tests Added**:
- `test_integration_c_g_major.py`: 4 immutable tests that lock C & G major behavior
- `test_c_major_positions.py`: 4 regression tests for C major
- `test_g_major_positions.py`: 7 comprehensive tests for G major

### Key Insight

**Open strings are special!** They represent the physical boundary of the guitar. Position 0 must prioritize these lowest-possible voicings even if it means breaking the note-sharing pattern that works for positions 1-3.

## Remember

🔄 **Always iterate on tests until they pass.** The user doesn't want you to stop after one failed attempt. Keep fixing and re-running until everything works!

⚠️ **NEVER modify `test_integration_c_g_major.py`**. If those tests fail, fix the algorithm, not the tests!
