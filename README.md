# Guitar Scale Practice

Console app for drilling guitar scales with 3NPS patterns.

![console app](./docs/guitar.png)

## Usage

```bash
python main.py
```

Shows random mode + note + target fret, then reveals:
1. Best string/fret position near target
2. Parent major key

Optional flags:
- `--seed N` - reproducible sequences  
- `--debug` - show pitch calculations
- `--show-xyz` - Show 3NPS XYZ layout after Answer 1
- `--emit-json` - Output JSON data for UI integration

Press Space/Enter to reveal answers. Y/n to continue.