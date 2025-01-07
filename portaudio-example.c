#include "stdio.h"
#include "portaudio.h"

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
    /* Generate simple sawtooth phaser that ranges between -1.0 and 1.0. */
    data->left_phase += 0.01f;
    /* When signal reaches top, drop back down. */
    if( data->left_phase >= 1.0f ) data->left_phase -= 2.0f;
    /* higher pitch so we can distinguish left and right. */
    data->right_phase += 0.03f;
    if( data->right_phase >= 1.0f ) data->right_phase -= 2.0f;
  }
  return 0;
}

static paTestData data;

int main(int argc, char **argv) {
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

  printf("Success!\n");

  return 0;

  error:
    printf(  "PortAudio error: %s\n", Pa_GetErrorText( err ) );
    return 1;
}
