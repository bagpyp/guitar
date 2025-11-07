# Guitar Practice Web UI

A minimal, tab-based web interface for guitar practice tools built with Next.js and TypeScript.

## Features

### Current
- **Scale Practice**: Interactive drill for guitar scales with 3NPS (three-notes-per-string) patterns
  - Random mode + note + target fret challenges
  - Shows best position, parent major key, and XYZ shape patterns
  - Toggle individual answers or show all at once

### Coming Soon
- **Major Triads**: Display all major triads along 4 string groups for every key with inversion references

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

```bash
cd web
npm install --ignore-scripts
```

### Development

Start the dev server on localhost:3000:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run the integration tests:

```bash
npm test
```

All core guitar logic is thoroughly tested:
- Note/pitch conversions
- Parent major key calculations
- Fretboard mapping
- Position finding with tie-breaking rules
- XYZ pattern generation for all modes

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main page with tab navigation
│   └── globals.css     # Global styles
├── components/          # React components
│   ├── Tabs.tsx        # Tab navigation component
│   └── ScalePractice.tsx # Scale practice interactive UI
├── lib/                 # Core logic (reusable)
│   └── guitar/         # Guitar-specific utilities
│       ├── types.ts    # TypeScript types
│       ├── constants.ts # Guitar constants and mappings
│       ├── core.ts     # Core logic (fretboard, positions, XYZ)
│       └── index.ts    # Main export
└── __tests__/          # Integration tests
    └── guitar-logic.test.ts

```

## Architecture Notes

The code is designed to be **clean and reusable** for future guitar features:

1. **Separation of Concerns**: Core guitar logic (`lib/guitar`) is completely separate from UI components
2. **Type Safety**: Full TypeScript coverage with proper types
3. **Testable**: All logic is unit tested independently of the UI
4. **Extensible**: Tab-based architecture makes it easy to add new features (like the major triads tab)
5. **Minimal Dependencies**: Only Next.js, React, and TypeScript

## XYZ Pattern Reference

The app uses the 3NPS XYZ pattern system for guitar scales:

- **X**: First three-note group
- **Y**: Second three-note group
- **Z**: Third three-note group

Mode patterns:
- **Ionian**: XXYYZZ
- **Dorian**: ZXXXYY
- **Phrygian**: YZZXXX
- **Lydian**: XYYZZX
- **Mixolydian**: XXXYYZ
- **Aeolian**: ZZXXXY
- **Locrian**: YYZZXX

## License

Private project
