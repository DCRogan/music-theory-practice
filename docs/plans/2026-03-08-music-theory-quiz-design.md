# Music Theory Quiz App — Design Document

Date: 2026-03-08

## Overview

A React (Vite) single-page application for practicing music theory through multiple-choice quizzes. The aesthetic direction is "深夜琴房" — dark, immersive, with piano-key contrast (deep black + warm ivory accents), purposeful animations, and a ritual-like practice feel.

---

## Core Music Theory Data

### Twelve-Tone Chromatic Scale (index 0–11)
```
["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
```

### Semitone → Interval Name (0–12)
```
0  → 纯一度
1  → 小二度
2  → 大二度
3  → 小三度
4  → 大三度
5  → 纯四度
6  → 增四度/减五度
7  → 纯五度
8  → 小六度
9  → 大六度
10 → 小七度
11 → 大七度
12 → 纯八度
```

### Solfège → Semitones (natural major scale)
```
1 → 0,  2 → 2,  3 → 4,  4 → 5,  5 → 7,  6 → 9,  7 → 11
```

### Core Formula
```
targetIndex = (rootIndex + semitones) % 12
semitones   = (targetIndex - rootIndex + 12) % 12
```

---

## Quiz Modes (9 total)

### 6 Individual Modes
| # | Given | Answer |
|---|-------|--------|
| 1 | Root note + Interval name | Target note |
| 2 | Root note + Solfège (1–7) | Target note |
| 3 | Root note + Semitone count (1–12) | Target note |
| 4 | Two notes | Interval name |
| 5 | Two notes | Solfège |
| 6 | Two notes | Semitone count |

> Note: Mode 5 only generates questions where the semitone distance matches a natural major scale degree (0,2,4,5,7,9,11).

### 2 Mixed Modes
| # | Included modes |
|---|---------------|
| 混合A | Modes 1 + 2 + 3 (root given, vary answer type) |
| 混合B | Modes 4 + 5 + 6 (two notes given, vary answer type) |

### 1 Full Random Mode
- All 6 individual modes, equally weighted random selection.

---

## Interaction Flow

### Answer Correct
1. Selected option highlights green immediately.
2. Auto-advance to next question after 0.8s.

### Answer Wrong
1. Selected option highlights red immediately.
2. Correct option highlights with a pulsing gold indicator ("点击此处继续").
3. User must click the correct option to advance.
4. No auto-advance — requires deliberate action to reinforce memory.

### Score Tracking
- Correct count, total attempted, current streak displayed in HUD.
- Streak resets on wrong answer.

---

## UI Architecture

### Single Page Layout
```
┌─────────────────────────────────────┐
│  HUD: Mode selector | Score | Streak │
├─────────────────────────────────────┤
│                                     │
│         Question Area               │
│    (root note + condition)          │
│                                     │
├─────────────────────────────────────┤
│   [Option A]        [Option B]      │
│   [Option C]        [Option D]      │
└─────────────────────────────────────┘
```

### Component Tree
```
App
├── HUD
│   ├── ModeSelector (9 modes, tab/dropdown)
│   └── ScoreBoard (correct / total / streak)
├── QuestionCard
│   ├── QuestionDisplay (root + condition)
│   └── AnswerGrid (4 × OptionButton)
└── musicTheory.js  (pure logic, no React)
```

---

## Visual Design

### Aesthetic: "深夜琴房"
- **Background**: Near-black (#0d0d0d) with subtle noise texture
- **Primary accent**: Warm ivory (#f5f0e8)
- **Correct**: Muted gold-green (#7eb87e)
- **Wrong**: Deep crimson (#c0524a)
- **Prompt accent**: Amber (#e8a838)
- **Font display**: A distinctive serif or slab (e.g., "Playfair Display") for question root notes
- **Font UI**: Monospace-adjacent for numbers/note names; clean sans for labels

### Key Motion Details
- Page load: staggered fade-in of HUD → QuestionCard → AnswerGrid
- Option buttons: subtle lift on hover (translateY -2px + shadow)
- Wrong answer: short horizontal shake on clicked button
- Correct answer: soft scale-up pulse before auto-advance
- Mode switch: cross-fade transition on QuestionCard

---

## File Structure (Vite + React)
```
src/
├── main.jsx
├── App.jsx
├── components/
│   ├── HUD.jsx
│   ├── ModeSelector.jsx
│   ├── ScoreBoard.jsx
│   ├── QuestionCard.jsx
│   └── OptionButton.jsx
├── logic/
│   ├── musicTheory.js     # data + pure functions
│   └── questionGenerator.js  # question + option generation per mode
└── styles/
    └── index.css          # CSS variables + global styles
```

---

## Question Generator Logic

### Generate Question (any mode)
1. Pick random root note (index 0–11).
2. Pick random condition based on mode.
3. Compute correct answer via core formula.
4. Generate 3 wrong options from the same answer pool, distinct from correct.
5. Shuffle all 4 options.

### Wrong Option Strategy
- For note answers: pick 3 random other notes from chromatic scale.
- For interval/solfège/semitone answers: pick adjacent ±1 values as first distractors (harder), then fill remainder randomly. This maximizes learning difficulty.

---

## Mobile Support
- Fully responsive, mobile-first layout
- Mode selector collapses to a scrollable pill row on small screens
- Answer grid: 2×2 on mobile, same on desktop (already fits)
- Touch-friendly tap targets (min 48×48px)
- Font sizes scale with viewport (clamp())

## Out of Scope (v1)
- Flat (♭) note names — use sharps only
- Audio playback
- User accounts / persistence
