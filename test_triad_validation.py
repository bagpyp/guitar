#!/usr/bin/env python3
"""
Tests to validate triad voicing correctness across all string groups.

Important: Adjacent string groups share 2 strings, so some notes will
appear in the same location on the fretboard. This is geometrically correct!
"""
import pytest
from main import (
    build_major_triad,
    find_all_triad_voicings,
    select_4_positions,
    build_fretboard,
    pc_to_sharp_name,
)


def test_all_voicings_contain_only_triad_notes():
    """Test that every voicing contains ONLY notes from the triad (no invalid notes)"""
    fretboard = build_fretboard()
    triad_pcs = build_major_triad("C")  # [0, 4, 7] = C, E, G
    triad_set = set(triad_pcs)

    string_groups = [
        [0, 1, 2],  # Strings 6-5-4 (E-A-D)
        [1, 2, 3],  # Strings 5-4-3 (A-D-G)
        [2, 3, 4],  # Strings 4-3-2 (D-G-B)
        [3, 4, 5],  # Strings 3-2-1 (G-B-E)
    ]

    for string_group in string_groups:
        all_voicings = find_all_triad_voicings(triad_pcs, string_group, fretboard)
        selected = select_4_positions(all_voicings)

        for voicing in selected:
            # Every note in the voicing must be in the triad
            for pc in voicing["notes"]:
                assert pc in triad_set, \
                    f"Found invalid note {pc_to_sharp_name(pc)} (pc={pc}) in voicing. " \
                    f"Triad is {[pc_to_sharp_name(p) for p in triad_pcs]}"


def test_all_voicings_have_three_unique_notes():
    """Test that every voicing has all 3 unique triad notes (root, 3rd, 5th)"""
    fretboard = build_fretboard()
    triad_pcs = build_major_triad("C")
    triad_set = set(triad_pcs)

    string_groups = [
        [0, 1, 2],
        [1, 2, 3],
        [2, 3, 4],
        [3, 4, 5],
    ]

    for string_group in string_groups:
        all_voicings = find_all_triad_voicings(triad_pcs, string_group, fretboard)
        selected = select_4_positions(all_voicings)

        for voicing in selected:
            note_set = set(voicing["notes"])
            assert note_set == triad_set, \
                f"Voicing {voicing['note_names']} has notes {note_set}, " \
                f"but should have exactly {triad_set}"


def test_adjacent_string_groups_share_two_strings():
    """
    Verify that adjacent string groups share 2 strings.
    This is why some notes appear in the same location - it's geometrically correct!
    """
    string_groups = [
        [0, 1, 2],  # Strings 6-5-4
        [1, 2, 3],  # Strings 5-4-3
        [2, 3, 4],  # Strings 4-3-2
        [3, 4, 5],  # Strings 3-2-1
    ]

    for i in range(len(string_groups) - 1):
        group1 = set(string_groups[i])
        group2 = set(string_groups[i + 1])
        shared = group1 & group2

        assert len(shared) == 2, \
            f"Groups {string_groups[i]} and {string_groups[i+1]} should share 2 strings, " \
            f"but share {len(shared)}: {shared}"


def test_c_major_voicing_notes_are_valid():
    """Detailed test: verify specific C major voicings on string group 3-2-1"""
    fretboard = build_fretboard()
    triad_pcs = build_major_triad("C")  # [0, 4, 7]
    string_group = [3, 4, 5]  # G-B-E

    all_voicings = find_all_triad_voicings(triad_pcs, string_group, fretboard)
    selected = select_4_positions(all_voicings)

    # With new inversion-based algorithm, position 0 may not be the absolute lowest
    # Just verify it's a valid triad with all 3 notes
    assert len(selected[0]["frets"]) == 3
    assert len(selected[0]["note_names"]) == 3
    assert set(selected[0]["notes"]) == {0, 4, 7}  # C, E, G

    # All positions should have all triad notes
    assert set(selected[1]["notes"]) == {0, 4, 7}
    assert set(selected[2]["notes"]) == {0, 4, 7}
    assert set(selected[3]["notes"]) == {0, 4, 7}

    # Positions should be distributed (P0 < P1 < P2 < P3)
    assert selected[0]["avg_fret"] < selected[1]["avg_fret"]
    assert selected[1]["avg_fret"] < selected[2]["avg_fret"]
    assert selected[2]["avg_fret"] < selected[3]["avg_fret"]


def test_all_keys_produce_valid_triads():
    """Test that all 12 keys produce valid major triads"""
    fretboard = build_fretboard()
    all_keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    string_group = [3, 4, 5]  # Test on one string group

    for key in all_keys:
        triad_pcs = build_major_triad(key)
        triad_set = set(triad_pcs)

        # Build triad should give us exactly 3 unique pitch classes
        assert len(triad_set) == 3, f"{key} major triad should have 3 unique notes"

        # Should be able to find voicings
        all_voicings = find_all_triad_voicings(triad_pcs, string_group, fretboard)
        assert len(all_voicings) > 0, f"Should find voicings for {key} major"

        # All voicings should contain only triad notes
        for voicing in all_voicings:
            assert set(voicing["notes"]) == triad_set, \
                f"{key} major voicing contains invalid notes"


def test_position_labels_are_sequential():
    """Test that selected positions are labeled 0, 1, 2, 3 in order"""
    fretboard = build_fretboard()
    triad_pcs = build_major_triad("C")
    string_group = [3, 4, 5]

    all_voicings = find_all_triad_voicings(triad_pcs, string_group, fretboard)
    selected = select_4_positions(all_voicings)

    # Should have positions 0, 1, 2, 3
    positions = [v["position"] for v in selected]
    assert positions == [0, 1, 2, 3], \
        f"Positions should be [0, 1, 2, 3], got {positions}"


def test_shared_string_voicings_can_overlap():
    """
    Test that string groups 4-3-2 and 3-2-1 can have the same notes
    on their shared strings (3 and 4). This is correct behavior!
    """
    fretboard = build_fretboard()
    triad_pcs = build_major_triad("C")

    # Get voicings for both groups
    group_432 = [2, 3, 4]  # D-G-B
    group_321 = [3, 4, 5]  # G-B-E

    voicings_432 = select_4_positions(
        find_all_triad_voicings(triad_pcs, group_432, fretboard)
    )
    voicings_321 = select_4_positions(
        find_all_triad_voicings(triad_pcs, group_321, fretboard)
    )

    # Shared strings are indices 3 and 4 (G and B)
    # It's OK if they have the same notes at the same frets - that's geometry!
    # Just verify that when they do overlap, the notes are still valid triad notes

    for v432 in voicings_432:
        for v321 in voicings_321:
            # If string 3 (G) has the same fret in both voicings
            if v432["frets"][1] == v321["frets"][0]:  # String 3 in both
                note_432 = v432["notes"][1]
                note_321 = v321["notes"][0]
                # They should be the same note (since same string, same fret)
                assert note_432 == note_321, \
                    "Same string, same fret should produce same note"
                # And it should be a valid triad note
                assert note_432 in triad_pcs, "Shared note must be in triad"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
