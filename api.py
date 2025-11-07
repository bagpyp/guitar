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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
