# Guitar Scale Practice

![Guitar Triads Visualization](screenshot.png)

Interactive guitar practice app with realistic fretboard visualization, circle of fifths color coding, and physics-based rendering. **Runs entirely in your browser - no backend required!**

## Features

- **Major Triads Tab**: Interactive triad visualization across all string groups
  - Circle of fifths color coding for all 12 chromatic notes
  - Horizontal fretboard layout with realistic physics-based spacing
  - Hover to play notes with Web Audio API
  - 4 positions per string group with coordinated selection algorithm

- **Scale Practice Tab**: Interactive mode/scale practice challenges
  - Random challenges for all 7 modes
  - Progressive hints with scoring system
  - XYZ pattern visualization

## Installation

**First time setup:**

```bash
# 1. Install Python dependencies (optional - only needed for console app):
poetry install              # if you have poetry
# OR
python -m venv .venv && .venv/bin/pip install -e .

# 2. Install web dependencies:
cd web
npm install
cd ..
```

## Running the App

### Web App (Browser Only - No Backend!)

```bash
cd web
npm run dev                 # Open http://localhost:3000
```

**That's it!** All logic runs in your browser. No API server needed.

## Console App (Optional)

```bash
python main.py              # interactive practice (standalone CLI)
```

## Tests

```bash
# TypeScript tests (web app logic)
cd web && npm test          # 188 tests

# Python tests (console app logic)
.venv/bin/pytest            # 46 tests
```

## Architecture

The app has two independent implementations:

1. **Browser-based Web UI** (TypeScript)
   - All logic in `web/lib/guitar/`
   - Pure client-side, no server needed
   - Uses Next.js for UI

2. **Console App** (Python)
   - All logic in `main.py`
   - Standalone CLI tool
   - Optional API server in `api.py` (not used by web UI)

Both implementations are fully tested and maintain feature parity.

## Poetry Scripts (Python only)

```bash
poetry run guitar           # console app
poetry run serve            # API server (port 8000, optional)
```

## Development

**PyCharm setup:** Set interpreter to `.venv/bin/python`

**VS Code setup:** TypeScript/Next.js environment in `web/` directory