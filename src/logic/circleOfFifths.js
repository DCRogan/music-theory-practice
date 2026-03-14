// Circle of Fifths data and utilities

// 12 positions in clockwise fifths order starting from C (12 o'clock)
// Each entry: major key, relative minor, number of sharps (positive) or flats (negative)
export const CIRCLE = [
  { major: 'C',  minor: 'Am',  accidentals: 0,  sharps: [],                             flats: [] },
  { major: 'G',  minor: 'Em',  accidentals: 1,  sharps: ['F#'],                         flats: [] },
  { major: 'D',  minor: 'Bm',  accidentals: 2,  sharps: ['F#','C#'],                    flats: [] },
  { major: 'A',  minor: 'F#m', accidentals: 3,  sharps: ['F#','C#','G#'],               flats: [] },
  { major: 'E',  minor: 'C#m', accidentals: 4,  sharps: ['F#','C#','G#','D#'],          flats: [] },
  { major: 'B',  minor: 'G#m', accidentals: 5,  sharps: ['F#','C#','G#','D#','A#'],     flats: [] },
  // Enharmonic pair: F#/Gb
  { major: 'F#', minor: 'D#m', accidentals: 6,  sharps: ['F#','C#','G#','D#','A#','E#'], flats: [],
    enharmonic: { major: 'Gb', minor: 'Ebm', accidentals: -6, flats: ['Bb','Eb','Ab','Db','Gb','Cb'] } },
  { major: 'Db', minor: 'Bbm', accidentals: -5, sharps: [],   flats: ['Bb','Eb','Ab','Db','Gb'] },
  { major: 'Ab', minor: 'Fm',  accidentals: -4, sharps: [],   flats: ['Bb','Eb','Ab','Db'] },
  { major: 'Eb', minor: 'Cm',  accidentals: -3, sharps: [],   flats: ['Bb','Eb','Ab'] },
  { major: 'Bb', minor: 'Gm',  accidentals: -2, sharps: [],   flats: ['Bb','Eb'] },
  { major: 'F',  minor: 'Dm',  accidentals: -1, sharps: [],   flats: ['Bb'] },
]

// All 12 major key names (for answer options)
export const MAJOR_KEYS = CIRCLE.map(c => c.major)
export const MINOR_KEYS = CIRCLE.map(c => c.minor)

// Format key signature display: "3#" or "2b" or "0"
export function formatKeySignature(accidentals) {
  if (accidentals === 0) return '0'
  if (accidentals > 0) return `${accidentals}#`
  return `${Math.abs(accidentals)}b`
}

// Get the circle entry by major key name
export function getByMajor(key) {
  return CIRCLE.find(c => c.major === key)
}

// Get dominant key (one step clockwise = +1 position)
export function dominantOf(majorKey) {
  const idx = CIRCLE.findIndex(c => c.major === majorKey)
  if (idx === -1) return null
  return CIRCLE[(idx + 1) % 12].major
}

// Get subdominant key (one step counter-clockwise = -1 position)
export function subdominantOf(majorKey) {
  const idx = CIRCLE.findIndex(c => c.major === majorKey)
  if (idx === -1) return null
  return CIRCLE[(idx + 11) % 12].major
}

// Generate a Circle of Fifths practice question
// Modes:
//   'keyFromSig'     - key signature (e.g. "3#") -> pick the major key
//   'sigFromKey'     - major key name -> pick the key signature
//   'relativeMinor'  - major key -> pick relative minor
//   'dominant'       - find the dominant (V) or subdominant (IV)

export const COF_MODES = [
  { id: 'keyFromSig',    label: '调号→调名' },
  { id: 'sigFromKey',    label: '调名→调号' },
  { id: 'relativeMinor', label: '大调→关系小调' },
  { id: 'dominant',      label: '属调/下属调' },
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

export function generateCofQuestion(modeId) {
  const entry = rand(CIRCLE)

  if (modeId === 'keyFromSig') {
    // Given key signature -> pick major key name
    const sigStr = formatKeySignature(entry.accidentals)
    const answer = entry.major
    const wrongs = shuffle(MAJOR_KEYS.filter(k => k !== answer)).slice(0, 3)
    return {
      modeId,
      prompt: { type: 'keySignature', value: sigStr },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'key',
      highlightAnswer: true,  // highlight answer position on circle
    }
  }

  if (modeId === 'sigFromKey') {
    // Given major key name -> pick key signature
    const answer = formatKeySignature(entry.accidentals)
    const wrongSigs = shuffle(
      CIRCLE.filter(c => c.major !== entry.major)
        .map(c => formatKeySignature(c.accidentals))
        .filter(s => s !== answer)
    ).slice(0, 3)
    return {
      modeId,
      prompt: { type: 'keyName', value: entry.major },
      answer,
      options: shuffle([answer, ...wrongSigs]),
      answerType: 'signature',
      highlightKey: entry.major,
    }
  }

  if (modeId === 'relativeMinor') {
    // Given major key -> pick relative minor
    const answer = entry.minor
    const wrongs = shuffle(MINOR_KEYS.filter(k => k !== answer)).slice(0, 3)
    return {
      modeId,
      prompt: { type: 'majorKey', value: entry.major },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'key',
      highlightKey: entry.major,
    }
  }

  if (modeId === 'dominant') {
    // Randomly ask for dominant or subdominant
    const askDominant = Math.random() < 0.5
    const answer = askDominant ? dominantOf(entry.major) : subdominantOf(entry.major)
    const label = askDominant ? '属调(V)' : '下属调(IV)'
    const wrongs = shuffle(MAJOR_KEYS.filter(k => k !== answer)).slice(0, 3)
    return {
      modeId,
      prompt: { type: 'domSub', value: entry.major, subType: label },
      answer,
      options: shuffle([answer, ...wrongs]),
      answerType: 'key',
      highlightKey: entry.major,
    }
  }

  return null
}
