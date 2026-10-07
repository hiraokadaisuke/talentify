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
    }).format(date).replace('年', ''),
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
  ctx.drawImage(image, sx, sy, sourceWidth, sourceHeight, x, y, width, height)
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

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | null
) {
  const x = 245
  const y = 135
  const width = 935
  const height = 1120

  ctx.save()
  roundRectPath(ctx, x, y, width, height, 34)
  ctx.clip()

  if (photo) {
    drawCoverImageFocused(ctx, photo, x, y, width, height)
  } else {
    const fallback = ctx.createLinearGradient(x, y, x + width, y + height)
    fallback.addColorStop(0, '#30100d')
    fallback.addColorStop(0.5, '#0b1f3b')
    fallback.addColorStop(1, '#080a10')
    ctx.fillStyle = fallback
    ctx.fillRect(x, y, width, height)
  }

  const leftShade = ctx.createLinearGradient(x, 0, x + width * 0.42, 0)
  leftShade.addColorStop(0, 'rgba(3,5,10,.76)')
  leftShade.addColorStop(1, 'rgba(3,5,10,0)')
  ctx.fillStyle = leftShade
  ctx.fillRect(x, y, width * 0.5, height)

  const bottomShade = ctx.createLinearGradient(0, y + height * 0.56, 0, y + height)
  bottomShade.addColorStop(0, 'rgba(3,5,10,0)')
  bottomShade.addColorStop(0.55, 'rgba(3,5,10,.30)')
  bottomShade.addColorStop(1, 'rgba(3,5,10,.94)')
  ctx.fillStyle = bottomShade
  ctx.fillRect(x, y + height * 0.5, width, height * 0.5)

  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  const warm = ctx.createRadialGradient(430, 510, 0, 430, 510, 330)
  warm.addColorStop(0, 'rgba(255,70,20,.18)')
  warm.addColorStop(1, 'rgba(255,70,20,0)')
  ctx.fillStyle = warm
  ctx.fillRect(120, 160, 650, 720)

  const gold = ctx.createRadialGradient(980, 350, 0, 980, 350, 280)
  gold.addColorStop(0, 'rgba(255,196,0,.15)')
  gold.addColorStop(1, 'rgba(255,196,0,0)')
  ctx.fillStyle = gold
  ctx.fillRect(670, 80, 570, 600)
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
    loadImage('/promo-templates/poster-master-v8-bg.svg'),
    loadImage('/promo-templates/poster-master-v8-overlay.svg'),
    photoUrl ? loadImage(photoUrl).catch(() => null) : Promise.resolve(null),
  ])

  ctx.drawImage(background, 0, 0, WIDTH, HEIGHT)
  drawPhoto(ctx, photo)
  ctx.drawImage(overlay, 0, 0, WIDTH, HEIGHT)

  const { month, day, weekday, year } = getVisitDateParts(visitDate)

  // fixed sponsor badge
  roundRectPath(ctx, 72, 80, 286, 58, 29)
  const sponsor = ctx.createLinearGradient(72, 80, 358, 138)
  sponsor.addColorStop(0, '#ff3018')
  sponsor.addColorStop(0.62, '#ff5a1f')
  sponsor.addColorStop(1, '#ff8a00')
  ctx.fillStyle = sponsor
  ctx.fill()
  setJapaneseFont(ctx, 900, 27)
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'middle'
  ctx.fillText('主催：来店ナビ', 99, 109)

  // date block
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(255,255,255,.72)'
  ctx.font = '800 20px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillText(year, 76, 190)

  ctx.font = '900 132px -apple-system, BlinkMacSystemFont, "Arial Black", sans-serif'
  drawOutlinedText(ctx, `${month}.${day}`, 72, 303, {
    fill: '#fff',
    stroke: 'rgba(0,0,0,.55)',
    strokeWidth: 7,
    shadowColor: 'rgba(255,68,24,.45)',
    shadowBlur: 18,
  })

  const dateWidth = ctx.measureText(`${month}.${day}`).width
  roundRectPath(ctx, 88 + dateWidth, 232, 92, 64, 14)
  ctx.fillStyle = '#ffc400'
  ctx.fill()
  setJapaneseFont(ctx, 900, 30)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#07101d'
  ctx.fillText(weekday, 134 + dateWidth, 264)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.font = '800 18px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillStyle = '#ffc400'
  ctx.fillText('SPECIAL GUEST', 76, 339)

  // performer name
  const nameSize = fitFontSize(ctx, performerName, 880, 104, 56, 900, true)
  setJapaneseFont(ctx, 900, nameSize, true)
  drawOutlinedText(ctx, performerName, 78, 1118, {
    fill: '#fff',
    stroke: 'rgba(4,6,11,.92)',
    strokeWidth: 13,
    shadowColor: 'rgba(255,48,24,.42)',
    shadowBlur: 28,
  })

  // main factual headline: 来店
  const visitGradient = ctx.createLinearGradient(80, 1130, 650, 1350)
  visitGradient.addColorStop(0, '#fff3a5')
  visitGradient.addColorStop(0.23, '#ffd43b')
  visitGradient.addColorStop(0.52, '#ffc400')
  visitGradient.addColorStop(0.82, '#ff8a00')
  visitGradient.addColorStop(1, '#ff5a1f')

  setJapaneseFont(ctx, 900, 205)
  drawOutlinedText(ctx, '来店', 74, 1333, {
    fill: visitGradient,
    stroke: '#070b13',
    strokeWidth: 18,
    shadowColor: 'rgba(255,88,22,.55)',
    shadowBlur: 34,
  })

  // accent underline
  const line = ctx.createLinearGradient(80, 0, 1080, 0)
  line.addColorStop(0, '#ff2f18')
  line.addColorStop(0.55, '#ff8a00')
  line.addColorStop(1, '#ffc400')
  ctx.fillStyle = line
  ctx.fillRect(78, 1362, 1015, 8)

  // store name
  ctx.font = '800 18px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillStyle = '#ffc400'
  ctx.fillText('STORE', 84, 1421)

  const storeSize = fitFontSize(ctx, storeName, 1010, 66, 38, 900)
  setJapaneseFont(ctx, 900, storeSize)
  drawOutlinedText(ctx, storeName, 620, 1500, {
    fill: '#fff',
    stroke: 'rgba(3,5,10,.85)',
    strokeWidth: 9,
    shadowColor: 'rgba(0,0,0,.72)',
    shadowBlur: 16,
    align: 'center',
  })

  // compliance footer
  setJapaneseFont(ctx, 700, 22)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#fff'
  ctx.fillText('主催：来店ナビ（RAITEN NAVI）', 96, 1644)

  ctx.textAlign = 'right'
  ctx.font = '800 17px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillStyle = '#ffc400'
  ctx.fillText('OFFICIAL VISIT PROMOTION', 1145, 1644)
  ctx.textAlign = 'left'

  return canvasToBlob(canvas)
}
