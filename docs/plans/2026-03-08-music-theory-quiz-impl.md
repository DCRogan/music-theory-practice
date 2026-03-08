# Music Theory Quiz App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Vite + React music theory quiz app with 9 modes, "深夜琴房" dark aesthetic, mobile-responsive, with strict wrong-answer interaction (must click correct to advance).

**Architecture:** Single-page React app with pure logic separated into `src/logic/` (no React dependencies), and UI components in `src/components/`. State lives in `App.jsx` via `useState`/`useReducer`. No routing, no external state library.

**Tech Stack:** Vite 5, React 18, CSS custom properties (no Tailwind), Google Fonts (Playfair Display + JetBrains Mono), Framer Motion for animations.

---

### Task 1: Scaffold Vite + React project

**Files:**
- Create: project root via `npm create vite`

**Step 1: Create project**

```bash
cd /Users/I525918/rong/projects/my/praticeMusicTheory
npm create vite@latest . -- --template react
npm install
npm install framer-motion
```

**Step 2: Clean boilerplate**

Delete: `src/App.css`, `src/assets/react.svg`, `public/vite.svg`

Replace `src/App.jsx` with empty shell:
```jsx
export default function App() {
  return <div>Music Theory Quiz</div>
}
```

Replace `src/index.css` with empty file (we'll fill it in Task 3).

**Step 3: Verify dev server starts**

```bash
npm run dev
```
Expected: server at http://localhost:5173, shows "Music Theory Quiz"

**Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold vite react project"
```

---

### Task 2: Core music theory logic

**Files:**
- Create: `src/logic/musicTheory.js`
- Create: `src/logic/musicTheory.test.js`

**Step 1: Write failing tests**

Create `src/logic/musicTheory.test.js`:
```js
import { describe, it, expect } from 'vitest'
import {
  NOTES,
  INTERVALS,
  SOLFEGE,
  noteAt,
  semitonesBetween,
  intervalName,
  solfegeName,
} from './musicTheory'

describe('NOTES', () => {
  it('has 12 notes', () => expect(NOTES).toHaveLength(12))
  it('starts with C', () => expect(NOTES[0]).toBe('C'))
})

describe('noteAt', () => {
  it('C + 7 semitones = G', () => expect(noteAt('C', 7)).toBe('G'))
  it('A + 3 semitones = C', () => expect(noteAt('A', 3)).toBe('C'))
  it('wraps around: B + 1 = C', () => expect(noteAt('B', 1)).toBe('C'))
})

describe('semitonesBetween', () => {
  it('C to G = 7', () => expect(semitonesBetween('C', 'G')).toBe(7))
  it('G to C = 5', () => expect(semitonesBetween('G', 'C')).toBe(5))
  it('C to C = 0', () => expect(semitonesBetween('C', 'C')).toBe(0))
})

describe('intervalName', () => {
  it('7 semitones = 纯五度', () => expect(intervalName(7)).toBe('纯五度'))
  it('0 semitones = 纯一度', () => expect(intervalName(0)).toBe('纯一度'))
})

describe('solfegeName', () => {
  it('0 semitones = 1', () => expect(solfegeName(0)).toBe('1'))
  it('7 semitones = 5', () => expect(solfegeName(7)).toBe('5'))
  it('3 semitones = null (not in major scale)', () => expect(solfegeName(3)).toBeNull())
})
```

**Step 2: Run tests to verify they fail**

```bash
npx vitest run src/logic/musicTheory.test.js
```
Expected: FAIL — cannot find module

**Step 3: Implement `src/logic/musicTheory.js`**

```js
export const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

export const INTERVALS = {
  0:  '纯一度',
  1:  '小二度',
  2:  '大二度',
  3:  '小三度',
  4:  '大三度',
  5:  '纯四度',
  6:  '增四度',
  7:  '纯五度',
  8:  '小六度',
  9:  '大六度',
  10: '小七度',
  11: '大七度',
  12: '纯八度',
}

// Solfege degree -> semitones from root (natural major scale)
export const SOLFEGE = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 }

// Reverse: semitones -> solfege degree (only major scale tones)
const SEMITONES_TO_SOLFEGE = Object.fromEntries(
  Object.entries(SOLFEGE).map(([deg, semi]) => [semi, String(deg)])
)

