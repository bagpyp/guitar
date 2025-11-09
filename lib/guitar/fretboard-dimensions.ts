/**
 * Centralized fretboard dimension configuration
 *
 * This file provides a single source of truth for all fretboard dimensions.
 * All sizes are derived from three base scale factors, making it easy to
 * resize the entire fretboard by changing just a few numbers.
 *
 * ## Quick Start - How to Scale the Fretboard
 *
 * Edit the `FRETBOARD_CONFIG` object below to change dimensions:
 *
 * ### Make the fretboard LONGER (horizontally):
 * ```typescript
 * FRETBOARD_LENGTH_SCALE: 1.5    // 50% longer (2100px instead of 1400px)
 * ```
 *
 * ### Make the fretboard THINNER (vertically):
 * ```typescript
 * FRETBOARD_WIDTH_SCALE: 0.75    // 25% thinner (300px instead of 400px)
 * ```
 *
 * ### Make UI elements SMALLER (notes, markers, text):
 * ```typescript
 * ELEMENT_SIZE_SCALE: 0.8        // 20% smaller elements
 * ```
 *
 * ## Common Presets
 *
 * ### Compact View (for smaller screens):
 * ```typescript
 * FRETBOARD_LENGTH_SCALE: 0.7    // Shorter fretboard
 * FRETBOARD_WIDTH_SCALE: 0.7     // Thinner neck
 * ELEMENT_SIZE_SCALE: 0.8        // Smaller notes/text
 * ```
 *
 * ### Large Display (for presentations):
 * ```typescript
 * FRETBOARD_LENGTH_SCALE: 1.5    // Longer fretboard
 * FRETBOARD_WIDTH_SCALE: 1.2     // Wider neck
 * ELEMENT_SIZE_SCALE: 1.3        // Larger notes/text
 * ```
 *
 * ### Wide/Thin Neck (realistic proportions):
 * ```typescript
 * FRETBOARD_LENGTH_SCALE: 1.3    // Longer
 * FRETBOARD_WIDTH_SCALE: 0.6     // Much thinner
 * ELEMENT_SIZE_SCALE: 0.9        // Slightly smaller elements
 * ```
 *
 * ## What Gets Scaled
 *
 * - **LENGTH_SCALE**: Fretboard width, fret spacing (horizontal dimension)
 * - **WIDTH_SCALE**: String spacing, margins, fretboard height (vertical dimension)
 * - **ELEMENT_SIZE_SCALE**: Note dots, markers, text, stroke widths, hover radii
 *
 * All dimensions throughout the component automatically update when you
 * change these values. No other code changes needed!
 */

/**
 * Base configuration - ADJUST THESE VALUES to scale the fretboard
 *
 * Default values (1.0 for all) produce:
 * - 1400px wide (horizontal fretboard length)
 * - 400px tall (vertical string spacing)
 * - 16px note dots, 12px text, etc.
 */
export const FRETBOARD_CONFIG = {
  // Length scaling (horizontal dimension)
  FRETBOARD_LENGTH_SCALE: 1.0,    // 1.0 = 1400px default width
  USE_VIEWPORT_WIDTH: true,       // Use viewport width instead of fixed pixels
  VIEWPORT_WIDTH_PERCENT: 98,     // Percentage of viewport width to use

  // Width scaling (vertical dimension, string spacing)
  FRETBOARD_WIDTH_SCALE: 0.5,     // 0.5 = thinner neck for fitting all 4 in viewport

  // Element size scaling (notes, markers, text)
  ELEMENT_SIZE_SCALE: 1.0,        // 1.0 = default sizes

  // Open string positioning
  OPEN_STRING_OFFSET_PX: 35,      // Distance open strings appear beyond the nut (left)
} as const;

/**
 * Derived dimensions - automatically calculated from base scales
 */
