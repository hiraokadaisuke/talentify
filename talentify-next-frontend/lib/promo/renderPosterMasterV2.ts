import { loadPosterImage, preparePortrait } from './portrait'

type PosterMasterV2Input = {
  performerName: string
  storeName: string
  visitDate: string
  photoUrl?: string | null
  photoScale?: number
  photoOffsetY?: number
  signal?: AbortSignal
  onProgress?: (message: string) => void
}

const WIDTH = 1240
const HEIGHT = 1754
const ASSETS = '/promo-templates/layered-v1'
let fonts: Promise<void> | undefined

function loadFonts() {
  if (!fonts) fonts = Promise.all([
    new FontFace('PosterBrush', 'url(/fonts/promo/yuji-syuku.woff2)').load(),
    new FontFace('PosterDate', 'url(/fonts/promo/oswald.woff2)', { weight: '700' }).load(),
    new FontFace('PosterSans', 'url(/fonts/promo/noto-sans-jp.woff2)', { weight: '900' }).load(),
  ]).then(faces => { faces.forEach(face => document.fonts.add(face)) }).catch(error => { fonts = undefined; throw error })
  return fonts
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number,
  family: string, maxWidth: number, options: { center?: boolean; color?: string; weight?: number; outline?: number } = {}) {
  ctx.save()
  const weight = options.weight ?? (family === 'PosterBrush' ? 400 : 900)
  let fontSize = size
  const setFont = () => { ctx.font = `${weight} ${fontSize}px ${family}, sans-serif` }
  setFont()
  while (ctx.measureText(value).width > maxWidth && fontSize > 22) { fontSize--; setFont() }
  ctx.textAlign = options.center ? 'center' : 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.lineJoin = 'round'
  ctx.shadowColor = 'rgba(0,0,0,.8)'
  ctx.shadowBlur = 14
  ctx.strokeStyle = 'rgba(20,3,5,.72)'
  ctx.lineWidth = options.outline ?? 5
  ctx.strokeText(value, x, y, maxWidth)
  ctx.shadowBlur = 0
  ctx.fillStyle = options.color ?? '#fffdf5'
  // A narrow white stroke gives the dynamic brush name enough weight at print size.
  if (family === 'PosterBrush') { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2; ctx.strokeText(value, x, y, maxWidth) }
  ctx.fillText(value, x, y, maxWidth)
  ctx.restore()
}

function drawPortrait(ctx: CanvasRenderingContext2D, photo: HTMLCanvasElement, zoom: number, offsetY: number) {
  const layer = document.createElement('canvas')
  layer.width = WIDTH; layer.height = HEIGHT
  const p = layer.getContext('2d')!
  // Fill a bust-oriented area; the alpha bounds, not the original photo background,
  // define placement. Tall/full-length photos naturally crop below the waist.
  const scale = Math.max(900 / photo.width, 1080 / photo.height) * zoom
  const w = photo.width * scale, h = photo.height * scale
  const x = 760 - w / 2, y = 130 + offsetY
  p.drawImage(photo, x, y, w, h)
  p.globalCompositeOperation = 'destination-in'
  const fade = p.createLinearGradient(0, 880, 0, 1270)
  fade.addColorStop(0, '#fff'); fade.addColorStop(1, 'rgba(255,255,255,0)')
  p.fillStyle = fade; p.fillRect(0, 0, WIDTH, HEIGHT)
  ctx.save()
  // Alpha-following backlight; never add a rectangular tint over the photo.
  ctx.shadowColor = 'rgba(255,112,16,.85)'; ctx.shadowBlur = 26
  ctx.drawImage(layer, 0, 0)
  ctx.restore()
}

export async function renderPosterMasterV2({ performerName, storeName, visitDate, photoUrl,
  photoScale = 1, photoOffsetY = 0, signal, onProgress }: PosterMasterV2Input) {
  const date = new Date(visitDate)
  if (Number.isNaN(date.getTime())) throw new Error('来店日を確認してください。')
  const [background, visit, foreground, portrait] = await Promise.all([
    loadPosterImage(`${ASSETS}/background.png`, signal),
    loadPosterImage(`${ASSETS}/visit.png`, signal),
    loadPosterImage(`${ASSETS}/foreground.png`, signal),
    photoUrl ? preparePortrait(photoUrl, signal, onProgress) : Promise.resolve(null),
    loadFonts(),
  ])
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  onProgress?.('文字と写真を合成中…')
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH; canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(background, 0, 0, WIDTH, HEIGHT)
  if (portrait) drawPortrait(ctx, portrait, photoScale, photoOffsetY)
  ctx.drawImage(foreground, 0, 0, WIDTH, HEIGHT)

  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(date)
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? ''
  text(ctx, part('year'), 62, 102, 48, 'PosterDate', 400, { weight: 700 })
  text(ctx, `${part('month')}.${part('day')}`, 48, 315, 232, 'PosterDate', 495, { weight: 700 })
  text(ctx, part('weekday').toUpperCase(), 60, 411, 92, 'PosterDate', 390, { weight: 700 })

  text(ctx, '来店ナビ', 934, 66, 39, 'PosterSans', 258)
  text(ctx, 'RAITEN NAVI', 944, 96, 20, 'PosterDate', 236, { weight: 700, outline: 3 })

  // Names and dates are drawn directly over the artwork, with no cover-up panels.
  ctx.save()
  ctx.translate(620, 1060); ctx.rotate(-0.075)
  text(ctx, performerName, 0, 0, 195, 'PosterBrush', 1100, { center: true, outline: 8 })
  text(ctx, 'SPECIAL GUEST', 0, 58, 29, 'PosterDate', 410, { center: true, color: '#ffdc83', weight: 700 })
  ctx.restore()

  const visitWidth = 760
  const visitHeight = visitWidth * visit.naturalHeight / visit.naturalWidth
  ctx.drawImage(visit, (WIDTH - visitWidth) / 2, 1155, visitWidth, visitHeight)
  text(ctx, storeName, WIDTH / 2, 1640, 70, 'PosterSans', 1100, { center: true, outline: 7 })
  text(ctx, '主催：来店ナビ（RAITEN NAVI）', WIDTH / 2, 1720, 27, 'PosterSans', 1080, { center: true, outline: 3 })
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNGの作成に失敗しました。')), 'image/png'))
}