export function noteAt(root, semitones) {
  const rootIdx = NOTES.indexOf(root)
  return NOTES[(rootIdx + semitones) % 12]
}

export function semitonesBetween(root, target) {
  const rootIdx = NOTES.indexOf(root)
  const targetIdx = NOTES.indexOf(target)
  return (targetIdx - rootIdx + 12) % 12
}

export function intervalName(semitones) {
  return INTERVALS[semitones] ?? null
}

export function solfegeName(semitones) {
  return SEMITONES_TO_SOLFEGE[semitones] ?? null
}
```

**Step 4: Run tests — verify pass**

```bash
npx vitest run src/logic/musicTheory.test.js
```
Expected: all 10 tests PASS

**Step 5: Commit**

```bash
git add src/logic/
git commit -m "feat: core music theory logic with tests"
```

---

### Task 3: Question generator

**Files:**
- Create: `src/logic/questionGenerator.js`
- Create: `src/logic/questionGenerator.test.js`

**Step 1: Write failing tests**

Create `src/logic/questionGenerator.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { generateQuestion, MODES } from './questionGenerator'

describe('MODES', () => {
  it('has 9 modes', () => expect(MODES).toHaveLength(9))
})

describe('generateQuestion', () => {
  // Run each mode 20 times to catch randomness bugs
  MODES.forEach(mode => {
    it(`mode "${mode.id}" generates valid question`, () => {
      for (let i = 0; i < 20; i++) {
        const q = generateQuestion(mode.id)
        expect(q.options).toHaveLength(4)
        expect(q.options).toContain(q.answer)
        // All options distinct
        expect(new Set(q.options).size).toBe(4)
      }
    })
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npx vitest run src/logic/questionGenerator.test.js
```
Expected: FAIL — cannot find module

**Step 3: Implement `src/logic/questionGenerator.js`**

```js
import { NOTES, INTERVALS, SOLFEGE, noteAt, semitonesBetween, intervalName, solfegeName } from './musicTheory'

export const MODES = [
  { id: 'mode1', label: '根音+音程→音名',  group: 'single' },
  { id: 'mode2', label: '根音+唱名→音名',  group: 'single' },
  { id: 'mode3', label: '根音+半音→音名',  group: 'single' },
  { id: 'mode4', label: '两音→音程名',     group: 'single' },
  { id: 'mode5', label: '两音→唱名',       group: 'single' },
  { id: 'mode6', label: '两音→半音数',     group: 'single' },
  { id: 'mixA',  label: '混合A (1+2+3)',   group: 'mix' },
  { id: 'mixB',  label: '混合B (4+5+6)',   group: 'mix' },
  { id: 'full',  label: '全随机',          group: 'mix' },
]

const SINGLE_MODES = ['mode1','mode2','mode3','mode4','mode5','mode6']
const INTERVAL_NAMES = Object.values(INTERVALS)
const SOLFEGE_DEGREES = Object.keys(SOLFEGE).map(Number)
// semitone values that map to major scale degrees
const MAJOR_SEMITONES = Object.values(SOLFEGE)

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Generate 3 wrong note options, preferring adjacent semitones for difficulty */
function wrongNotes(correct, count = 3) {
  const pool = NOTES.filter(n => n !== correct)
  return shuffle(pool).slice(0, count)
}

/** Generate wrong interval names near the correct one */
function wrongIntervals(correctSemitones, count = 3) {
  const candidates = []
  // Adjacent semitone values first
  for (const delta of [-1, 1, -2, 2, -3, 3]) {
    const s = correctSemitones + delta
    if (s >= 0 && s <= 12 && s !== correctSemitones && INTERVALS[s]) {
      candidates.push(INTERVALS[s])
    }
  }
  // Fill rest from all intervals
  const all = INTERVAL_NAMES.filter(n => n !== INTERVALS[correctSemitones] && !candidates.includes(n))
  const pool = [...candidates, ...shuffle(all)]
  return [...new Set(pool)].slice(0, count)
}

/** Generate wrong solfege degrees */
function wrongSolfege(correctDeg, count = 3) {
  const pool = SOLFEGE_DEGREES.filter(d => d !== correctDeg)
  return shuffle(pool).slice(0, count)
}

/** Generate wrong semitone counts, adjacent-biased */
function wrongSemitones(correct, count = 3) {
  const candidates = []
  for (const delta of [-1, 1, -2, 2]) {
    const s = correct + delta
    if (s >= 1 && s <= 12 && s !== correct) candidates.push(s)
  }
  const all = Array.from({length: 12}, (_, i) => i + 1).filter(s => s !== correct && !candidates.includes(s))
  const pool = [...candidates, ...shuffle(all)]
  return [...new Set(pool)].slice(0, count)
}

function makeQuestion(modeId) {
  const root = rand(NOTES)

  if (modeId === 'mode1') {
    // Root + interval name -> target note
    const semi = rand(Object.keys(INTERVALS).map(Number))
    const intName = INTERVALS[semi]
    const answer = noteAt(root, semi)
    const wrongs = wrongNotes(answer)
    return {
      modeId,
      prompt: { root, condition: intName, conditionType: 'interval' },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'note',
    }
  }

  if (modeId === 'mode2') {
    // Root + solfege degree -> target note
    const deg = rand(SOLFEGE_DEGREES)
    const semi = SOLFEGE[deg]
    const answer = noteAt(root, semi)
    const wrongs = wrongNotes(answer)
    return {
      modeId,
      prompt: { root, condition: String(deg), conditionType: 'solfege' },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'note',
    }
  }

  if (modeId === 'mode3') {
    // Root + semitone count -> target note
    const semi = Math.floor(Math.random() * 12) + 1
    const answer = noteAt(root, semi)
    const wrongs = wrongNotes(answer)
    return {
      modeId,
      prompt: { root, condition: String(semi), conditionType: 'semitone' },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'note',
    }
  }

  if (modeId === 'mode4') {
    // Two notes -> interval name
    const target = rand(NOTES)
    const semi = semitonesBetween(root, target)
    const answer = intervalName(semi)
    const wrongs = wrongIntervals(semi)
    return {
      modeId,
      prompt: { root, target },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'interval',
    }
  }

  if (modeId === 'mode5') {
    // Two notes -> solfege (only major scale intervals)
    const semi = rand(MAJOR_SEMITONES)
    const target = noteAt(root, semi)
    const answer = solfegeName(semi)
    const wrongs = wrongSolfege(Number(answer))
    return {
      modeId,
      prompt: { root, target },
      answer,
      options: shuffle([answer, ...wrongs.map(String)]),
      answerType: 'solfege',
    }
  }

  if (modeId === 'mode6') {
    // Two notes -> semitone count
    const semi = Math.floor(Math.random() * 12) + 1
    const target = noteAt(root, semi)
    const answer = String(semi)
    const wrongs = wrongSemitones(semi).map(String)
    return {
      modeId,
      prompt: { root, target },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'semitone',
    }
  }

  // Should not reach here
  return null
}

export function generateQuestion(modeId) {
  if (modeId === 'mixA') return makeQuestion(rand(['mode1','mode2','mode3']))
  if (modeId === 'mixB') return makeQuestion(rand(['mode4','mode5','mode6']))
  if (modeId === 'full') return makeQuestion(rand(SINGLE_MODES))
  return makeQuestion(modeId)
}
```

**Step 4: Run tests — verify pass**

```bash
npx vitest run src/logic/questionGenerator.test.js
```
Expected: all 9 mode tests PASS

**Step 5: Install vitest (if not present)**

Check `package.json` — if vitest missing:
```bash
npm install -D vitest
```
Add to `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  test: { environment: 'node' },
})
```

**Step 6: Commit**

```bash
git add src/logic/ vite.config.js package.json
git commit -m "feat: question generator with 9 modes and tests"
```

---

### Task 4: Global CSS — "深夜琴房" theme

**Files:**
- Modify: `src/index.css`
- Modify: `index.html` (add Google Fonts)

**Step 1: Add fonts to `index.html`**

In `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

**Step 2: Write `src/index.css`**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:         #0d0d0f;
  --bg-card:    #161618;
  --bg-option:  #1e1e21;
  --border:     #2a2a2e;
  --text:       #f0ece2;
  --text-dim:   #7a7870;
  --accent:     #e8a838;
  --correct:    #5a9e6f;
  --wrong:      #c04a42;
  --correct-bg: #1a3324;
  --wrong-bg:   #2e1210;
  --font-display: 'Playfair Display', serif;
  --font-mono:    'JetBrains Mono', monospace;
  --font-ui:      'Inter', sans-serif;
}

html, body, #root {
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
}

