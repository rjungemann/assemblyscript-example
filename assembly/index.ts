// The entry file of your WebAssembly module.

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function hello(name: string): string {
  var prefix = "Hello, ";
  var suffix = "!";
  return prefix.concat(name).concat(suffix);
}

// export function processSignal(input: Float32Array): Float32Array {
//   var current = new Float32Array(input.length);
//   for (let i: i32 = 0; i < input.length; i++) {
//     current[i] = input[i];
//   }
//   return current;
// }

function saw(f: f32, t: f32): f32 {
  return (((f * t * 1.0) % 1.0) - 0.5) * 1.0;
}

export function dsp(t: f32): f32 {
  return (saw(110, t) + saw(111, t)) / 4
}

export function createParameters(): Map<string, Float32Array> {
  return new Map();
}

export function parametersGet(config: Map<string, Float32Array>, key: string): Float32Array {
  return config.get(key);
}

export function parametersSet(config: Map<string, Float32Array>, key: string, value: Float32Array): Map<string, Float32Array> {
  return config.set(key, value);
}

export function processSignal(inputs: Float32Array[], outputs: Float32Array[], parameters: Map<string, Float32Array>): boolean {
  return true
}