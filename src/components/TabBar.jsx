import { memo } from 'react'
import './TabBar.css'

const TABS = [
  { id: 'quiz',       label: '音程练习', icon: '♪' },
  { id: 'circle',     label: '五度圈',  icon: '◎' },
  { id: 'fretboard',  label: '指板',    icon: '🎸' },
]

function TabBar({ activeTab, onTabChange }) {
  return (
    <nav className="tab-bar">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tab-bar__item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-bar__icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

export default memo(TabBar)
