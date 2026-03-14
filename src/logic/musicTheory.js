// ---- Chromatic note names (legacy, used by fretboard) ----
export const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

// ---- Interval names by semitone count ----
export const INTERVALS = {
  0:  '纯一度',
  1:  '小二度',
  2:  '大二度',
  3:  '小三度',
  4:  '大三度',
  5:  '纯四度',
  6:  '增四度',
  7:  '纯五度',
  8:  '小六度',
  9:  '大六度',
  10: '小七度',
  11: '大七度',
  12: '纯八度',
}

// Solfege degree -> semitones from root (natural major scale)
export const SOLFEGE = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 }

// Reverse: semitones -> solfege degree (only major scale tones)
const SEMITONES_TO_SOLFEGE = Object.fromEntries(
  Object.entries(SOLFEGE).map(([deg, semi]) => [semi, String(deg)])
)

// ---- Note object system ----
// Note = { letter: 'C'..'B', accidental: -2(bb) | -1(b) | 0 | 1(#) | 2(x) }

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

// Semitone value for each natural letter
const LETTER_TO_SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

// Interval degree -> letter steps (degree 1 = 0 steps, degree 2 = 1 step, etc.)
// Also the natural semitone offset for each degree in a major scale context
const DEGREE_SEMITONES = [0, 2, 4, 5, 7, 9, 11] // index 0=unison, 1=2nd, ..., 6=7th

/**
 * Parse a note string like "C", "Bb", "F#", "Cx", "Ebb" into a Note object.
 */
export function parseNote(str) {
  if (!str || str.length === 0) return null
  const letter = str[0].toUpperCase()
  if (!LETTERS.includes(letter)) return null
  const suffix = str.slice(1)
  let accidental = 0
  if (suffix === '#')       accidental = 1
  else if (suffix === 'b')  accidental = -1
  else if (suffix === 'x')  accidental = 2
  else if (suffix === 'bb') accidental = -2
  else if (suffix === '##') accidental = 2
  else if (suffix !== '')   return null
  return { letter, accidental }
}

/**
 * Format a Note object into a display string.
 * Uses "x" for double-sharp, "bb" for double-flat.
 */
export function formatNote(note) {
  if (!note) return ''
  const acc = note.accidental
  const suffix = acc === 2 ? 'x' : acc === 1 ? '#' : acc === -1 ? 'b' : acc === -2 ? 'bb' : ''
  return note.letter + suffix
}

/**
 * Get the semitone value (0-11) of a Note.
 */
export function noteToSemitone(note) {
  return ((LETTER_TO_SEMI[note.letter] + note.accidental) % 12 + 12) % 12
}

/**
 * Get the letter index (0-6) for a given letter.
 */
function letterIndex(letter) {
  return LETTERS.indexOf(letter)
}

/**
 * Compute the target note of an interval from a root note.
 *
 * @param {object} root - Root Note object
 * @param {number} degree - Interval degree (1=unison, 2=second, ..., 7=seventh)
 * @param {number} semitones - Desired semitone distance (0-12)
 * @param {'up'|'down'} direction - Direction of interval
 * @returns {object} Target Note object
 */
