import { useReducer, useEffect } from 'react'
import { generateQuestion } from './logic/questionGenerator'
import HUD from './components/HUD'
import QuestionCard from './components/QuestionCard'
import AnswerGrid from './components/AnswerGrid'

const initialState = {
  modeId: 'mode1',
  question: null,
  selected: null,
  status: 'idle',
  score: 0,
  total: 0,
  streak: 0,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...initialState, modeId: action.modeId, question: action.question }
    case 'NEXT_QUESTION':
      return { ...state, question: action.question, selected: null, status: 'idle' }
    case 'SELECT': {
      const correct = action.option === state.question.answer
      return {
        ...state,
        selected: action.option,
        status: correct ? 'correct' : 'wrong',
        score: correct ? state.score + 1 : state.score,
        total: state.total + 1,
        streak: correct ? state.streak + 1 : 0,
      }
    }
    default: return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    dispatch({ type: 'NEXT_QUESTION', question: generateQuestion('mode1') })
  }, [])

  function handleModeChange(modeId) {
    dispatch({ type: 'SET_MODE', modeId, question: generateQuestion(modeId) })
  }

  function handleSelect(option) {
    if (state.status !== 'idle') return
    dispatch({ type: 'SELECT', option })
  }

  useEffect(() => {
    if (state.status !== 'correct') return
    const t = setTimeout(() => {
      dispatch({ type: 'NEXT_QUESTION', question: generateQuestion(state.modeId) })
    }, 800)
    return () => clearTimeout(t)
  }, [state.status, state.question])

  if (!state.question) return null

  return (
    <div style={{ padding: '1rem', color: 'white' }}>
      <HUD
        modeId={state.modeId}
        score={state.score}
        total={state.total}
        streak={state.streak}
        onModeChange={handleModeChange}
      />
      <QuestionCard question={state.question} />
      <AnswerGrid
        question={state.question}
        selected={state.selected}
        status={state.status}
        onSelect={handleSelect}
      />
    </div>
  )
}
