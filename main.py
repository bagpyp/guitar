#!/usr/bin/env python3
"""
Guitar Scale Practice App - Single File Console Tool

Setup (one-time):
  uv venv
  uv pip install -r requirements.txt   # if any; pure stdlib is fine
Run:
  python main.py

Optional flags:
  --seed N        Use fixed random seed for reproducible sequences
  --debug         Show internal pitch calculations
  --show-xyz      Show 3NPS XYZ layout after Answer 1
  --emit-json     Output JSON data for UI integration
"""

import random
import sys
import argparse
import json


# Constants
NOTE_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
MODES = ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"]

# 3NPS XYZ Pattern Mechanics (corrected mapping)
# Base circular pattern
XYZ_BASE = ["X", "X", "X", "Y", "Y", "Z", "Z"]  # len = 7

# Mode to start index in circular base (for 6-symbol window)
# Base pattern: X X X Y Y Z Z (indices 0 1 2 3 4 5 6)
MODE_TO_START = {
    "Ionian": 1,      # Start at idx 1 → X X Y Y Z Z
    "Dorian": 6,      # Start at idx 6 → Z X X X Y Y
    "Phrygian": 4,    # Start at idx 4 → Y Z Z X X X
    "Lydian": 2,      # Start at idx 2 → X Y Y Z Z X
    "Mixolydian": 0,  # Start at idx 0 → X X X Y Y Z
    "Aeolian": 5,     # Start at idx 5 → Z Z X X X Y
    "Locrian": 3      # Start at idx 3 → Y Y Z Z X X
}

WINDOW_LEN = 6

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
    2. On distance ties, prefer deeper/lower-pitched string (lower string index)
    3. On string ties, prefer lower fret number
    
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
    
    # Sort by: distance (asc), string_index (asc for deeper strings), fret (asc)
    candidates.sort(key=lambda x: (x[0], x[2], x[1]))
    
    distance, fret, string_idx = candidates[0]
    open_string_name = STRING_NAMES[string_idx]
    
    return string_idx, open_string_name, fret


def get_ordinal_suffix(number):
    """Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)"""
    if 10 <= number % 100 <= 20:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(number % 10, 'th')
    return suffix


def clear_screen():
    """Clear the terminal screen"""
    import os
    os.system('cls' if os.name == 'nt' else 'clear')


def display_challenge_info(mode, note, target_fret, show_key=False, show_position=False, show_shape=False, fretboard=None, args=None):
    """Display challenge information with optional answers"""
    clear_screen()
    print("=" * 50)
    print("GUITAR SCALE PRACTICE")
    print("=" * 50)
    print(f"\nChallenge: {mode} mode | Note: {note} | Target fret: {target_fret}")
    print("\nControls:")
    print("  [k] Show key    [p] Show position    [s] Show shape    [a] Show all")
    print("  [Enter] New challenge    [q] Quit")
    
    answers_shown = []
    
    # Show key if requested
    if show_key:
        parent_key = parent_major(mode, note)
        print(f"\nKey: You are playing in the key of {parent_key}")
        answers_shown.append("key")
    
    # Show position if requested  
    if show_position and fretboard:
        try:
            string_idx, open_string_name, best_fret = find_best_position(
                note, target_fret, fretboard, debug=args.debug if args else False
            )
            ordinal_string = string_index_to_ordinal(string_idx)
            suffix = get_ordinal_suffix(best_fret)
            print(f"\nPosition: {ordinal_string} string ({open_string_name}), {best_fret}{suffix} fret")
            answers_shown.append("position")
        except ValueError as e:
            print(f"\nError finding position: {e}")
    
    # Show shape if requested
    if show_shape and fretboard:
        try:
            string_idx, open_string_name, best_fret = find_best_position(
                note, target_fret, fretboard, debug=args.debug if args else False
            )
            print(f"\nShape: {get_xyz_display_string(mode)}")
            
            positions = plan_xyz_positions(mode, string_idx, best_fret)
            print("\n3NPS/XYZ layout (low→high):")
            
            # Display in two rows for readability
            row1 = []
            row2 = []
            for pos_idx, (s_idx, fret, symbol) in enumerate(positions):
                ordinal = string_index_to_ordinal(s_idx)
                string_name = STRING_NAMES[s_idx]
                if pos_idx < 3:
                    row1.append(f"{ordinal[0]}({string_name}): {symbol} @ {fret}")
                else:
                    row2.append(f"{ordinal[0]}({string_name}): {symbol} @ {fret}")
            
            print("  " + "  ".join(row1))
            print("  " + "  ".join(row2))
            
            # Note if shifts were applied
            window = xyz_window_for_mode(mode)
            has_xy_shift = any(window[i-1] == 'X' and window[i] == 'Y' for i in range(1, 6))
            if has_xy_shift:
                print("  (shifts: X→Y and G→B applied as needed)")
            
            answers_shown.append("shape")
        except ValueError as e:
            print(f"\nError calculating shape: {e}")
    
    if answers_shown:
        print(f"\n{'─' * 30}")
        print(f"Showing: {', '.join(answers_shown)}")
    
    print(f"\n{'─' * 50}")


