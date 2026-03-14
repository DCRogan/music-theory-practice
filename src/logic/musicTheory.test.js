import { describe, it, expect } from 'vitest'
import {
  NOTES,
  INTERVALS,
  SOLFEGE,
  noteAt,
  semitonesBetween,
  intervalName,
  solfegeName,
  parseNote,
  formatNote,
  noteToSemitone,
  intervalNote,
  semitonesBetweenNotes,
  intervalDegree,
  getIntervalDef,
  INTERVAL_DEFS,
} from './musicTheory'

// ---- Legacy API tests ----
describe('NOTES', () => {
  it('has 12 notes', () => expect(NOTES).toHaveLength(12))
  it('starts with C', () => expect(NOTES[0]).toBe('C'))
})

describe('noteAt', () => {
  it('C + 7 semitones = G', () => expect(noteAt('C', 7)).toBe('G'))
  it('A + 3 semitones = C', () => expect(noteAt('A', 3)).toBe('C'))
  it('wraps around: B + 1 = C', () => expect(noteAt('B', 1)).toBe('C'))
})

describe('semitonesBetween', () => {
  it('C to G = 7', () => expect(semitonesBetween('C', 'G')).toBe(7))
  it('G to C = 5', () => expect(semitonesBetween('G', 'C')).toBe(5))
  it('C to C = 0', () => expect(semitonesBetween('C', 'C')).toBe(0))
})

describe('intervalName', () => {
  it('7 semitones = 纯五度', () => expect(intervalName(7)).toBe('纯五度'))
  it('0 semitones = 纯一度', () => expect(intervalName(0)).toBe('纯一度'))
})

describe('solfegeName', () => {
  it('0 semitones = 1', () => expect(solfegeName(0)).toBe('1'))
  it('7 semitones = 5', () => expect(solfegeName(7)).toBe('5'))
  it('3 semitones = null (not in major scale)', () => expect(solfegeName(3)).toBeNull())
})

// ---- New Note system tests ----
describe('parseNote', () => {
  it('parses natural notes', () => {
    expect(parseNote('C')).toEqual({ letter: 'C', accidental: 0 })
    expect(parseNote('G')).toEqual({ letter: 'G', accidental: 0 })
  })
  it('parses sharps', () => {
    expect(parseNote('F#')).toEqual({ letter: 'F', accidental: 1 })
    expect(parseNote('C#')).toEqual({ letter: 'C', accidental: 1 })
  })
  it('parses flats', () => {
    expect(parseNote('Bb')).toEqual({ letter: 'B', accidental: -1 })
    expect(parseNote('Eb')).toEqual({ letter: 'E', accidental: -1 })
  })
  it('parses double sharp (x)', () => {
    expect(parseNote('Fx')).toEqual({ letter: 'F', accidental: 2 })
  })
  it('parses double sharp (##)', () => {
    expect(parseNote('F##')).toEqual({ letter: 'F', accidental: 2 })
  })
  it('parses double flat', () => {
    expect(parseNote('Bbb')).toEqual({ letter: 'B', accidental: -2 })
  })
  it('returns null for invalid input', () => {
    expect(parseNote('')).toBeNull()
    expect(parseNote(null)).toBeNull()
    expect(parseNote('X')).toBeNull()
  })
})

describe('formatNote', () => {
  it('formats natural', () => expect(formatNote({ letter: 'C', accidental: 0 })).toBe('C'))
  it('formats sharp', () => expect(formatNote({ letter: 'F', accidental: 1 })).toBe('F#'))
  it('formats flat', () => expect(formatNote({ letter: 'B', accidental: -1 })).toBe('Bb'))
  it('formats double sharp', () => expect(formatNote({ letter: 'F', accidental: 2 })).toBe('Fx'))
  it('formats double flat', () => expect(formatNote({ letter: 'B', accidental: -2 })).toBe('Bbb'))
  it('handles null', () => expect(formatNote(null)).toBe(''))
})

