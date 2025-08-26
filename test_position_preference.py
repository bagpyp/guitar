#!/usr/bin/env python3
"""Test that verifies position finding prefers deeper (lower-pitched) strings"""

import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import find_best_position, build_fretboard

def test_position_preference():
    """Test that find_best_position prefers deeper strings when equidistant"""
    
    fretboard = build_fretboard()
    
    # Test case: A# (Bb) with target fret 12
    # A# can be played at:
    # - 6th string (E), fret 6 (distance 6)
    # - 5th string (A), fret 1 (distance 11) 
    # - 5th string (A), fret 13 (distance 1)  <- Should choose this (closer)
    # - 4th string (D), fret 8 (distance 4)
    # - 4th string (D), fret 20 (distance 8)
    # - 3rd string (G), fret 3 (distance 9)
    # - 3rd string (G), fret 15 (distance 3)
    # - 2nd string (B), fret 11 (distance 1)  <- Currently choosing this
    # - 1st string (E), fret 6 (distance 6)
    # - 1st string (E), fret 18 (distance 6)
    
    # When distance is tied at 1 (5th string fret 13 vs 2nd string fret 11),
    # it should prefer the deeper string (5th string, index 1)
    
    note = "A#"
    target_fret = 12
    
    string_idx, open_string_name, fret = find_best_position(note, target_fret, fretboard, debug=True)
    
    print("\nTest: A# at target fret 12")
    print(f"Expected: 5th string (A), fret 13")
    print(f"Got: {['6th', '5th', '4th', '3rd', '2nd', '1st'][string_idx]} string ({open_string_name}), fret {fret}")
    
    if string_idx == 1 and fret == 13:
        print("✓ TEST PASSED: Correctly chose 5th string, fret 13")
        return True
    else:
        print("✗ TEST FAILED: Should have chosen 5th string, fret 13")
        print("\nThe logic should prefer:")
        print("1. Closest distance to target fret")
        print("2. On distance tie, prefer lower fret number")
        print("3. On fret tie, prefer deeper/lower-pitched string (lower string index)")
        return False

if __name__ == "__main__":
    success = test_position_preference()
    sys.exit(0 if success else 1)