export class PosterPhotoError extends Error {}

export function loadPosterImage(src: string, signal?: AbortSignal) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    const cleanup = () => { clearTimeout(timer); signal?.removeEventListener('abort', abort) }
    const fail = (error: Error) => { cleanup(); image.onload = null; image.onerror = null; image.src = ''; reject(error) }
    const abort = () => fail(new DOMException('Aborted', 'AbortError'))
    const timer = setTimeout(() => fail(new Error('画像の読み込みがタイムアウトしました。')), 45000)
    image.onload = () => { cleanup(); resolve(image) }
    image.onerror = () => fail(new Error('画像を読み込めませんでした。'))
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) { abort(); return }
    image.src = src
  })
}

const cache = new Map<string, HTMLCanvasElement>()

export async function preparePortrait(url: string, signal?: AbortSignal, onProgress?: (text: string) => void) {
  if (cache.has(url)) return cache.get(url)!
  onProgress?.('演者写真を読み込み中…')
  const image = await loadPosterImage(url, signal)
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight))
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let transparent = 0
  for (let i = 3; i < data.data.length; i += 4) if (data.data[i] < 200) transparent++
  // Preserve uploaded transparent cutouts instead of running a second matte.
  if (transparent < canvas.width * canvas.height * 0.01) {
    onProgress?.('写真の背景を除去中…（初回は少し時間がかかります）')
    const result = await new Promise<ImageData>((resolve, reject) => {
      const worker = new Worker('/promo-workers/removeBackground.worker.js', { type: 'module' })
      const cleanup = () => { clearTimeout(timer); signal?.removeEventListener('abort', abort); worker.terminate() }
      const fail = () => { cleanup(); reject(new PosterPhotoError('写真の背景を除去できませんでした。通信状態を確認して再試行するか、別の写真を選んでください。')) }
      const abort = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')) }
      const timer = setTimeout(fail, 180000)
      signal?.addEventListener('abort', abort, { once: true })
      worker.onerror = fail
      worker.onmessage = ({ data: output }) => {
        if (output.status === 'complete') {
          cleanup()
          resolve(new ImageData(new Uint8ClampedArray(output.pixels), output.width, output.height))
        } else if (output.status === 'error') fail()
        else if (output.status === 'processing') onProgress?.('人物を切り抜いています…')
        else if (output.status === 'loading') onProgress?.(`背景除去の準備中… ${output.progress}%（初回のみダウンロード）`)
      }
      if (signal?.aborted) { abort(); return }
      worker.postMessage({ pixels: data.data.buffer, width: canvas.width, height: canvas.height }, [data.data.buffer])
    })
    ctx.putImageData(result, 0, 0)
  }
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  let left = canvas.width, right = 0, top = canvas.height, bottom = 0, count = 0
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    if (pixels[(y * canvas.width + x) * 4 + 3] > 48) {
      left = Math.min(left, x); right = Math.max(right, x)
      top = Math.min(top, y); bottom = Math.max(bottom, y); count++
    }
  }
  if (count < canvas.width * canvas.height * 0.005) throw new PosterPhotoError('人物を検出できませんでした。人物がはっきり写った写真を選んでください。')
  const cropped = document.createElement('canvas')
  cropped.width = right - left + 1; cropped.height = bottom - top + 1
  cropped.getContext('2d')!.drawImage(canvas, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height)
  if (cache.size >= 3) cache.delete(cache.keys().next().value!)
  cache.set(url, cropped)
  return cropped
}
