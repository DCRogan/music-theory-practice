import { NOTES } from './musicTheory'

// Open string notes (indices into NOTES), string 0 = high e, string 5 = low E
export const OPEN_STRINGS = [4, 11, 7, 2, 9, 4]

export const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']

export const FRET_COUNT = 13 // frets 0-12

// Returns the note name at a given string and fret
export function noteAtFret(string, fret) {
  return NOTES[(OPEN_STRINGS[string] + fret) % 12]
}

// Returns all [string, fret] positions that match a given note
export function allPositions(note) {
  const positions = []
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f < FRET_COUNT; f++) {
      if (noteAtFret(s, f) === note) positions.push([s, f])
    }
  }
  return positions
}

// Returns a random note from NOTES
export function randomNote() {
  return NOTES[Math.floor(Math.random() * NOTES.length)]
}