body {
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(232,168,56,0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(90,158,111,0.03) 0%, transparent 50%);
}

button { cursor: pointer; border: none; background: none; font-family: inherit; }
```

**Step 3: Verify styles load**

```bash
npm run dev
```
Expected: dark background visible in browser.

**Step 4: Commit**

```bash
git add src/index.css index.html
git commit -m "feat: global theme css - 深夜琴房"
```

---

### Task 5: App state management

**Files:**
- Modify: `src/App.jsx`

**Step 1: Implement App with useReducer**

```jsx
import { useReducer, useEffect } from 'react'
import { MODES, generateQuestion } from './logic/questionGenerator'

const initialState = {
  modeId: 'mode1',
  question: null,       // current question object
  selected: null,       // user's selected option string
  status: 'idle',       // 'idle' | 'correct' | 'wrong'
  score: 0,
  total: 0,
  streak: 0,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...initialState, modeId: action.modeId, question: action.question }
    case 'NEXT_QUESTION':
      return { ...state, question: action.question, selected: null, status: 'idle' }
    case 'SELECT': {
      const correct = action.option === state.question.answer
      return {
        ...state,
        selected: action.option,
        status: correct ? 'correct' : 'wrong',
        score: correct ? state.score + 1 : state.score,
        total: state.total + 1,
        streak: correct ? state.streak + 1 : 0,
      }
    }
    default: return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Generate first question on mount
  useEffect(() => {
    dispatch({ type: 'NEXT_QUESTION', question: generateQuestion(state.modeId) })
  }, [])

  function handleModeChange(modeId) {
    dispatch({ type: 'SET_MODE', modeId, question: generateQuestion(modeId) })
  }

  function handleSelect(option) {
    if (state.status !== 'idle') return  // ignore extra clicks while animating
    dispatch({ type: 'SELECT', option })
  }

  // Auto-advance after correct
  useEffect(() => {
    if (state.status !== 'correct') return
    const t = setTimeout(() => {
      dispatch({ type: 'NEXT_QUESTION', question: generateQuestion(state.modeId) })
    }, 800)
    return () => clearTimeout(t)
  }, [state.status, state.question])

  if (!state.question) return null

  return (
    <div style={{ padding: '1rem' }}>
      <p>Mode: {state.modeId} | Score: {state.score}/{state.total} | Streak: {state.streak}</p>
      <p>Question: {JSON.stringify(state.question.prompt)}</p>
      {state.question.options.map(opt => (
        <button key={opt} onClick={() => handleSelect(opt)}
          style={{
            margin: '0.5rem',
            padding: '1rem 2rem',
            background: state.selected === opt
              ? (opt === state.question.answer ? 'green' : 'red')
              : state.status !== 'idle' && opt === state.question.answer
                ? 'gold' : '#333',
            color: 'white',
          }}>
          {opt}
        </button>
      ))}
    </div>
  )
}
```

**Step 2: Manual test in browser**

- Answer correct: button turns green, 0.8s later new question appears ✓
- Answer wrong: button turns red, correct turns gold, clicking gold advances ✓
- Mode selection should be wired next task

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: app state with useReducer, quiz interaction logic"
```

