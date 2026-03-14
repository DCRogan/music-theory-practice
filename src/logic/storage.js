// localStorage persistence for practice stats

const STORAGE_KEY = 'musicTheory_stats'

const DEFAULT_STATS = {
  modes: {},     // { [modeId]: { correct, total, lastPlayed } }
  bestStreak: 0,
  totalSessions: 0,
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATS }
    return { ...DEFAULT_STATS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // quota exceeded, silently fail
  }
}

// Record a single answer result
export function recordAnswer(modeId, correct) {
  const data = load()
  if (!data.modes[modeId]) {
    data.modes[modeId] = { correct: 0, total: 0, lastPlayed: null }
  }
  data.modes[modeId].total += 1
  if (correct) data.modes[modeId].correct += 1
  data.modes[modeId].lastPlayed = new Date().toISOString().slice(0, 10)
  save(data)
}

// Update best streak if current streak exceeds it
export function updateBestStreak(streak) {
  const data = load()
  if (streak > data.bestStreak) {
    data.bestStreak = streak
    save(data)
  }
}

// Increment session count (call once on app load)
export function incrementSession() {
  const data = load()
  data.totalSessions += 1
  save(data)
}

// Get all stats
export function getStats() {
  return load()
}

// Get mode-level stats sorted by accuracy (worst first)
export function getModeStats() {
  const data = load()
  return Object.entries(data.modes)
    .filter(([, s]) => s.total > 0)
    .map(([modeId, s]) => ({
      modeId,
      correct: s.correct,
      total: s.total,
      accuracy: s.total > 0 ? s.correct / s.total : 0,
      lastPlayed: s.lastPlayed,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
}

// Reset all stats
export function resetStats() {
  save({ ...DEFAULT_STATS })
}
