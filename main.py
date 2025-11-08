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


# ============================================================================
# TRIAD FUNCTIONS
# ============================================================================

def build_major_triad(root_name: str) -> list:
    """
    Build major triad pitch classes.
    Returns: [root_pc, third_pc, fifth_pc]
    """
    root_pc = name_to_pc(root_name)
    third_pc = (root_pc + 4) % 12  # Major third (4 semitones)
    fifth_pc = (root_pc + 7) % 12  # Perfect fifth (7 semitones)
    return [root_pc, third_pc, fifth_pc]


def identify_inversion(notes: list, triad_pcs: list) -> str:
    """
    Identify which inversion type based on lowest note.

    Args:
        notes: [low, mid, high] pitch classes from low to high strings
        triad_pcs: [root, third, fifth] pitch classes

    Returns: "root", "first", or "second"
    """
    root_pc, third_pc, fifth_pc = triad_pcs
    lowest_note = notes[0]

    if lowest_note == root_pc:
        return "root"
    elif lowest_note == third_pc:
        return "first"
    elif lowest_note == fifth_pc:
        return "second"
    else:
        return "unknown"


def find_all_triad_voicings(triad_pcs: list, string_group: list, fretboard: dict, max_stretch: int = 5) -> list:
    """
    Find all valid triad voicings on a 3-string group.

    Args:
        triad_pcs: [root, third, fifth] pitch classes
        string_group: [low_string_idx, mid_string_idx, high_string_idx]
                      e.g., [3, 4, 5] for strings G-B-E
        fretboard: fretboard mapping from build_fretboard()
        max_stretch: maximum fret span allowed (default 5)

    Returns: list of voicing dicts with keys:
        - strings: [s1, s2, s3]
        - frets: [f1, f2, f3]
        - notes: [pc1, pc2, pc3] (pitch classes)
        - note_names: [name1, name2, name3]
        - inversion: "root"|"first"|"second"
        - avg_fret: float
    """
    voicings = []
    triad_set = set(triad_pcs)

    # Try all combinations of frets on the 3 strings
    for fret1 in range(21):  # Low string
        note1 = fretboard[string_group[0]][fret1]
        if note1 not in triad_set:
            continue

        for fret2 in range(21):  # Mid string
            note2 = fretboard[string_group[1]][fret2]
            if note2 not in triad_set:
                continue

            for fret3 in range(21):  # High string
                note3 = fretboard[string_group[2]][fret3]
                if note3 not in triad_set:
                    continue

                # Check that all three unique triad notes are present
                notes = [note1, note2, note3]
                if set(notes) != triad_set:
                    continue

                # Check fret stretch constraint
                min_fret = min(fret1, fret2, fret3)
                max_fret = max(fret1, fret2, fret3)
                if max_fret - min_fret > max_stretch:
                    continue

                # Valid voicing found
                avg_fret = (fret1 + fret2 + fret3) / 3.0
                inversion = identify_inversion(notes, triad_pcs)
                note_names = [pc_to_sharp_name(pc) for pc in notes]

                voicings.append({
                    "strings": string_group.copy(),
                    "frets": [fret1, fret2, fret3],
                    "notes": notes.copy(),
                    "note_names": note_names,
                    "inversion": inversion,
                    "avg_fret": avg_fret
                })

    return voicings


def voicings_share_notes(v1: dict, v2: dict) -> bool:
    """
    Check if two voicings from adjacent groups share notes on overlapping strings.

    v1 is from group k (strings [a, b, c])
    v2 is from group k+1 (strings [b, c, d])
    They should share notes on strings b and c.
    """
    # v1's last 2 notes should match v2's first 2 notes
    return (v1["notes"][1:3] == v2["notes"][0:2] and
            v1["frets"][1:3] == v2["frets"][0:2])


