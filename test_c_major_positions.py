#!/usr/bin/env python3
"""
Regression test for C major triad positions.
Pins the exact voicings that currently work correctly for C major.
"""
import pytest
from main import (
    build_major_triad,
    find_all_triad_voicings,
    select_4_positions_coordinated,
    build_fretboard,
)


def test_c_major_coordinated_positions():
    """
    Test that C major generates the expected 16 voicings (4 groups × 4 positions).
    This regression test pins the current working behavior.
    """
    # Build C major
    triad_pcs = build_major_triad('C')
    assert triad_pcs == [0, 4, 7], "C major should be [C=0, E=4, G=7]"

    # Define string groups
    string_groups = [
        [0, 1, 2],  # Group 0: Strings 6-5-4
        [1, 2, 3],  # Group 1: Strings 5-4-3
        [2, 3, 4],  # Group 2: Strings 4-3-2
        [3, 4, 5],  # Group 3: Strings 3-2-1
    ]

    # Build fretboard
    fretboard = build_fretboard()

    # Find voicings for each group
    all_group_voicings = []
    for sg in string_groups:
        voicings = find_all_triad_voicings(triad_pcs, sg, fretboard)
        all_group_voicings.append(voicings)

    # Get coordinated positions
    selected = select_4_positions_coordinated(all_group_voicings, triad_pcs)

    # Expected voicings for each group (coordinated chains)
    expected = [
        # Group 0 (strings 6-5-4)
        [
            {"position": 0, "frets": [3, 3, 2], "notes": [7, 0, 4], "inversion": "second"},
            {"position": 1, "frets": [8, 7, 5], "notes": [0, 4, 7], "inversion": "root"},
            {"position": 2, "frets": [12, 10, 10], "notes": [4, 7, 0], "inversion": "first"},
            {"position": 3, "frets": [15, 15, 14], "notes": [7, 0, 4], "inversion": "second"},
        ],
        # Group 1 (strings 5-4-3)
        [
            {"position": 0, "frets": [3, 2, 0], "notes": [0, 4, 7], "inversion": "root"},
            {"position": 1, "frets": [7, 5, 5], "notes": [4, 7, 0], "inversion": "first"},
            {"position": 2, "frets": [10, 10, 9], "notes": [7, 0, 4], "inversion": "second"},
            {"position": 3, "frets": [15, 14, 12], "notes": [0, 4, 7], "inversion": "root"},
        ],
        # Group 2 (strings 4-3-2)
        [
            {"position": 0, "frets": [2, 0, 1], "notes": [4, 7, 0], "inversion": "first"},
            {"position": 1, "frets": [5, 5, 5], "notes": [7, 0, 4], "inversion": "second"},
            {"position": 2, "frets": [10, 9, 8], "notes": [0, 4, 7], "inversion": "root"},
            {"position": 3, "frets": [14, 12, 13], "notes": [4, 7, 0], "inversion": "first"},
        ],
        # Group 3 (strings 3-2-1)
        [
            {"position": 0, "frets": [0, 1, 0], "notes": [7, 0, 4], "inversion": "second"},
            {"position": 1, "frets": [5, 5, 3], "notes": [0, 4, 7], "inversion": "root"},
            {"position": 2, "frets": [9, 8, 8], "notes": [4, 7, 0], "inversion": "first"},
            {"position": 3, "frets": [12, 13, 12], "notes": [7, 0, 4], "inversion": "second"},
        ],
    ]

    # Verify we got 4 groups
    assert len(selected) == 4, f"Should have 4 groups, got {len(selected)}"

    # Verify each group
    for group_idx, group_voicings in enumerate(selected):
        assert len(group_voicings) == 4, \
            f"Group {group_idx} should have 4 positions, got {len(group_voicings)}"

        for pos_idx, voicing in enumerate(group_voicings):
            expected_voicing = expected[group_idx][pos_idx]

            # Check position
            assert voicing["position"] == expected_voicing["position"], \
                f"Group {group_idx}, position {pos_idx}: wrong position"

            # Check frets
            assert voicing["frets"] == expected_voicing["frets"], \
                f"Group {group_idx}, position {pos_idx}: expected frets {expected_voicing['frets']}, got {voicing['frets']}"

            # Check notes
            assert voicing["notes"] == expected_voicing["notes"], \
                f"Group {group_idx}, position {pos_idx}: expected notes {expected_voicing['notes']}, got {voicing['notes']}"

            # Check inversion
            assert voicing["inversion"] == expected_voicing["inversion"], \
                f"Group {group_idx}, position {pos_idx}: expected inversion {expected_voicing['inversion']}, got {voicing['inversion']}"


