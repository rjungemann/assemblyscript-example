import { instantiate } from "../build/debug.js";

class SimpleWasmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    const wasmPath = '/build/debug.wasm'
    const wasmBuffer = fetch(wasmPath);
    WebAssembly.compileStreaming(wasmBuffer, {}).then(async (wasmModule) => {
      const { createParameters, parametersGet, parametersSet, processSignal } = await instantiate(wasmCompiled, {
        /* imports */
      })
    })
    
  }

  process(inputs, outputs, parameters) {
    var result = processSignal(inputs, outputs, parameters);
    return true;
  }

  static get parameterDescriptors() {
    return [
    //   {
    //     name: "customGain",
    //     defaultValue: 1,
    //     minValue: 0,
    //     maxValue: 1,
    //     automationRate: "a-rate",
    //   },
    ];
  }
}

registerProcessor("simple-wasm-processor", SimpleWasmProcessor);