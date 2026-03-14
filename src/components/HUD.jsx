import { memo } from 'react'
import './HUD.css'

function HUD({ score, total, streak, descending, onToggleDescending, onShowStats }) {
  return (
    <div className="hud">
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
      <div className="hud__actions">
        <button
          className={`descending-toggle ${descending ? 'active' : ''}`}
          onClick={onToggleDescending}
          title="开启后题目包含下行音程"
        >
          ↑↓
        </button>
        <button className="stats-btn" onClick={onShowStats} title="查看练习统计">
          📊
        </button>
      </div>
    </div>
  )
}

export default memo(HUD)
