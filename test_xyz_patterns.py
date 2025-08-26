#!/usr/bin/env python3
"""
Test XYZ pattern mappings for all modes.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import get_xyz_display_string


def test_xyz_patterns():
    """Test that XYZ patterns match the expected mapping."""
    expected_patterns = {
        "Ionian": "XXYYZZ",
        "Dorian": "ZXXXYY", 
        "Phrygian": "YZZXXX",
        "Lydian": "XYYZZX",
        "Mixolydian": "XXXYYZ",
        "Aeolian": "ZZXXXY",
        "Locrian": "YYZZXX"
    }
    
    print("Testing XYZ patterns:")
    all_passed = True
    
    for mode, expected in expected_patterns.items():
        actual = get_xyz_display_string(mode)
        status = "✓" if actual == expected else "✗"
        print(f"{status} {mode:12}: expected {expected}, got {actual}")
        if actual != expected:
            all_passed = False
    
    print()
    if all_passed:
        print("✓ All XYZ patterns are correct!")
        return True
    else:
        print("✗ Some XYZ patterns are incorrect!")
        return False


if __name__ == "__main__":
    success = test_xyz_patterns()
    sys.exit(0 if success else 1)