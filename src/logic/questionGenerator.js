import {
  NOTES, INTERVALS, SOLFEGE, intervalName, solfegeName,
  parseNote, formatNote, noteToSemitone, intervalNote,
  semitonesBetweenNotes, getIntervalDef, INTERVAL_DEFS,
} from './musicTheory'

export const MODES = [
  { id: 'mode1',  label: '根音+音程→音名',  group: 'single' },
  { id: 'mode2',  label: '根音+唱名→音名',  group: 'single' },
  { id: 'mode3',  label: '根音+半音→音名',  group: 'single' },
  { id: 'mode4',  label: '两音→音程名',     group: 'single' },
  { id: 'mode5',  label: '两音→唱名',       group: 'single' },
  { id: 'mode6',  label: '两音→半音数',     group: 'single' },
  { id: 'mode7',  label: '音程名→半音数',   group: 'single' },
  { id: 'mode8',  label: '半音数→音程名',   group: 'single' },
  { id: 'mode9',  label: '唱名→半音数',     group: 'single' },
  { id: 'mode10', label: '半音数→唱名',     group: 'single' },
  { id: 'mixA',   label: '混合A (1+2+3)',   group: 'mix' },
  { id: 'mixB',   label: '混合B (4+5+6)',   group: 'mix' },
  { id: 'mixC',   label: '混合C (7~10)',    group: 'mix' },
  { id: 'full',   label: '全随机',          group: 'mix' },
]

const SINGLE_MODE_IDS = ['mode1','mode2','mode3','mode4','mode5','mode6','mode7','mode8','mode9','mode10']
const INTERVAL_NAMES = Object.values(INTERVALS)
const SOLFEGE_DEGREES = Object.keys(SOLFEGE).map(Number)
const MAJOR_SEMITONES = Object.values(SOLFEGE)
// Semitones 1-11 for note-producing intervals (exclude unison=0 and octave=12)
const ALL_SEMITONES = Object.keys(INTERVALS).map(Number).filter(s => s >= 1 && s <= 11)

// Common root notes for question generation (natural + single sharp/flat)
const ROOT_NOTES = [
  'C', 'D', 'E', 'F', 'G', 'A', 'B',
  'C#', 'D#', 'F#', 'G#', 'A#',
  'Db', 'Eb', 'Gb', 'Ab', 'Bb',
]

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

// Generate wrong note options that are different from the correct answer
// Returns formatted note strings
function wrongNotes(correctStr, count = 3) {
  const correctSemi = noteToSemitone(parseNote(correctStr))
  // Pick notes that are nearby in semitone space but different
  const candidates = []
  for (const delta of [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5]) {
    const semi = ((correctSemi + delta) % 12 + 12) % 12
    // Use simple sharp/flat names for wrong options
    const name = NOTES[semi]
    // Also try flat version for variety
    const flatName = flatVersion(semi)
    if (name !== correctStr && !candidates.includes(name)) candidates.push(name)
    if (flatName && flatName !== correctStr && flatName !== name && !candidates.includes(flatName)) candidates.push(flatName)
  }
  return shuffle(candidates).slice(0, count)
}