describe('noteToSemitone', () => {
  it('C = 0', () => expect(noteToSemitone({ letter: 'C', accidental: 0 })).toBe(0))
  it('C# = 1', () => expect(noteToSemitone({ letter: 'C', accidental: 1 })).toBe(1))
  it('Bb = 10', () => expect(noteToSemitone({ letter: 'B', accidental: -1 })).toBe(10))
  it('Fx = 7 (enharmonic with G)', () => expect(noteToSemitone({ letter: 'F', accidental: 2 })).toBe(7))
  it('Cbb = 10 (enharmonic with Bb)', () => expect(noteToSemitone({ letter: 'C', accidental: -2 })).toBe(10))
  it('E# = 5 (enharmonic with F)', () => expect(noteToSemitone({ letter: 'E', accidental: 1 })).toBe(5))
  it('Cb = 11 (enharmonic with B)', () => expect(noteToSemitone({ letter: 'C', accidental: -1 })).toBe(11))
})

describe('intervalNote - ascending', () => {
  // C + major 3rd (degree=3, semi=4) = E
  it('C + major 3rd = E', () => {
    const result = intervalNote({ letter: 'C', accidental: 0 }, 3, 4, 'up')
    expect(result).toEqual({ letter: 'E', accidental: 0 })
  })

  // F + perfect 4th (degree=4, semi=5) = Bb
  it('F + perfect 4th = Bb', () => {
    const result = intervalNote({ letter: 'F', accidental: 0 }, 4, 5, 'up')
    expect(result).toEqual({ letter: 'B', accidental: -1 })
  })

  // C + augmented 4th (degree=4, semi=6) = F#
  it('C + augmented 4th = F#', () => {
    const result = intervalNote({ letter: 'C', accidental: 0 }, 4, 6, 'up')
    expect(result).toEqual({ letter: 'F', accidental: 1 })
  })

  // D + minor 7th (degree=7, semi=10) = C
  it('D + minor 7th = C', () => {
    const result = intervalNote({ letter: 'D', accidental: 0 }, 7, 10, 'up')
    expect(result).toEqual({ letter: 'C', accidental: 0 })
  })

  // G# + major 3rd (degree=3, semi=4) = B#
  it('G# + major 3rd = B#', () => {
    const result = intervalNote({ letter: 'G', accidental: 1 }, 3, 4, 'up')
    expect(result).toEqual({ letter: 'B', accidental: 1 })
  })

  // G# + major 7th (degree=7, semi=11) = Fx (double sharp!)
  it('G# + major 7th = Fx', () => {
    const result = intervalNote({ letter: 'G', accidental: 1 }, 7, 11, 'up')
    expect(result).toEqual({ letter: 'F', accidental: 2 })
  })

  // Bb + major 3rd (degree=3, semi=4) = D
  it('Bb + major 3rd = D', () => {
    const result = intervalNote({ letter: 'B', accidental: -1 }, 3, 4, 'up')
    expect(result).toEqual({ letter: 'D', accidental: 0 })
  })

  // Eb + perfect 5th (degree=5, semi=7) = Bb
  it('Eb + perfect 5th = Bb', () => {
    const result = intervalNote({ letter: 'E', accidental: -1 }, 5, 7, 'up')
    expect(result).toEqual({ letter: 'B', accidental: -1 })
  })

  // A + minor 2nd (degree=2, semi=1) = Bb
  it('A + minor 2nd = Bb', () => {
    const result = intervalNote({ letter: 'A', accidental: 0 }, 2, 1, 'up')
    expect(result).toEqual({ letter: 'B', accidental: -1 })
  })

  // C + unison (degree=1, semi=0) = C
  it('C + unison = C', () => {
    const result = intervalNote({ letter: 'C', accidental: 0 }, 1, 0, 'up')
    expect(result).toEqual({ letter: 'C', accidental: 0 })
  })

  // F# + major 2nd (degree=2, semi=2) = G#
  it('F# + major 2nd = G#', () => {
    const result = intervalNote({ letter: 'F', accidental: 1 }, 2, 2, 'up')
    expect(result).toEqual({ letter: 'G', accidental: 1 })
  })

  // Cb + major 3rd (degree=3, semi=4) = Eb
  it('Cb + major 3rd = Eb', () => {
    const result = intervalNote({ letter: 'C', accidental: -1 }, 3, 4, 'up')
    expect(result).toEqual({ letter: 'E', accidental: -1 })
  })
})

