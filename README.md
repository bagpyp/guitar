# Guitar Scale Practice

## Quick Start

**Terminal 1** - Start API server:
```bash
.venv/bin/python api.py     # or: poetry run serve
```

**Terminal 2** - Start web UI:
```bash
cd web
npm run dev                 # localhost:3000
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