---

### Task 6: HUD component — mode selector + scoreboard

**Files:**
- Create: `src/components/HUD.jsx`
- Create: `src/components/HUD.css`

**Step 1: Create `src/components/HUD.css`**

```css
.hud {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--border);
}

.hud__modes {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hud__modes::-webkit-scrollbar { display: none; }

.mode-btn {
  font-family: var(--font-ui);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  padding: 0.35rem 0.9rem;
  border-radius: 20px;
  border: 1px solid var(--border);
  color: var(--text-dim);
  background: transparent;
  white-space: nowrap;
  transition: all 0.18s ease;
}
.mode-btn:hover { color: var(--text); border-color: var(--text-dim); }
.mode-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #0d0d0f;
  font-weight: 600;
}

.hud__score {
  display: flex;
  gap: 1.5rem;
  align-items: baseline;
}

.score-item { display: flex; flex-direction: column; gap: 0.1rem; }
.score-label {
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dim);
  font-family: var(--font-mono);
}
.score-value {
  font-size: 1.4rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text);
  line-height: 1;
}
.score-value.streak { color: var(--accent); }

@media (max-width: 480px) {
  .hud { padding: 0.75rem 1rem 0.6rem; }
  .score-value { font-size: 1.1rem; }
}
```

**Step 2: Create `src/components/HUD.jsx`**