describe('intervalNote - descending', () => {
  // C - perfect 5th (degree=5, semi=7) = F
  it('C - perfect 5th = F', () => {
    const result = intervalNote({ letter: 'C', accidental: 0 }, 5, 7, 'down')
    expect(result).toEqual({ letter: 'F', accidental: 0 })
  })

  // G - major 3rd (degree=3, semi=4) = Eb... wait, no
  // G down major 3rd: degree=3, letter 3 steps down from G: G->F->E, so E
  // G to E descending natural = G(7) - E(4) = 3 semitones. We want 4. So E needs to be flatted.
  // target_acc = 0 - 4 + 3 = -1 => Eb
  it('G - major 3rd = Eb', () => {
    const result = intervalNote({ letter: 'G', accidental: 0 }, 3, 4, 'down')
    expect(result).toEqual({ letter: 'E', accidental: -1 })
  })

  // A - minor 2nd (degree=2, semi=1) = G#
  // Letter 2 steps down from A: A->G, so G
  // A to G descending natural = A(9) - G(7) = 2. We want 1. So G needs +1 = G#
  it('A - minor 2nd = G#', () => {
    const result = intervalNote({ letter: 'A', accidental: 0 }, 2, 1, 'down')
    expect(result).toEqual({ letter: 'G', accidental: 1 })
  })

  // F# - major 3rd (degree=3, semi=4) = D
  // Letter 3 steps down from F: F->E->D, so D
  // F to D descending natural = F(5) - D(2) = 3. root_acc=1, so target_acc = 1 - 4 + 3 = 0 => D
  it('F# - major 3rd = D', () => {
    const result = intervalNote({ letter: 'F', accidental: 1 }, 3, 4, 'down')
    expect(result).toEqual({ letter: 'D', accidental: 0 })
  })
})

describe('semitonesBetweenNotes', () => {
  it('C to G = 7', () => {
    expect(semitonesBetweenNotes(
      { letter: 'C', accidental: 0 },
      { letter: 'G', accidental: 0 }
    )).toBe(7)
  })
  it('F to Bb = 5', () => {
    expect(semitonesBetweenNotes(
      { letter: 'F', accidental: 0 },
      { letter: 'B', accidental: -1 }
    )).toBe(5)
  })
  it('G# to B# = 4', () => {
    expect(semitonesBetweenNotes(
      { letter: 'G', accidental: 1 },
      { letter: 'B', accidental: 1 }
    )).toBe(4)
  })
})

describe('intervalDegree', () => {
  it('C to E ascending = 3', () => {
    expect(intervalDegree(
      { letter: 'C', accidental: 0 },
      { letter: 'E', accidental: 0 },
      'up'
    )).toBe(3)
  })
  it('C to F ascending = 4', () => {
    expect(intervalDegree(
      { letter: 'C', accidental: 0 },
      { letter: 'F', accidental: 0 },
      'up'
    )).toBe(4)
  })
  it('G to E descending = 3', () => {
    expect(intervalDegree(
      { letter: 'G', accidental: 0 },
      { letter: 'E', accidental: -1 },
      'down'
    )).toBe(3)
  })
})

describe('getIntervalDef', () => {
  it('4 semitones = major 3rd', () => {
    const def = getIntervalDef(4)
    expect(def.name).toBe('大三度')
    expect(def.degree).toBe(3)
  })
  it('7 semitones = perfect 5th', () => {
    const def = getIntervalDef(7)
    expect(def.name).toBe('纯五度')
    expect(def.degree).toBe(5)
  })
  it('13 semitones = null', () => {
    expect(getIntervalDef(13)).toBeNull()
  })
})

