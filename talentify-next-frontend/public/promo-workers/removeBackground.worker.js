import { env, pipeline, RawImage } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js'

env.allowLocalModels = false
env.backends.onnx.wasm.numThreads = 1

self.onmessage = async (event) => {
  try {
    const { pixels, width, height } = event.data
    const segmenter = await pipeline('background-removal', 'Xenova/modnet', {
      revision: 'fa2fa546052fba4c08921230a26cc69a333fca12',
      dtype: 'fp32',
      device: 'wasm',
      progress_callback: (progress) => {
        if (progress.status === 'progress') self.postMessage({ status: 'loading', progress: Math.round(progress.progress) })
      },
    })
    self.postMessage({ status: 'processing' })
    const [output] = await segmenter(new RawImage(new Uint8ClampedArray(pixels), width, height, 4))
    const result = new Uint8ClampedArray(output.data)
    self.postMessage({ status: 'complete', pixels: result.buffer, width: output.width, height: output.height }, [result.buffer])
    await segmenter.dispose()
  } catch {
    self.postMessage({ status: 'error' })
  }
}