```jsx
import './HUD.css'
import { MODES } from '../logic/questionGenerator'

export default function HUD({ modeId, score, total, streak, onModeChange }) {
  return (
    <div className="hud">
      <div className="hud__modes">
        {MODES.map(m => (
          <button
            key={m.id}
            className={`mode-btn ${modeId === m.id ? 'active' : ''}`}
            onClick={() => onModeChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="hud__score">
        <div className="score-item">
          <span className="score-label">正确</span>
          <span className="score-value">{score}</span>
        </div>
        <div className="score-item">
          <span className="score-label">总计</span>
          <span className="score-value">{total}</span>
        </div>
        <div className="score-item">
          <span className="score-label">连击</span>
          <span className={`score-value${streak > 2 ? ' streak' : ''}`}>{streak}</span>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Wire HUD into App.jsx**

Replace the `<p>Mode...</p>` placeholder with:
```jsx
import HUD from './components/HUD'
// inside return:
<HUD
  modeId={state.modeId}
  score={state.score}
  total={state.total}
  streak={state.streak}
  onModeChange={handleModeChange}
/>
```

**Step 4: Verify in browser** — mode pills appear, clicking changes mode, score updates.

**Step 5: Commit**

```bash
git add src/components/HUD.jsx src/components/HUD.css src/App.jsx
git commit -m "feat: HUD with mode selector and scoreboard"
```

---

### Task 7: QuestionCard component

**Files:**
- Create: `src/components/QuestionCard.jsx`
- Create: `src/components/QuestionCard.css`

**Step 1: Create `src/components/QuestionCard.css`**

```css
.question-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  gap: 0.5rem;
  text-align: center;
}

.question-card__label {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-dim);
  font-family: var(--font-mono);
}

.question-card__root {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 12vw, 6rem);
  font-weight: 700;
  color: var(--text);
  line-height: 1;
  letter-spacing: -0.02em;
}

.question-card__separator {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-dim);
  margin: 0.25rem 0;
}

.question-card__condition {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1.2rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-card);
}

.question-card__condition-type {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  color: var(--accent);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.question-card__condition-value {
  font-size: 1.1rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text);
}

/* Two-note prompt (mode 4/5/6) */
.question-card__two-notes {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.question-card__arrow {
  font-size: 1.2rem;
  color: var(--text-dim);
}

.question-card__target-note {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 12vw, 6rem);
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.question-card__ask {
  font-size: 0.75rem;
  color: var(--text-dim);
  font-family: var(--font-ui);
  margin-top: 0.5rem;
}

@media (max-width: 480px) {
  .question-card { padding: 1.5rem 1rem; }
}
```

**Step 2: Create `src/components/QuestionCard.jsx`**

```jsx
import './QuestionCard.css'

const CONDITION_LABELS = {
  interval: '音程',
  solfege:  '唱名',
  semitone: '半音数',
}

const ANSWER_LABELS = {
  note:     '选出对应的音名',
  interval: '选出音程关系',
  solfege:  '选出唱名',
  semitone: '选出半音数',
}

export default function QuestionCard({ question }) {
  const { prompt, answerType } = question
  const isTwoNote = 'target' in prompt

  return (
    <div className="question-card">
      {isTwoNote ? (
        <>
          <span className="question-card__label">两音关系</span>
          <div className="question-card__two-notes">
            <span className="question-card__root">{prompt.root}</span>
            <span className="question-card__arrow">→</span>
            <span className="question-card__target-note">{prompt.target}</span>
          </div>
        </>
      ) : (
        <>
          <span className="question-card__label">根音</span>
          <span className="question-card__root">{prompt.root}</span>
          <span className="question-card__separator">+</span>
          <div className="question-card__condition">
            <span className="question-card__condition-type">
              {CONDITION_LABELS[prompt.conditionType]}
            </span>
            <span className="question-card__condition-value">{prompt.condition}</span>
          </div>
        </>
      )}
      <p className="question-card__ask">{ANSWER_LABELS[answerType]}</p>
    </div>
  )
}
```

**Step 3: Wire into App.jsx**

```jsx
import QuestionCard from './components/QuestionCard'
// replace the <p>Question:...</p> with:
<QuestionCard question={state.question} />
```

**Step 4: Verify** — question displays correctly for all 6 mode types.

**Step 5: Commit**

```bash
git add src/components/QuestionCard.jsx src/components/QuestionCard.css src/App.jsx
git commit -m "feat: QuestionCard component"
```

---

### Task 8: OptionButton component

**Files:**
- Create: `src/components/OptionButton.jsx`
- Create: `src/components/OptionButton.css`

**Step 1: Create `src/components/OptionButton.css`**

```css
.option-btn {
  position: relative;
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-option);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: clamp(1rem, 4vw, 1.3rem);
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease, border-color 0.15s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.option-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  border-color: var(--text-dim);
}

