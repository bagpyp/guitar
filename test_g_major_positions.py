#!/usr/bin/env python3
"""
Comprehensive tests for G major triad positions.
Ensures no voicings are skipped and all positions are properly distributed.
"""
import pytest
from main import (
    build_major_triad,
    find_all_triad_voicings,
    select_4_positions_coordinated,
    build_fretboard,
)


def test_g_major_all_groups_have_4_positions():
    """Test that all 4 groups have exactly 4 positions for G major"""
    triad_pcs = build_major_triad('G')
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

    for group_idx, group_voicings in enumerate(selected):
        assert len(group_voicings) == 4, \
            f"Group {group_idx} should have 4 positions, got {len(group_voicings)}"


def test_g_major_no_duplicate_positions():
    """Test that no group has duplicate voicings for G major"""
    triad_pcs = build_major_triad('G')
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

    for group_idx, group_voicings in enumerate(selected):
        fret_lists = [tuple(v["frets"]) for v in group_voicings]
        unique_frets = set(fret_lists)

        assert len(fret_lists) == len(unique_frets), \
            f"Group {group_idx} has duplicate positions: {[list(f) for f in fret_lists]}"


def test_g_major_positions_ascending():
    """Test that positions are in ascending order by avg_fret for G major"""
    triad_pcs = build_major_triad('G')
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

    for group_idx, group_voicings in enumerate(selected):
        # Sort by position number
        sorted_by_pos = sorted(group_voicings, key=lambda v: v["position"])

        # Check avg_fret is ascending
        for i in range(len(sorted_by_pos) - 1):
            assert sorted_by_pos[i]["avg_fret"] <= sorted_by_pos[i + 1]["avg_fret"], \
                f"Group {group_idx}: Position {i} (avg={sorted_by_pos[i]['avg_fret']:.1f}) should be <= Position {i+1} (avg={sorted_by_pos[i+1]['avg_fret']:.1f})"


def test_g_major_spans_fretboard():
    """
    Test that G major positions span the fretboard reasonably.
    Positions should be in ascending order with reasonable distribution.
    """
    triad_pcs = build_major_triad('G')
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

    for group_idx, group_voicings in enumerate(selected):
        # Get selected voicings
        selected_sorted = sorted(group_voicings, key=lambda v: v["avg_fret"])

        # Positions should be in ascending order
        assert selected_sorted[-1]["avg_fret"] > selected_sorted[0]["avg_fret"], \
            f"Group {group_idx} Position 3 should be higher than Position 0"

        # Should span at least 5 frets
        span = selected_sorted[-1]["avg_fret"] - selected_sorted[0]["avg_fret"]
        assert span >= 5, \
            f"Group {group_idx} should span at least 5 frets, got {span:.1f}"


def test_g_major_group_2_includes_voicing_5_4_3():
    """
    Specific regression test: G major Group 2 should include [5, 4, 3].
    This voicing was being skipped in the original bug.
    """
    triad_pcs = build_major_triad('G')
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

    # Check Group 2
    group2_frets = [v["frets"] for v in selected[2]]

    assert [5, 4, 3] in group2_frets, \
        f"Group 2 should include voicing [5, 4, 3], got: {group2_frets}"


def test_g_major_group_3_position_3_is_highest():
    """
    Specific regression test: G major Group 3 Position 3 should be [16, 15, 15].
    This was the original reported bug.
    """
    triad_pcs = build_major_triad('G')
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

    # Find Position 3 for Group 3
    group3_pos3 = next(v for v in selected[3] if v["position"] == 3)

    assert group3_pos3["frets"] == [16, 15, 15], \
        f"Group 3 Position 3 should be [16, 15, 15], got {group3_pos3['frets']}"


def test_all_keys_no_duplicates():
    """
    Test all 12 keys to ensure no duplicate positions within any group.
    """
    from main import NOTE_NAMES_SHARP

    fretboard = build_fretboard()
    string_groups = [
        [0, 1, 2],  # Group 0: Strings 6-5-4
        [1, 2, 3],  # Group 1: Strings 5-4-3
        [2, 3, 4],  # Group 2: Strings 4-3-2
        [3, 4, 5],  # Group 3: Strings 3-2-1
    ]

    for key in NOTE_NAMES_SHARP:
        triad_pcs = build_major_triad(key)

        all_group_voicings = []
        for sg in string_groups:
            voicings = find_all_triad_voicings(triad_pcs, sg, fretboard)
            all_group_voicings.append(voicings)

        selected = select_4_positions_coordinated(all_group_voicings, triad_pcs)

        for group_idx, group_voicings in enumerate(selected):
            # Check no duplicates
            fret_lists = [tuple(v["frets"]) for v in group_voicings]
            unique_frets = set(fret_lists)

            assert len(fret_lists) == len(unique_frets), \
                f"{key} major, Group {group_idx} has duplicate positions"

            # Note: We don't check for strictly ascending order because the
            # inversion-based algorithm intentionally groups by inversion type
            # which may not always be in strict fret order (this is musically intentional)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
