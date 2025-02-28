# AssemblyScript DSP Example

By Roger Jungemann

## Purpose

Write DSP code using AssemblyScript and run it from natively from C code, or in the browser.

For native use cases, uses PortAudio to generate sound, and wasm2c to translate wasm into C code, which can be compiled and run.

For browser use cases, uses WebAssembly to run the generated wasm, and WebAudio to generate the sound.

## Setup

```sh
git clone https://github.com/rjungemann/assemblyscript-example.git
cd assemblyscript-example

npm install

npm run c:all:debug

# Or...

npm run asbuild:debug
npm run wasm2c:debug
npm run c:copy-files
npm run c:build:debug
npm run c:run
```

To run the server,

```sh
npm run start
```

Visit http://localhost:3000 and click in the browser window to start WebAudio.

To run the C version, run `build/debug`.

To run the tests, `npm run test`.
