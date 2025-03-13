import { createChange, createDelay, createLores, createTape, mtof, ramp, saw, sinify, tilt, twoOp, tri } from './helpers'

const delay = createDelay(44100)
const filter = createLores()
const tape = createTape([1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0])
const change = createChange()

export function setup(): void {
}

export function dsp(t: f32): f32 {
  let out1: f32 = 0.0

  // Low filter-sweep drone
  const detunedSaws: f32 = saw(mtof(45.0 + 0.07), t) + saw(mtof(45.0 - 0.07), t)
  const lfo: f32 = tri(0.5, ramp(0.125, t))
  filter.setCutoff(lfo)
  filter.setQ(0.7)
  out1 += filter.dsp(detunedSaws * 0.5) * 0.125

  // 16th Note Hats
  const hihatSlope: f32 = (t * 8.0) % 1.0
  const hihatAmp: f32 = tilt(-0.5, hihatSlope)
  out1 += twoOp(80.0, 234.0, 350.0, t) * hihatAmp * 0.125

  // Sequenced FM bass with delay
  const ts: f32 = t % 1.0
  const slope: f32 = (ts * 4.0) % 1.0
  if (change.dsp(slope) < 0.0) tape.read()
  const carrier: f32 = mtof(45.0)
  const modulator: f32 = carrier * 2.0
  const amp: f32 = sinify(0.3, slope)
  const index: f32 = 0.35
  const val: f32 = twoOp(carrier, modulator, index * amp, ts) * amp * tape.dsp()
  out1 += val * 0.5 + delay.dsp(val) * 0.5

  return out1
}