def find_voicing_chains(all_group_voicings: list[list]) -> list[list]:
    """
    Find sequences of voicings that share notes across all 4 groups.

    Returns: List of chains, where each chain is [v0, v1, v2, v3]
              representing a voicing from each of the 4 groups that share notes.
    """
    chains = []

    # Start with every voicing in group 0
    for v0 in all_group_voicings[0]:
        # Try to find matching voicings in subsequent groups
        for v1 in all_group_voicings[1]:
            if not voicings_share_notes(v0, v1):
                continue

            for v2 in all_group_voicings[2]:
                if not voicings_share_notes(v1, v2):
                    continue

                for v3 in all_group_voicings[3]:
                    if not voicings_share_notes(v2, v3):
                        continue

                    # Found a complete chain!
                    chains.append([v0, v1, v2, v3])

    return chains


def select_4_positions_coordinated(all_group_voicings: list[list], triad_pcs: tuple) -> list[list]:
    """
    Select 4 positions across all 4 string groups with coordination.

    Ensures:
    1. Positions 0 & 3 have same inversion type
    2. Positions 1 & 2 have the other two inversion types
    3. Adjacent groups share notes on overlapping strings

    Args:
        all_group_voicings: List of 4 lists, one for each string group (unsorted, unfiltered)
        triad_pcs: [root, third, fifth] pitch classes

    Returns:
        List of 4 lists, each with 4 selected voicings
    """
    # Find all valid chains
    chains = find_voicing_chains(all_group_voicings)

    if len(chains) < 4:
        # Fallback: not enough chains, use independent selection
        return [select_4_positions(group_voicings) for group_voicings in all_group_voicings]

    # Group chains by inversion pattern
    chains_by_pattern = {}
    for chain in chains:
        # Get avg fret for sorting
        avg_fret = sum(v["avg_fret"] for v in chain) / 4

        # Get inversion of first group (they should all be similar in a chain)
        inv = chain[0]["inversion"]

        if inv not in chains_by_pattern:
            chains_by_pattern[inv] = []
        chains_by_pattern[inv].append((avg_fret, chain))

    # Sort chains within each inversion group by avg fret
    for inv in chains_by_pattern:
        chains_by_pattern[inv].sort(key=lambda x: x[0])

    # Sort ALL chains by avg fret globally
    all_chains_sorted = [(avg_fret, chain) for chain in chains]
    all_chains_sorted.sort(key=lambda x: x[0])

    # ALWAYS use the absolute lowest chain for P0
    pos0_chain = all_chains_sorted[0][1]
    paired_inv = pos0_chain[0]["inversion"]

    # Find the highest chain with matching inversion for P3
    pos3_chain = None
    for avg_fret, chain in reversed(all_chains_sorted):
        if chain[0]["inversion"] == paired_inv:
            pos3_chain = chain
            break

    if pos3_chain is None:
        # Can't find matching P3, use fallback
        return [select_4_positions(group_voicings) for group_voicings in all_group_voicings]

    # Get the other two inversions for P1/P2
    inversion_types = ["root", "first", "second"]
    other_invs = [inv for inv in inversion_types if inv != paired_inv]

    selected_chains = [pos0_chain]

    # Position 1: Lower-middle chain from first "other" inversion
    if other_invs[0] in chains_by_pattern and chains_by_pattern[other_invs[0]]:
        inv1_chains = chains_by_pattern[other_invs[0]]
        idx = min(len(inv1_chains) - 1, len(inv1_chains) // 3)
        selected_chains.append(inv1_chains[idx][1])

    # Position 2: Higher-middle chain from second "other" inversion
    if len(other_invs) > 1 and other_invs[1] in chains_by_pattern and chains_by_pattern[other_invs[1]]:
        inv2_chains = chains_by_pattern[other_invs[1]]
        idx = max(0, len(inv2_chains) * 2 // 3)
        selected_chains.append(inv2_chains[idx][1])

    # Position 3: Highest chain with matching inversion
    selected_chains.append(pos3_chain)

    # Convert chains to grouped format
    result = [[], [], [], []]  # 4 groups
    for pos_idx, chain in enumerate(selected_chains):
        for group_idx, voicing in enumerate(chain):
            voicing_copy = voicing.copy()
            voicing_copy["position"] = pos_idx
            result[group_idx].append(voicing_copy)

    return result


def select_4_positions(voicings: list) -> list:
    """
    Select 4 representative voicings spanning the fretboard (positions 0-3).

    New inversion-based approach:
    - Positions 0 & 3: Same inversion type (low and high on neck)
    - Positions 1 & 2: The other two inversion types

    This creates musically coherent patterns while spanning the fretboard.

    Returns: list of up to 4 voicings, each with added "position" key (0-3)
    """
    if not voicings:
        return []

    # Sort by average fret
    sorted_voicings = sorted(voicings, key=lambda v: v["avg_fret"])
    n = len(sorted_voicings)

    if n <= 4:
        # If 4 or fewer voicings, use them all
        selected = []
        for idx, v in enumerate(sorted_voicings):
            voicing = v.copy()
            voicing["position"] = idx
            selected.append(voicing)
        return selected

    # Group voicings by inversion type
    by_inversion = {"root": [], "first": [], "second": []}
    for v in sorted_voicings:
        inv_type = v.get("inversion", "unknown")
        if inv_type in by_inversion:
            by_inversion[inv_type].append(v)

    # Find which inversion type has voicings in both low and high ranges
    # This will be used for positions 0 & 3
    inversion_types = ["root", "first", "second"]
    best_paired_inversion = None
    best_span = 0

    for inv_type in inversion_types:
        if len(by_inversion[inv_type]) >= 2:
            inv_voicings = by_inversion[inv_type]
            span = inv_voicings[-1]["avg_fret"] - inv_voicings[0]["avg_fret"]
            if span > best_span:
                best_span = span
                best_paired_inversion = inv_type

    # Fallback: if no inversion spans well, use old algorithm
    if best_paired_inversion is None or best_span < 3:
        indices = [
            0,
            round((n - 1) / 4),
            round(2 * (n - 1) / 4),
            round(3 * (n - 1) / 4)
        ]
        selected = []
        for position_idx, voicing_idx in enumerate(indices):
            voicing = sorted_voicings[voicing_idx].copy()
            voicing["position"] = position_idx
            selected.append(voicing)
        return selected

    # Get the other two inversions for positions 1 & 2
    other_inversions = [inv for inv in inversion_types if inv != best_paired_inversion]

    # Select positions with inversion constraints
    selected = []

    # Position 0: Lowest voicing with paired inversion
    paired_voicings = by_inversion[best_paired_inversion]
    if paired_voicings:
        pos0 = paired_voicings[0].copy()
        pos0["position"] = 0
        selected.append(pos0)

    # Position 1: Lower voicing from first "other" inversion
    if other_inversions[0] and by_inversion[other_inversions[0]]:
        inv1_voicings = by_inversion[other_inversions[0]]
        # Pick from lower half
        idx = min(len(inv1_voicings) - 1, len(inv1_voicings) // 3)
        pos1 = inv1_voicings[idx].copy()
        pos1["position"] = 1
        selected.append(pos1)

    # Position 2: Higher voicing from second "other" inversion
    if len(other_inversions) > 1 and by_inversion[other_inversions[1]]:
        inv2_voicings = by_inversion[other_inversions[1]]
        # Pick from upper half
        idx = max(0, len(inv2_voicings) * 2 // 3)
        pos2 = inv2_voicings[idx].copy()
        pos2["position"] = 2
        selected.append(pos2)

    # Position 3: Highest voicing with paired inversion
    if paired_voicings:
        pos3 = paired_voicings[-1].copy()
        pos3["position"] = 3
        selected.append(pos3)

    return selected


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