.option-btn:not(:disabled):active {
  transform: translateY(0);
}

.option-btn.correct {
  background: var(--correct-bg);
  border-color: var(--correct);
  color: #a8d5b0;
}

.option-btn.wrong {
  background: var(--wrong-bg);
  border-color: var(--wrong);
  color: #e08880;
  animation: shake 0.35s ease;
}

.option-btn.hint {
  border-color: var(--accent);
  color: var(--accent);
  animation: pulse-hint 1.2s ease infinite;
}

.option-btn__hint-text {
  display: block;
  font-size: 0.6rem;
  font-family: var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 0.25rem;
  color: var(--accent);
  opacity: 0.8;
}

@keyframes shake {
  0%   { transform: translateX(0); }
  20%  { transform: translateX(-6px); }
  40%  { transform: translateX(6px); }
  60%  { transform: translateX(-4px); }
  80%  { transform: translateX(4px); }
  100% { transform: translateX(0); }
}

@keyframes pulse-hint {
  0%, 100% { box-shadow: 0 0 0 0 rgba(232,168,56,0); }
  50%       { box-shadow: 0 0 0 6px rgba(232,168,56,0.15); }
}

@media (max-width: 480px) {
  .option-btn { padding: 0.85rem 1rem; }
}
```

**Step 2: Create `src/components/OptionButton.jsx`**

```jsx
import './OptionButton.css'

export default function OptionButton({ option, status, isCorrect, isSelected, onClick }) {
  // status: 'idle' | 'correct' | 'wrong'
  // isSelected: this button was clicked
  // isCorrect: this button holds the right answer

  let className = 'option-btn'
  let disabled = false
  let showHint = false

  if (status !== 'idle') {
    if (isSelected && isCorrect)  className += ' correct'
    if (isSelected && !isCorrect) className += ' wrong'
    if (!isSelected && isCorrect && status === 'wrong') {
      className += ' hint'
      showHint = true
    }
    // Disable all non-correct buttons after wrong
    if (status === 'wrong' && !isCorrect) disabled = true
    // Disable all after correct
    if (status === 'correct') disabled = true
  }

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {option}
      {showHint && <span className="option-btn__hint-text">点击继续</span>}
    </button>
  )
}
```

**Step 3: Create AnswerGrid and wire into App**

Create `src/components/AnswerGrid.jsx`:
```jsx
import './AnswerGrid.css'
import OptionButton from './OptionButton'

export default function AnswerGrid({ question, selected, status, onSelect }) {
  return (
    <div className="answer-grid">
      {question.options.map(opt => (
        <OptionButton
          key={opt}
          option={opt}
          status={status}
          isCorrect={opt === question.answer}
          isSelected={opt === selected}
          onClick={() => onSelect(opt)}
        />
      ))}
    </div>
  )
}
```

Create `src/components/AnswerGrid.css`:
```css
.answer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.5rem;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

@media (max-width: 360px) {
  .answer-grid { gap: 0.5rem; padding: 0.75rem 1rem 1.25rem; }
}
```

**Step 4: Update App.jsx** — replace `<button>` map with:
```jsx
import AnswerGrid from './components/AnswerGrid'
// replace buttons:
<AnswerGrid
  question={state.question}
  selected={state.selected}
  status={state.status}
  onSelect={handleSelect}
