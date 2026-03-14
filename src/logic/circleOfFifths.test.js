import { describe, it, expect } from 'vitest'
import {
  CIRCLE, MAJOR_KEYS, MINOR_KEYS,
  formatKeySignature, getByMajor, dominantOf, subdominantOf,
  COF_MODES, generateCofQuestion,
} from './circleOfFifths'

describe('CIRCLE', () => {
  it('has 12 entries', () => expect(CIRCLE).toHaveLength(12))

  it('starts at C with 0 accidentals', () => {
    expect(CIRCLE[0].major).toBe('C')
    expect(CIRCLE[0].accidentals).toBe(0)
  })

  it('each entry has major, minor, accidentals', () => {
    CIRCLE.forEach(c => {
      expect(c).toHaveProperty('major')
      expect(c).toHaveProperty('minor')
      expect(typeof c.accidentals).toBe('number')
    })
  })
})

describe('formatKeySignature', () => {
  it('0 accidentals = "0"', () => expect(formatKeySignature(0)).toBe('0'))
  it('3 sharps = "3#"', () => expect(formatKeySignature(3)).toBe('3#'))
  it('2 flats = "2b"', () => expect(formatKeySignature(-2)).toBe('2b'))
})

describe('dominantOf / subdominantOf', () => {
  it('dominant of C = G', () => expect(dominantOf('C')).toBe('G'))
  it('subdominant of C = F', () => expect(subdominantOf('C')).toBe('F'))
  it('dominant of F = C', () => expect(dominantOf('F')).toBe('C'))
  it('subdominant of G = C', () => expect(subdominantOf('G')).toBe('C'))
  it('dominant of B = F#', () => expect(dominantOf('B')).toBe('F#'))
})

describe('generateCofQuestion', () => {
  COF_MODES.forEach(mode => {
    it(`mode "${mode.id}" generates valid question`, () => {
      for (let i = 0; i < 30; i++) {
        const q = generateCofQuestion(mode.id)
        expect(q).not.toBeNull()
        expect(q.options).toHaveLength(4)
        expect(q.options).toContain(q.answer)
        expect(new Set(q.options).size).toBe(4)
      }
    })
  })
})
