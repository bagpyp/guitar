#!/usr/bin/env python3
"""
Tests for major triad functionality
"""
import pytest
from main import (
    build_major_triad,
    identify_inversion,
    find_all_triad_voicings,
    select_4_positions,
    build_fretboard,
)


def test_build_major_triad_c():
    """Test C major triad construction"""
    triad = build_major_triad("C")
    assert triad == [0, 4, 7], "C major should be [C=0, E=4, G=7]"


def test_build_major_triad_d():
    """Test D major triad construction"""
    triad = build_major_triad("D")
    assert triad == [2, 6, 9], "D major should be [D=2, F#=6, A=9]"


def test_build_major_triad_g():
    """Test G major triad construction"""
    triad = build_major_triad("G")
    assert triad == [7, 11, 2], "G major should be [G=7, B=11, D=2]"


def test_identify_inversion_root():
    """Test root position identification"""
    triad_pcs = [0, 4, 7]  # C, E, G
    notes = [0, 4, 7]  # C, E, G (root position)
    assert identify_inversion(notes, triad_pcs) == "root"


def test_identify_inversion_first():
    """Test first inversion identification"""
    triad_pcs = [0, 4, 7]  # C, E, G
    notes = [4, 7, 0]  # E, G, C (first inversion)
    assert identify_inversion(notes, triad_pcs) == "first"


def test_identify_inversion_second():
    """Test second inversion identification"""
    triad_pcs = [0, 4, 7]  # C, E, G
    notes = [7, 0, 4]  # G, C, E (second inversion)
    assert identify_inversion(notes, triad_pcs) == "second"


def test_find_all_triad_voicings():
    """Test finding triad voicings on a string group"""
    fretboard = build_fretboard()
    triad_pcs = [0, 4, 7]  # C major
    string_group = [3, 4, 5]  # Strings G-B-E (3rd, 2nd, 1st)

    voicings = find_all_triad_voicings(triad_pcs, string_group, fretboard)

    # Should find multiple voicings
    assert len(voicings) > 0, "Should find at least one voicing"

    # Check structure of first voicing
    v = voicings[0]
    assert "strings" in v
    assert "frets" in v
    assert "notes" in v
    assert "note_names" in v
    assert "inversion" in v
    assert "avg_fret" in v

    # All voicings should have 3 notes from the triad
    for v in voicings:
        assert len(v["frets"]) == 3
        assert len(v["notes"]) == 3
        assert set(v["notes"]) == set(triad_pcs), f"Expected {triad_pcs}, got {v['notes']}"


def test_voicing_includes_open_position():
    """Test that we find the open position voicing for C major on strings G-B-E"""
    fretboard = build_fretboard()
    triad_pcs = [0, 4, 7]  # C major: C, E, G
    string_group = [3, 4, 5]  # Strings G-B-E

    voicings = find_all_triad_voicings(triad_pcs, string_group, fretboard)

    # Look for the open position: G(open), C(1st fret), E(open) = [0, 1, 0]
    open_voicing = None
    for v in voicings:
        if v["frets"] == [0, 1, 0]:
            open_voicing = v
            break

    assert open_voicing is not None, "Should find open position voicing [0, 1, 0]"
    assert open_voicing["notes"] == [7, 0, 4], "Should be G, C, E"
    assert open_voicing["inversion"] == "second", "G-C-E is 2nd inversion (5-1-3)"


def test_select_4_positions():
    """Test selecting 4 positions from voicings"""
    fretboard = build_fretboard()
    triad_pcs = [0, 4, 7]  # C major
    string_group = [3, 4, 5]  # Strings G-B-E

    all_voicings = find_all_triad_voicings(triad_pcs, string_group, fretboard)
    selected = select_4_positions(all_voicings)

    # Should return up to 4 voicings
    assert 1 <= len(selected) <= 4, f"Should select 1-4 voicings, got {len(selected)}"

    # Each should have a position field
    for v in selected:
        assert "position" in v
        assert 0 <= v["position"] <= 3

    # Positions should be in ascending order by avg_fret
    if len(selected) > 1:
        for i in range(len(selected) - 1):
            assert selected[i]["avg_fret"] <= selected[i+1]["avg_fret"], \
                "Voicings should be sorted by average fret"


def test_select_4_positions_spans_fretboard():
    """Test that selected positions span the fretboard"""
    fretboard = build_fretboard()
    triad_pcs = [0, 4, 7]  # C major
    string_group = [3, 4, 5]  # Strings G-B-E

    all_voicings = find_all_triad_voicings(triad_pcs, string_group, fretboard)
    selected = select_4_positions(all_voicings)

    if len(selected) >= 2:
        # First position should be low on fretboard
        assert selected[0]["avg_fret"] < 6, "Position 0 should be in low frets"

        # Last position should be higher
        assert selected[-1]["avg_fret"] > selected[0]["avg_fret"], \
            "Later positions should be higher on fretboard"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
