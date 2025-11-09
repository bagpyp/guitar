#!/usr/bin/env python3
"""
INTEGRATION TESTS - DO NOT MODIFY THESE ASSERTIONS

These tests lock in the exact voicing positions for C and G major.
They represent the correct, working behavior that users depend on.

⚠️  NEVER EVER CHANGE THESE TESTS ⚠️

If these tests fail, the algorithm is broken. Fix the algorithm, not the tests.
"""
import pytest
from main import (
    build_major_triad,
    find_all_triad_voicings,
    select_4_positions_coordinated,
    build_fretboard,
)


def test_c_major_integration_all_positions():
    """
    ⚠️  DO NOT MODIFY ⚠️

    Integration test for C major - locks in EXACT positions for all 4 groups.
    This represents the known-good, working state.
    """
    triad_pcs = build_major_triad('C')
    fretboard = build_fretboard()
    string_groups = [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]]

    all_group_voicings = []
    for sg in string_groups:
        voicings = find_all_triad_voicings(triad_pcs, sg, fretboard)
        all_group_voicings.append(voicings)

    selected = select_4_positions_coordinated(all_group_voicings, triad_pcs)

    # EXACT expected voicings - DO NOT CHANGE
    expected = [
        # Group 0 (E-A-D)
        [
            {"position": 0, "frets": [3, 3, 2], "notes": [7, 0, 4]},
            {"position": 1, "frets": [8, 7, 5], "notes": [0, 4, 7]},
            {"position": 2, "frets": [12, 10, 10], "notes": [4, 7, 0]},
            {"position": 3, "frets": [15, 15, 14], "notes": [7, 0, 4]},
        ],
        # Group 1 (A-D-G)
        [
            {"position": 0, "frets": [3, 2, 0], "notes": [0, 4, 7]},
            {"position": 1, "frets": [7, 5, 5], "notes": [4, 7, 0]},
            {"position": 2, "frets": [10, 10, 9], "notes": [7, 0, 4]},
            {"position": 3, "frets": [15, 14, 12], "notes": [0, 4, 7]},
        ],
        # Group 2 (D-G-B)
        [
            {"position": 0, "frets": [2, 0, 1], "notes": [4, 7, 0]},
            {"position": 1, "frets": [5, 5, 5], "notes": [7, 0, 4]},
            {"position": 2, "frets": [10, 9, 8], "notes": [0, 4, 7]},
            {"position": 3, "frets": [14, 12, 13], "notes": [4, 7, 0]},
        ],
        # Group 3 (G-B-E)
        [
            {"position": 0, "frets": [0, 1, 0], "notes": [7, 0, 4]},
            {"position": 1, "frets": [5, 5, 3], "notes": [0, 4, 7]},
            {"position": 2, "frets": [9, 8, 8], "notes": [4, 7, 0]},
            {"position": 3, "frets": [12, 13, 12], "notes": [7, 0, 4]},
        ],
    ]

    # Verify exact match
    for group_idx in range(4):
        for pos_idx in range(4):
            actual = selected[group_idx][pos_idx]
            expected_voicing = expected[group_idx][pos_idx]

            assert actual["position"] == expected_voicing["position"], \
                f"C major Group {group_idx} Position {pos_idx}: wrong position number"

            assert actual["frets"] == expected_voicing["frets"], \
                f"C major Group {group_idx} Position {pos_idx}: expected frets {expected_voicing['frets']}, got {actual['frets']}"

            assert actual["notes"] == expected_voicing["notes"], \
                f"C major Group {group_idx} Position {pos_idx}: expected notes {expected_voicing['notes']}, got {actual['notes']}"