def test_c_major_position_0_includes_open_strings():
    """
    Test that C major Position 0 includes the open string voicing [0, 1, 0] in Group 3.
    This is critical - C major's lowest position should use open strings.
    """
    triad_pcs = build_major_triad('C')
    fretboard = build_fretboard()

    string_groups = [
        [0, 1, 2],  # Group 0: Strings 6-5-4
        [1, 2, 3],  # Group 1: Strings 5-4-3
        [2, 3, 4],  # Group 2: Strings 4-3-2
        [3, 4, 5],  # Group 3: Strings 3-2-1
    ]

    all_group_voicings = []
    for sg in string_groups:
        voicings = find_all_triad_voicings(triad_pcs, sg, fretboard)
        all_group_voicings.append(voicings)

    selected = select_4_positions_coordinated(all_group_voicings, triad_pcs)

    # Group 3, Position 0 should be the open position [0, 1, 0]
    group3_pos0 = selected[3][0]
    assert group3_pos0["frets"] == [0, 1, 0], \
        f"Group 3 Position 0 should be open position [0, 1, 0], got {group3_pos0['frets']}"
    assert group3_pos0["notes"] == [7, 0, 4], \
        f"Group 3 Position 0 should be [G, C, E], got {group3_pos0['notes']}"


def test_c_major_position_0_is_lowest():
    """
    Test that Position 0 voicings have the lowest average frets for C major.
    """
    triad_pcs = build_major_triad('C')
    fretboard = build_fretboard()

    string_groups = [
        [0, 1, 2],  # Group 0: Strings 6-5-4
        [1, 2, 3],  # Group 1: Strings 5-4-3
        [2, 3, 4],  # Group 2: Strings 4-3-2
        [3, 4, 5],  # Group 3: Strings 3-2-1
    ]

    all_group_voicings = []
    for sg in string_groups:
        voicings = find_all_triad_voicings(triad_pcs, sg, fretboard)
        all_group_voicings.append(voicings)

    selected = select_4_positions_coordinated(all_group_voicings, triad_pcs)

    # For each group, Position 0 should have lower avg_fret than Position 3
    for group_idx, group_voicings in enumerate(selected):
        pos0_avg = group_voicings[0]["avg_fret"]
        pos3_avg = group_voicings[3]["avg_fret"]

        assert pos0_avg < pos3_avg, \
            f"Group {group_idx}: Position 0 (avg={pos0_avg:.1f}) should be lower than Position 3 (avg={pos3_avg:.1f})"


def test_c_major_no_frets_above_18():
    """
    Test that no C major voicing uses frets above 18.
    This ensures compatibility with the frontend sound system (0-18 only).
    """
    triad_pcs = build_major_triad('C')
    fretboard = build_fretboard()

    string_groups = [
        [0, 1, 2],  # Group 0: Strings 6-5-4
        [1, 2, 3],  # Group 1: Strings 5-4-3
        [2, 3, 4],  # Group 2: Strings 4-3-2
        [3, 4, 5],  # Group 3: Strings 3-2-1
    ]

    all_group_voicings = []
    for sg in string_groups:
        voicings = find_all_triad_voicings(triad_pcs, sg, fretboard)
        all_group_voicings.append(voicings)

    selected = select_4_positions_coordinated(all_group_voicings, triad_pcs)

    # Check all voicings
    for group_idx, group_voicings in enumerate(selected):
        for voicing in group_voicings:
            for fret in voicing["frets"]:
                assert 0 <= fret <= 18, \
                    f"Group {group_idx}, Position {voicing['position']}: fret {fret} exceeds limit (0-18)"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
