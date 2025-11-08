#!/usr/bin/env python3
"""
FastAPI server for Guitar Scale Practice
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from typing import List, Dict

from main import (
    build_fretboard,
    find_best_position,
    parent_major,
    get_xyz_display_string,
    plan_xyz_positions,
    string_index_to_ordinal,
    build_major_triad,
    find_all_triad_voicings,
    select_4_positions,
    MODES,
    NOTE_NAMES_SHARP,
    STRING_NAMES,
)

app = FastAPI(title="Guitar Scale Practice API")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Build fretboard once at startup
fretboard = build_fretboard()


class Challenge(BaseModel):
    mode: str
    note: str
    targetFret: int


class Position(BaseModel):
    stringIndex: int
    stringName: str
    fret: int
    distance: int


class XYZPosition(BaseModel):
    stringIndex: int
    fret: int
    symbol: str


class Answer(BaseModel):
    key: str
    position: Position
    xyzPattern: str
    xyzLayout: List[XYZPosition]


# Triad-related models
class TriadVoicing(BaseModel):
    position: int  # 0, 1, 2, or 3
    strings: List[int]  # [low_string_idx, mid_string_idx, high_string_idx]
    frets: List[int]  # [fret1, fret2, fret3]
    notes: List[int]  # [pc1, pc2, pc3] - pitch classes
    noteNames: List[str]  # ["C", "E", "G"]
    inversion: str  # "root", "first", or "second"
    avgFret: float


class StringGroupTriads(BaseModel):
    strings: List[int]  # e.g., [0, 1, 2] for strings 6-5-4
    stringNames: List[str]  # e.g., ["E", "A", "D"]
    voicings: List[TriadVoicing]  # 4 voicings (positions 0-3)


class TriadsResponse(BaseModel):
    key: str  # e.g., "C"
    triadNotes: List[str]  # ["C", "E", "G"]
    stringGroups: List[StringGroupTriads]  # 4 string groups


@app.get("/")
def root():
    return {"message": "Guitar Scale Practice API", "docs": "/docs"}


@app.get("/api/challenge")
def generate_challenge(seed: int = None) -> Challenge:
    """Generate a random scale practice challenge"""
    if seed is not None:
        random.seed(seed)

    mode = random.choice(MODES)
    note = random.choice(NOTE_NAMES_SHARP)
    target_fret = random.randint(1, 12)

    return Challenge(mode=mode, note=note, targetFret=target_fret)


@app.post("/api/answer")
def get_answer(challenge: Challenge) -> Answer:
    """Get the answer for a given challenge"""
    mode = challenge.mode
    note = challenge.note
    target_fret = challenge.targetFret

    # Find best position
    string_idx, open_string_name, best_fret = find_best_position(
        note, target_fret, fretboard
    )

    position = Position(
        stringIndex=string_idx,
        stringName=open_string_name,
        fret=best_fret,
        distance=abs(best_fret - target_fret)
    )

    # Get parent key
    key = parent_major(mode, note)

    # Get XYZ pattern
    xyz_pattern = get_xyz_display_string(mode)

    # Get XYZ layout
    positions = plan_xyz_positions(mode, string_idx, best_fret)
    xyz_layout = [
        XYZPosition(
            stringIndex=pos[0],
            fret=pos[1],
            symbol=pos[2]
        )
        for pos in positions
    ]

    return Answer(
        key=key,
        position=position,
        xyzPattern=xyz_pattern,
        xyzLayout=xyz_layout
    )


@app.get("/api/modes")
def get_modes() -> List[str]:
    """Get list of all available modes"""
    return list(MODES)


@app.get("/api/notes")
def get_notes() -> List[str]:
    """Get list of all note names"""
    return NOTE_NAMES_SHARP


@app.get("/api/triads/{key}")
def get_triads(key: str) -> TriadsResponse:
    """
    Get all major triad voicings for a given key.
    Returns 4 string groups, each with 4 voicings (positions 0-3).

    Args:
        key: Root note name (e.g., "C", "D#", "F")

    Returns:
        TriadsResponse with 16 total voicings (4 string groups × 4 positions)
    """
    # Validate key
    if key not in NOTE_NAMES_SHARP:
        return {"error": f"Invalid key: {key}. Must be one of {NOTE_NAMES_SHARP}"}

    # Build the triad
    triad_pcs = build_major_triad(key)
    from main import pc_to_sharp_name
    triad_note_names = [pc_to_sharp_name(pc) for pc in triad_pcs]

    # Define the 4 string groups (adjacent 3-string sets)
    # String indices: 0=6th(E), 1=5th(A), 2=4th(D), 3=3rd(G), 4=2nd(B), 5=1st(E)
    string_groups_data = [
        [0, 1, 2],  # Strings 6-5-4 (E-A-D)
        [1, 2, 3],  # Strings 5-4-3 (A-D-G)
        [2, 3, 4],  # Strings 4-3-2 (D-G-B)
        [3, 4, 5],  # Strings 3-2-1 (G-B-E)
    ]

    # Find all voicings for all groups first (for coordination)
    all_group_voicings = []
    for string_group_indices in string_groups_data:
        all_voicings = find_all_triad_voicings(triad_pcs, string_group_indices, fretboard)
        all_group_voicings.append(all_voicings)

    # Select positions using coordinated algorithm
    from main import select_4_positions_coordinated
    selected_by_group = select_4_positions_coordinated(all_group_voicings, triad_pcs)

    string_groups_result = []

    for group_idx, string_group_indices in enumerate(string_groups_data):
        # Get string names for this group
        group_string_names = [STRING_NAMES[idx] for idx in string_group_indices]

        # Get the selected voicings for this group
        selected_voicings = selected_by_group[group_idx]

        # Convert to Pydantic models
        voicing_models = [
            TriadVoicing(
                position=v["position"],
                strings=v["strings"],
                frets=v["frets"],
                notes=v["notes"],
                noteNames=v["note_names"],
                inversion=v["inversion"],
                avgFret=v["avg_fret"]
            )
            for v in selected_voicings
        ]

        string_groups_result.append(
            StringGroupTriads(
                strings=string_group_indices,
                stringNames=group_string_names,
                voicings=voicing_models
            )
        )

    return TriadsResponse(
        key=key,
        triadNotes=triad_note_names,
        stringGroups=string_groups_result
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
