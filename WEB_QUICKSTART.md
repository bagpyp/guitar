# Web UI Quick Start

## Run the App

```bash
cd web
npm run dev
```

Then open **http://localhost:3000** in your browser.

## What You'll See

A clean, tab-based interface with:

1. **Scale Practice** (active tab) - Interactive guitar scale drills
   - Random challenges: mode + note + target fret
   - Toggle buttons to reveal:
     - **Show Key**: Parent major key
     - **Show Position**: Best string/fret position
     - **Show Shape**: 3NPS XYZ pattern layout
   - **Show All**: Reveal everything at once
   - **New Challenge**: Generate a new random challenge

2. **Major Triads** (placeholder tab) - Coming soon!

## Run Tests

```bash
cd web
npm test
```

All 15 integration tests pass, covering:
- Note/pitch conversions
- Parent major key calculations
- Fretboard position finding
- XYZ pattern generation for all 7 modes

## Architecture Highlights

✓ **Clean separation**: Core logic (`lib/guitar`) is UI-independent
✓ **Type-safe**: Full TypeScript coverage
✓ **Tested**: 15 integration tests
✓ **Extensible**: Easy to add new tabs (triads, etc.)
✓ **Minimal**: No heavy dependencies, just Next.js + React

## Code Reusability

All guitar logic is in `web/lib/guitar/`:
- `types.ts` - TypeScript interfaces
- `constants.ts` - Guitar mappings and mode definitions
- `core.ts` - Pure functions for all calculations
- `index.ts` - Clean exports

Import anywhere with:
```typescript
import { buildFretboard, findBestPosition, parentMajor } from '@/lib/guitar';
```

Perfect for the upcoming triads feature!
