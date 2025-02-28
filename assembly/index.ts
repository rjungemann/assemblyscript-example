// The entry file of your WebAssembly module.

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function hello(name: string): string {
  var prefix = "Hello, ";
  var suffix = "!";
  return prefix.concat(name).concat(suffix);
}

function saw(f: f32, t: f32): f32 {
  return (((f * t * 1.0) % 1.0) - 0.5) * 1.0; // TODO: I think the `* 1.0` should be a `* 2.0`
}

// TODO: `noise` using FM

// TODO: Do something with this buffer state
let buf0: f32 = 0.0
let buf1: f32 = 0.0
function lores2(f: f32, q: f32, input: f32): f32 {
  const f2 = f32(Math.min(f, 0.999))
  const fb: f32 = q + q / (1.0 - f2);
  buf0 = buf0 + f2 * (input - buf0 + fb * (buf0 - buf1));
  buf1 = buf1 + f2 * (buf0 - buf1);
  return buf1
}

function ramp(f: f32, t: f32): f32 {
  return (f * t * 1.0) % 1.0;
}

function tri(p: f32, t: f32): f32 {
  return (t < p) ? t / p : -(t / (1.0 - p)) + (1.0 / (1.0 - p))
}

export function setup(): void {

}

export function dsp(t: f32): f32 {
  const detunedSaws: f32 = saw(110, t) + saw(111, t)
  const lfo: f32 = tri(0.5, ramp(0.125, t));
  const lfo2: f32 = tri(0.01, ramp(0.125, t)) * 0.7;
  const filtered: f32 = lores2(lfo, 0.7, detunedSaws);
  return filtered * 0.25;
}

// export function createParameters(): Map<string, Float32Array> {
//   return new Map();
// }

// export function parametersGet(config: Map<string, Float32Array>, key: string): Float32Array {
//   return config.get(key);
// }

// export function parametersSet(config: Map<string, Float32Array>, key: string, value: Float32Array): Map<string, Float32Array> {
//   return config.set(key, value);
// }
