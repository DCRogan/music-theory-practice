export const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

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