/>
```

**Step 5: Verify interaction**
- Click wrong: shakes red, correct pulses gold with "点击继续"
- Click gold: advances to next question
- Click correct: green, 0.8s auto-advance

**Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: OptionButton, AnswerGrid with correct/wrong states"
```

---

### Task 9: Full App layout + Framer Motion animations

**Files:**
- Modify: `src/App.jsx`
- Create: `src/App.css`

**Step 1: Create `src/App.css`**

```css
.app {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: 600px;
  margin: 0 auto;
}

.app__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}
```

**Step 2: Final App.jsx with animations**

```jsx
import { useReducer, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MODES, generateQuestion } from './logic/questionGenerator'
import HUD from './components/HUD'
import QuestionCard from './components/QuestionCard'
import AnswerGrid from './components/AnswerGrid'
import './App.css'

const initialState = {
  modeId: 'mode1',
  question: null,
  selected: null,
  status: 'idle',
  score: 0,
  total: 0,
  streak: 0,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...initialState, modeId: action.modeId, question: action.question }
    case 'NEXT_QUESTION':
      return { ...state, question: action.question, selected: null, status: 'idle' }
    case 'SELECT': {
      const correct = action.option === state.question.answer
      return {
        ...state,
        selected: action.option,
        status: correct ? 'correct' : 'wrong',
        score: correct ? state.score + 1 : state.score,
        total: state.total + 1,
        streak: correct ? state.streak + 1 : 0,
      }
    }
    default: return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    dispatch({ type: 'NEXT_QUESTION', question: generateQuestion('mode1') })
  }, [])

  function handleModeChange(modeId) {
    dispatch({ type: 'SET_MODE', modeId, question: generateQuestion(modeId) })
  }

  function handleSelect(option) {
    if (state.status !== 'idle') return
    dispatch({ type: 'SELECT', option })
  }

  useEffect(() => {
    if (state.status !== 'correct') return
    const t = setTimeout(() => {
      dispatch({ type: 'NEXT_QUESTION', question: generateQuestion(state.modeId) })
    }, 800)
    return () => clearTimeout(t)
  }, [state.status, state.question])

  if (!state.question) return null

  return (
    <div className="app">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <HUD
          modeId={state.modeId}
          score={state.score}
          total={state.total}
          streak={state.streak}
          onModeChange={handleModeChange}
        />
      </motion.div>

      <div className="app__body">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.question.prompt.root + JSON.stringify(state.question.prompt)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
          >
            <QuestionCard question={state.question} />
            <AnswerGrid
              question={state.question}
              selected={state.selected}
              status={state.status}
              onSelect={handleSelect}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
```

**Step 3: Verify full experience**
- Page load: staggered fade-in ✓
- New question: slides in from below, exits upward ✓
- All 9 modes work ✓
- Mobile layout (375px): fits without overflow ✓

**Step 4: Commit**

```bash
git add src/App.jsx src/App.css
git commit -m "feat: full app layout with framer-motion animations"
```

---

### Task 10: Final polish + production build

**Files:**
- Modify: `index.html` (title + meta viewport)
- Run build

**Step 1: Update index.html**

```html
<title>乐理练习</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<meta name="theme-color" content="#0d0d0f">
```

**Step 2: Run all tests**

```bash
npx vitest run
```
Expected: all tests PASS

**Step 3: Build**

```bash
npm run build
npm run preview
```
Expected: production build serves correctly, no console errors.

**Step 4: Final commit**

```bash
git add .
git commit -m "feat: final polish - title, viewport meta, build verified"
```

---

## Summary

| Task | Description | Est. |
|------|-------------|------|
| 1 | Vite scaffold | 5 min |
| 2 | Music theory logic + tests | 10 min |
| 3 | Question generator + tests | 15 min |
| 4 | Global CSS theme | 5 min |
| 5 | App state (useReducer) | 10 min |
| 6 | HUD component | 10 min |
| 7 | QuestionCard component | 10 min |
| 8 | OptionButton + AnswerGrid | 10 min |
| 9 | Full layout + animations | 10 min |
| 10 | Polish + build | 5 min |
