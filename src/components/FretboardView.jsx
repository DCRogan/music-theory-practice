import { useState } from 'react'
import { noteAtFret, allPositions, randomNote, FRET_COUNT } from '../logic/fretboard'
import { playFret } from '../logic/audio'
import './FretboardView.css'

// Layout constants
const FRET_WIDTH = 52
const STRING_SPACING = 28
const NUT_WIDTH = 8
const OPEN_SLOT = 30    // width reserved left of nut for open string dots
const LEFT_PADDING = 36   // space for string labels
const TOP_PADDING = 28    // space for fret numbers
const BOTTOM_PADDING = 16
const NUM_STRINGS = 6

const SVG_WIDTH = LEFT_PADDING + OPEN_SLOT + NUT_WIDTH + FRET_COUNT * FRET_WIDTH
const SVG_HEIGHT = TOP_PADDING + (NUM_STRINGS - 1) * STRING_SPACING + BOTTOM_PADDING

// String thicknesses (high e to low E)
const STRING_THICKNESS = [0.8, 1.1, 1.5, 2.0, 2.6, 3.2]

// String names high to low
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']

// Fret dot markers (single dot frets)
const SINGLE_MARKERS = new Set([3, 5, 7, 9])
const DOUBLE_MARKER = 12

// X center of a fret slot
function fretX(fret) {
  if (fret === 0) return LEFT_PADDING + OPEN_SLOT / 2  // centered in open slot, left of nut
  return LEFT_PADDING + OPEN_SLOT + NUT_WIDTH + fret * FRET_WIDTH - FRET_WIDTH / 2
}

// X position of fret wire
function fretWireX(fret) {
  return LEFT_PADDING + OPEN_SLOT + NUT_WIDTH + fret * FRET_WIDTH
}

// Y position of string
function stringY(s) {
  return TOP_PADDING + s * STRING_SPACING
}

