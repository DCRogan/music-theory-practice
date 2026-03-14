// Synthesizes a plucked string sound using Web Audio API
// Karplus-Strong inspired approach with oscillator harmonics

let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// Base frequencies for open strings (Hz), string 0 = high e, string 5 = low E
// Standard tuning: E4, B3, G3, D3, A2, E2
const OPEN_FREQ = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41]

// Returns frequency for a given string and fret
function fretFrequency(string, fret) {
  return OPEN_FREQ[string] * Math.pow(2, fret / 12)
}

// Pluck a string at a given frequency
export function playFret(string, fret) {
  const ctx = getAudioContext()
  const freq = fretFrequency(string, fret)
  const now = ctx.currentTime

  // Master gain for this note
  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0.28, now)
  // Fast attack, slow decay — guitar-like envelope
  masterGain.gain.setValueAtTime(0.28, now + 0.005)
  masterGain.gain.exponentialRampToValueAtTime(0.12, now + 0.08)
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8)
  masterGain.connect(ctx.destination)

  // Harmonics: fundamental + overtones with decreasing amplitude
  const harmonics = [
    { mult: 1,    gain: 1.0  },
    { mult: 2,    gain: 0.5  },
    { mult: 3,    gain: 0.25 },
    { mult: 4,    gain: 0.12 },
    { mult: 5,    gain: 0.06 },
    { mult: 6,    gain: 0.03 },
  ]

  harmonics.forEach(({ mult, gain }) => {
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq * mult, now)

    // Higher harmonics decay faster (string physics)
    const decayTime = 1.8 / (mult * 0.7)
    oscGain.gain.setValueAtTime(gain, now)
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime)

    osc.connect(oscGain)
    oscGain.connect(masterGain)

    osc.start(now)
    osc.stop(now + decayTime + 0.05)
  })

  // Add a brief noise burst for the pick attack
  const bufferSize = ctx.sampleRate * 0.03
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const noiseSource = ctx.createBufferSource()
  noiseSource.buffer = noiseBuffer

  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.06, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03)

  // Bandpass filter to shape the noise to the string's frequency
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(freq, now)
  filter.Q.setValueAtTime(8, now)

  noiseSource.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(masterGain)
  noiseSource.start(now)
  noiseSource.stop(now + 0.03)
}
