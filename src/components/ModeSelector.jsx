import { memo } from 'react'
import { MODES } from '../logic/questionGenerator'
import './ModeSelector.css'

const singleModes = MODES.filter(m => m.group === 'single')
const mixModes = MODES.filter(m => m.group === 'mix')

function ModeSelector({ modeId, onModeChange }) {
  return (
    <div className="mode-selector">
      <div className="mode-selector__group">
        <span className="mode-selector__group-label">single</span>
        <div className="mode-selector__options">
          {singleModes.map(m => (
            <button
              key={m.id}
              className={`mode-chip ${modeId === m.id ? 'active' : ''}`}
              onClick={() => onModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mode-selector__group">
        <span className="mode-selector__group-label">mix</span>
        <div className="mode-selector__options">
          {mixModes.map(m => (
            <button
              key={m.id}
              className={`mode-chip ${modeId === m.id ? 'active' : ''}`}
              onClick={() => onModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(ModeSelector)
