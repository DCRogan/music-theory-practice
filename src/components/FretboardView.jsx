import { useState, useCallback } from 'react'
import { noteAtFret, allPositions, randomNote, STRING_NAMES, FRET_COUNT } from '../logic/fretboard'
import './FretboardView.css'

// Fret positions with traditional dot markers
const MARKER_FRETS = new Set([3, 5, 7, 9, 12])

export default function FretboardView() {
  const [targetNote, setTargetNote] = useState(() => randomNote())
  const [selected, setSelected] = useState(new Set()) // Set of "s-f" keys
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState({ found: 0, total: 0, wrong: 0 })

  const correctPositions = allPositions(targetNote)
  const correctKeys = new Set(correctPositions.map(([s, f]) => `${s}-${f}`))

  function toggleSelect(s, f) {
    if (revealed) return
    const key = `${s}-${f}`
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleReveal() {
    // Count hits, misses, wrongs
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

  function dotLabel(s, f) {
    const state = dotState(s, f)
    if (state === 'hit') return '✓'
    if (state === 'miss') return '○'
    if (state === 'wrong') return '✕'
    return ''
  }

  return (
    <div className="fretboard-view">
      <div className="fretboard-view__target">
        <span className="fretboard-view__target-label">找出所有</span>
        <span className="fretboard-view__target-note">{targetNote}</span>
      </div>

      {revealed && (
        <div className="fretboard-view__score">
          找到 <span>{stats.found}</span> / {stats.total} 个
          {stats.wrong > 0 && <> · 误点 <span style={{color:'var(--wrong)'}}>{stats.wrong}</span> 个</>}
        </div>
      )}

      <div className="fretboard-scroll">
        <div className="fretboard">
          {/* Fret numbers */}
          <div className="fret-numbers">
            <div />
            {Array.from({ length: FRET_COUNT }, (_, f) => (
              <div key={f} className={`fret-number${MARKER_FRETS.has(f) ? ' marker' : ''}`}>
                {f}
              </div>
            ))}
          </div>

          {/* String rows: string 0 = high e at top */}
          {STRING_NAMES.map((name, s) => (
            <div key={s} className="string-row">
              <span className="string-label">{name}</span>
              {Array.from({ length: FRET_COUNT }, (_, f) => {
                const state = dotState(s, f)
                return (
                  <div
                    key={f}
                    className={`fret-dot ${state}`}
                    onClick={() => toggleSelect(s, f)}
                  >
                    <div className="fret-dot__inner">
                      {dotLabel(s, f)}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="fretboard-view__actions">
        {!revealed ? (
          <button className="fretboard-action-btn primary" onClick={handleReveal}>
            完成
          </button>
        ) : (
          <button className="fretboard-action-btn primary" onClick={handleNext}>
            下一题
          </button>
        )}
      </div>
    </div>
  )
}
