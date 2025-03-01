// The entry file of your WebAssembly module.

function ramp(f: f32, t: f32): f32 {
  return (f * t) % 1.0
}

function saw(f: f32, t: f32): f32 {
  return ramp(f, t) * 2.0 - 1.0
}

function tri(p: f32, t: f32): f32 {
  return (t < p)
  ? t / p
  : -(t / (1.0 - p)) + (1.0 / (1.0 - p))
}

function lores(buf: Array<f32>, f: f32, q: f32, input: f32): f32 {
  const f2 = f32(Math.min(f, 0.999))
  const fb: f32 = q + q / (1.0 - f2);
  buf[0] = buf[0] + f2 * (input - buf[0] + fb * (buf[0] - buf[1]))
  buf[1] = buf[1] + f2 * (buf[0] - buf[1])
  return buf[1]
}

// ----
// Main
// ----

const filterData: Array<f32> = [0.0, 0.0]

export function setup(): void {
}

export function dsp(t: f32): f32 {
  const detunedSaws: f32 = saw(110, t) + saw(111, t)
  const lfo: f32 = tri(0.5, ramp(0.125, t));
  const filtered: f32 = lores(filterData, lfo, 0.7, detunedSaws * 0.5);
  return filtered * 0.125;
}
