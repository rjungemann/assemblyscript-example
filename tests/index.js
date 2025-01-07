import assert from "assert";
// import { add, createParameters, parametersGet, parametersSet, hello, processSignal } from '../build/debug.js'

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs/promises";
import { instantiate } from "../build/debug.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmPath = path.join(__dirname, '../build/debug.wasm');
const wasmBuffer = await fs.readFile(wasmPath);
const wasmCompiled = await WebAssembly.compile(wasmBuffer, {});
const { add, createParameters, parametersGet, parametersSet, hello, processSignal } = await instantiate(wasmCompiled, {
  /* imports */
})

assert.strictEqual(add(1, 2), 3);
assert.strictEqual(hello("Alice"), "Hello, Alice!");

const inputs = [new Float32Array(256)];
const outputs = [new Float32Array(256)];
const parameterKey = "foo";
const parameterValue = new Float32Array(1);
parameterValue[0] = 1.0;
var parameters = createParameters();
parameters = parametersSet(parameters, parameterKey, parameterValue);
assert.deepStrictEqual(parametersGet(parameters, parameterKey), parameterValue);
const result = processSignal(inputs, outputs, parameters);
assert.deepStrictEqual(result, true);
console.log("ok");