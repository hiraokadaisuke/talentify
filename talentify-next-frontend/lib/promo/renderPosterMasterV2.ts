type PosterMasterV2Input = {
  performerName: string
  storeName: string
  visitDate: string
  photoUrl?: string | null
}

const WIDTH = 1240
const HEIGHT = 1754

const AREAS = {
  date: { x: 48, y: 54, w: 500, h: 355 },
  photo: { x: 365, y: 60, w: 835, h: 790 },
  performerName: { x: 42, y: 585, w: 710, h: 255 },
  storeName: { x: 220, y: 1180, w: 835, h: 175 },
} as const

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`image load failed: ${src}`))
    image.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('png conversion failed'))
    }, 'image/png')
  })
}

function getVisitDateParts(value: string) {
  const date = new Date(value)

  return {
    month: new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      month: '2-digit',
    }).format(date),
    day: new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      day: '2-digit',
    }).format(date),
    weekday: new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      weekday: 'short',
    }).format(date),
    year: new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
    })
      .format(date)
      .replace('年', ''),
  }
}

function setJapaneseFont(
  ctx: CanvasRenderingContext2D,
  weight: number,
  size: number,
  italic = false
) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", sans-serif`
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  weight = 900,
  italic = false
) {
  let size = startSize
  while (size > minSize) {
    setJapaneseFont(ctx, weight, size, italic)
    if (ctx.measureText(text).width <= maxWidth) return size
    size -= 2
  }
  return minSize
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawCoverImageFocused(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  zoom = 1.08,
  focusY = 0.2
) {
  const baseScale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const scale = baseScale * zoom
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  const sx = Math.max(0, (image.naturalWidth - sourceWidth) / 2)
  const idealSy = image.naturalHeight * focusY - sourceHeight * 0.16
  const sy = Math.max(0, Math.min(image.naturalHeight - sourceHeight, idealSy))

  ctx.drawImage(
    image,
    sx,
    sy,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  )
}

function drawOutlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    fill: string | CanvasGradient
    stroke?: string
    strokeWidth?: number
    shadowColor?: string
    shadowBlur?: number
    align?: CanvasTextAlign
  }
) {
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = options.align ?? 'left'

  if (options.shadowColor) {
    ctx.shadowColor = options.shadowColor
    ctx.shadowBlur = options.shadowBlur ?? 18
  }

  if (options.stroke) {
    ctx.strokeStyle = options.stroke
    ctx.lineWidth = options.strokeWidth ?? 8
    ctx.strokeText(text, x, y)
  }

  ctx.fillStyle = options.fill
  ctx.fillText(text, x, y)
  ctx.restore()
}

function drawBrushPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  opacity = 0.96
) {
  ctx.save()

  const gradient = ctx.createLinearGradient(x, y, x + width, y + height)
  gradient.addColorStop(0, `rgba(6, 4, 6, ${opacity})`)
  gradient.addColorStop(0.56, `rgba(16, 7, 8, ${opacity})`)
  gradient.addColorStop(1, `rgba(72, 8, 6, ${Math.max(0.78, opacity - 0.08)})`)

  ctx.beginPath()
  ctx.moveTo(x + 12, y + height * 0.11)
  ctx.lineTo(x + width, y)
  ctx.lineTo(x + width - 24, y + height * 0.86)
  ctx.lineTo(x, y + height)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.globalAlpha = 0.95
  const accent = ctx.createLinearGradient(x, y, x + width, y)
  accent.addColorStop(0, '#E51D12')
  accent.addColorStop(0.6, '#FF5A1F')
  accent.addColorStop(1, '#FFC400')
  ctx.fillStyle = accent
  ctx.fillRect(x + 16, y + height - 9, width - 44, 6)

  ctx.restore()
}

function drawPerformerPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement
) {
  const { x, y, w, h } = AREAS.photo

  const layer = document.createElement('canvas')
  layer.width = WIDTH
  layer.height = HEIGHT
  const layerCtx = layer.getContext('2d')
  if (!layerCtx) return

  drawCoverImageFocused(layerCtx, photo, x, y, w, h)

  const mask = document.createElement('canvas')
  mask.width = WIDTH
  mask.height = HEIGHT
  const maskCtx = mask.getContext('2d')
  if (!maskCtx) return

  const fade = maskCtx.createRadialGradient(
    x + w * 0.58,
    y + h * 0.43,
    w * 0.18,
    x + w * 0.58,
    y + h * 0.43,
    w * 0.64
  )
  fade.addColorStop(0, 'rgba(255,255,255,1)')
  fade.addColorStop(0.63, 'rgba(255,255,255,.98)')
  fade.addColorStop(0.84, 'rgba(255,255,255,.72)')
  fade.addColorStop(1, 'rgba(255,255,255,0)')

  maskCtx.fillStyle = fade
  maskCtx.fillRect(x - 90, y - 90, w + 180, h + 180)

  const lowerFade = maskCtx.createLinearGradient(0, y + h * 0.7, 0, y + h)
  lowerFade.addColorStop(0, 'rgba(255,255,255,1)')
  lowerFade.addColorStop(0.62, 'rgba(255,255,255,.82)')
  lowerFade.addColorStop(1, 'rgba(255,255,255,0)')
  maskCtx.globalCompositeOperation = 'destination-in'
  maskCtx.fillStyle = lowerFade
  maskCtx.fillRect(x - 100, y, w + 200, h)

  layerCtx.globalCompositeOperation = 'destination-in'
  layerCtx.drawImage(mask, 0, 0)
  layerCtx.globalCompositeOperation = 'source-over'

  ctx.save()
  ctx.globalAlpha = 0.98
  ctx.drawImage(layer, 0, 0)
  ctx.restore()

  // Photo tint: ordinary profile photos blend into the fixed red/gold stage artwork.
  ctx.save()
  ctx.globalCompositeOperation = 'soft-light'
  const warm = ctx.createLinearGradient(x, y, x + w, y + h)
  warm.addColorStop(0, 'rgba(255,62,20,.28)')
  warm.addColorStop(0.52, 'rgba(255,110,20,.08)')
  warm.addColorStop(1, 'rgba(20,44,92,.18)')
  ctx.fillStyle = warm
  ctx.fillRect(x, y, w, h)
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  const rim = ctx.createRadialGradient(
    x + w * 0.72,
    y + h * 0.18,
    0,
    x + w * 0.72,
    y + h * 0.18,
    w * 0.34
  )
  rim.addColorStop(0, 'rgba(255,196,0,.18)')
  rim.addColorStop(1, 'rgba(255,196,0,0)')
  ctx.fillStyle = rim
  ctx.fillRect(x - 50, y - 50, w + 100, h + 100)
  ctx.restore()
}

