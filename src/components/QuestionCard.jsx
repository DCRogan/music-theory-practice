import './QuestionCard.css'

const CONDITION_LABELS = {
  interval: '音程',
  solfege:  '唱名',
  semitone: '半音数',
}

const ANSWER_LABELS = {
  note:     '选出对应的音名',
  interval: '选出音程名称',
  solfege:  '选出唱名',
  semitone: '选出半音数',
}

export default function QuestionCard({ question }) {
  const { prompt, answerType } = question
  const isTwoNote = 'target' in prompt
  const isSoloInterval = prompt.conditionType === 'intervalToSemitone'
  const isSoloSemitone = prompt.conditionType === 'semitoneToInterval'

  return (
    <div className="question-card">
      {isTwoNote ? (
        <>
          <span className="question-card__label">两音关系</span>
          <div className="question-card__two-notes">
            <span className="question-card__root">{prompt.root}</span>
            <span className="question-card__arrow">→</span>
            <span className="question-card__target-note">{prompt.target}</span>
          </div>
        </>
      ) : isSoloInterval ? (
        <>
          <span className="question-card__label">音程名称</span>
          <span className="question-card__solo-value">{prompt.condition}</span>
        </>
      ) : isSoloSemitone ? (
        <>
          <span className="question-card__label">半音数</span>
          <span className="question-card__solo-value">{prompt.condition}</span>
        </>
      ) : (
        <>
          <span className="question-card__label">根音</span>
          <span className="question-card__root">{prompt.root}</span>
          <span className="question-card__separator">+</span>
          <div className="question-card__condition">
            <span className="question-card__condition-type">
              {CONDITION_LABELS[prompt.conditionType]}
            </span>
            <span className="question-card__condition-value">{prompt.condition}</span>
          </div>
        </>
      )}
      <p className="question-card__ask">{ANSWER_LABELS[answerType]}</p>
    </div>
  )
}
