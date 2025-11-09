// Core types for guitar practice app

export type NoteName = string;
export type Mode = "Ionian" | "Dorian" | "Phrygian" | "Lydian" | "Mixolydian" | "Aeolian" | "Locrian";
export type XYZSymbol = "X" | "Y" | "Z";

export interface Position {
  stringIndex: number;
  stringName: string;
  fret: number;
  distance: number;
}

export interface XYZPosition {
  stringIndex: number;
  fret: number;
  symbol: XYZSymbol;
}

export interface Challenge {
  mode: Mode;
  note: NoteName;
  targetFret: number;
}

export interface Answer {
  key: string;
  position: Position;
  xyzPattern: XYZSymbol[];
  xyzLayout: XYZPosition[];
}
