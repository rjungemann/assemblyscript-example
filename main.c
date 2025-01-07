#include "stdio.h"
#include "stdlib.h"
#include "stdio.h"
#include "portaudio.h"

#include "debug.h"

#define SAMPLE_RATE (44100)

typedef int PaStreamCallback(
  const void *input,
  void *output,
  unsigned long frameCount,
  const PaStreamCallbackTimeInfo* timeInfo,
  PaStreamCallbackFlags statusFlags,
  void *userData
);

typedef struct {
  float left_phase;
  float right_phase;
  float t;
  w2c_debug context;
} paTestData;

/* This routine will be called by the PortAudio engine when audio is needed.
 * It may called at interrupt level on some machines so don't do anything
 * that could mess up the system like calling malloc() or free().
*/ 
static int patestCallback(
  const void *inputBuffer,
  void *outputBuffer,
  unsigned long framesPerBuffer,
  const PaStreamCallbackTimeInfo* timeInfo,
  PaStreamCallbackFlags statusFlags,
  void *userData
) {
  /* Cast data passed through stream to our structure. */
  paTestData *data = (paTestData*)userData; 
  float *out = (float*)outputBuffer;
  unsigned int i;
  (void) inputBuffer; /* Prevent unused variable warning. */
  
  for (i = 0; i < framesPerBuffer; i++) {
    *out++ = data->left_phase;  /* left */
    *out++ = data->right_phase;  /* right */
    f32 t = data->t / (float)SAMPLE_RATE;
    f32 result = w2c_debug_dsp(&data->context, t);
    data->left_phase = result;
    data->right_phase = result;
    data->t = data->t + 1.0f;
  }
  return 0;
}

void w2c_env_abort(struct w2c_env*e, u32 a, u32 b, u32 c, u32 d) {

}

int main(int argc, char** argv) {
  /* Initialize the Wasm runtime. */
  wasm_rt_init();

  /* Declare an instance of the `debug` module. */
  w2c_debug context;

  /* Construct the module instance. */
  wasm2c_debug_instantiate(&context, NULL);

  paTestData data = {
    .left_phase = 0.0f,
    .right_phase = 0.0f,
    .t = 0.0f,
    .context = context
  };
  PaStream *stream;
  PaError err;

  // Initialize Portaudio
  err = Pa_Initialize();
  if( err != paNoError ) goto error;
  
  // Open stream
  err = Pa_OpenDefaultStream(
    &stream,
    0, /* no input channels */
    2, /* stereo output */
    paFloat32, /* 32 bit floating point output */
    SAMPLE_RATE,
    paFramesPerBufferUnspecified,
    patestCallback, /* callback function */
    &data
  ); /* A pointer passed to the callback */
  if( err != paNoError ) goto error;

  // Start stream
  err = Pa_StartStream( stream );
  if( err != paNoError ) goto error;

  // Sleep for 5 seconds.
  Pa_Sleep(5 * 1000);

  // Stop stream
  err = Pa_StopStream( stream );
  if( err != paNoError ) goto error;

  // Close stream
  err = Pa_CloseStream( stream );
  if( err != paNoError ) goto error;

  // Terminate Portaudio
  err = Pa_Terminate();
  if( err != paNoError ) goto error;

  /* Free the debug module. */
  wasm2c_debug_free(&context);

  /* Free the Wasm runtime state. */
  wasm_rt_free();

  return 0;

  error:
    printf(  "PortAudio error: %s\n", Pa_GetErrorText( err ) );
    return 1;
}
