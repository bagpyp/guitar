# Guitar Scale Practice

![Guitar Triads Visualization](screenshot.png)

Interactive guitar practice app with realistic fretboard visualization, circle of fifths color coding, and physics-based rendering.

## Installation

**First time setup:**

```bash
# 1. Install Python dependencies (choose one):
poetry install              # if you have poetry
# OR
python -m venv .venv && .venv/bin/pip install -e .

# 2. Install web dependencies:
cd web
npm install
cd ..
```

## Running the App

### Web App (Full UI)

**Terminal 1** - Start API server:
```bash
.venv/bin/python api.py     # or: poetry run serve
```

**Terminal 2** - Start web UI:
```bash
cd web
npm run dev                 # Open http://localhost:3000
```

## Console App

```bash
python main.py              # interactive practice (no server needed)
```

## Tests

```bash
.venv/bin/pytest            # Python tests
cd web && npm test          # TypeScript tests
```

## Poetry Scripts

```bash
poetry run guitar           # console app
poetry run serve            # API server (port 8000)
```

## PyCharm

Interpreter: `.venv/bin/python`