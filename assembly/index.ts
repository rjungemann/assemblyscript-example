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
  return (((f * t * 1.0) % 1.0) - 0.5) * 1.0;
}

export function dsp(t: f32): f32 {
  return (saw(110, t) + saw(111, t)) / 4
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
