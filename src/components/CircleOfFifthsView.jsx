import { useState, useMemo, memo } from 'react'
import { CIRCLE, COF_MODES, generateCofQuestion, formatKeySignature } from '../logic/circleOfFifths'
import './CircleOfFifthsView.css'

const SIZE = 340
const CX = SIZE / 2
const CY = SIZE / 2
const OUTER_R = 140
const INNER_R = 95
const LABEL_OUTER_R = 118
const LABEL_INNER_R = 73

// Position on circle: index 0 = top (12 o'clock), clockwise
function polarToXY(cx, cy, r, index, total = 12) {
  const angle = (index * 2 * Math.PI / total) - Math.PI / 2
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

// Build arc path for a sector
function sectorPath(cx, cy, r1, r2, startIdx, total = 12) {
  const halfAngle = Math.PI / total
  const centerAngle = (startIdx * 2 * Math.PI / total) - Math.PI / 2

  const a1 = centerAngle - halfAngle
  const a2 = centerAngle + halfAngle

  const outer1 = { x: cx + r2 * Math.cos(a1), y: cy + r2 * Math.sin(a1) }
  const outer2 = { x: cx + r2 * Math.cos(a2), y: cy + r2 * Math.sin(a2) }
  const inner1 = { x: cx + r1 * Math.cos(a2), y: cy + r1 * Math.sin(a2) }
  const inner2 = { x: cx + r1 * Math.cos(a1), y: cy + r1 * Math.sin(a1) }

  return [
    `M ${outer1.x} ${outer1.y}`,
    `A ${r2} ${r2} 0 0 1 ${outer2.x} ${outer2.y}`,
    `L ${inner1.x} ${inner1.y}`,
    `A ${r1} ${r1} 0 0 0 ${inner2.x} ${inner2.y}`,
    'Z',
  ].join(' ')
}

function CircleOfFifthsView() {
  const [cofMode, setCofMode] = useState('keyFromSig')
  const [question, setQuestion] = useState(() => generateCofQuestion('keyFromSig'))
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'correct' | 'wrong'
  const [stats, setStats] = useState({ score: 0, total: 0, streak: 0 })

  // Determine which keys to highlight
  const highlightedKey = question?.highlightKey ?? null

  function handleModeChange(modeId) {
    setCofMode(modeId)
    setQuestion(generateCofQuestion(modeId))
    setSelected(null)
    setStatus('idle')
  }

  function handleNext() {
    setQuestion(generateCofQuestion(cofMode))
    setSelected(null)
    setStatus('idle')
  }

  function handleOptionSelect(option) {
    if (status === 'correct') return
    if (status === 'wrong' && option === question.answer) {
      handleNext()
      return
    }
    if (status !== 'idle') return

    setSelected(option)
    const correct = option === question.answer
    setStatus(correct ? 'correct' : 'wrong')
    setStats(prev => ({
      score: correct ? prev.score + 1 : prev.score,
      total: prev.total + 1,
      streak: correct ? prev.streak + 1 : 0,
    }))

    if (correct) {
      setTimeout(handleNext, 800)
    }
  }

  // Sector colors
  function outerFill(entry, idx) {
    if (status !== 'idle') {
      if (entry.major === question.answer && question.answerType === 'key') return 'var(--correct-bg)'
      if (entry.major === selected && selected !== question.answer) return 'var(--wrong-bg)'
    }
    if (entry.major === highlightedKey) return 'rgba(232,168,56,0.15)'
    if (entry.major === selected) return 'rgba(232,168,56,0.2)'
    return 'transparent'
  }

  function outerStroke(entry) {
    if (status !== 'idle' && entry.major === question.answer && question.answerType === 'key') return 'var(--correct)'
    if (entry.major === highlightedKey) return 'var(--accent)'
    return 'rgba(255,255,255,0.08)'
  }

  function innerFill(entry) {
    if (status !== 'idle') {
      if (entry.minor === question.answer) return 'var(--correct-bg)'
      if (entry.minor === selected && selected !== question.answer) return 'var(--wrong-bg)'
    }
    if (entry.minor === selected) return 'rgba(232,168,56,0.2)'
    return 'transparent'
  }

  function innerStroke(entry) {
    if (status !== 'idle' && entry.minor === question.answer) return 'var(--correct)'
    return 'rgba(255,255,255,0.05)'
  }

  // Can we click the circle to answer?
  const circleClickable = question?.answerType === 'key' && status === 'idle'

  return (
    <div className="cof-view">
      {/* Mode selector */}
      <div className="cof-modes">
        {COF_MODES.map(m => (
          <button
            key={m.id}
            className={`cof-mode-chip ${cofMode === m.id ? 'active' : ''}`}
            onClick={() => handleModeChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Score */}
      <div className="cof-score">
        <span>正确 <strong>{stats.score}</strong></span>
        <span>总计 <strong>{stats.total}</strong></span>
        {stats.streak > 2 && <span className="cof-streak">连击 {stats.streak}</span>}
      </div>

      {/* Question prompt */}
      <div className="cof-prompt">
        {question.prompt.type === 'keySignature' && (
          <>
            <span className="cof-prompt__label">调号</span>
            <span className="cof-prompt__value">{question.prompt.value}</span>
            <span className="cof-prompt__ask">选出对应的大调</span>
          </>
        )}
        {question.prompt.type === 'keyName' && (
          <>
            <span className="cof-prompt__label">大调</span>
            <span className="cof-prompt__value">{question.prompt.value}</span>
            <span className="cof-prompt__ask">选出调号</span>
          </>
        )}
        {question.prompt.type === 'majorKey' && (
          <>
            <span className="cof-prompt__label">{question.prompt.value} 大调</span>
            <span className="cof-prompt__ask">选出关系小调</span>
          </>
        )}
        {question.prompt.type === 'domSub' && (
          <>
            <span className="cof-prompt__label">{question.prompt.value} 大调</span>
            <span className="cof-prompt__ask">找出它的{question.prompt.subType}</span>
          </>
        )}
      </div>

      {/* SVG Circle */}
      <div className="cof-circle-wrap">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="cof-svg">
          {/* Outer ring sectors (major keys) */}
          {CIRCLE.map((entry, i) => (
            <g key={`outer-${i}`}>
              <path
                d={sectorPath(CX, CY, INNER_R + 2, OUTER_R, i)}
                fill={outerFill(entry, i)}
                stroke={outerStroke(entry)}
                strokeWidth={1}
                className={circleClickable ? 'cof-sector-clickable' : ''}
                onClick={() => circleClickable && handleOptionSelect(entry.major)}
              />
              {/* Major key label */}
              {(() => {
                const pos = polarToXY(CX, CY, LABEL_OUTER_R, i)
                return (
                  <text
                    x={pos.x} y={pos.y + 4}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="'JetBrains Mono', monospace"
                    fill={
                      status !== 'idle' && entry.major === question.answer && question.answerType === 'key'
                        ? '#a8d5b0'
                        : entry.major === highlightedKey ? 'var(--accent)' : 'var(--text)'
                    }
                    style={{ pointerEvents: 'none' }}
                  >
                    {entry.major}
                  </text>
                )
              })()}
            </g>
          ))}

          {/* Inner ring sectors (minor keys) */}
          {CIRCLE.map((entry, i) => (
            <g key={`inner-${i}`}>
              <path
                d={sectorPath(CX, CY, 30, INNER_R, i)}
                fill={innerFill(entry)}
                stroke={innerStroke(entry)}
                strokeWidth={0.5}
                className={circleClickable && question.answerType === 'key' && question.modeId === 'relativeMinor' ? 'cof-sector-clickable' : ''}
                onClick={() => {
                  if (question.modeId === 'relativeMinor' && status === 'idle') {
                    handleOptionSelect(entry.minor)
                  }
                }}
              />
              {/* Minor key label */}
              {(() => {
                const pos = polarToXY(CX, CY, LABEL_INNER_R, i)
                return (
                  <text
                    x={pos.x} y={pos.y + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="500"
                    fontFamily="'JetBrains Mono', monospace"
                    fill={
                      status !== 'idle' && entry.minor === question.answer
                        ? '#a8d5b0' : 'var(--text-dim)'
                    }
                    style={{ pointerEvents: 'none' }}
                  >
                    {entry.minor}
                  </text>
                )
              })()}
            </g>
          ))}

          {/* Center circle */}
          <circle cx={CX} cy={CY} r={28} fill="var(--bg)" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
        </svg>
      </div>

      {/* Button options (for sigFromKey mode or as fallback) */}
      {question.answerType === 'signature' && (
        <div className="cof-options">
          {question.options.map(opt => {
            let cls = 'cof-option-btn'
            if (status !== 'idle') {
              if (opt === question.answer) cls += status === 'correct' || opt === selected ? ' correct' : ' hint'
              else if (opt === selected) cls += ' wrong'
            } else if (opt === selected) {
              cls += ' selected'
            }
            return (
              <button key={opt} className={cls} onClick={() => handleOptionSelect(opt)}>
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {/* Status indicator */}
      {status === 'wrong' && (
        <div className="cof-hint">
          正确答案: <strong>{question.answer}</strong>
          <button className="cof-next-btn" onClick={handleNext}>下一题</button>
        </div>
      )}
    </div>
  )
}

export default memo(CircleOfFifthsView)
