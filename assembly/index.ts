import { createDelay, createLores, createTape, ramp, saw, scale, sinify, tilt, twoOp, tri } from './helpers'

const delay = createDelay(44100)
const filter = createLores()
const tape = createTape([1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0])
let prevSlope: f32 = 0.0
let i: i32 = 0

export function setup(): void {
}

export function dsp(t: f32): f32 {
  let out0: f32
  {
    // Low filter-sweep drone
    const detunedSaws: f32 = saw(110, t) + saw(111, t)
    const lfo: f32 = tri(0.5, ramp(0.125, t))
    filter.setCutoff(lfo)
    filter.setQ(0.7)
    out0 = filter.dsp(t, detunedSaws * 0.5) * 0.125
  }

  let out1: f32
  {
    // 16th Note Hats
    const carrier: f32 = 80.0
    const modulator: f32 = 345.0
    const index: f32 = 25.0
    const lfo: f32 = scale(ramp(0.1, t), 0.0, 1.0, 0.0, index)
    const slope: f32 = (t * 8.0) % 1.0
    const amp: f32 = tilt(-0.5, slope)
    out1 = twoOp(80.0, 234.0, 350.0, t) * amp * 0.125
  }

  let out2: f32
  {
    // Sequenced FM bass with delay
    const ts: f32 = t % 1.0
    const seqval: f32 = tape.dsp(t)
    const slope: f32 = (ts * 4.0) % 1.0
    if (slope < prevSlope) tape.read()
    prevSlope = slope
    const carrier: f32 = 110.0
    const modulator: f32 = carrier * 2.0
    const amp: f32 = sinify(0.3, slope)
    const index: f32 = 0.35
    const val: f32 = twoOp(carrier, modulator, index * amp, ts) * amp * seqval
    out2 = val * 0.5 + delay.dsp(t, val) * 0.5
    prevSlope = slope
  }

  return out0 + out1 + out2
}
