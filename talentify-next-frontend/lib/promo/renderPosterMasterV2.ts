type PosterMasterV2Input = {
  performerName: string
  storeName: string
  visitDate: string
  photoUrl?: string | null
}

const WIDTH = 1240
const HEIGHT = 1754

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
  size: number
) {
  ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", sans-serif`
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  weight = 900
) {
  let size = startSize
  while (size > minSize) {
    setJapaneseFont(ctx, weight, size)
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
  zoom = 1.04,
  focusY = 0.18
) {
  const baseScale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const scale = baseScale * zoom
  const sourceWidth = width / scale
  const sourceHeight = height / scale

  const sx = Math.max(0, (image.naturalWidth - sourceWidth) / 2)
  const idealSy = image.naturalHeight * focusY - sourceHeight * 0.22
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
  }
) {
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.textBaseline = 'alphabetic'
  if (options.shadowColor) {
    ctx.shadowColor = options.shadowColor
    ctx.shadowBlur = options.shadowBlur ?? 20
  }
  if (options.stroke) {
    ctx.strokeStyle = options.stroke
    ctx.lineWidth = options.strokeWidth ?? 10
    ctx.strokeText(text, x, y)
  }
  ctx.fillStyle = options.fill
  ctx.fillText(text, x, y)
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

  const [background, overlay, photo] = await Promise.all([
    loadImage('/promo-templates/poster-master-v2-bg.svg'),
    loadImage('/promo-templates/poster-master-v2-overlay.svg'),
    photoUrl ? loadImage(photoUrl).catch(() => null) : Promise.resolve(null),
  ])

  ctx.drawImage(background, 0, 0, WIDTH, HEIGHT)

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(84, 304)
  ctx.lineTo(1160, 272)
  ctx.lineTo(1160, 1320)
  ctx.lineTo(72, 1352)
  ctx.closePath()
  ctx.clip()

  if (photo) {
    drawCoverImageFocused(ctx, photo, 72, 250, 1088, 1135)
  } else {
    const fallback = ctx.createLinearGradient(72, 250, 1160, 1385)
    fallback.addColorStop(0, '#132D50')
    fallback.addColorStop(0.52, '#0B1F3B')
    fallback.addColorStop(1, '#421F17')
    ctx.fillStyle = fallback
    ctx.fillRect(72, 250, 1088, 1135)
  }

  const photoTopShade = ctx.createLinearGradient(0, 250, 0, 580)
  photoTopShade.addColorStop(0, 'rgba(5,11,21,.70)')
  photoTopShade.addColorStop(1, 'rgba(5,11,21,0)')
  ctx.fillStyle = photoTopShade
  ctx.fillRect(72, 250, 1088, 360)

  const leftShade = ctx.createLinearGradient(72, 0, 470, 0)
  leftShade.addColorStop(0, 'rgba(5,11,21,.72)')
  leftShade.addColorStop(1, 'rgba(5,11,21,0)')
  ctx.fillStyle = leftShade
  ctx.fillRect(72, 250, 430, 1135)

  ctx.restore()

  ctx.drawImage(overlay, 0, 0, WIDTH, HEIGHT)

  const { month, day, weekday, year } = getVisitDateParts(visitDate)

  roundRectPath(ctx, 78, 92, 285, 58, 29)
  const sponsorGradient = ctx.createLinearGradient(78, 92, 363, 150)
  sponsorGradient.addColorStop(0, '#FF3B2E')
  sponsorGradient.addColorStop(0.7, '#FF5A1F')
  sponsorGradient.addColorStop(1, '#FF8A00')
  ctx.fillStyle = sponsorGradient
  ctx.fill()

  setJapaneseFont(ctx, 900, 27)
  ctx.fillStyle = '#FFFFFF'
  ctx.textBaseline = 'middle'
  ctx.fillText('主催：来店ナビ', 105, 121)

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(255,255,255,.68)'
  ctx.font = '800 20px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.letterSpacing = '2px'
  ctx.fillText(year, 82, 198)

  ctx.letterSpacing = '0px'
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '900 132px -apple-system, BlinkMacSystemFont, "Arial Black", sans-serif'
  ctx.fillText(`${month}.${day}`, 76, 306)

  const dateWidth = ctx.measureText(`${month}.${day}`).width
  roundRectPath(ctx, 92 + dateWidth, 235, 92, 64, 14)
  ctx.fillStyle = '#FFC400'
  ctx.fill()
  setJapaneseFont(ctx, 900, 30)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#081426'
  ctx.fillText(weekday, 138 + dateWidth, 267)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = '#FFC400'
  ctx.font = '800 19px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.letterSpacing = '4px'
  ctx.fillText('SPECIAL VISIT', 82, 343)
  ctx.letterSpacing = '0px'

  const nameSize = fitFontSize(ctx, performerName, 830, 88, 54, 900)
  setJapaneseFont(ctx, 900, nameSize)
  drawOutlinedText(ctx, performerName, 82, 1216, {
    fill: '#FFFFFF',
    stroke: 'rgba(5,11,21,.90)',
    strokeWidth: 12,
    shadowColor: 'rgba(0,0,0,.72)',
    shadowBlur: 26,
  })

  setJapaneseFont(ctx, 900, 176)
  const visitGradient = ctx.createLinearGradient(80, 1240, 520, 1370)
  visitGradient.addColorStop(0, '#FFF28A')
  visitGradient.addColorStop(0.36, '#FFC400')
  visitGradient.addColorStop(0.78, '#FF8A00')
  visitGradient.addColorStop(1, '#FF5A1F')
  drawOutlinedText(ctx, '来店', 76, 1388, {
    fill: visitGradient,
    stroke: '#081426',
    strokeWidth: 16,
    shadowColor: 'rgba(255,90,31,.42)',
    shadowBlur: 24,
  })

  setJapaneseFont(ctx, 900, 104)
  drawOutlinedText(ctx, 'イベント', 465, 1384, {
    fill: '#FFFFFF',
    stroke: '#081426',
    strokeWidth: 14,
    shadowColor: 'rgba(0,0,0,.7)',
    shadowBlur: 18,
  })

  ctx.save()
  ctx.translate(80, 1435)
  ctx.rotate(-0.018)
  const bar = ctx.createLinearGradient(0, 0, 1020, 0)
  bar.addColorStop(0, '#FF5A1F')
  bar.addColorStop(0.58, '#FF8A00')
  bar.addColorStop(1, '#FFC400')
  ctx.fillStyle = bar
  ctx.fillRect(0, 0, 1020, 7)
  ctx.restore()

  const storeSize = fitFontSize(ctx, storeName, 1050, 48, 31, 800)
  setJapaneseFont(ctx, 800, storeSize)
  drawOutlinedText(ctx, storeName, 82, 1527, {
    fill: '#FFFFFF',
    stroke: 'rgba(5,11,21,.86)',
    strokeWidth: 8,
    shadowColor: 'rgba(0,0,0,.6)',
    shadowBlur: 14,
  })

  setJapaneseFont(ctx, 700, 19)
  ctx.fillStyle = 'rgba(255,255,255,.70)'
  ctx.fillText('主催：来店ナビ（RAITEN NAVI）', 82, 1642)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#FFC400'
  ctx.font = '800 18px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.letterSpacing = '2px'
  ctx.fillText('OFFICIAL PROMOTION MATERIAL', 1158, 1642)
  ctx.textAlign = 'left'
  ctx.letterSpacing = '0px'

  return canvasToBlob(canvas)
}
