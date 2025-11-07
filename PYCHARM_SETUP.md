# PyCharm Setup Guide

## Virtual Environment

The project uses a standard Python virtual environment located at `.venv/`.

### Quick Setup

The virtual environment is already created and configured. To use it in PyCharm:

1. **Open Project** in PyCharm
2. **Configure Interpreter**:
   - Go to: `PyCharm → Settings → Project: guitar → Python Interpreter`
   - Click the gear icon ⚙️ → `Add Interpreter → Add Local Interpreter`
   - Select `Existing environment`
   - Browse to: `/Users/robbie/bagpyp/guitar/.venv/bin/python`
   - Click `OK`

3. **Verify Setup**:
   - The interpreter should show as `Python 3.9 (.venv)`
   - Package list should include `pytest`

### Manual Recreate (if needed)

If you need to recreate the virtual environment:

```bash
# Remove old venv
rm -rf .venv

# Create new venv
/usr/bin/python3 -m venv .venv

# Install dependencies
.venv/bin/pip install --upgrade pip
.venv/bin/pip install pytest
```

## Running Tests

### In Terminal

```bash
# Run all tests
.venv/bin/pytest -v

# Run specific test
.venv/bin/pytest test_xyz_patterns.py -v
```

### In PyCharm

1. Right-click on any `test_*.py` file
2. Select `Run 'pytest in test_xyz_patterns.py'`
3. Or use the green play button next to test functions

## Running the App

### In Terminal

```bash
# Interactive mode
.venv/bin/python main.py

# With seed for reproducible sequence
.venv/bin/python main.py --seed 42

# Show XYZ patterns
.venv/bin/python main.py --show-xyz

# Debug mode
.venv/bin/python main.py --debug
```

### In PyCharm

1. Right-click `main.py`
2. Select `Run 'main'`
3. Or click the green play button in the editor

To add command-line arguments:
- Go to: `Run → Edit Configurations`
- Add parameters to `Parameters` field (e.g., `--seed 42`)

## Project Structure

```
guitar/
├── .venv/              # Virtual environment (local, not in git)
├── main.py             # Main application
├── demo.py             # UI demo
├── test_*.py           # Test files
├── pyproject.toml      # Project metadata and Poetry config
├── README.md           # Project README
└── web/                # Web UI (separate Node.js project)
```

## Poetry Alternative

If you prefer to use Poetry (though the venv is already set up):

```bash
# Poetry is configured in pyproject.toml
poetry install

# Run with poetry
poetry run python main.py
poetry run pytest
```

Note: There may be issues with Poetry + asdf Python shims. The manual venv approach is more reliable.
