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

describe('allPositions - enharmonic support', () => {
  it('Bb returns same positions as A#', () => {
    const bb = allPositions('Bb')
    const aSharp = allPositions('A#')
    expect(bb.length).toBeGreaterThan(0)
    expect(bb).toEqual(aSharp)
  })

  it('Eb returns same positions as D#', () => {
    const eb = allPositions('Eb')
    const dSharp = allPositions('D#')
    expect(eb.length).toBeGreaterThan(0)
    expect(eb).toEqual(dSharp)
  })

  it('Gb returns same positions as F#', () => {
    const gb = allPositions('Gb')
    const fSharp = allPositions('F#')
    expect(gb.length).toBeGreaterThan(0)
    expect(gb).toEqual(fSharp)
  })

  it('Db returns same positions as C#', () => {
    const db = allPositions('Db')
    const cSharp = allPositions('C#')
    expect(db.length).toBeGreaterThan(0)
    expect(db).toEqual(cSharp)
  })

  it('Ab returns same positions as G#', () => {
    const ab = allPositions('Ab')
    const gSharp = allPositions('G#')
    expect(ab.length).toBeGreaterThan(0)
    expect(ab).toEqual(gSharp)
  })

  it('E# returns same positions as F', () => {
    const eSharp = allPositions('E#')
    const f = allPositions('F')
    expect(eSharp.length).toBeGreaterThan(0)
    expect(eSharp).toEqual(f)
  })

  it('Cb returns same positions as B', () => {
    const cb = allPositions('Cb')
    const b = allPositions('B')
    expect(cb.length).toBeGreaterThan(0)
    expect(cb).toEqual(b)
  })
})
