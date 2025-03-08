// The entry file of your WebAssembly module.

const pi = 3.1415926536;
const tau = pi * 2.0;
const logtwo = 0.69314718055994528623;
const logten = 2.302585092994;

const samplerate = 44100;

function baseLog(base: f32, y: f32): f32 {
  return Math.log(y) / Math.log(base)
}

function atodb(amp: f32): f32 {
  return 20.0 * baseLog(10.0, amp);
}

function dbtoa(db: f32): f32 {
  return Math.pow(10.0, db / 20.0)
}

function scale(n: f32, a: f32, b: f32, x: f32, y: f32): f32 {
  return ((n - a) / (b - a)) * (x - y);
}

function mtof(f: f32): f32 {
  if (f <= -1500.0) return 0.0;
  if (f > 1499.0) return mtof(1499.0);
  return f32(Math.pow(2.0, (f - 69.0) / 12.0) * 440.0);
}

function ftom(f: f32): f32 {
  return (f > 0.0 ? (baseLog(2.0, f / 440.0) / logtwo) * 12.0 + 69.0 : -1500.0);
}

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

function sin(t: f32): f32 {
  return f32(Math.sin(tau * t));
}

// -1 to 0 is a tightened env
// 0 to 1 is a billowier env
function tilt(o: f32, t: f32): f32 {
  const exp: f32 = (o < 0.0) ? 1.0 / (1.0 + o) : 1.0 - o;
  return f32(Math.pow(1.0 - t, exp));
}

function sinify(o: f32, t: f32): f32 {
  const k: f32 = f32(Math.pow(t, o))
  const a: f32 = f32(Math.sin(pi * k))
  const b: f32 = f32(Math.cos(pi * k) + 1.0)
  return (k < 0.5) ? a : b
}

function twoOp(c: f32, m: f32, index: f32, t: f32): f32 {
  return sin(ramp(c + sin(ramp(m, t)) * index, t))
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

let delayI: i32 = 0
const delayData: Array<f32> = new Array<f32>(i32(samplerate * 1.0))
const filterData: Array<f32> = [0.0, 0.0]
let prevSlope: f32 = 0.0
let i: i32 = 0

export function setup(): void {
  // console.log(mtof(36.0).toString())
}

export function dsp(t: f32): f32 {
  // const detunedSaws: f32 = saw(110, t) + saw(111, t)
  // const lfo: f32 = tri(0.5, ramp(0.125, t));
  // const filtered: f32 = lores(filterData, lfo, 0.7, detunedSaws * 0.5);
  // return filtered * 0.125;

  // const freq: f32 = 220.0;
  // const ratio: f32 = 1.5;
  // const index: f32 = 1.2;
  // return twoOp(freq, freq * ratio, index, t) * 0.125

  // return twoOp(100.0, 444.0, 250.0, t) * 0.125;

  // const carrier: f32 = 80.0;
  // const modulator: f32 = 345.0;
  // const index: f32 = 25.0;
  // const lfo: f32 = scale(ramp(0.1, t), 0.0, 1.0, 0.0, index);
  // return twoOp(carrier, modulator, lfo, t) * 0.125;

  // // 16th Note Hats
  // const carrier: f32 = 80.0;
  // const modulator: f32 = 345.0;
  // const index: f32 = 25.0;
  // const lfo: f32 = scale(ramp(0.1, t), 0.0, 1.0, 0.0, index);
  // const slope: f32 = (t * 8.0) % 1.0;
  // const amp: f32 = tilt(-0.5, slope)
  // return twoOp(80.0, 234.0, 350.0, t) * amp * 0.125;

  const ts: f32 = t % 1.0
  const seq: f32[] = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]
  const seqval: f32 = seq[i % seq.length]
  const slope: f32 = (ts * 4.0) % 1.0
  if (slope < prevSlope) i++
  prevSlope = slope
  const carrier: f32 = 110.0
  const modulator: f32 = carrier * 2.0
  const amp: f32 = sinify(0.3, slope)
  const index: f32 = 0.35
  const val: f32 = twoOp(carrier, modulator, index * amp, ts) * amp * seqval
  const delay = delayData[delayI % delayData.length]
  const mixed: f32 = val * 0.25 + delay * 0.25
  prevSlope = slope
  delayData[delayI % delayData.length] = mixed
  delayI++

  return mixed
}
