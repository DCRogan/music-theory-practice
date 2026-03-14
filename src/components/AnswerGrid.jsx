import { memo, useCallback } from 'react'
import './AnswerGrid.css'
import OptionButton from './OptionButton'

function AnswerGrid({ question, selected, status, onSelect }) {
  const handleClick = useCallback(opt => onSelect(opt), [onSelect])
  return (
    <div className="answer-grid">
      {question.options.map(opt => (
        <OptionButton
          key={opt}
          option={opt}
          status={status}
          isCorrect={opt === question.answer}
          isSelected={opt === selected}
          onClick={() => handleClick(opt)}
        />
      ))}
    </div>
  )
}

export default memo(AnswerGrid)
