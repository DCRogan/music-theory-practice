import './HUD.css'
import { MODES } from '../logic/questionGenerator'

export default function HUD({ modeId, score, total, streak, descending, view, onModeChange, onToggleDescending, onViewChange }) {
  return (
    <div className="hud">
      <div className="hud__top">
        <div className="hud__modes">
          {MODES.map(m => (
            <button
              key={m.id}
              className={`mode-btn ${view === 'quiz' && modeId === m.id ? 'active' : ''} ${view === 'fretboard' ? 'dimmed' : ''}`}
              onClick={() => { onViewChange('quiz'); onModeChange(m.id) }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          className={`view-toggle-btn ${view === 'fretboard' ? 'active' : ''}`}
          onClick={() => onViewChange(view === 'fretboard' ? 'quiz' : 'fretboard')}
        >
          指板
        </button>
      </div>
      {view === 'quiz' && (
        <div className="hud__bottom">
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
          <button
            className={`descending-toggle ${descending ? 'active' : ''}`}
            onClick={onToggleDescending}
            title="开启后题目包含下行音程"
          >
            ↑↓ 上下行
          </button>
        </div>
      )}
    </div>
  )
}
