import { describe, it, expect } from 'vitest'
import { noteAtFret, allPositions } from './fretboard'

describe('noteAtFret', () => {
  it('open high e string = E', () => expect(noteAtFret(0, 0)).toBe('E'))
  it('open A string = A', () => expect(noteAtFret(4, 0)).toBe('A'))
  it('fret 5 on low E = A', () => expect(noteAtFret(5, 5)).toBe('A'))
  it('fret 12 = same as open (octave)', () => {
    for (let s = 0; s < 6; s++) {
      expect(noteAtFret(s, 12)).toBe(noteAtFret(s, 0))
    }
  })
})

describe('allPositions', () => {
  it('returns correct positions for E', () => {
    const pos = allPositions('E')
    expect(pos.length).toBeGreaterThan(0)
    pos.forEach(([s, f]) => expect(noteAtFret(s, f)).toBe('E'))
  })
  it('C has positions', () => expect(allPositions('C').length).toBeGreaterThan(0))
  it('F# has positions', () => expect(allPositions('F#').length).toBeGreaterThan(0))
})
