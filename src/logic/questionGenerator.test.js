import { describe, it, expect } from 'vitest'
import { generateQuestion, MODES } from './questionGenerator'
import { parseNote, noteToSemitone, getIntervalDef, SOLFEGE, INTERVALS, solfegeName } from './musicTheory'

describe('MODES', () => {
  it('has 14 modes', () => expect(MODES).toHaveLength(14))
})

describe('generateQuestion', () => {
  MODES.forEach(mode => {
    it(`mode "${mode.id}" generates valid question`, () => {
      for (let i = 0; i < 30; i++) {
        const q = generateQuestion(mode.id)
        expect(q).not.toBeNull()
        expect(q.options).toHaveLength(4)
        expect(q.options).toContain(q.answer)
        expect(new Set(q.options).size).toBe(4)
      }
    })
  })
})

describe('enharmonic correctness - mode1 (root + interval -> note)', () => {
  it('answer note is at the correct semitone distance from root', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion('mode1')
      const root = parseNote(q.prompt.root)
      const answer = parseNote(q.answer)
      expect(root).not.toBeNull()
      expect(answer).not.toBeNull()

      // Find which interval was given
      const intName = q.prompt.condition
      const def = Object.entries(INTERVALS).find(([, name]) => name === intName)
      const expectedSemi = Number(def[0])

      // Verify semitone distance matches
      const rootSemi = noteToSemitone(root)
      const ansSemi = noteToSemitone(answer)
      if (q.prompt.direction === 'up') {
        expect((ansSemi - rootSemi + 12) % 12).toBe(expectedSemi % 12)
      } else {
        expect((rootSemi - ansSemi + 12) % 12).toBe(expectedSemi % 12)
      }
    }
  })

  it('answer uses the correct letter for the interval degree', () => {
    const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion('mode1')
      const root = parseNote(q.prompt.root)
      const answer = parseNote(q.answer)
      const intName = q.prompt.condition
      const semi = Number(Object.entries(INTERVALS).find(([, name]) => name === intName)[0])
      const def = getIntervalDef(semi)

      // The target letter should be (degree-1) steps from root letter
      const rootLi = LETTERS.indexOf(root.letter)
      const steps = def.degree - 1
      let expectedLi
      if (q.prompt.direction === 'up') {
        expectedLi = (rootLi + steps) % 7
      } else {
        expectedLi = ((rootLi - steps) % 7 + 7) % 7
      }
      expect(answer.letter).toBe(LETTERS[expectedLi])
    }
  })
})

describe('enharmonic correctness - mode4 (two notes -> interval name)', () => {
  it('displayed interval name matches the actual semitone distance', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion('mode4')
      const root = parseNote(q.prompt.root)
      const target = parseNote(q.prompt.target)
      const rootSemi = noteToSemitone(root)
      const targetSemi = noteToSemitone(target)

      let semi
      if (q.prompt.direction === 'up') {
        semi = (targetSemi - rootSemi + 12) % 12
      } else {
        semi = (rootSemi - targetSemi + 12) % 12
      }

      expect(q.answer).toBe(INTERVALS[semi])
    }
  })
})

describe('descending mode support', () => {
  it('mode1 with descending generates some down-direction questions', () => {
    let downCount = 0
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion('mode1', true)
      if (q.prompt.direction === 'down') downCount++
    }
    expect(downCount).toBeGreaterThan(0)
    expect(downCount).toBeLessThan(200)
  })
})
