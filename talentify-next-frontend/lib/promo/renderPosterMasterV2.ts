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

function drawBrushStroke(ctx: CanvasRenderingContext2D, x: number, y: number, width: number,
  color: string, thickness: number, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = color
  ctx.lineWidth = thickness
  ctx.shadowColor = color
  ctx.shadowBlur = thickness * 0.65
  ctx.beginPath()
  ctx.moveTo(x - width / 2, y + 9)
  ctx.bezierCurveTo(x - width * 0.23, y - 13, x + width * 0.18, y + 17, x + width / 2, y - 7)
  ctx.stroke()
  ctx.restore()
}

function drawFlare(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  const glow = ctx.createRadialGradient(x, y, 0, x, y, 42 * scale)
  glow.addColorStop(0, 'rgba(255,255,225,.95)')
  glow.addColorStop(.16, 'rgba(255,214,102,.86)')
  glow.addColorStop(1, 'rgba(255,90,18,0)')
  ctx.fillStyle = glow
  ctx.fillRect(x - 48 * scale, y - 48 * scale, 96 * scale, 96 * scale)
  ctx.strokeStyle = 'rgba(255,246,192,.9)'
  ctx.lineWidth = Math.max(1.4, 2.2 * scale)
  ctx.shadowColor = 'rgba(255,166,35,.9)'
  ctx.shadowBlur = 12 * scale
  for (const [dx, dy] of [[1, 0], [0, 1], [0.72, 0.72], [-0.72, 0.72]] as const) {
    ctx.beginPath()
    ctx.moveTo(x - dx * 31 * scale, y - dy * 31 * scale)
    ctx.lineTo(x + dx * 31 * scale, y + dy * 31 * scale)
    ctx.stroke()
  }
  ctx.fillStyle = '#fffbe3'
  ctx.beginPath(); ctx.arc(x, y, 3.2 * scale, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawPosterDecorations(ctx: CanvasRenderingContext2D) {
  // These sharp, deterministic flares give the type a finished advertising-print edge
  // without obscuring the cutout performer.
  drawFlare(ctx, 1004, 1218, .8)
  drawFlare(ctx, 176, 1392, .57)
  drawFlare(ctx, 1074, 1512, .46)
  drawBrushStroke(ctx, 620, 1649, 790, '#8e1015', 24, .78)
  drawBrushStroke(ctx, 620, 1646, 760, '#ffb62e', 5, .9)
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
  const [background, visit, foreground, foregroundGlam, portrait] = await Promise.all([
    loadPosterImage(`${ASSETS}/background.png`, signal),
    loadPosterImage(`${ASSETS}/visit-v2.png`, signal),
    loadPosterImage(`${ASSETS}/foreground.png`, signal),
    loadPosterImage(`${ASSETS}/foreground-v2.png`, signal),
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
  ctx.save()
  ctx.globalAlpha = .58
  ctx.drawImage(foregroundGlam, 0, 0, WIDTH, HEIGHT)
  ctx.restore()

  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(date)
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? ''
  // The reference posters use a compact, slightly slanted date lockup rather than
  // three unrelated labels. Rotate the entire lockup as one typographic unit.
  ctx.save()
  ctx.translate(174, 240); ctx.rotate(-0.035); ctx.translate(-174, -240)
  text(ctx, part('year'), 62, 102, 48, 'PosterDate', 400, { weight: 700, outline: 7 })
  text(ctx, `${part('month')}.${part('day')}`, 48, 315, 232, 'PosterDate', 495, { weight: 700, outline: 9 })
  text(ctx, part('weekday').toUpperCase(), 60, 411, 92, 'PosterDate', 390, { weight: 700, outline: 7 })
  ctx.restore()
  drawBrushStroke(ctx, 170, 432, 248, '#ff9a1e', 5, .9)

  text(ctx, '来店ナビ', 934, 66, 39, 'PosterSans', 258)
  text(ctx, 'RAITEN NAVI', 944, 96, 20, 'PosterDate', 236, { weight: 700, outline: 3 })

  // Names and dates are drawn directly over the artwork, with no cover-up panels.
  ctx.save()
  ctx.translate(620, 1065); ctx.rotate(-0.115)
  drawBrushStroke(ctx, 0, 38, 1010, '#5b0a12', 46, .78)
  drawBrushStroke(ctx, 0, 34, 980, '#d3261e', 19, .9)
  text(ctx, performerName, 0, 0, 205, 'PosterBrush', 1120, { center: true, outline: 13, color: '#fffaf0' })
  text(ctx, 'SPECIAL GUEST', 0, 72, 30, 'PosterDate', 430, { center: true, color: '#ffe4a2', weight: 700, outline: 4 })
  ctx.restore()

  const visitWidth = 890
  const visitHeight = visitWidth * visit.naturalHeight / visit.naturalWidth
  ctx.save()
  ctx.translate(WIDTH / 2, 1285); ctx.rotate(-0.035)
  ctx.shadowColor = 'rgba(255,130,15,.82)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 12
  ctx.filter = 'saturate(1.18) contrast(1.06)'
  ctx.drawImage(visit, -visitWidth / 2, -visitHeight / 2, visitWidth, visitHeight)
  ctx.restore()
  drawPosterDecorations(ctx)
  ctx.save(); ctx.translate(WIDTH / 2, 0); ctx.rotate(-0.025); ctx.translate(-WIDTH / 2, 0)
  text(ctx, storeName, WIDTH / 2, 1640, 70, 'PosterSans', 1100, { center: true, outline: 10, color: '#fffaf0' })
  ctx.restore()
  text(ctx, '主催：来店ナビ（RAITEN NAVI）', WIDTH / 2, 1720, 27, 'PosterSans', 1080, { center: true, outline: 4 })
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNGの作成に失敗しました。')), 'image/png'))
}
