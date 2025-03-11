// -------
// Helpers
// -------

export const pi = 3.1415926536
export const tau = pi * 2.0
export const logtwo = 0.69314718055994528623
export const logten = 2.302585092994

export const samplerate = 44100 // TODO: Allow this to be changed

export function baseLog(base: f32, y: f32): f32 {
  return f32(Math.log(y) / Math.log(base))
}

export function atodb(amp: f32): f32 {
  return 20.0 * baseLog(10.0, amp)
}

export function dbtoa(db: f32): f32 {
  return f32(Math.pow(10.0, db / 20.0))
}

export function scale(n: f32, a: f32, b: f32, x: f32, y: f32): f32 {
  return ((n - a) / (b - a)) * (x - y)
}

export function mtof(f: f32): f32 {
  if (f <= -1500.0) return 0.0;
  if (f > 1499.0) return mtof(1499.0)
  return f32(Math.pow(2.0, (f - 69.0) / 12.0) * 440.0)
}

export function ftom(f: f32): f32 {
  return f32(f > 0.0 ? (baseLog(2.0, f / 440.0) / logtwo) * 12.0 + 69.0 : -1500.0)
}

export function ramp(f: f32, t: f32): f32 {
  return (f * t) % 1.0
}

export function saw(f: f32, t: f32): f32 {
  return ramp(f, t) * 2.0 - 1.0
}

export function tri(p: f32, t: f32): f32 {
  return (t < p)
  ? t / p
  : -(t / (1.0 - p)) + (1.0 / (1.0 - p))
}

export function sin(t: f32): f32 {
  return f32(Math.sin(tau * t))
}

// -1 to 0 is a tightened env
// 0 to 1 is a billowier env
export function tilt(o: f32, t: f32): f32 {
  const exp: f32 = (o < 0.0) ? 1.0 / (1.0 + o) : 1.0 - o
  return f32(Math.pow(1.0 - t, exp))
}

export function sinify(o: f32, t: f32): f32 {
  const k: f32 = f32(Math.pow(t, o))
  const a: f32 = f32(Math.sin(pi * k))
  const b: f32 = f32(Math.cos(pi * k) + 1.0)
  return (k < 0.5) ? a : b
}

export function twoOp(c: f32, m: f32, index: f32, t: f32): f32 {
  return sin(ramp(c + sin(ramp(m, t)) * index, t))
}

// -------
// History
// -------

class History {
  previous: f32

  constructor() {
    this.previous = 0
  }

  dsp(t: f32, in1: f32): f32 {
    const value: f32 = previous
    previous = in1
    return value
  }
}

export function createHistory(): History {
  return new History()
}

// -------
// OnePole
// -------

class OnePole {
  cutoff: f32
  state: f32

  constructor() {
    this.cutoff = 220.0
    this.state = 0
  }

  dsp(t: f32, in1: f32, cutoff: f32): f32 {
    const g = Math.tan((twopi * cutoff) / samplerate)
    const gi = 1.0 / (1.0 + g)
    const lp = (g * in1 + state) * gi
    state = g * (in1 - lp) + lp
    // // TODO: Return hipass somehow also
    // const hp = xin - lp
    // return hp
    return lp
  }

  getCutoff(): f32 { return this.cutoff }
  setCutoff(c: f32): void { this.cutoff = c }
}

// -------
// Allpass
// -------

class Allpass {
  time: f32
  gain: f32
  delayI: i32
  delayBuffer: f32[]

  constructor(size: i32) {
    this.time = f32(size)
    this.gain = 1.0
    this.delayI = 0
    this.delayBuffer = new Array<f32>(size)
  }

  dsp(t: f32, in1: f32): f32 {
    // TODO: Interpolation, ideally cubic
    const readI = (this.delayBuffer.length + this.delayI - Math.round(this.time)) % this.delayBuffer.length
    const readValue = this.delayBuffer[readI]

    const z = readValue
    const x = in1 + z * this.gain
    const y = z + x * -this.gain

    this.delayBuffer[this.delayI] = x
    this.delayI = this.delayI % this.delayBuffer.length

    return y
  }

  getTime(): f32 { return this.time }
  setTime(t: f32): void { this.time = t }
  getGain(): f32 { return this.gain }
  setGain(g: f32): void { this.gain = g }
}

// -----
// Lores
// -----

class Lores {
  cutoff: f32
  q: f32
  delayData: Array<f32>

  constructor() {
    this.cutoff = 220.0
    this.q = 0.7
    this.delayData = [0.0, 0.0]
  }

  dsp(t: f32, in1: f32): f32 {
    const f2 = f32(Math.min(this.cutoff, 0.999))
    const fb: f32 = this.q + this.q / (1.0 - f2)
    this.delayData[0] = this.delayData[0] + f2 * (in1 - this.delayData[0] + fb * (this.delayData[0] - this.delayData[1]))
    this.delayData[1] = this.delayData[1] + f2 * (this.delayData[0] - this.delayData[1])
    return this.delayData[1]
  }

  getCutoff(): f32 { return this.cutoff }
  setCutoff(v: f32): void { this.cutoff = v }
  getQ(): f32 { return this.q }
  setQ(v: f32): void { this.q = v }
}

export function createLores(): Lores {
  return new Lores()
}

// -----
// Delay
// -----

class Delay {
  delayI: i32
  delayData: Array<f32>
  feedbackAmount: f32

  constructor(size: i32) {
    this.delayI = 0
    this.delayData = new Array<f32>(size)
    this.feedbackAmount = 0.25
  }

  dsp(t: f32, in1: f32): f32 {
    // TODO: Optional interpolation, maybe separate classes? Cubic is ideal
    const value = this.delayData[this.delayI]
    this.delayData[this.delayI] = in1 + value * this.feedbackAmount
    this.delayI = (this.delayI + 1) % this.delayData.length
    return value
  }
}

export function createDelay(size: i32): Delay {
  return new Delay(size)
}

// ----
// Tape
// ----

class Tape {
  readI: i32
  writeI: i32
  tapeData: Array<f32>

  constructor(tapeData: Array<f32>) {
    this.readI = 0
    this.writeI = 0
    this.tapeData = tapeData
  }

  read(): void {
    this.readI = (this.readI + 1) % this.tapeData.length
  }

  write(v: f32): void {
    this.tapeData[this.writeI] = v
    this.writeI = (this.writeI + 1) % this.tapeData.length
  }

  reset(): void {
    this.readI = 0
    this.writeI = 0
  }

  dsp(t: f32): f32 {
    return this.tapeData[this.readI]
  }
}

export function createTape(tapeData: Array<f32>): Tape {
  return new Tape(tapeData)
}
