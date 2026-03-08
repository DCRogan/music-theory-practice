import { NOTES, INTERVALS, SOLFEGE, noteAt, semitonesBetween, intervalName, solfegeName } from './musicTheory'

export const MODES = [
  { id: 'mode1', label: '根音+音程→音名',  group: 'single' },
  { id: 'mode2', label: '根音+唱名→音名',  group: 'single' },
  { id: 'mode3', label: '根音+半音→音名',  group: 'single' },
  { id: 'mode4', label: '两音→音程名',     group: 'single' },
  { id: 'mode5', label: '两音→唱名',       group: 'single' },
  { id: 'mode6', label: '两音→半音数',     group: 'single' },
  { id: 'mode7', label: '音程名→半音数',   group: 'single' },
  { id: 'mode8', label: '半音数→音程名',   group: 'single' },
  { id: 'mixA',  label: '混合A (1+2+3)',   group: 'mix' },
  { id: 'mixB',  label: '混合B (4+5+6)',   group: 'mix' },
  { id: 'mixC',  label: '混合C (7+8)',     group: 'mix' },
  { id: 'full',  label: '全随机',          group: 'mix' },
]

const SINGLE_MODE_IDS = ['mode1','mode2','mode3','mode4','mode5','mode6','mode7','mode8']
const INTERVAL_NAMES = Object.values(INTERVALS)
const SOLFEGE_DEGREES = Object.keys(SOLFEGE).map(Number)
// semitone values that map to major scale degrees
const MAJOR_SEMITONES = Object.values(SOLFEGE)
// All valid semitone counts for interval questions (0-12)
const ALL_SEMITONES = Object.keys(INTERVALS).map(Number)

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function wrongNotes(correct, count = 3) {
  const pool = NOTES.filter(n => n !== correct)
  return shuffle(pool).slice(0, count)
}

function wrongIntervals(correctSemitones, count = 3) {
  const correctName = INTERVALS[correctSemitones]
  const candidates = []
  for (const delta of [-1, 1, -2, 2, -3, 3]) {
    const s = correctSemitones + delta
    if (s >= 0 && s <= 12 && s !== correctSemitones && INTERVALS[s]) {
      candidates.push(INTERVALS[s])
    }
  }
  const all = INTERVAL_NAMES.filter(n => n !== correctName && !candidates.includes(n))
  const pool = [...candidates, ...shuffle(all)]
  return [...new Set(pool)].slice(0, count)
}

function wrongSolfege(correctDeg, count = 3) {
  const pool = SOLFEGE_DEGREES.filter(d => d !== correctDeg)
  return shuffle(pool).slice(0, count)
}

function wrongSemitones(correct, count = 3) {
  const candidates = []
  for (const delta of [-1, 1, -2, 2]) {
    const s = correct + delta
    if (s >= 1 && s <= 12 && s !== correct) candidates.push(s)
  }
  const all = Array.from({length: 12}, (_, i) => i + 1).filter(s => s !== correct && !candidates.includes(s))
  const pool = [...candidates, ...shuffle(all)]
  return [...new Set(pool)].slice(0, count)
}

// Wrong semitone counts for interval questions (0-12 range)
function wrongIntervalSemitones(correct, count = 3) {
  const candidates = []
  for (const delta of [-1, 1, -2, 2]) {
    const s = correct + delta
    if (s >= 0 && s <= 12 && s !== correct) candidates.push(s)
  }
  const all = Array.from({length: 13}, (_, i) => i).filter(s => s !== correct && !candidates.includes(s))
  const pool = [...candidates, ...shuffle(all)]
  return [...new Set(pool)].slice(0, count)
}

function makeQuestion(modeId) {
  const root = rand(NOTES)

  if (modeId === 'mode1') {
    const semi = rand(ALL_SEMITONES)
    const intName = INTERVALS[semi]
    const answer = noteAt(root, semi)
    const wrongs = wrongNotes(answer)
    return {
      modeId,
      prompt: { root, condition: intName, conditionType: 'interval' },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'note',
    }
  }

  if (modeId === 'mode2') {
    const deg = rand(SOLFEGE_DEGREES)
    const semi = SOLFEGE[deg]
    const answer = noteAt(root, semi)
    const wrongs = wrongNotes(answer)
    return {
      modeId,
      prompt: { root, condition: String(deg), conditionType: 'solfege' },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'note',
    }
  }

  if (modeId === 'mode3') {
    const semi = Math.floor(Math.random() * 12) + 1
    const answer = noteAt(root, semi)
    const wrongs = wrongNotes(answer)
    return {
      modeId,
      prompt: { root, condition: String(semi), conditionType: 'semitone' },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'note',
    }
  }

  if (modeId === 'mode4') {
    const target = rand(NOTES)
    const semi = semitonesBetween(root, target)
    const answer = intervalName(semi)
    const wrongs = wrongIntervals(semi)
    return {
      modeId,
      prompt: { root, target },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'interval',
    }
  }

  if (modeId === 'mode5') {
    const semi = rand(MAJOR_SEMITONES)
    const target = noteAt(root, semi)
    const answer = solfegeName(semi)
    const wrongs = wrongSolfege(Number(answer))
    return {
      modeId,
      prompt: { root, target },
      answer,
      options: shuffle([answer, ...wrongs.map(String)]),
      answerType: 'solfege',
    }
  }

  if (modeId === 'mode6') {
    const semi = Math.floor(Math.random() * 12) + 1
    const target = noteAt(root, semi)
    const answer = String(semi)
    const wrongs = wrongSemitones(semi).map(String)
    return {
      modeId,
      prompt: { root, target },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'semitone',
    }
  }

  if (modeId === 'mode7') {
    // Given interval name -> select semitone count
    const semi = rand(ALL_SEMITONES)
    const intName = INTERVALS[semi]
    const answer = String(semi)
    const wrongs = wrongIntervalSemitones(semi).map(String)
    return {
      modeId,
      prompt: { condition: intName, conditionType: 'intervalToSemitone' },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'semitone',
    }
  }

  if (modeId === 'mode8') {
    // Given semitone count -> select interval name
    const semi = rand(ALL_SEMITONES)
    const answer = INTERVALS[semi]
    const wrongs = wrongIntervals(semi)
    return {
      modeId,
      prompt: { condition: String(semi), conditionType: 'semitoneToInterval' },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'interval',
    }
  }

  return null
}

export function generateQuestion(modeId) {
  if (modeId === 'mixA') return makeQuestion(rand(['mode1','mode2','mode3']))
  if (modeId === 'mixB') return makeQuestion(rand(['mode4','mode5','mode6']))
  if (modeId === 'mixC') return makeQuestion(rand(['mode7','mode8']))
  if (modeId === 'full') return makeQuestion(rand(SINGLE_MODE_IDS))
  return makeQuestion(modeId)
}