export function intervalNote(root, degree, semitones, direction = 'up') {
  // Target letter: count (degree-1) letter steps from root letter
  const rootLi = letterIndex(root.letter)
  const steps = ((degree - 1) % 7 + 7) % 7

  let targetLi, targetLetter, naturalSemiDiff

  if (direction === 'up') {
    targetLi = (rootLi + steps) % 7
    targetLetter = LETTERS[targetLi]
    // Natural semitone distance (ascending) from root letter to target letter
    naturalSemiDiff = ((LETTER_TO_SEMI[targetLetter] - LETTER_TO_SEMI[root.letter]) % 12 + 12) % 12
  } else {
    targetLi = ((rootLi - steps) % 7 + 7) % 7
    targetLetter = LETTERS[targetLi]
    // Natural semitone distance (descending) from root letter to target letter
    naturalSemiDiff = ((LETTER_TO_SEMI[root.letter] - LETTER_TO_SEMI[targetLetter]) % 12 + 12) % 12
  }

  // The accidental needed = root's accidental contribution + (desired semitones - natural diff)
  // For ascending: target_semi = root_semi + semitones
  //   target_letter_semi + target_acc = root_letter_semi + root_acc + semitones
  //   target_acc = root_acc + semitones - naturalSemiDiff
  // For descending: target_semi = root_semi - semitones
  //   target_letter_semi + target_acc = root_letter_semi + root_acc - semitones
  //   target_acc = root_acc - semitones + naturalSemiDiff
  //   But we also need: naturalSemiDiff = root_letter_semi - target_letter_semi (mod 12)
  //   So: target_acc = root_acc - semitones + naturalSemiDiff

  let targetAcc
  if (direction === 'up') {
    targetAcc = root.accidental + semitones - naturalSemiDiff
  } else {
    targetAcc = root.accidental - semitones + naturalSemiDiff
  }

  // Normalize: keep accidental within -2..+2 range
  // If out of range, the interval produces a theoretically unusual note, but we allow it
  return { letter: targetLetter, accidental: targetAcc }
}

/**
 * Compute the semitone distance between two Note objects (ascending).
 */
export function semitonesBetweenNotes(a, b) {
  return ((noteToSemitone(b) - noteToSemitone(a)) % 12 + 12) % 12
}

/**
 * Determine the interval degree between two notes based on letter distance.
 * Returns 1-7 (1=unison/octave, 2=second, ..., 7=seventh).
 */
export function intervalDegree(a, b, direction = 'up') {
  const aLi = letterIndex(a.letter)
  const bLi = letterIndex(b.letter)
  if (direction === 'up') {
    return ((bLi - aLi) % 7 + 7) % 7 + 1
  } else {
    return ((aLi - bLi) % 7 + 7) % 7 + 1
  }
}

// ---- Interval definition table ----
// Maps (degree, quality) -> semitones.  Also maps semitones -> (degree, quality) for lookup.
// degree is 1-indexed: 1=unison, 2=second, ..., 7=seventh

export const INTERVAL_DEFS = [
  { degree: 1, semitones: 0,  name: '纯一度' },
  { degree: 2, semitones: 1,  name: '小二度' },
  { degree: 2, semitones: 2,  name: '大二度' },
  { degree: 3, semitones: 3,  name: '小三度' },
  { degree: 3, semitones: 4,  name: '大三度' },
  { degree: 4, semitones: 5,  name: '纯四度' },
  { degree: 4, semitones: 6,  name: '增四度' },
  { degree: 5, semitones: 7,  name: '纯五度' },
  { degree: 6, semitones: 8,  name: '小六度' },
  { degree: 6, semitones: 9,  name: '大六度' },
  { degree: 7, semitones: 10, name: '小七度' },
  { degree: 7, semitones: 11, name: '大七度' },
  { degree: 1, semitones: 12, name: '纯八度' },
]

// Lookup: semitones -> { degree, name }
const SEMI_TO_INTERVAL_DEF = {}
INTERVAL_DEFS.forEach(d => { SEMI_TO_INTERVAL_DEF[d.semitones] = d })

/**
 * Get the interval definition for a given semitone count.
 */
export function getIntervalDef(semitones) {
  return SEMI_TO_INTERVAL_DEF[semitones] ?? null
}

// ---- Legacy API (backward compatibility) ----

export function noteAt(root, semitones) {
  const rootIdx = NOTES.indexOf(root)
  return NOTES[(rootIdx + semitones) % 12]
}

export function semitonesBetween(root, target) {
  const rootIdx = NOTES.indexOf(root)
  const targetIdx = NOTES.indexOf(target)
  return (targetIdx - rootIdx + 12) % 12
}

export function intervalName(semitones) {
  return INTERVALS[semitones] ?? null
}

export function solfegeName(semitones) {
  return SEMITONES_TO_SOLFEGE[semitones] ?? null
}
