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
