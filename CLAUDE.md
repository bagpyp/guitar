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
2. **Web App** - Client-server architecture:
   - Backend: FastAPI server (`api.py`) on port 8000
   - Frontend: Next.js app on port 3000
   - Frontend calls backend via REST API

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

# Expected: 31 tests passing (as of latest commit)
```

### TypeScript Tests

```bash
# From web/ directory
cd web
npm test

# Expected: 191 tests passing (as of latest commit)
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

### Web App (Client-Server)

**Terminal 1 - API Server:**
```bash
.venv/bin/python api.py
# Server runs on http://localhost:8000
```

**Terminal 2 - Web UI:**
```bash
cd web
npm run dev
# UI runs on http://localhost:3000
```

## Making Changes

### Python Backend Changes

1. Edit `main.py` (console logic) or `api.py` (API endpoints)
2. Run Python tests: `.venv/bin/pytest -v`
3. **Iterate until all tests pass**
4. If API changes affect frontend, update `web/components/`

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

To test the full stack:

1. Start API server: `.venv/bin/python api.py`
2. In another terminal, test API:
   ```bash
   curl http://localhost:8000/api/challenge
   ```
3. Start web UI: `cd web && npm run dev`
4. Open `http://localhost:3000` in browser
5. Click buttons and verify behavior

## Common Issues

### "Failed to load challenge. Is the API server running?"
- The web UI can't reach the API server
- Start API server: `.venv/bin/python api.py`
- Check it's running: `curl http://localhost:8000/api/challenge`

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

*Backend (Python):*
- `main.py`: Core triad logic with coordinated position selection
  - `build_major_triad()`: Generate [root, 3rd, 5th] pitch classes
  - `find_all_triad_voicings()`: Find all valid voicings on 3 strings
  - `find_voicing_chains()`: Find sequences that share notes across groups
  - `select_4_positions_coordinated()`: Select positions with inversion constraints
  - `voicings_share_notes()`: Check if adjacent groups share notes
- `api.py`: `GET /api/triads/{key}` endpoint (uses coordinated algorithm)

*Frontend (TypeScript):*
- `web/lib/guitar/triads.ts`: TypeScript triad logic (mirrors Python)
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

*Tests (222 total):*
- Python: 31 tests
- TypeScript: 191 tests across 8 files
  - `triads.test.ts`: 21 tests (triad generation)
  - `fretboard-physics.test.ts`: 20 tests (physics calculations)
  - `note-colors.test.ts`: 29 tests (circle of fifths colors)
  - `fretboard-rendering.test.ts`: 46 tests (visual features)
  - `position-note-sharing.test.ts`: 15 tests (coordinated selection)
  - `hover-interaction.test.ts`: 21 tests (hover/click behavior)
  - `sound.test.ts`: 24 tests (frequency accuracy)
  - `guitar-logic.test.ts`: 15 tests (original features)

**Critical Algorithm: Coordinated Position Selection**

⚠️ **IMPORTANT**: Position selection now uses a **coordinated chain-finding approach** across all 4 string groups simultaneously!

**Why Coordination is Needed:**
- Adjacent string groups share 2 strings (e.g., 6-5-4 shares A&D with 5-4-3)
- Same position number across groups should share notes on overlapping strings
- Creates visually coherent patterns across the entire fretboard

**How it Works:**
1. **Find chains**: Sequences of voicings [v0, v1, v2, v3] that share notes across all 4 groups
2. **Group by inversion**: Organize chains by their inversion type
3. **Apply constraints**:
   - Position 0: Always use absolute LOWEST chain (includes open positions)
   - Position 3: Highest chain with SAME inversion as P0
   - Positions 1 & 2: Use the other two inversion types
4. **Result**: All adjacent groups share notes + inversion symmetry (P0 = P3)

**Example Chain (C major):**
```python
Position 0 (2nd inversion):
  Group 0: [3, 2, 0]   # Strings 6-5-4
  Group 1: [2, 0, 3]   # Shares [2,0] on strings A&D
  Group 2: [0, 3, 5]   # Shares [0,3] on strings D&G
  Group 3: [0, 1, 0]   # Shares [3,5]→[0,1] on strings G&B
```

**Key Functions:**
- `find_voicing_chains()`: Finds all valid [v0,v1,v2,v3] sequences
- `voicings_share_notes()`: Checks if v1.notes[1:3] == v2.notes[0:2]
- `select_4_positions_coordinated()`: Main selection with constraints

**Inversion Pairing:**
- P0 & P3 always have matching inversions (creates symmetry)
- P1 & P2 use the other two inversions
- Ensures musical coherence while spanning low→high fretboard

### Voicing Constraints & Validation

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

### 1. Coordinated Selection Performance
The chain-finding algorithm is O(n^4) where n = voicings per group (typically 5-7).
With ~6 voicings per group: 6^4 = 1,296 iterations. Fast enough for real-time, but:
- If adding more string groups, consider optimizing
- Current implementation finds ~5 chains for most keys
- Fallback to independent selection if < 4 chains found

### 2. Python/TypeScript Parity
The triad logic MUST match between `main.py` and `web/lib/guitar/triads.ts`. When updating one, update the other. Tests verify this parity.

### 3. String Indexing and Display Order
- **Data indexing**: `string_idx = 0` → 6th string (low E), `string_idx = 5` → 1st string (high E)
- **Visual display**: Reversed! String 1 (high E) at TOP, string 6 (low E) at BOTTOM
- `allStringYPositions[5]` = top position, `allStringYPositions[0]` = bottom position
- Matches natural guitar viewing perspective (thin strings "up", thick strings "down")

### 4. API Endpoint Returns 16 Voicings
`GET /api/triads/{key}` returns 4 string groups × 4 positions = 16 voicings total. If a string group has fewer than 4 valid voicings, some positions may be missing.

### 5. Note Sharing Verification

**With coordinated selection, adjacent groups MUST share notes on overlapping strings.**

Tests in `position-note-sharing.test.ts` verify:
- For each position (0-3)
- For each adjacent group pair (0→1, 1→2, 2→3)
- Last 2 notes of group k == First 2 notes of group k+1
- Both notes AND frets must match

If this test fails, the coordinated algorithm is broken!

### 6. String Groups Share Strings (This is CORRECT!)

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

### 6. Horizontal Fretboard Layout

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

### 7. Physics-Based Rendering

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

### 8. Interactive Sound System

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

### 9. Multi-Level Hover Interactions

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

## Remember

🔄 **Always iterate on tests until they pass.** The user doesn't want you to stop after one failed attempt. Keep fixing and re-running until everything works!
