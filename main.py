#!/usr/bin/env python3
"""
Guitar Scale Practice App - Single File Console Tool

Setup (one-time):
  uv venv
  uv pip install -r requirements.txt   # if any; pure stdlib is fine
Run:
  python main.py

Optional flags:
  --seed N    Use fixed random seed for reproducible sequences
  --debug     Show internal pitch calculations
"""

import random
import sys
import argparse


# Constants
NOTE_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
MODES = ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"]

# XYZ pattern codes for each mode
MODE_XYZ = {
    "Ionian": "XXYYZZ",
    "Dorian": "ZXXXYY", 
    "Phrygian": "YZZXXX",
    "Lydian": "XYYZZX",
    "Mixolydian": "XXXYYZ",
    "Aeolian": "ZZXXXY",
    "Locrian": "YYZZXX"
}

# Mode offsets for parent major calculation
# These represent semitones to subtract from mode tonic to get major key tonic
MODE_OFFSETS = {
    "Ionian": 0,    # 1st degree - no offset
    "Dorian": 2,    # 2nd degree - subtract 2 semitones  
    "Phrygian": 4,  # 3rd degree - subtract 4 semitones
    "Lydian": 5,    # 4th degree - subtract 5 semitones
    "Mixolydian": 7, # 5th degree - subtract 7 semitones
    "Aeolian": 9,   # 6th degree - subtract 9 semitones
    "Locrian": 11   # 7th degree - subtract 11 semitones
}

# Standard tuning: low to high (string 6 to string 1)
# Using MIDI note numbers for internal calculation
STRING_TUNING_MIDI = [40, 45, 50, 55, 59, 64]  # E2, A2, D3, G3, B3, E4
STRING_NAMES = ["E", "A", "D", "G", "B", "E"]  # Open string names


def name_to_pc(name: str) -> int:
    """Convert note name to pitch class (0-11, where C=0)"""
    return NOTE_NAMES_SHARP.index(name)


def pc_to_sharp_name(pc: int) -> str:
    """Convert pitch class to sharp note name"""
    return NOTE_NAMES_SHARP[pc % 12]


def midi_to_pc(midi_note: int) -> int:
    """Convert MIDI note number to pitch class"""
    return midi_note % 12


def parent_major(mode: str, tonic: str) -> str:
    """Calculate parent major key given mode and tonic"""
    tonic_pc = name_to_pc(tonic)
    offset = MODE_OFFSETS[mode]
    parent_pc = (tonic_pc - offset) % 12
    return pc_to_sharp_name(parent_pc)


def build_fretboard():
    """Build fretboard mapping: {string_index: {fret: pitch_class}}"""
    fretboard = {}
    for string_idx, open_midi in enumerate(STRING_TUNING_MIDI):
        fretboard[string_idx] = {}
        for fret in range(21):  # 0-20 frets
            midi_note = open_midi + fret
            pitch_class = midi_to_pc(midi_note)
            fretboard[string_idx][fret] = pitch_class
    return fretboard


def find_best_position(note: str, target_fret: int, fretboard: dict, debug=False) -> tuple:
    """
    Find the best string/fret combination for the given note near target_fret.
    
    Tie-breaking rules:
    1. Closest to target_fret by absolute distance
    2. On distance ties, prefer lower fret number
    3. On fret ties, prefer lower-pitched string (higher string index)
    
    Returns: (string_index, open_string_name, fret)
    """
    target_pc = name_to_pc(note)
    candidates = []
    
    # Find all positions that produce the target note
    for string_idx in range(6):  # 0-5 (6th string to 1st string)
        for fret in range(21):  # 0-20 frets
            if fretboard[string_idx][fret] == target_pc:
                distance = abs(fret - target_fret)
                candidates.append((distance, fret, string_idx))
                if debug:
                    string_name = STRING_NAMES[string_idx]
                    midi = STRING_TUNING_MIDI[string_idx] + fret
                    ordinal = string_index_to_ordinal(string_idx)
                    print(f"  Debug: {ordinal} string ({string_name}), fret {fret}, distance {distance}, MIDI {midi}")
    
    if not candidates:
        raise ValueError(f"Note {note} not found on fretboard")
    
    # Sort by: distance (asc), fret (asc), string_index (asc for lower pitch preference)
    candidates.sort(key=lambda x: (x[0], x[1], x[2]))
    
    distance, fret, string_idx = candidates[0]
    open_string_name = STRING_NAMES[string_idx]
    
    return string_idx, open_string_name, fret


def wait_for_input():
    """Wait for Space or Enter key"""
    try:
        input("(Press Space/Enter to continue...)")
    except KeyboardInterrupt:
        print("\nGoodbye!")
        sys.exit(0)


def string_index_to_ordinal(string_idx: int) -> str:
    """Convert string index (0-5) to ordinal string name (6th-1st)"""
    ordinals = ["6th", "5th", "4th", "3rd", "2nd", "1st"]  # index 0 = 6th string (lowest)
    return ordinals[string_idx]


def main():
    parser = argparse.ArgumentParser(description="Guitar Scale Practice App")
    parser.add_argument("--seed", type=int, help="Random seed for reproducible sequences")
    parser.add_argument("--debug", action="store_true", help="Show internal pitch calculations")
    args = parser.parse_args()
    
    if args.seed is not None:
        random.seed(args.seed)
        print(f"Using random seed: {args.seed}")
    
    fretboard = build_fretboard()
    
    while True:
        # Generate random practice parameters
        mode = random.choice(MODES)
        note = random.choice(NOTE_NAMES_SHARP)
        target_fret = random.randint(1, 20)
        
        # Display the challenge
        print(f"\nMode: {mode} | Note: {note} | Target fret: {target_fret}")
        print(f"XYZ: {MODE_XYZ[mode]}")
        
        # Wait for first reveal
        wait_for_input()
        
        # Answer 1: Find best position
        try:
            string_idx, open_string_name, best_fret = find_best_position(
                note, target_fret, fretboard, debug=args.debug
            )
            ordinal_string = string_index_to_ordinal(string_idx)
            print(f"\nAnswer 1: {ordinal_string} string ({open_string_name}), {best_fret}{'st' if best_fret == 1 else 'nd' if best_fret == 2 else 'rd' if best_fret == 3 else 'th'} fret")
        except ValueError as e:
            print(f"Error: {e}")
            continue
        
        # Wait for second reveal
        wait_for_input()
        
        # Answer 2: Parent major key
        parent_key = parent_major(mode, note)
        print(f"\nAnswer 2: You are playing in the key of {parent_key}")
        
        # Ask to continue
        while True:
            try:
                response = input("\nGo again? (Y/n): ").strip().lower()
                if response in ['', 'y', 'yes']:
                    break
                elif response in ['n', 'no']:
                    print("Goodbye!")
                    return
                else:
                    print("Please enter Y or N")
            except KeyboardInterrupt:
                print("\nGoodbye!")
                return


if __name__ == "__main__":
    main()