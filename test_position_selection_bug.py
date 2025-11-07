#!/usr/bin/env python3
"""
Test to expose bug in position selection for C major triads.

Expected: Positions should be distributed across fretboard, not skip mid-range voicings.
For C major on strings 3-2-1 (G-B-E), the C (root) should appear at:
  Position 0: around fret 1
  Position 1: around fret 5
  Position 2: around fret 8-9 (NOT skipped!)
  Position 3: around fret 13+
"""
import pytest
from main import (
    build_major_triad,
    find_all_triad_voicings,
    select_4_positions,
    build_fretboard,
)


def test_c_major_position_selection_includes_mid_frets():
    """
    Test that position selection doesn't skip voicings in the 8-9 fret range.

    Bug: Position 2 is currently skipping voicings around fret 8 and jumping to fret 13,
    because the range (8.5, 13.5) excludes avg_fret = 8.0.
    """
    fretboard = build_fretboard()
    triad_pcs = build_major_triad("C")  # [0, 4, 7] = C, E, G
    string_group = [3, 4, 5]  # Strings 3-2-1 (G, B, E)

    # Find all voicings
    all_voicings = find_all_triad_voicings(triad_pcs, string_group, fretboard)

    # Select 4 positions
    selected = select_4_positions(all_voicings)

    print("\n=== C Major on Strings 3-2-1 (G-B-E) ===")
    print(f"Total voicings found: {len(all_voicings)}")
    print(f"Selected positions: {len(selected)}")
    print()

    # For each selected voicing, find where the C (root) is
    root_positions = []
    for voicing in selected:
        position = voicing["position"]
        frets = voicing["frets"]
        notes = voicing["notes"]

        # Find which string has the C (root = 0)
        for string_idx, (fret, note) in enumerate(zip(frets, notes)):
            if note == 0:  # C is the root
                root_positions.append({
                    "position": position,
                    "string": string_idx,
                    "fret": fret,
                    "avg_fret": voicing["avg_fret"],
                    "all_frets": frets
                })
                print(f"Position {position}: C on string {string_idx}, fret {fret} "
                      f"(avg_fret={voicing['avg_fret']:.1f}, frets={frets})")
                break

    print("\n=== Expected vs Actual ===")
    print("Expected root (C) locations:")
    print("  Position 0: string 2, fret 1  (low, open position)")
    print("  Position 1: string 1, fret 5  (mid-low)")
    print("  Position 2: string 1, fret 8  (mid-high) ← CURRENTLY SKIPPED!")
    print("  Position 3: string 2, fret 13 (high)")
    print()
    print("Actual root (C) locations:")
    for rp in root_positions:
        print(f"  Position {rp['position']}: string {rp['string']}, fret {rp['fret']}")

    # Assertions
    assert len(selected) == 4, f"Should select 4 positions, got {len(selected)}"

    # Check that we have positions distributed across the fretboard
    avg_frets = [v["avg_fret"] for v in selected]
    print(f"\nAvg frets: {avg_frets}")

    # Position 0 should be low (< 6)
    assert avg_frets[0] < 6, f"Position 0 should be low frets, got {avg_frets[0]}"

    # Position 1 should be mid-low (4-9)
    assert 4 <= avg_frets[1] < 9, \
        f"Position 1 should be mid-low (4-9 frets), got {avg_frets[1]}"

    # Position 2 should be mid-high (7-12) - THIS IS THE BUG!
    # Currently it's probably around 13 instead of 8-9
    assert 7 <= avg_frets[2] < 12, \
        f"Position 2 should be mid-high (7-12 frets), got {avg_frets[2]}. " \
        f"BUG: Skipping voicings around fret 8!"

    # Position 3 should be high (> 11)
    assert avg_frets[3] > 11, f"Position 3 should be high frets, got {avg_frets[3]}"

    print("\n✓ All assertions passed!")


def test_position_ranges_dont_skip_voicings():
    """
    Test that position ranges have appropriate overlap to not skip voicings.

    If we have voicings at avg_frets: [2.0, 5.5, 8.0, 13.0, 17.0],
    we should select all of them for different positions, not skip the 8.0.
    """
    fretboard = build_fretboard()
    triad_pcs = build_major_triad("C")
    string_group = [3, 4, 5]

    all_voicings = find_all_triad_voicings(triad_pcs, string_group, fretboard)

    # Group voicings by avg_fret buckets
    low_frets = [v for v in all_voicings if v["avg_fret"] < 6]
    mid_low = [v for v in all_voicings if 5 <= v["avg_fret"] < 9]
    mid_high = [v for v in all_voicings if 8 <= v["avg_fret"] < 12]
    high_frets = [v for v in all_voicings if v["avg_fret"] >= 12]

    print(f"\n=== Voicing distribution ===")
    print(f"Low (0-6):     {len(low_frets)} voicings")
    print(f"Mid-low (5-9): {len(mid_low)} voicings")
    print(f"Mid-high (8-12): {len(mid_high)} voicings")
    print(f"High (12+):    {len(high_frets)} voicings")

    selected = select_4_positions(all_voicings)
    selected_avg_frets = [v["avg_fret"] for v in selected]

    print(f"\nSelected avg_frets: {[f'{x:.1f}' for x in selected_avg_frets]}")

    # We should have representation from mid-high range
    has_mid_high = any(8 <= v["avg_fret"] < 12 for v in selected)

    assert has_mid_high, \
        f"Selected positions should include mid-high range (8-12 frets), " \
        f"but only selected: {[f'{x:.1f}' for x in selected_avg_frets]}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