export const DIMENSIONS = {
  // SVG canvas dimensions
  get svgWidth() {
    // When using viewport width, this is the base calculation
    // The actual width will be set via CSS (90vw)
    return 1400 * FRETBOARD_CONFIG.FRETBOARD_LENGTH_SCALE;
  },

  get svgHeight() {
    return 400 * FRETBOARD_CONFIG.FRETBOARD_WIDTH_SCALE;
  },

  // Extra space for open string notes to appear beyond the nut
  get openStringOffset() {
    return FRETBOARD_CONFIG.OPEN_STRING_OFFSET_PX;
  },

  // Total SVG viewBox width (includes open string space + fretboard)
  get viewBoxWidth() {
    return this.openStringOffset + this.svgWidth;
  },

  // Fretboard constants
  get numFrets() {
    return 18; // Number of frets displayed
  },

  get startFret() {
    return 0; // Starting fret number
  },

  // String spacing
  get stringSpacing() {
    return this.svgHeight / 7; // Space for 6 strings with margins
  },

  // Fretboard margins (vertical, beyond strings)
  get fretboardMarginTop() {
    return 15 * FRETBOARD_CONFIG.FRETBOARD_WIDTH_SCALE;
  },

  get fretboardMarginBottom() {
    return 15 * FRETBOARD_CONFIG.FRETBOARD_WIDTH_SCALE;
  },

  // Fret line extensions (vertical beyond fretboard wood)
  get fretLineExtensionTop() {
    return 20 * FRETBOARD_CONFIG.FRETBOARD_WIDTH_SCALE;
  },

  get fretLineExtensionBottom() {
    return 20 * FRETBOARD_CONFIG.FRETBOARD_WIDTH_SCALE;
  },

  // Note/marker sizes
  get noteRadius() {
    return 13 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  get chromaticNoteRadius() {
    return 13 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  get fretMarkerRadius() {
    return 10 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  get rootNoteRingOffset() {
    return 6 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  get rootNoteRingWidth() {
    return 3 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  get positionHoverRadius() {
    return 96 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  // Overlap offset for multiple notes at same position
  get noteOverlapOffset() {
    return 8 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  // Font sizes
  get chromaticNoteFontSize() {
    return 12 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  get noteFontSize() {
    return 12 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  get noteHoverFontSize() {
    return 14 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  get inversionSymbolFontSize() {
    return 24 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  // Inversion symbol positioning
  get inversionSymbolYOffset() {
    return 10 * FRETBOARD_CONFIG.FRETBOARD_WIDTH_SCALE;
  },

  // Stroke widths
  get fretLineWidth() {
    return 2 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  get nutWidth() {
    return 4 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  get hoverStrokeWidth() {
    return 3 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  get fretMarkerStrokeWidth() {
    return 1 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },

  // Note hover size multipliers
  get defaultTriadNoteMultiplier() {
    return 1.15; // Triad notes always shown at this size
  },

  get positionHoverSizeMultiplier() {
    return 1.35; // Position hover
  },

  get directHoverSizeMultiplier() {
    return 1.7; // Direct hover (largest)
  },

  // Fretboard styling
  get fretboardBorderRadius() {
    return 8 * FRETBOARD_CONFIG.ELEMENT_SIZE_SCALE;
  },
} as const;

/**
 * Calculate all string Y positions (vertical positions for horizontal layout)
 * String 1 (index 5) at top, string 6 (index 0) at bottom
 *
 * @returns Array of Y positions for all 6 strings [string6, string5, ..., string1]
 */
export function calculateAllStringYPositions(): number[] {
  const spacing = DIMENSIONS.stringSpacing;
  return [
    spacing * 6, // String 6 (index 0) - bottom (thickest)
    spacing * 5, // String 5 (index 1)
    spacing * 4, // String 4 (index 2)
    spacing * 3, // String 3 (index 3)
    spacing * 2, // String 2 (index 4)
    spacing * 1, // String 1 (index 5) - top (thinnest)
  ];
}
