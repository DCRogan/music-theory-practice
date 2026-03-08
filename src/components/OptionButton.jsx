import './OptionButton.css'

export default function OptionButton({ option, status, isCorrect, isSelected, onClick }) {
  let className = 'option-btn'
  let disabled = false
  let showHint = false

  if (status !== 'idle') {
    if (isSelected && isCorrect)  className += ' correct'
    if (isSelected && !isCorrect) className += ' wrong'
    if (!isSelected && isCorrect && status === 'wrong') {
      className += ' hint'
      showHint = true
    }
    if (status === 'wrong' && !isCorrect) disabled = true
    if (status === 'correct') disabled = true
  }

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {option}
      {showHint && <span className="option-btn__hint-text">点击继续</span>}
    </button>
  )
}
