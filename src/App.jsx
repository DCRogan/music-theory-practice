import { useReducer, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { generateQuestion } from './logic/questionGenerator'
import HUD from './components/HUD'
import QuestionCard from './components/QuestionCard'
import AnswerGrid from './components/AnswerGrid'
import FretboardView from './components/FretboardView'
import './App.css'

const initialState = {
  modeId: 'mode1',
  question: null,
  selected: null,
  status: 'idle',
  score: 0,
  total: 0,
  streak: 0,
  descending: false,
  view: 'quiz',
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...initialState, modeId: action.modeId, question: action.question, descending: state.descending, view: state.view }
    case 'NEXT_QUESTION':
      return { ...state, question: action.question, selected: null, status: 'idle' }
    case 'TOGGLE_DESCENDING':
      return { ...state, descending: !state.descending }
    case 'SET_VIEW':
      return { ...state, view: action.view }
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
    dispatch({ type: 'NEXT_QUESTION', question: generateQuestion('mode1', false) })
  }, [])

  function handleModeChange(modeId) {
    dispatch({ type: 'SET_MODE', modeId, question: generateQuestion(modeId, state.descending) })
  }

  function handleToggleDescending() {
    dispatch({ type: 'TOGGLE_DESCENDING' })
  }

  function handleViewChange(view) {
    dispatch({ type: 'SET_VIEW', view })
  }

  function handleSelect(option) {
    if (state.status === 'idle') {
      dispatch({ type: 'SELECT', option })
    } else if (state.status === 'wrong' && option === state.question.answer) {
      // User clicked the correct answer after a wrong attempt — advance to next question
      dispatch({ type: 'NEXT_QUESTION', question: generateQuestion(state.modeId, state.descending) })
    }
  }

  useEffect(() => {
    if (state.status !== 'correct') return
    const t = setTimeout(() => {
      dispatch({ type: 'NEXT_QUESTION', question: generateQuestion(state.modeId, state.descending) })
    }, 800)
    return () => clearTimeout(t)
  }, [state.status, state.question])

  if (!state.question) return null

  return (
    <div className="app">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%' }}
      >
        <HUD
          modeId={state.modeId}
          score={state.score}
          total={state.total}
          streak={state.streak}
          descending={state.descending}
          view={state.view}
          onModeChange={handleModeChange}
          onToggleDescending={handleToggleDescending}
          onViewChange={handleViewChange}
        />
      </motion.div>

      <div className="app__body">
        {state.view === 'fretboard' ? (
          <FretboardView />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={state.question.modeId + JSON.stringify(state.question.prompt)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
            >
              <QuestionCard question={state.question} />
              <AnswerGrid
                question={state.question}
                selected={state.selected}
                status={state.status}
                onSelect={handleSelect}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
