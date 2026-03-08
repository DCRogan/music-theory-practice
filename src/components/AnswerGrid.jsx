import './AnswerGrid.css'
import OptionButton from './OptionButton'

export default function AnswerGrid({ question, selected, status, onSelect }) {
  return (
    <div className="answer-grid">
      {question.options.map(opt => (
        <OptionButton
          key={opt}
          option={opt}
          status={status}
          isCorrect={opt === question.answer}
          isSelected={opt === selected}
          onClick={() => onSelect(opt)}
        />
      ))}
    </div>
  )
}