export async function renderPosterMasterV2({
  performerName,
  storeName,
  visitDate,
  photoUrl,
}: PosterMasterV2Input) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  const [template, photo] = await Promise.all([
    loadImage('/promo-templates/poster-photo-template-v4.jpg'),
    photoUrl ? loadImage(photoUrl).catch(() => null) : Promise.resolve(null),
  ])

  // High-quality fixed visual master.
  ctx.drawImage(template, 0, 0, WIDTH, HEIGHT)

  // Replace the silhouette with the selected performer photo.
  if (photo) drawPerformerPhoto(ctx, photo)

  const { month, day, weekday, year } = getVisitDateParts(visitDate)

  // DATE placeholder replacement.
  drawBrushPanel(
    ctx,
    AREAS.date.x,
    AREAS.date.y,
    AREAS.date.w,
    AREAS.date.h,
    0.94
  )

  ctx.fillStyle = 'rgba(255,255,255,.72)'
  ctx.font = '800 23px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillText(year, AREAS.date.x + 28, AREAS.date.y + 50)

  ctx.font = '900 130px -apple-system, BlinkMacSystemFont, "Arial Black", sans-serif'
  drawOutlinedText(
    ctx,
    `${month}.${day}`,
    AREAS.date.x + 20,
    AREAS.date.y + 190,
    {
      fill: '#FFFFFF',
      stroke: 'rgba(0,0,0,.72)',
      strokeWidth: 8,
      shadowColor: 'rgba(255,70,20,.42)',
      shadowBlur: 18,
    }
  )

  setJapaneseFont(ctx, 900, 43)
  drawOutlinedText(
    ctx,
    weekday,
    AREAS.date.x + 30,
    AREAS.date.y + 258,
    {
      fill: '#FFC400',
      stroke: 'rgba(0,0,0,.72)',
      strokeWidth: 7,
    }
  )

  ctx.font = '800 18px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,.7)'
  ctx.fillText('RAITEN NAVI VISIT', AREAS.date.x + 30, AREAS.date.y + 309)

  // NAME placeholder replacement.
  drawBrushPanel(
    ctx,
    AREAS.performerName.x,
    AREAS.performerName.y,
    AREAS.performerName.w,
    AREAS.performerName.h,
    0.91
  )

  const nameSize = fitFontSize(
    ctx,
    performerName,
    AREAS.performerName.w - 68,
    112,
    56,
    900,
    true
  )
  setJapaneseFont(ctx, 900, nameSize, true)
  drawOutlinedText(
    ctx,
    performerName,
    AREAS.performerName.x + 34,
    AREAS.performerName.y + 142,
    {
      fill: '#FFFFFF',
      stroke: 'rgba(4,5,8,.94)',
      strokeWidth: 12,
      shadowColor: 'rgba(255,45,20,.38)',
      shadowBlur: 22,
    }
  )

  ctx.font = '800 22px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillStyle = '#FFC400'
  ctx.fillText(
    'SPECIAL GUEST',
    AREAS.performerName.x + 38,
    AREAS.performerName.y + 207
  )

  // STORE placeholder replacement.
  drawBrushPanel(
    ctx,
    AREAS.storeName.x,
    AREAS.storeName.y,
    AREAS.storeName.w,
    AREAS.storeName.h,
    0.95
  )

  ctx.font = '800 18px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillStyle = '#FFC400'
  ctx.fillText('STORE', AREAS.storeName.x + 30, AREAS.storeName.y + 40)

  const storeSize = fitFontSize(
    ctx,
    storeName,
    AREAS.storeName.w - 72,
    62,
    36,
    900
  )
  setJapaneseFont(ctx, 900, storeSize)
  drawOutlinedText(
    ctx,
    storeName,
    AREAS.storeName.x + AREAS.storeName.w / 2,
    AREAS.storeName.y + 119,
    {
      fill: '#FFFFFF',
      stroke: 'rgba(0,0,0,.84)',
      strokeWidth: 9,
      shadowColor: 'rgba(0,0,0,.7)',
      shadowBlur: 16,
      align: 'center',
    }
  )

  return canvasToBlob(canvas)
}
