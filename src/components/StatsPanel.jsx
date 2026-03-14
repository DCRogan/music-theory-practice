import { memo, useState, useCallback } from 'react'
import { getModeStats, getStats, resetStats } from '../logic/storage'
import { MODES } from '../logic/questionGenerator'
import { COF_MODES } from '../logic/circleOfFifths'
import './StatsPanel.css'

const ALL_MODES = [...MODES, ...COF_MODES.map(m => ({ ...m, id: `cof_${m.id}` }))]

function modeLabel(modeId) {
  // Check interval modes
  const mode = MODES.find(m => m.id === modeId)
  if (mode) return mode.label
  // Check CoF modes
  const cofMode = COF_MODES.find(m => `cof_${m.id}` === modeId || m.id === modeId)
  if (cofMode) return `五度圈: ${cofMode.label}`
  return modeId
}

function StatsPanel({ onClose }) {
  const [stats, setStats] = useState(() => getStats())
  const [modeStats, setModeStats] = useState(() => getModeStats())

  const handleReset = useCallback(() => {
    if (confirm('确定要重置所有练习记录吗？')) {
      resetStats()
      setStats(getStats())
      setModeStats(getModeStats())
    }
  }, [])

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-panel" onClick={e => e.stopPropagation()}>
        <div className="stats-panel__header">
          <h2>练习统计</h2>
          <button className="stats-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="stats-panel__summary">
          <div className="stats-summary-item">
            <span className="stats-summary-label">最高连击</span>
            <span className="stats-summary-value">{stats.bestStreak}</span>
          </div>
          <div className="stats-summary-item">
            <span className="stats-summary-label">练习次数</span>
            <span className="stats-summary-value">{stats.totalSessions}</span>
          </div>
        </div>

        {modeStats.length > 0 ? (
          <div className="stats-panel__modes">
            <h3>各模式正确率 <span className="stats-sort-hint">(从低到高)</span></h3>
            {modeStats.map(s => (
              <div key={s.modeId} className="stats-mode-row">
                <span className="stats-mode-label">{modeLabel(s.modeId)}</span>
                <div className="stats-bar-wrap">
                  <div
                    className="stats-bar"
                    style={{ width: `${Math.round(s.accuracy * 100)}%` }}
                    data-weak={s.accuracy < 0.6 ? '' : undefined}
                  />
                </div>
                <span className="stats-mode-pct">
                  {Math.round(s.accuracy * 100)}%
                  <span className="stats-mode-count">({s.correct}/{s.total})</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="stats-empty">暂无练习记录</p>
        )}

        <button className="stats-reset-btn" onClick={handleReset}>重置记录</button>
      </div>
    </div>
  )
}

export default memo(StatsPanel)