export default function FretboardView() {
  const [targetNote, setTargetNote] = useState(() => randomNote())
  const [selected, setSelected] = useState(new Set())
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState({ found: 0, total: 0, wrong: 0 })

  const correctPositions = allPositions(targetNote)
  const correctKeys = new Set(correctPositions.map(([s, f]) => `${s}-${f}`))

  function toggleSelect(s, f) {
    if (revealed) return
    playFret(s, f)
    const key = `${s}-${f}`
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleReveal() {
    let found = 0
    selected.forEach(key => { if (correctKeys.has(key)) found++ })
    const wrong = selected.size - found
    setStats({ found, total: correctPositions.length, wrong })
    setRevealed(true)
  }

  function handleNext() {
    setTargetNote(randomNote())
    setSelected(new Set())
    setRevealed(false)
    setStats({ found: 0, total: 0, wrong: 0 })
  }

  function dotState(s, f) {
    const key = `${s}-${f}`
    const isCorrect = correctKeys.has(key)
    const isSelected = selected.has(key)
    if (!revealed) return isSelected ? 'selected' : 'idle'
    if (isSelected && isCorrect) return 'hit'
    if (isSelected && !isCorrect) return 'wrong'
    if (!isSelected && isCorrect) return 'miss'
    return 'idle'
  }

  // Dot color by state
  const DOT_FILL = {
    idle:     'transparent',
    selected: 'rgba(232,168,56,0.55)',
    hit:      '#3d7a52',
    miss:     'rgba(232,168,56,0.30)',
    wrong:    '#7a2e2a',
  }
  const DOT_STROKE = {
    idle:     'rgba(255,255,255,0.0)',
    selected: '#e8a838',
    hit:      '#5a9e6f',
    miss:     '#e8a838',
    wrong:    '#c04a42',
  }

  return (
    <div className="fretboard-view">
      {/* Target note */}
      <div className="fretboard-view__target">
        <span className="fretboard-view__target-label">找出所有</span>
        <span className="fretboard-view__target-note">{targetNote}</span>
      </div>

      {/* Score after reveal */}
      {revealed && (
        <div className="fretboard-view__score">
          找到 <span className="score-good">{stats.found}</span> / {stats.total} 个
          {stats.wrong > 0 && <> · 误点 <span className="score-bad">{stats.wrong}</span> 个</>}
        </div>
      )}

      {/* SVG Fretboard */}
      <div className="fretboard-scroll">
        <svg
          className="fretboard-svg"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
        >
          {/* Board background */}
          <defs>
            <linearGradient id="boardGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#2a1a0e" />
              <stop offset="50%"  stopColor="#3d2510" />
              <stop offset="100%" stopColor="#2a1a0e" />
            </linearGradient>
            <linearGradient id="nutGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#d4c5a0" />
              <stop offset="50%"  stopColor="#f0e6c8" />
              <stop offset="100%" stopColor="#c8b890" />
            </linearGradient>
          </defs>

          {/* Fretboard wood background */}
          <rect
            x={LEFT_PADDING + OPEN_SLOT}
            y={TOP_PADDING - 10}
            width={NUT_WIDTH + FRET_COUNT * FRET_WIDTH}
            height={(NUM_STRINGS - 1) * STRING_SPACING + 20}
            fill="url(#boardGrad)"
            rx="3"
          />

          {/* Fret position markers (inlays) */}
          {Array.from({ length: FRET_COUNT }, (_, f) => {
            const cx = fretX(f)
            const midY = TOP_PADDING + ((NUM_STRINGS - 1) * STRING_SPACING) / 2
            if (SINGLE_MARKERS.has(f)) {
              return (
                <circle key={f} cx={cx} cy={midY} r={5}
                  fill="#c8b070" opacity="0.55" />
              )
            }
            if (f === DOUBLE_MARKER) {
              return (
                <g key={f}>
                  <circle cx={cx} cy={midY - 9} r={5} fill="#c8b070" opacity="0.55" />
                  <circle cx={cx} cy={midY + 9} r={5} fill="#c8b070" opacity="0.55" />
                </g>
              )
            }
            return null
          })}

          {/* Nut */}
          <rect
            x={LEFT_PADDING + OPEN_SLOT}
            y={TOP_PADDING - 8}
            width={NUT_WIDTH}
            height={(NUM_STRINGS - 1) * STRING_SPACING + 16}
            fill="url(#nutGrad)"
            rx="1"
          />

          {/* Fret wires */}
          {Array.from({ length: FRET_COUNT }, (_, f) => {
            if (f === 0) return null
            const x = fretWireX(f)
            return (
              <rect key={f}
                x={x - 1.5} y={TOP_PADDING - 6}
                width={3} height={(NUM_STRINGS - 1) * STRING_SPACING + 12}
                fill="#9a9070" rx="1"
              />
            )
          })}

          {/* Strings */}
          {STRING_NAMES.map((name, s) => {
            const y = stringY(s)
            const thickness = STRING_THICKNESS[s]
            return (
              <g key={s}>
                {/* String shadow */}
                <line
                  x1={LEFT_PADDING} y1={y + thickness / 2 + 0.5}
                  x2={SVG_WIDTH}    y2={y + thickness / 2 + 0.5}
                  stroke="rgba(0,0,0,0.5)" strokeWidth={thickness + 0.5}
                />
                {/* String */}
                <line
                  x1={LEFT_PADDING} y1={y}
                  x2={SVG_WIDTH}    y2={y}
                  stroke={s < 3 ? '#d4c8a0' : '#b0a878'}
                  strokeWidth={thickness}
                />
                {/* String label */}
                <text
                  x={LEFT_PADDING - 6} y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                  fill="#7a7870"
                >
                  {name}
                </text>
              </g>
            )
          })}

          {/* Fret numbers */}
          {Array.from({ length: FRET_COUNT }, (_, f) => (
            <text key={f}
              x={fretX(f)} y={TOP_PADDING - 12}
              textAnchor="middle"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              fill={SINGLE_MARKERS.has(f) || f === DOUBLE_MARKER ? '#e8a838' : '#4a4845'}
            >
              {f}
            </text>
          ))}

          {/* Clickable dots on every string/fret */}
          {STRING_NAMES.map((_, s) =>
            Array.from({ length: FRET_COUNT }, (__, f) => {
              const state = dotState(s, f)
              const cx = fretX(f)
              const cy = stringY(s)
              const note = noteAtFret(s, f)
              const showLabel = state === 'hit' || state === 'miss' || state === 'wrong'

              return (
                <g key={`${s}-${f}`}
                  onClick={() => toggleSelect(s, f)}
                  style={{ cursor: revealed ? 'default' : 'pointer' }}
                >
                  {/* Invisible large hit area */}
                  <rect
                    x={cx - FRET_WIDTH / 2 + 2} y={cy - STRING_SPACING / 2}
                    width={FRET_WIDTH - 4} height={STRING_SPACING}
                    fill="transparent"
                  />
                  {/* Dot */}
                  {state !== 'idle' && (
                    <circle
                      cx={cx} cy={cy} r={11}
                      fill={DOT_FILL[state]}
                      stroke={DOT_STROKE[state]}
                      strokeWidth={1.5}
                    />
                  )}
                  {/* Hover ring (CSS handles this via SVG class) */}
                  {state === 'idle' && (
                    <circle
                      cx={cx} cy={cy} r={11}
                      fill="transparent"
                      stroke="transparent"
                      strokeWidth={1.5}
                      className="fret-hit-area"
                    />
                  )}
                  {/* Note label after reveal */}
                  {showLabel && (
                    <text
                      x={cx} y={cy + 4}
                      textAnchor="middle"
                      fontSize={note.length > 1 ? '8' : '9'}
                      fontFamily="'JetBrains Mono', monospace"
                      fontWeight="600"
                      fill={
                        state === 'hit'  ? '#a8d5b0' :
                        state === 'miss' ? '#e8a838' :
                        '#e08880'
                      }
                      style={{ pointerEvents: 'none' }}
                    >
                      {note}
                    </text>
                  )}
                </g>
              )
            })
          )}
        </svg>
      </div>

      {/* Legend after reveal */}
      {revealed && (
        <div className="fretboard-legend">
          <span className="legend-item hit">■ 答对</span>
          <span className="legend-item miss">■ 漏选</span>
          <span className="legend-item wrong">■ 误点</span>
        </div>
      )}

      {/* Action button */}
      <div className="fretboard-view__actions">
        {!revealed ? (
          <button className="fretboard-action-btn primary" onClick={handleReveal}>完成</button>
        ) : (
          <button className="fretboard-action-btn primary" onClick={handleNext}>下一题</button>
        )}
      </div>
    </div>
  )
}
