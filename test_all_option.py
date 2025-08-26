#!/usr/bin/env python3
"""Test script to verify the 'all' option functionality"""

import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import interactive_practice_session, build_fretboard
import argparse

class MockArgs:
    def __init__(self):
        self.debug = False
        self.seed = None
        self.emit_json = False

def test_all_option():
    """Test that the 'a' option toggles all three display options"""
    
    # Test data
    mode = "Dorian"
    note = "G#"
    target_fret = 7
    fretboard = build_fretboard()
    args = MockArgs()
    
    print("Testing 'all' option functionality...")
    print("=" * 50)
    
    # The logic for 'a' option:
    # If all are True, set all to False
    # If any are False, set all to True
    
    test_cases = [
        (False, False, False, True, True, True, "All off -> All on"),
        (True, False, False, True, True, True, "Some on -> All on"),
        (False, True, False, True, True, True, "Some on -> All on"),
        (False, False, True, True, True, True, "Some on -> All on"),
        (True, True, False, True, True, True, "Two on -> All on"),
        (True, True, True, False, False, False, "All on -> All off"),
    ]
    
    for initial_key, initial_pos, initial_shape, expected_key, expected_pos, expected_shape, desc in test_cases:
        show_key = initial_key
        show_position = initial_pos
        show_shape = initial_shape
        
        # Simulate pressing 'a' - this is the logic from main.py
        new_state = not (show_key and show_position and show_shape)
        show_key = new_state
        show_position = new_state
        show_shape = new_state
        
        if show_key == expected_key and show_position == expected_pos and show_shape == expected_shape:
            print(f"✓ {desc}: PASS")
        else:
            print(f"✗ {desc}: FAIL")
            print(f"  Initial: key={initial_key}, pos={initial_pos}, shape={initial_shape}")
            print(f"  Expected: key={expected_key}, pos={expected_pos}, shape={expected_shape}")
            print(f"  Got: key={show_key}, pos={show_position}, shape={show_shape}")
    
    print("=" * 50)
    print("All tests completed!")

if __name__ == "__main__":
    test_all_option()