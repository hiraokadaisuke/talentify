import { loadPosterImage, preparePortrait } from './portrait'

type PosterMasterV2Input = {
  performerName: string
  storeName: string
  visitDate: string
  photoUrl?: string | null
  photoScale?: number
  photoOffsetX?: number
  photoOffsetY?: number
  signal?: AbortSignal
  onProgress?: (message: string) => void
}

const WIDTH = 1240
const HEIGHT = 1754
const ASSETS = '/promo-templates/layered-v1'
export const POSTER_PHOTO_LIMITS = {
  scale: { min: 0.5, max: 2.5, step: 0.05 },
  offsetX: { min: -600, max: 600, step: 10 },
  offsetY: { min: -600, max: 600, step: 10 },
} as const

function clampPhoto(value: number, range: { min: number; max: number }, fallback: number) {
  return Number.isFinite(value) ? Math.min(range.max, Math.max(range.min, value)) : fallback
}
let fonts: Promise<void> | undefined
let artwork: Promise<[HTMLImageElement, HTMLImageElement, HTMLImageElement, HTMLImageElement, HTMLImageElement]> | undefined

function loadArtwork() {
  if (!artwork) artwork = Promise.all([
    loadPosterImage(`${ASSETS}/background.png`),
    loadPosterImage(`${ASSETS}/visit-v3.png`),
    loadPosterImage(`${ASSETS}/foreground.png`),
    loadPosterImage(`${ASSETS}/foreground-v2.png`),
    loadPosterImage('/brand/raiten-navi-logo.svg'),
  ]).catch(error => { artwork = undefined; throw error })
  return artwork
}

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
  ctx.translate(x, y)
  ctx.fillStyle = color
  ctx.strokeStyle = color
  // Pointed ends and separate bristle marks, rather than a rounded neon tube.
  ctx.beginPath()
  ctx.moveTo(-width / 2, 12)
  ctx.bezierCurveTo(-width * .28, -thickness * .45, width * .12, -thickness * .55, width / 2, -9)
  ctx.bezierCurveTo(width * .2, thickness * .3, -width * .15, thickness * .55, -width / 2, 12)
  ctx.fill()
  ctx.lineWidth = Math.max(1, thickness * .12)
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(-width * (.49 - i * .014), 16 + i * 2)
    ctx.quadraticCurveTo(-width * .06, thickness * .3 + i * 1.5, width * (.43 - i * .03), -4 + i * 2)
    ctx.stroke()
  }
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
  ctx.fillStyle = 'rgba(255,246,192,.8)'
  ctx.shadowColor = 'rgba(255,166,35,.9)'
  ctx.shadowBlur = 12 * scale
  for (const [dx, dy] of [[1, 0], [0, 1], [0.72, 0.72], [-0.72, 0.72]] as const) {
    ctx.beginPath()
    ctx.moveTo(x - dx * 38 * scale, y - dy * 38 * scale)
    ctx.lineTo(x - dy * 1.8 * scale, y + dx * 1.8 * scale)
    ctx.lineTo(x + dx * 38 * scale, y + dy * 38 * scale)
    ctx.lineTo(x + dy * 1.8 * scale, y - dx * 1.8 * scale)
    ctx.closePath(); ctx.fill()
  }
  ctx.fillStyle = '#fffbe3'
  ctx.beginPath(); ctx.arc(x, y, 3.2 * scale, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawLightSweep(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, alpha: number) {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = alpha
  ctx.lineCap = 'round'
  ctx.shadowColor = 'rgba(255,155,30,.95)'
  ctx.shadowBlur = 25
  ctx.strokeStyle = 'rgba(255,178,50,.9)'
  ctx.lineWidth = 5
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.shadowBlur = 7
  ctx.strokeStyle = 'rgba(255,250,205,.92)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.restore()
}

function drawSparkParticles(ctx: CanvasRenderingContext2D) {
  // A fixed seed keeps every export visually consistent while filling the dark
  // negative space with fine, print-safe amber and champagne sparks.
  let seed = 0x71a8c42d
  const random = () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5
    return (seed >>> 0) / 4294967296
  }
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (let i = 0; i < 112; i++) {
    const zone = random()
    let x: number, y: number
    if (zone < .39) { x = 18 + random() * 225; y = 80 + random() * 1500 }
    else if (zone < .78) { x = 1010 + random() * 210; y = 80 + random() * 1500 }
    else { x = 210 + random() * 820; y = 820 + random() * 720 }
    // Preserve a clean face and keep the smallest embers out of the organizer line.
    if (x > 340 && x < 915 && y > 160 && y < 870) continue
    if (y > 1685 && x > 160 && x < 1080) continue
    const radius = .65 + random() * 1.7
    const alpha = .28 + random() * .57
    ctx.globalAlpha = alpha
    ctx.fillStyle = random() > .7 ? '#fff0c0' : '#ffb23b'
    ctx.shadowColor = '#ff9a25'
    ctx.shadowBlur = 5 + radius * 4
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

function drawPosterDecorations(ctx: CanvasRenderingContext2D) {
  // These sharp, deterministic flares give the type a finished advertising-print edge
  // without obscuring the cutout performer.
  drawFlare(ctx, 1004, 1218, .8)
  drawFlare(ctx, 176, 1392, .57)
  drawFlare(ctx, 1074, 1512, .46)
  drawFlare(ctx, 111, 684, .34)
  drawFlare(ctx, 1128, 520, .3)
  drawFlare(ctx, 1084, 1000, .36)
  drawFlare(ctx, 348, 1200, .27)
  drawFlare(ctx, 910, 1450, .3)
  drawFlare(ctx, 70, 1552, .33)
}

function drawPortrait(ctx: CanvasRenderingContext2D, photo: HTMLCanvasElement, zoom: number, offsetX: number, offsetY: number) {
  const layer = document.createElement('canvas')
  layer.width = WIDTH; layer.height = HEIGHT
  const p = layer.getContext('2d')!
  // Fill a bust-oriented area; the alpha bounds, not the original photo background,
  // define placement. Tall/full-length photos naturally crop below the waist.
  const scale = Math.max(900 / photo.width, 1080 / photo.height) * zoom
  const w = photo.width * scale, h = photo.height * scale
  const x = 760 - w / 2 + offsetX, y = 130 + offsetY
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
  photoScale = 1, photoOffsetX = 0, photoOffsetY = 0, signal, onProgress }: PosterMasterV2Input) {
  const date = new Date(visitDate)
  if (Number.isNaN(date.getTime())) throw new Error('来店日を確認してください。')
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  // Decode the four immutable art layers once; slider updates only recompose them.
  const [[background, visit, foreground, foregroundGlam, brandLogo], portrait] = await Promise.all([
    loadArtwork(),
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
  if (portrait) drawPortrait(ctx, portrait,
    clampPhoto(photoScale, POSTER_PHOTO_LIMITS.scale, 1),
    clampPhoto(photoOffsetX, POSTER_PHOTO_LIMITS.offsetX, 0),
    clampPhoto(photoOffsetY, POSTER_PHOTO_LIMITS.offsetY, 0))
  ctx.drawImage(foreground, 0, 0, WIDTH, HEIGHT)
  ctx.save()
  const glitter = document.createElement('canvas')
  glitter.width = WIDTH; glitter.height = HEIGHT
  const g = glitter.getContext('2d')!
  g.drawImage(foregroundGlam, 0, 0, WIDTH, HEIGHT)
  g.globalCompositeOperation = 'destination-in'
  const glitterFade = g.createLinearGradient(0, 0, 0, HEIGHT)
  glitterFade.addColorStop(0, 'rgba(255,255,255,.78)')
  glitterFade.addColorStop(.68, 'rgba(255,255,255,.72)')
  glitterFade.addColorStop(.85, 'rgba(255,255,255,.46)')
  glitterFade.addColorStop(1, 'rgba(255,255,255,.16)')
  g.fillStyle = glitterFade; g.fillRect(0, 0, WIDTH, HEIGHT)
  ctx.drawImage(glitter, 0, 0)
  ctx.restore()
  drawLightSweep(ctx, 16, 1280, 1220, 1050, .62)
  drawLightSweep(ctx, 22, 1535, 1170, 1330, .53)
  drawSparkParticles(ctx)

  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(date)
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? ''
  // The reference posters use a compact, slightly slanted date lockup rather than
  // three unrelated labels. Rotate the entire lockup as one typographic unit.
  ctx.save()
  ctx.translate(174, 240); ctx.rotate(-0.075); ctx.transform(1, 0, -.045, 1, 0, 0); ctx.translate(-174, -240)
  text(ctx, part('year'), 62, 102, 48, 'PosterDate', 400, { weight: 700, outline: 7 })
  text(ctx, `${part('month')}.${part('day')}`, 48, 315, 232, 'PosterDate', 495, { weight: 700, outline: 9 })
  text(ctx, part('weekday').toUpperCase(), 60, 411, 92, 'PosterDate', 390, { weight: 700, outline: 7 })
  ctx.restore()

  ctx.save()
  ctx.shadowColor = 'rgba(255,151,30,.75)'; ctx.shadowBlur = 16
  ctx.drawImage(brandLogo, 930, 18, 286, 95.3)
  ctx.restore()

  // Names and dates are drawn directly over the artwork, with no cover-up panels.
  ctx.save()
  ctx.translate(605, 1060); ctx.rotate(-0.145)
  drawBrushStroke(ctx, 0, 29, 1040, '#c5161d', 16, .85)
  drawBrushStroke(ctx, -20, 19, 970, '#fff3d6', 4, .86)
  ctx.save(); ctx.transform(1, 0, -.12, 1, 0, 0)
  text(ctx, performerName, 0, 0, 225, 'PosterBrush', 1090, { center: true, outline: 7, color: '#fffdf5' })
  ctx.restore()
  text(ctx, 'S P E C I A L  G U E S T', 0, 42, 28, 'PosterDate', 430, { center: true, color: '#ffe4a2', weight: 700, outline: 3 })
  ctx.restore()

  const visitWidth = 820
  const visitHeight = visitWidth * visit.naturalHeight / visit.naturalWidth
  ctx.save()
  ctx.translate(WIDTH / 2, 1324); ctx.rotate(-0.055)
  ctx.shadowColor = 'rgba(255,145,20,.9)'
  ctx.shadowBlur = 32
  ctx.shadowOffsetY = 13
  ctx.drawImage(visit, -visitWidth / 2, -visitHeight / 2, visitWidth, visitHeight)
  ctx.restore()
  drawPosterDecorations(ctx)
  ctx.save(); ctx.translate(WIDTH / 2, 1620); ctx.rotate(-0.045)
  drawBrushStroke(ctx, 0, 41, 930, '#d71920', 13, .95)
  drawBrushStroke(ctx, 0, 38, 895, '#ffb62e', 3, .9)
  ctx.transform(1, 0, -.12, 1, 0, 0)
  text(ctx, storeName, 0, 0, 74, 'PosterSans', 1100, { center: true, outline: 10, color: '#fffaf0' })
  ctx.restore()
  text(ctx, '主催：来店ナビ（RAITEN NAVI）', WIDTH / 2, 1720, 27, 'PosterSans', 1080, { center: true, outline: 4 })
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNGの作成に失敗しました。')), 'image/png'))
}
