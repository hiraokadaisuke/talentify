type PosterMasterV2Input = {
  performerName: string
  storeName: string
  visitDate: string
  photoUrl?: string | null
}

const WIDTH = 1240
const HEIGHT = 1754

const AREAS = {
  date: { x: 58, y: 55, w: 480, h: 350 },
  photo: { x: 285, y: 70, w: 930, h: 1030 },
  performerName: { x: 70, y: 615, w: 775, h: 235 },
  storeName: { x: 170, y: 1322, w: 900, h: 175 },
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
  const idealSy = image.naturalHeight * focusY - sourceHeight * 0.18
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
  opacity = 0.95
) {
  ctx.save()

  const gradient = ctx.createLinearGradient(x, y, x + width, y + height)
  gradient.addColorStop(0, `rgba(3, 6, 12, ${opacity})`)
  gradient.addColorStop(0.62, `rgba(10, 7, 10, ${opacity})`)
  gradient.addColorStop(1, `rgba(70, 7, 9, ${Math.max(0.72, opacity - 0.12)})`)

  ctx.beginPath()
  ctx.moveTo(x + 8, y + height * 0.16)
  ctx.lineTo(x + width, y)
  ctx.lineTo(x + width - 22, y + height * 0.84)
  ctx.lineTo(x, y + height)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.globalAlpha = 0.9
  const accent = ctx.createLinearGradient(x, y, x + width, y)
  accent.addColorStop(0, '#FF2A17')
  accent.addColorStop(0.52, '#FF5A1F')
  accent.addColorStop(1, '#FFC400')
  ctx.fillStyle = accent
  ctx.fillRect(x + 18, y + height - 8, width - 44, 5)

  ctx.restore()
}

function drawPerformerPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const layer = document.createElement('canvas')
  layer.width = WIDTH
  layer.height = HEIGHT
  const layerCtx = layer.getContext('2d')
  if (!layerCtx) return

  drawCoverImageFocused(layerCtx, photo, x, y, width, height)

  const mask = document.createElement('canvas')
  mask.width = WIDTH
  mask.height = HEIGHT
  const maskCtx = mask.getContext('2d')
  if (!maskCtx) return

  maskCtx.save()
  maskCtx.filter = 'blur(34px)'
  maskCtx.fillStyle = '#fff'
  roundRectPath(maskCtx, x + 26, y + 26, width - 52, height - 52, 92)
  maskCtx.fill()
  maskCtx.restore()

  layerCtx.globalCompositeOperation = 'destination-in'
  layerCtx.drawImage(mask, 0, 0)
  layerCtx.globalCompositeOperation = 'source-over'

  const lowerFade = layerCtx.createLinearGradient(0, y + height * 0.62, 0, y + height)
  lowerFade.addColorStop(0, 'rgba(5,8,14,0)')
  lowerFade.addColorStop(0.65, 'rgba(5,8,14,.34)')
  lowerFade.addColorStop(1, 'rgba(5,8,14,.92)')
  layerCtx.fillStyle = lowerFade
  layerCtx.fillRect(x - 35, y + height * 0.55, width + 70, height * 0.5)

  ctx.drawImage(layer, 0, 0)

  // Warm/cool rim lights help ordinary profile photos blend into the fixed artwork.
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  const warm = ctx.createRadialGradient(
    x + width * 0.22,
    y + height * 0.38,
    0,
    x + width * 0.22,
    y + height * 0.38,
    width * 0.48
  )
  warm.addColorStop(0, 'rgba(255,82,20,.20)')
  warm.addColorStop(1, 'rgba(255,82,20,0)')
  ctx.fillStyle = warm
  ctx.fillRect(x - 80, y - 80, width + 160, height + 160)

  const gold = ctx.createRadialGradient(
    x + width * 0.76,
    y + height * 0.24,
    0,
    x + width * 0.76,
    y + height * 0.24,
    width * 0.38
  )
  gold.addColorStop(0, 'rgba(255,196,0,.16)')
  gold.addColorStop(1, 'rgba(255,196,0,0)')
  ctx.fillStyle = gold
  ctx.fillRect(x - 80, y - 80, width + 160, height + 160)
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
    loadImage('/promo-templates/poster-photo-template-v3.avif'),
    photoUrl ? loadImage(photoUrl).catch(() => null) : Promise.resolve(null),
  ])

  // The generated artwork is the visual master. We only replace the variable fields.
  ctx.drawImage(template, 0, 0, WIDTH, HEIGHT)

  if (photo) {
    drawPerformerPhoto(
      ctx,
      photo,
      AREAS.photo.x,
      AREAS.photo.y,
      AREAS.photo.w,
      AREAS.photo.h
    )
  }

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
  ctx.font = '800 24px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillText(year, AREAS.date.x + 26, AREAS.date.y + 48)

  ctx.font = '900 120px -apple-system, BlinkMacSystemFont, "Arial Black", sans-serif'
  drawOutlinedText(
    ctx,
    `${month}.${day}`,
    AREAS.date.x + 20,
    AREAS.date.y + 175,
    {
      fill: '#FFFFFF',
      stroke: 'rgba(0,0,0,.72)',
      strokeWidth: 8,
      shadowColor: 'rgba(255,90,31,.45)',
      shadowBlur: 18,
    }
  )

  setJapaneseFont(ctx, 900, 42)
  drawOutlinedText(
    ctx,
    weekday,
    AREAS.date.x + 26,
    AREAS.date.y + 242,
    {
      fill: '#FFC400',
      stroke: 'rgba(0,0,0,.68)',
      strokeWidth: 6,
    }
  )

  ctx.font = '800 18px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,.66)'
  ctx.fillText('RAITEN NAVI VISIT', AREAS.date.x + 26, AREAS.date.y + 295)

  // NAME placeholder replacement.
  drawBrushPanel(
    ctx,
    AREAS.performerName.x,
    AREAS.performerName.y,
    AREAS.performerName.w,
    AREAS.performerName.h,
    0.92
  )

  const nameSize = fitFontSize(
    ctx,
    performerName,
    AREAS.performerName.w - 60,
    108,
    56,
    900,
    true
  )
  setJapaneseFont(ctx, 900, nameSize, true)
  drawOutlinedText(
    ctx,
    performerName,
    AREAS.performerName.x + 30,
    AREAS.performerName.y + 132,
    {
      fill: '#FFFFFF',
      stroke: 'rgba(5,8,14,.92)',
      strokeWidth: 11,
      shadowColor: 'rgba(255,60,20,.32)',
      shadowBlur: 20,
    }
  )

  ctx.font = '800 22px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillStyle = '#FFC400'
  ctx.fillText(
    'SPECIAL GUEST',
    AREAS.performerName.x + 34,
    AREAS.performerName.y + 190
  )

  // STORE placeholder replacement.
  drawBrushPanel(
    ctx,
    AREAS.storeName.x,
    AREAS.storeName.y,
    AREAS.storeName.w,
    AREAS.storeName.h,
    0.96
  )

  ctx.font = '800 18px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillStyle = '#FFC400'
  ctx.fillText(
    'STORE',
    AREAS.storeName.x + 30,
    AREAS.storeName.y + 38
  )

  const storeSize = fitFontSize(
    ctx,
    storeName,
    AREAS.storeName.w - 70,
    67,
    38,
    900
  )
  setJapaneseFont(ctx, 900, storeSize)
  drawOutlinedText(
    ctx,
    storeName,
    AREAS.storeName.x + AREAS.storeName.w / 2,
    AREAS.storeName.y + 115,
    {
      fill: '#FFFFFF',
      stroke: 'rgba(0,0,0,.78)',
      strokeWidth: 8,
      shadowColor: 'rgba(0,0,0,.65)',
      shadowBlur: 14,
      align: 'center',
    }
  )

  return canvasToBlob(canvas)
}