def test_g_major_integration_group_0_and_3():
    """
    ⚠️  DO NOT MODIFY ⚠️

    Integration test for G major Groups 0 (E-A-D) and 3 (G-B-E).
    These groups work correctly and should never change.
    """
    triad_pcs = build_major_triad('G')
    fretboard = build_fretboard()
    string_groups = [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]]

    all_group_voicings = []
    for sg in string_groups:
        voicings = find_all_triad_voicings(triad_pcs, sg, fretboard)
        all_group_voicings.append(voicings)

    selected = select_4_positions_coordinated(all_group_voicings, triad_pcs)

    # EXACT expected voicings for Groups 0 and 3 - DO NOT CHANGE
    expected = {
        0: [  # Group 0 (E-A-D)
            {"position": 0, "frets": [3, 2, 0], "notes": [7, 11, 2]},
            {"position": 1, "frets": [7, 5, 5], "notes": [11, 2, 7]},
            {"position": 2, "frets": [10, 10, 9], "notes": [2, 7, 11]},
            {"position": 3, "frets": [15, 14, 12], "notes": [7, 11, 2]},
        ],
        3: [  # Group 3 (G-B-E)
            {"position": 0, "frets": [4, 3, 3], "notes": [11, 2, 7]},
            {"position": 1, "frets": [7, 8, 7], "notes": [2, 7, 11]},
            {"position": 2, "frets": [12, 12, 10], "notes": [7, 11, 2]},
            {"position": 3, "frets": [16, 15, 15], "notes": [11, 2, 7]},
        ],
    }

    # Verify Groups 0 and 3
    for group_idx in [0, 3]:
        for pos_idx in range(4):
            actual = selected[group_idx][pos_idx]
            expected_voicing = expected[group_idx][pos_idx]

            assert actual["position"] == expected_voicing["position"], \
                f"G major Group {group_idx} Position {pos_idx}: wrong position number"

            assert actual["frets"] == expected_voicing["frets"], \
                f"G major Group {group_idx} Position {pos_idx}: expected frets {expected_voicing['frets']}, got {actual['frets']}"

            assert actual["notes"] == expected_voicing["notes"], \
                f"G major Group {group_idx} Position {pos_idx}: expected notes {expected_voicing['notes']}, got {actual['notes']}"


def test_g_major_group_2_position_0_must_be_open_strings():
    """
    G major Group 2 (D-G-B) Position 0 MUST be [0, 0, 0] - all open strings.

    This is the lowest possible voicing for this group and uses the open D, G, B strings
    which form a G major triad (G=root, B=3rd, D=5th).

    Currently BROKEN: Returns [5, 4, 3] instead of [0, 0, 0]
    """
    triad_pcs = build_major_triad('G')
    fretboard = build_fretboard()
    string_groups = [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]]

    all_group_voicings = []
    for sg in string_groups:
        voicings = find_all_triad_voicings(triad_pcs, sg, fretboard)
        all_group_voicings.append(voicings)

    selected = select_4_positions_coordinated(all_group_voicings, triad_pcs)

    # Group 2 Position 0
    group2_pos0 = selected[2][0]

    assert group2_pos0["frets"] == [0, 0, 0], \
        f"G major Group 2 Position 0 MUST be [0, 0, 0] (all open), got {group2_pos0['frets']}"

    assert group2_pos0["notes"] == [2, 7, 11], \
        f"G major Group 2 Position 0 should be [D, G, B], got {group2_pos0['notes']}"


def test_g_major_group_1_position_1_must_be_5_5_4():
    """
    G major Group 1 (A-D-G) Position 1 MUST be [5, 5, 4].

    This is an important mid-range voicing that should not be skipped.

    Currently BROKEN: Returns [10, 9, 7] instead of [5, 5, 4]
    """
    triad_pcs = build_major_triad('G')
    fretboard = build_fretboard()
    string_groups = [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]]

    all_group_voicings = []
    for sg in string_groups:
        voicings = find_all_triad_voicings(triad_pcs, sg, fretboard)
        all_group_voicings.append(voicings)

    selected = select_4_positions_coordinated(all_group_voicings, triad_pcs)

    # Find Position 1 in Group 1
    group1_pos1 = next(v for v in selected[1] if v["position"] == 1)

    assert group1_pos1["frets"] == [5, 5, 4], \
        f"G major Group 1 Position 1 MUST be [5, 5, 4], got {group1_pos1['frets']}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
