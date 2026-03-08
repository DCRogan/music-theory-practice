import { describe, it, expect } from 'vitest'
import { generateQuestion, MODES } from './questionGenerator'

describe('MODES', () => {
  it('has 12 modes', () => expect(MODES).toHaveLength(12))
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