describe('INTERVAL_DEFS', () => {
  it('has 13 entries (unison through octave)', () => {
    expect(INTERVAL_DEFS).toHaveLength(13)
  })
  it('all have degree, semitones, and name', () => {
    INTERVAL_DEFS.forEach(d => {
      expect(d).toHaveProperty('degree')
      expect(d).toHaveProperty('semitones')
      expect(d).toHaveProperty('name')
    })
  })
})

// ---- Comprehensive enharmonic correctness ----
describe('major scale correctness', () => {
  // Verify that building a major scale from each common root produces correct note names
  // Major scale intervals: W-W-H-W-W-W-H = degrees 1-7 with semitones [0,2,4,5,7,9,11]
  const MAJOR_SCALE = [
    { degree: 1, semi: 0 },
    { degree: 2, semi: 2 },
    { degree: 3, semi: 4 },
    { degree: 4, semi: 5 },
    { degree: 5, semi: 7 },
    { degree: 6, semi: 9 },
    { degree: 7, semi: 11 },
  ]

  function buildMajorScale(rootStr) {
    const root = parseNote(rootStr)
    return MAJOR_SCALE.map(({ degree, semi }) => formatNote(intervalNote(root, degree, semi, 'up')))
  }

  it('C major = C D E F G A B', () => {
    expect(buildMajorScale('C')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  it('G major = G A B C D E F#', () => {
    expect(buildMajorScale('G')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#'])
  })

  it('D major = D E F# G A B C#', () => {
    expect(buildMajorScale('D')).toEqual(['D', 'E', 'F#', 'G', 'A', 'B', 'C#'])
  })

  it('F major = F G A Bb C D E', () => {
    expect(buildMajorScale('F')).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E'])
  })

  it('Bb major = Bb C D Eb F G A', () => {
    expect(buildMajorScale('Bb')).toEqual(['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'])
  })

  it('Eb major = Eb F G Ab Bb C D', () => {
    expect(buildMajorScale('Eb')).toEqual(['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'])
  })

  it('Ab major = Ab Bb C Db Eb F G', () => {
    expect(buildMajorScale('Ab')).toEqual(['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'])
  })

  it('A major = A B C# D E F# G#', () => {
    expect(buildMajorScale('A')).toEqual(['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'])
  })

  it('E major = E F# G# A B C# D#', () => {
    expect(buildMajorScale('E')).toEqual(['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'])
  })

  it('B major = B C# D# E F# G# A#', () => {
    expect(buildMajorScale('B')).toEqual(['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'])
  })

  it('F# major = F# G# A# B C# D# E#', () => {
    expect(buildMajorScale('F#')).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'])
  })

  it('Gb major = Gb Ab Bb Cb Db Eb F', () => {
    expect(buildMajorScale('Gb')).toEqual(['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'])
  })

  it('Db major = Db Eb F Gb Ab Bb C', () => {
    expect(buildMajorScale('Db')).toEqual(['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'])
  })

  it('Cb major = Cb Db Eb Fb Gb Ab Bb', () => {
    expect(buildMajorScale('Cb')).toEqual(['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb'])
  })

  // The extreme case: C# major has Fx
  it('C# major = C# D# E# F# G# A# B#', () => {
    expect(buildMajorScale('C#')).toEqual(['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'])
  })

  // G# major has Fx
  it('G# major = G# A# B# C# D# E# Fx', () => {
    expect(buildMajorScale('G#')).toEqual(['G#', 'A#', 'B#', 'C#', 'D#', 'E#', 'Fx'])
  })

  // Each major scale should have 7 unique letters
  const ALL_ROOTS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C#', 'Cb', 'G#']
  ALL_ROOTS.forEach(root => {
    it(`${root} major scale uses 7 unique letters`, () => {
      const scale = buildMajorScale(root)
      const letters = new Set(scale.map(n => parseNote(n).letter))
      expect(letters.size).toBe(7)
    })
  })
})