// Get flat-name version of a semitone value (when there's a sharp equivalent)
function flatVersion(semi) {
  const flatMap = { 1: 'Db', 3: 'Eb', 6: 'Gb', 8: 'Ab', 10: 'Bb' }
  return flatMap[semi] ?? null
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

function makeQuestion(modeId, allowDescending = false) {
  const rootStr = rand(ROOT_NOTES)
  const root = parseNote(rootStr)
  const descending = allowDescending && Math.random() < 0.5
  const direction = descending ? 'down' : 'up'

  if (modeId === 'mode1') {
    // Root + interval name -> target note name
    const semi = rand(ALL_SEMITONES)
    const def = getIntervalDef(semi)
    const intName = def.name
    const targetNote = intervalNote(root, def.degree, semi, direction)
    const answer = formatNote(targetNote)
    const wrongs = wrongNotes(answer)
    return {
      modeId,
      prompt: { root: formatNote(root), condition: intName, conditionType: 'interval', direction },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'note',
    }
  }

  if (modeId === 'mode2') {
    // Root + solfege degree -> target note name
    const deg = rand(SOLFEGE_DEGREES)
    const semi = SOLFEGE[deg]
    const def = getIntervalDef(semi)
    const targetNote = intervalNote(root, def.degree, semi, direction)
    const answer = formatNote(targetNote)
    const wrongs = wrongNotes(answer)
    return {
      modeId,
      prompt: { root: formatNote(root), condition: String(deg), conditionType: 'solfege', direction },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'note',
    }
  }

  if (modeId === 'mode3') {
    // Root + semitone count -> target note name
    const semi = Math.floor(Math.random() * 12) + 1
    const def = getIntervalDef(semi)
    const targetNote = intervalNote(root, def.degree, semi, direction)
    const answer = formatNote(targetNote)
    const wrongs = wrongNotes(answer)
    return {
      modeId,
      prompt: { root: formatNote(root), condition: String(semi), conditionType: 'semitone', direction },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'note',
    }
  }

  if (modeId === 'mode4') {
    // Two notes -> interval name
    const semi = rand(ALL_SEMITONES)
    const def = getIntervalDef(semi)
    const targetNote = intervalNote(root, def.degree, semi, direction)
    const answer = def.name
    const wrongs = wrongIntervals(semi)
    return {
      modeId,
      prompt: { root: formatNote(root), target: formatNote(targetNote), direction },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'interval',
    }
  }

  if (modeId === 'mode5') {
    // Two notes -> solfege degree
    const semi = rand(MAJOR_SEMITONES)
    const def = getIntervalDef(semi)
    const targetNote = intervalNote(root, def.degree, semi, direction)
    const answer = solfegeName(semi)
    const wrongs = wrongSolfege(Number(answer))
    return {
      modeId,
      prompt: { root: formatNote(root), target: formatNote(targetNote), direction },
      answer,
      options: shuffle([answer, ...wrongs.map(String)]),
      answerType: 'solfege',
    }
  }

  if (modeId === 'mode6') {
    // Two notes -> semitone count
    const semi = Math.floor(Math.random() * 12) + 1
    const def = getIntervalDef(semi)
    const targetNote = intervalNote(root, def.degree, semi, direction)
    const answer = String(semi)
    const wrongs = wrongSemitones(semi).map(String)
    return {
      modeId,
      prompt: { root: formatNote(root), target: formatNote(targetNote), direction },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'semitone',
    }
  }

  if (modeId === 'mode7') {
    // Interval name -> semitone count
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
    // Semitone count -> interval name
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

  if (modeId === 'mode9') {
    // Solfege degree -> semitone count
    const deg = rand(SOLFEGE_DEGREES)
    const semi = SOLFEGE[deg]
    const answer = String(semi)
    const adjWrongs = wrongIntervalSemitones(semi).filter(s => MAJOR_SEMITONES.includes(s)).map(String)
    const allWrongMajor = MAJOR_SEMITONES.filter(s => s !== semi).map(String)
    const filledWrongs = [...new Set([...adjWrongs, ...shuffle(allWrongMajor)])].slice(0, 3)
    return {
      modeId,
      prompt: { condition: String(deg), conditionType: 'solfegeToSemitone' },
      answer,
      options: shuffle([answer, ...filledWrongs]),
      answerType: 'semitone',
    }
  }

  if (modeId === 'mode10') {
    // Semitone count (major scale) -> solfege degree
    const semi = rand(MAJOR_SEMITONES)
    const answer = solfegeName(semi)
    const wrongs = wrongSolfege(Number(answer))
    return {
      modeId,
      prompt: { condition: String(semi), conditionType: 'semitoneToSolfege' },
      answer,
      options: shuffle([answer, ...wrongs.map(String)]),
      answerType: 'solfege',
    }
  }

  return null
}

export function generateQuestion(modeId, allowDescending = false) {
  if (modeId === 'mixA') return makeQuestion(rand(['mode1','mode2','mode3']), allowDescending)
  if (modeId === 'mixB') return makeQuestion(rand(['mode4','mode5','mode6']), allowDescending)
  if (modeId === 'mixC') return makeQuestion(rand(['mode7','mode8','mode9','mode10']), allowDescending)
  if (modeId === 'full') return makeQuestion(rand(SINGLE_MODE_IDS), allowDescending)
  return makeQuestion(modeId, allowDescending)
}
