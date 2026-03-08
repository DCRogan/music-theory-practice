import { describe, it, expect } from 'vitest'
import {
  NOTES,
  INTERVALS,
  SOLFEGE,
  noteAt,
  semitonesBetween,
  intervalName,
  solfegeName,
} from './musicTheory'

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
