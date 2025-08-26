#!/usr/bin/env python3
"""
Test the new UI non-interactively
"""
from main import (
    display_challenge_info, 
    build_fretboard,
    get_xyz_display_string,
    parent_major
)

def test_ui_display():
    """Test the UI display without interaction"""
    fretboard = build_fretboard()
    
    # Test case 1: Nothing shown
    print("Test 1: Initial state (no answers shown)")
    print("-" * 50)
    mode = "Dorian"
    note = "G"
    target_fret = 10
    
    # Simulate initial display
    print(f"\nChallenge: {mode} mode | Note: {note} | Target fret: {target_fret}")
    print("\nControls:")
    print("  [k] Show key    [p] Show position    [s] Show shape")
    print("  [Enter] New challenge    [q] Quit")
    
    print("\n" + "=" * 50)
    
    # Test case 2: Show key
    print("\nTest 2: Key revealed")
    print("-" * 50)
    parent_key = parent_major(mode, note)
    print(f"Key: You are playing in the key of {parent_key}")
    
    print("\n" + "=" * 50)
    
    # Test case 3: Show shape
    print("\nTest 3: Shape revealed")
    print("-" * 50)
    xyz = get_xyz_display_string(mode)
    print(f"Shape: {xyz}")
    
    print("\n" + "=" * 50)
    
    # Test case 4: Verify all modes have correct XYZ
    print("\nTest 4: All mode XYZ patterns")
    print("-" * 50)
    modes = ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"]
    for mode in modes:
        print(f"{mode:12}: {get_xyz_display_string(mode)}")
    
    print("\nAll tests complete!")

if __name__ == "__main__":
    test_ui_display()