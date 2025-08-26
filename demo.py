#!/usr/bin/env python3
"""
Demo the interactive UI flow
"""
import time
import os

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def show_state(mode, note, target, show_key=False, show_position=False, show_shape=False):
    clear()
    print("=" * 50)
    print("GUITAR SCALE PRACTICE")
    print("=" * 50)
    print(f"\nChallenge: {mode} mode | Note: {note} | Target fret: {target}")
    print("\nControls:")
    print("  [k] Show key    [p] Show position    [s] Show shape")
    print("  [Enter] New challenge    [q] Quit")
    
    if show_key:
        print(f"\nKey: You are playing in the key of C")
    
    if show_position:
        print(f"\nPosition: 3rd string (D), 5th fret")
    
    if show_shape:
        print(f"\nShape: YYZZXX")
        print("\n3NPS/XYZ layout (low→high):")
        print("  6(E): Y @ 3  5(A): Y @ 3  4(D): Z @ 2")
        print("  3(G): Z @ 2  2(B): X @ 1  1(E): X @ 1")
    
    if show_key or show_position or show_shape:
        answers = []
        if show_key: answers.append("key")
        if show_position: answers.append("position")
        if show_shape: answers.append("shape")
        print(f"\n{'─' * 30}")
        print(f"Showing: {', '.join(answers)}")
    
    print(f"\n{'─' * 50}")

def demo():
    print("INTERACTIVE UI DEMO")
    print("=" * 50)
    print("\nThis demo shows the UI flow. In the real app,")
    print("it waits for your input and updates dynamically.\n")
    input("Press Enter to start demo...")
    
    # Initial state
    show_state("Locrian", "D", 17)
    print("\nUser presses 'k' to reveal key...")
    time.sleep(2)
    
    # Show key
    show_state("Locrian", "D", 17, show_key=True)
    print("\nUser presses 'p' to reveal position...")
    time.sleep(2)
    
    # Show key and position
    show_state("Locrian", "D", 17, show_key=True, show_position=True)
    print("\nUser presses 's' to reveal shape...")
    time.sleep(2)
    
    # Show all
    show_state("Locrian", "D", 17, show_key=True, show_position=True, show_shape=True)
    print("\nUser presses 'k' to toggle key off...")
    time.sleep(2)
    
    # Hide key
    show_state("Locrian", "D", 17, show_position=True, show_shape=True)
    print("\nUser presses Enter for next challenge...")
    time.sleep(2)
    
    # New challenge
    show_state("Mixolydian", "A#", 8)
    print("\nDemo complete!")

if __name__ == "__main__":
    demo()