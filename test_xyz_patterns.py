#!/usr/bin/env python3
"""
Test XYZ pattern mappings for all modes.
"""
import pytest
from main import get_xyz_display_string


class TestXYZPatterns:
    """Test XYZ pattern mappings for all modes."""
    
    expected_patterns = {
        "Ionian": "XXYYZZ",
        "Dorian": "ZXXXYY", 
        "Phrygian": "YZZXXX",
        "Lydian": "XYYZZX",
        "Mixolydian": "XXXYYZ",
        "Aeolian": "ZZXXXY",
        "Locrian": "YYZZXX"
    }
    
    @pytest.mark.parametrize("mode,expected", expected_patterns.items())
    def test_individual_xyz_pattern(self, mode, expected):
        """Test individual XYZ pattern for each mode."""
        actual = get_xyz_display_string(mode)
        assert actual == expected, f"Mode {mode}: expected {expected}, got {actual}"
    
    def test_all_xyz_patterns(self):
        """Test that all XYZ patterns match the expected mapping."""
        for mode, expected in self.expected_patterns.items():
            actual = get_xyz_display_string(mode)
            assert actual == expected, f"Mode {mode}: expected {expected}, got {actual}"


def test_xyz_patterns_standalone():
    """Standalone test function for compatibility."""
    expected_patterns = {
        "Ionian": "XXYYZZ",
        "Dorian": "ZXXXYY", 
        "Phrygian": "YZZXXX",
        "Lydian": "XYYZZX",
        "Mixolydian": "XXXYYZ",
        "Aeolian": "ZZXXXY",
        "Locrian": "YYZZXX"
    }
    
    for mode, expected in expected_patterns.items():
        actual = get_xyz_display_string(mode)
        assert actual == expected, f"Mode {mode}: expected {expected}, got {actual}"


if __name__ == "__main__":
    # Run with pytest if available, otherwise run standalone
    try:
        import pytest
        pytest.main([__file__, "-v"])
    except ImportError:
        test_xyz_patterns_standalone()
        print("✓ All XYZ patterns are correct!")