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
   - Long Neck View (default): All positions on one unified fretboard per string group
   - Compact View: Individual diagrams for each position
   - 4 string groups: 6-5-4, 5-4-3, 4-3-2, 3-2-1
   - 4 positions per group (0-3) distributed across fretboard
   - Color coding: Root=Red, 3rd=Green, 5th=Blue
   - Position rings: P0=Purple, P1=Blue, P2=Green, P3=Amber

## Running Tests

### Python Tests

```bash
# From repo root
.venv/bin/pytest -v

# Expected: 24 tests passing (as of latest commit)
```

### TypeScript Tests

```bash
# From web/ directory
cd web
npm test

# Expected: 36 tests passing (as of latest commit)
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
- `main.py`: Triad generation logic (`build_major_triad`, `find_all_triad_voicings`, `select_4_positions`)
- `api.py`: `GET /api/triads/{key}` endpoint
- `web/lib/guitar/triads.ts`: TypeScript triad logic (mirrors Python)
- `web/components/LongFretboardDiagram.tsx`: Unified vertical fretboard (426 lines)
- `web/components/FretboardDiagram.tsx`: Compact individual diagrams
- `web/components/MajorTriads.tsx`: Main UI component with view toggle
- `test_triads.py`: 10 Python tests
- `web/__tests__/triads.test.ts`: 21 TypeScript tests

**Important Algorithm: `select_4_positions()`**

⚠️ **CRITICAL**: This function uses a quartile-based approach, NOT fixed ranges!

```python
# CORRECT (current implementation):
indices = [
    0,                      # Position 0: 0th percentile (lowest)
    round(n / 4),           # Position 1: 25th percentile
    round(2 * n / 4),       # Position 2: 50th percentile
    n - 1                   # Position 3: 100th percentile (highest)
]
```

**Why quartiles?** Fixed ranges like `(0, 5.5), (4.5, 9.5), (8.5, 13.5), (11.5, 21)` caused a bug where voicings around fret 8 were skipped because they'd be grabbed by the wrong position bucket. Quartiles ensure even distribution regardless of how many voicings exist.

**Bug History (FIXED):** C major on strings 3-2-1 was skipping the fret-8 voicing. Test in `test_position_selection_bug.py` now prevents regression.

### Voicing Constraints

- **Max 5-fret stretch**: Voicings with `max(frets) - min(frets) > 5` are filtered out
- **All 3 triad notes required**: Root, 3rd, and 5th must all be present
- **Inversion detection**: Based on lowest note (low string = low pitch)
  - Root position: lowest note is root
  - 1st inversion: lowest note is 3rd
  - 2nd inversion: lowest note is 5th

## Known Issues & Gotchas

### 1. Quartile Rounding
With small numbers of voicings (e.g., 5), quartile selection is critical:
- 5 voicings → indices `[0, 1, 2, 4]` (correct)
- Don't use `n // 3` which gives `[0, 1, 3, 4]` (skips index 2!)

### 2. Python/TypeScript Parity
The triad logic MUST match between `main.py` and `web/lib/guitar/triads.ts`. When updating one, update the other. Tests verify this parity.

### 3. String Indexing
- `string_idx = 0` → 6th string (low E)
- `string_idx = 5` → 1st string (high E)
- Strings are indexed **low to high pitch**, not high to low visually

### 4. API Endpoint Returns 16 Voicings
`GET /api/triads/{key}` returns 4 string groups × 4 positions = 16 voicings total. If a string group has fewer than 4 valid voicings, some positions may be missing.

## Remember

🔄 **Always iterate on tests until they pass.** The user doesn't want you to stop after one failed attempt. Keep fixing and re-running until everything works!
