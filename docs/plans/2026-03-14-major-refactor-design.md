# Major Refactor Design - 2026-03-14

## Overview

Comprehensive improvement covering: correct enharmonic note naming, Circle of Fifths module, UI restructuring with tab navigation, data persistence, and performance optimization.

## 1. Note Name System Refactor (musicTheory.js)

### Data Model
Note = `{ letter: 'A'-'G', accidental: -2..+2 }`
- accidental: -2=bb, -1=b, 0=natural, +1=#, +2=x

### Letter-to-semitone base mapping
C=0, D=2, E=4, F=5, G=7, A=9, B=11

### Interval derivation rules
1. Interval = (degree, semitones). degree determines target letter, semitones determine accidental.
2. Target letter = root letter + (degree - 1) steps in A-G cycle
3. Natural semitones from root letter to target letter (mod 12)
4. Required accidental = desired semitones - natural semitones + root accidental

### API
- `Note` type: { letter, accidental }
- `parseNote(str)` -> Note (e.g. "Bb" -> {letter:'B', accidental:-1})
- `formatNote(note)` -> string (e.g. "Bb", "Fx")
- `noteToSemitone(note)` -> 0-11
- `intervalNote(root: Note, degree, semitones, direction)` -> Note
- `semitonesBetween(a: Note, b: Note)` -> number
- Backward compat: keep NOTES array for fretboard (display-only)

## 2. Circle of Fifths Module

### Data (circleOfFifths.js)
- 12 positions in fifths order: C, G, D, A, E, B, F#/Gb, Db, Ab, Eb, Bb, F
- Each position: { major, minor, sharps, flats, keySignature[] }
- Enharmonic pairs: B/Cb, F#/Gb, C#/Db

### SVG View (CircleOfFifthsView.jsx)
- Outer ring: major keys
- Inner ring: relative minor keys
- Center: question prompt / key signature display
- Click sectors to answer

### Practice Modes
1. Key signature -> Key name (e.g. "3#" -> click "A")
2. Key name -> Key signature count (button options, not circle click)
3. Major -> Relative minor (click inner ring)
4. Find dominant(V) / subdominant(IV) (click outer ring)

## 3. UI Restructuring

### Bottom Tab Navigation
Three tabs: `Intervals` | `Circle of 5ths` | `Fretboard`
- Persistent bottom bar, tab icons + labels
- Each tab has its own view component
- Shared score display in top bar

### Mode Selection (Intervals tab)
- Replace 14-button horizontal scroll with dropdown/select grouped by:
  - Single modes (mode1-10)
  - Mix modes (mixA, mixB, mixC, full)
- Descending toggle stays in intervals tab header

## 4. Data Persistence (storage.js)

### localStorage schema
```json
{
  "stats": {
    "mode1": { "correct": 10, "total": 15, "lastPlayed": "2026-03-14" },
    ...
  },
  "bestStreak": 12,
  "totalSessions": 5
}
```

### Stats panel
- Per-mode accuracy bars
- Weak spot identification
- Reset button

## 5. Performance Optimization

- React.memo on OptionButton, QuestionCard, HUD
- Module-level constants for DOT_FILL, DOT_STROKE in FretboardView
- useMemo for correctPositions/correctKeys
- Audio: limit concurrent nodes (max 4-6), stop oldest on new play
- Evaluate framer-motion replacement with CSS transitions (deferred)

## Implementation Order

1. **Phase 1**: musicTheory.js rewrite (foundation)
2. **Phase 2**: Update questionGenerator.js to use new note system
3. **Phase 3**: Update QuestionCard + existing components
4. **Phase 4**: UI restructure (Tab navigation + mode dropdown)
5. **Phase 5**: Circle of Fifths module
6. **Phase 6**: Data persistence + stats
7. **Phase 7**: Performance optimization
8. **Phase 8**: FretboardView updates for new note system
