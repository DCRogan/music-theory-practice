import { NOTES, noteToSemitone, parseNote } from './musicTheory'

// Open string notes (indices into NOTES), string 0 = high e, string 5 = low E
export const OPEN_STRINGS = [4, 11, 7, 2, 9, 4]

export const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']

export const FRET_COUNT = 13 // frets 0-12

// Returns the note name at a given string and fret (always uses sharp names from NOTES)
export function noteAtFret(string, fret) {
  return NOTES[(OPEN_STRINGS[string] + fret) % 12]
}

// Returns the semitone value (0-11) at a given string and fret
function semitoneAtFret(string, fret) {
  return (OPEN_STRINGS[string] + fret) % 12
}

// Returns all [string, fret] positions that match a given note name.
// Supports enharmonic equivalents: "Bb" matches the same positions as "A#".
export function allPositions(note) {
  // Determine target semitone: try new Note system first, fall back to NOTES index
  const parsed = parseNote(note)
  const targetSemitone = parsed !== null
    ? noteToSemitone(parsed)
    : NOTES.indexOf(note)

  if (targetSemitone === -1 && parsed === null) return []

  const positions = []
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f < FRET_COUNT; f++) {
      if (semitoneAtFret(s, f) === targetSemitone) positions.push([s, f])
    }
  }
  return positions
}

// Natural notes only (no sharps/flats) for target note selection in fretboard mode
const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

// Returns a random natural note
export function randomNote() {
  return NATURAL_NOTES[Math.floor(Math.random() * NATURAL_NOTES.length)]
}
