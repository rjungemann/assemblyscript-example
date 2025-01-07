#include <stdio.h>
#include <stdlib.h>

#include "debug.h"

void w2c_env_abort(struct w2c_env*e, u32 a, u32 b, u32 c, u32 d) {

}

int main(int argc, char** argv) {
  /* Initialize the Wasm runtime. */
  wasm_rt_init();

  /* Declare an instance of the `debug` module. */
  w2c_debug debug;

  /* Construct the module instance. */
  wasm2c_debug_instantiate(&debug, NULL);

  /* Call `debug`, using the mangled name. */
  u32 x = 1;
  u32 y = 2;
  u32 result = w2c_debug_add(&debug, x, y);

  /* Print the result. */
  printf("debug(%u) -> %u\n", x, result);

  /* Free the debug module. */
  wasm2c_debug_free(&debug);

  /* Free the Wasm runtime state. */
  wasm_rt_free();

  return 0;
}