def interactive_practice_session(mode, note, target_fret, fretboard, args):
    """Run an interactive practice session for one challenge"""
    show_key = False
    show_position = False  
    show_shape = False
    
    while True:
        display_challenge_info(mode, note, target_fret, show_key, show_position, show_shape, fretboard, args)
        
        try:
            response = input("\nYour choice: ").strip().lower()
            
            if response == 'k':
                show_key = not show_key
            elif response == 'p':
                show_position = not show_position
            elif response == 's':
                show_shape = not show_shape
            elif response == 'a':
                # Toggle all options at once
                new_state = not (show_key and show_position and show_shape)
                show_key = new_state
                show_position = new_state
                show_shape = new_state
            elif response in ['', 'n', 'next']:
                return True  # Continue to next challenge
            elif response in ['q', 'quit', 'exit']:
                return False  # Quit the program
            else:
                # Show brief help for invalid input
                print("\nInvalid input. Use: k (key), p (position), s (shape), a (all), Enter (next), q (quit)")
                input("Press Enter to continue...")
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            return False


def string_index_to_ordinal(string_idx: int) -> str:
    """Convert string index (0-5) to ordinal string name (6th-1st)"""
    ordinals = ["6th", "5th", "4th", "3rd", "2nd", "1st"]  # index 0 = 6th string (lowest)
    return ordinals[string_idx]


def xyz_window_for_mode(mode: str) -> list:
    """Generate the 6-symbol XYZ window for a given mode"""
    start = MODE_TO_START[mode]
    return [XYZ_BASE[(start + i) % 7] for i in range(WINDOW_LEN)]


def get_xyz_display_string(mode: str) -> str:
    """Get the display string for XYZ pattern (for backward compatibility)"""
    window = xyz_window_for_mode(mode)
    return ''.join(window)


def plan_xyz_positions(mode: str, start_string_idx: int, start_fret: int) -> list:
    """
    Plan 3NPS positions for all 6 strings starting from a given string/fret.
    
    Returns [(string_idx, fret, symbol)], from low to high strings (6→1).
    Applies −1 fret shifts:
      - whenever symbol[i-1] == 'X' and symbol[i] == 'Y'
      - whenever crossing from string 3 → 2 (G→B)
    """
    symbols = xyz_window_for_mode(mode)
    plan = []
    
    # We need to build the full pattern for all 6 strings
    # Starting from string 6 (index 0) to string 1 (index 5)
    # But we know the position of our starting note
    
    # First, figure out where in the pattern our starting string falls
    # String indices: 0=6th, 1=5th, 2=4th, 3=3rd, 4=2nd, 5=1st
    # Pattern indices: 0=6th string symbol, 1=5th string symbol, etc.
    
    # Calculate fret positions for all strings
    frets: list = [None] * 6
    frets[start_string_idx] = start_fret
    
    # Work backwards from start_string to string 6
    current_fret = start_fret
    for i in range(start_string_idx - 1, -1, -1):
        # Check if we need to apply shifts going backwards
        # Going from string i+1 to string i (backward)
        prev_symbol = symbols[i + 1]
        curr_symbol = symbols[i]
        
        # Reverse of X→Y shift: Y→X means +1 fret
        if prev_symbol == 'Y' and curr_symbol == 'X':
            current_fret += 1
            
        # Reverse of G→B shift: B→G (index 4→3) means +1 fret
        if i == 3 and (i + 1) == 4:
            current_fret += 1
            
        frets[i] = current_fret
    
    # Work forwards from start_string to string 1
    current_fret = start_fret
    for i in range(start_string_idx + 1, 6):
        # Apply normal forward shifts
        prev_symbol = symbols[i - 1]
        curr_symbol = symbols[i]
        
        # X → Y transition shift
        if prev_symbol == 'X' and curr_symbol == 'Y':
            current_fret -= 1
        
        # G → B string shift (indices 3 → 4)
        if (i - 1) == 3 and i == 4:
            current_fret -= 1
        
        frets[i] = current_fret
    
    # Build the plan
    for i in range(6):
        plan.append((i, frets[i], symbols[i]))
    
    return plan


def main():
    parser = argparse.ArgumentParser(description="Guitar Scale Practice App")
    parser.add_argument("--seed", type=int, help="Random seed for reproducible sequences")
    parser.add_argument("--debug", action="store_true", help="Show internal pitch calculations")
    parser.add_argument("--emit-json", action="store_true", help="Output JSON data for UI integration")
    args = parser.parse_args()
    
    if args.seed is not None:
        random.seed(args.seed)
    
    fretboard = build_fretboard()
    
    # Welcome message
    clear_screen()
    print("=" * 50)
    print("GUITAR SCALE PRACTICE")
    print("=" * 50)
    print("\nWelcome! Test your knowledge of guitar scales.")
    print("\nFor each challenge, try to figure out:")
    print("  - The best position to play the note")
    print("  - The parent key of the mode")
    print("  - The 3NPS XYZ shape pattern")
    print("\nPress Enter to begin...")
    input()
    
    while True:
        # Generate random practice parameters
        mode = random.choice(MODES)
        note = random.choice(NOTE_NAMES_SHARP)
        target_fret = random.randint(1, 12)
        
        # Run interactive practice session
        continue_practicing = interactive_practice_session(mode, note, target_fret, fretboard, args)
        
        if not continue_practicing:
            print("\nGoodbye!")
            break


if __name__ == "__main__":
    main()