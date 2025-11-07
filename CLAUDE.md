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

## Running Tests

### Python Tests

```bash
# From repo root
.venv/bin/pytest -v

# Expected: 12 tests passing
```

### TypeScript Tests

```bash
# From web/ directory
cd web
npm test

# Expected: 15 tests passing
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

## Remember

🔄 **Always iterate on tests until they pass.** The user doesn't want you to stop after one failed attempt. Keep fixing and re-running until everything works!
