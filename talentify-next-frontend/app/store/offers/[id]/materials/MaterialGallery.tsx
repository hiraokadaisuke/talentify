'use client'

import { useEffect, useState } from 'react'
import { Check, Download, ImageIcon, Loader2, Share2 } from 'lucide-react'
import { renderPosterMasterV2 } from '@/lib/promo/renderPosterMasterV2'

type FormatKey = 'poster' | 'feed' | 'story'

type GeneratedMaterial = {
  url: string
  blob: Blob
}

const formats: Array<{
  key: FormatKey
  title: string
  size: string
  usage: string
  width: number
  height: number
}> = [
  {
    key: 'poster',
    title: '店内ポスター',
    size: '1240 × 1754 px',
    usage: 'A4縦比率・店内掲示向け',
    width: 1240,
    height: 1754,
  },
  {
    key: 'feed',
    title: 'SNS投稿',
    size: '1080 × 1350 px',
    usage: 'Instagramなどの縦投稿向け',
    width: 1080,
    height: 1350,
  },
  {
    key: 'story',
    title: 'ストーリー',
    size: '1080 × 1920 px',
    usage: 'Instagramストーリー等の9:16向け',
    width: 1080,
    height: 1920,
  },
]

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image load failed'))
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

function roundedRect(
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
    ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif`
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 2
  }
  return size
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const sw = width / scale
  const sh = height / scale
  const sx = Math.max(0, (image.naturalWidth - sw) / 2)
  const sy = Math.max(0, Math.min(image.naturalHeight - sh, image.naturalHeight * 0.16))

  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height)
}

function getVisitDateParts(value: string) {
  const date = new Date(value)
  const monthDay = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  const weekday = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    weekday: 'short',
  }).format(date)
  const year = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
  })
    .format(date)
    .replace('年', '')

  return { monthDay, weekday, year }
}

async function createLegacyMaterial({
  width,
  height,
  performerName,
  storeName,
  visitDate,
  photo,
}: {
  width: number
  height: number
  performerName: string
  storeName: string
  visitDate: string
  photo: HTMLImageElement | null
}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  const pad = Math.round(width * 0.065)
  const isStory = height / width > 1.55
  const { monthDay, weekday, year } = getVisitDateParts(visitDate)

  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, '#081426')
  bg.addColorStop(0.44, '#0B1F3B')
  bg.addColorStop(0.72, '#131B35')
  bg.addColorStop(1, '#081426')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  const glow1 = ctx.createRadialGradient(
    width * 0.84,
    height * 0.15,
    0,
    width * 0.84,
    height * 0.15,
    width * 0.44
  )
  glow1.addColorStop(0, 'rgba(255,196,0,.38)')
  glow1.addColorStop(1, 'rgba(255,196,0,0)')
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, width, height)

  const glow2 = ctx.createRadialGradient(
    width * 0.12,
    height * 0.72,
    0,
    width * 0.12,
    height * 0.72,
    width * 0.52
  )
  glow2.addColorStop(0, 'rgba(255,90,31,.42)')
  glow2.addColorStop(1, 'rgba(255,90,31,0)')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, width, height)

  const photoTop = Math.round(height * (isStory ? 0.2 : 0.18))
  const photoHeight = Math.round(height * (isStory ? 0.55 : 0.54))

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, photoTop, width, photoHeight)
  ctx.clip()

  if (photo) {
    drawCoverImage(ctx, photo, 0, photoTop, width, photoHeight)
  } else {
    const fallback = ctx.createLinearGradient(0, photoTop, width, photoTop + photoHeight)
    fallback.addColorStop(0, '#172554')
    fallback.addColorStop(0.5, '#0B1F3B')
    fallback.addColorStop(1, '#3B1D16')
    ctx.fillStyle = fallback
    ctx.fillRect(0, photoTop, width, photoHeight)
  }

  const photoShade = ctx.createLinearGradient(0, photoTop, 0, photoTop + photoHeight)
  photoShade.addColorStop(0, 'rgba(8,20,38,.12)')
  photoShade.addColorStop(0.48, 'rgba(8,20,38,0)')
  photoShade.addColorStop(1, 'rgba(8,20,38,.92)')
  ctx.fillStyle = photoShade
  ctx.fillRect(0, photoTop, width, photoHeight)
  ctx.restore()

  const badgeHeight = Math.round(width * 0.07)
  ctx.fillStyle = '#FF5A1F'
  roundedRect(ctx, pad, pad, Math.round(width * 0.31), badgeHeight, badgeHeight / 2)
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `900 ${Math.round(width * 0.026)}px -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillText('主催：来店ナビ', pad + Math.round(width * 0.025), pad + badgeHeight / 2)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#FFC400'
  ctx.font = `800 ${Math.round(width * 0.021)}px -apple-system, BlinkMacSystemFont, sans-serif`
  ctx.fillText('RAITEN NAVI', width - pad, pad + badgeHeight / 2)
  ctx.textAlign = 'left'

  const dateY = Math.round(height * (isStory ? 0.115 : 0.105))
  ctx.fillStyle = '#FFFFFF'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `900 ${Math.round(width * (isStory ? 0.12 : 0.105))}px -apple-system, BlinkMacSystemFont, sans-serif`
  ctx.fillText(monthDay, pad, dateY + Math.round(width * 0.1))

  const dateWidth = ctx.measureText(monthDay).width
  const weekX = pad + dateWidth + Math.round(width * 0.018)
  const weekY = dateY + Math.round(width * 0.035)
  const weekW = Math.round(width * 0.09)
  const weekH = Math.round(width * 0.055)
  ctx.fillStyle = '#FFC400'
  roundedRect(ctx, weekX, weekY, weekW, weekH, Math.round(width * 0.01))
  ctx.fill()
  ctx.fillStyle = '#081426'
  ctx.font = `900 ${Math.round(width * 0.026)}px -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(weekday, weekX + weekW / 2, weekY + weekH / 2)
  ctx.textAlign = 'left'

  ctx.fillStyle = 'rgba(255,255,255,.72)'
  ctx.font = `700 ${Math.round(width * 0.02)}px -apple-system, BlinkMacSystemFont, sans-serif`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(`${year} · SPECIAL VISIT`, pad, dateY + Math.round(width * 0.14))

  const bottom = Math.round(height * (isStory ? 0.1 : 0.085))
  const storeY = height - bottom - Math.round(width * 0.04)
  const visitY = storeY - Math.round(width * 0.11)
  const nameY = visitY - Math.round(width * 0.085)
  const guestY = nameY - Math.round(width * 0.04)

  ctx.fillStyle = '#FFC400'
  ctx.font = `800 ${Math.round(width * 0.022)}px -apple-system, BlinkMacSystemFont, sans-serif`
  ctx.fillText('SPECIAL GUEST', pad, guestY)

  const nameSize = fitFontSize(
    ctx,
    performerName,
    width - pad * 2,
    Math.round(width * (isStory ? 0.074 : 0.07)),
    Math.round(width * 0.042),
    900
  )
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `900 ${nameSize}px -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif`
  ctx.shadowColor = 'rgba(0,0,0,.55)'
  ctx.shadowBlur = Math.round(width * 0.025)
  ctx.fillText(performerName, pad, nameY)

  ctx.font = `900 ${Math.round(width * (isStory ? 0.15 : 0.14))}px -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif`
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText('来店', pad, visitY)
  ctx.shadowBlur = 0

  ctx.strokeStyle = 'rgba(255,255,255,.28)'
  ctx.lineWidth = Math.max(2, Math.round(width * 0.003))
  ctx.beginPath()
  ctx.moveTo(pad, storeY - Math.round(width * 0.055))
  ctx.lineTo(width - pad, storeY - Math.round(width * 0.055))
  ctx.stroke()

  const storeSize = fitFontSize(
    ctx,
    storeName,
    width - pad * 2,
    Math.round(width * 0.038),
    Math.round(width * 0.027),
    800
  )
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `800 ${storeSize}px -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif`
  ctx.fillText(storeName, pad, storeY)

  ctx.fillStyle = 'rgba(255,255,255,.66)'
  ctx.font = `700 ${Math.round(width * 0.016)}px -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif`
  ctx.fillText('主催：来店ナビ（RAITEN NAVI）', pad, height - Math.round(height * 0.025))

  ctx.textAlign = 'right'
  ctx.fillStyle = '#FFC400'
  ctx.fillText('来店告知素材', width - pad, height - Math.round(height * 0.025))
  ctx.textAlign = 'left'

  return canvasToBlob(canvas)
}

export default function MaterialGallery({
  offerId,
  photos,
  performerName,
  storeName,
  visitDate,
}: {
  offerId: string
  photos: string[]
  performerName: string
  storeName: string
  visitDate: string
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [materials, setMaterials] = useState<Partial<Record<FormatKey, GeneratedMaterial>>>({})
  const [pending, setPending] = useState<Record<FormatKey, boolean>>({ poster: true, feed: true, story: true })
  const [failures, setFailures] = useState<Partial<Record<FormatKey, string>>>({})
  const [posterProgress, setPosterProgress] = useState('画像を作成中…')
  const [retry, setRetry] = useState(0)
  const [photoScale, setPhotoScale] = useState(1)
  const [photoOffsetY, setPhotoOffsetY] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [savingKey, setSavingKey] = useState<FormatKey | null>(null)

  // A4 matting is independent: an A4 error must not block the existing SNS images.
  useEffect(() => {
    const controller = new AbortController()
    let objectUrl: string | undefined
    setPending(current => ({ ...current, poster: true }))
    setFailures(current => ({ ...current, poster: undefined }))
    setMaterials(current => ({ ...current, poster: undefined }))
    setPosterProgress('画像を作成中…')
    renderPosterMasterV2({
      performerName, storeName, visitDate,
      photoUrl: photos[selectedPhoto] ?? null,
      photoScale, photoOffsetY,
      signal: controller.signal,
      onProgress: message => { if (!controller.signal.aborted) setPosterProgress(message) },
    }).then(blob => {
      if (controller.signal.aborted) return
      objectUrl = URL.createObjectURL(blob)
      setMaterials(current => ({ ...current, poster: { blob, url: objectUrl! } }))
    }).catch(cause => {
      if (!controller.signal.aborted) setFailures(current => ({ ...current,
        poster: cause instanceof Error ? cause.message : 'A4ポスターを作成できませんでした。もう一度お試しください。',
      }))
    }).finally(() => {
      if (!controller.signal.aborted) setPending(current => ({ ...current, poster: false }))
    })
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [photos, selectedPhoto, performerName, storeName, visitDate, photoScale, photoOffsetY, retry])

  useEffect(() => {
    let cancelled = false
    const urls: string[] = []
    setPending(current => ({ ...current, feed: true, story: true }))
    setFailures(current => ({ ...current, feed: undefined, story: undefined }))
    setMaterials(current => ({ ...current, feed: undefined, story: undefined }))
    async function generate() {
      const photo = photos[selectedPhoto] ? await loadImage(photos[selectedPhoto]).catch(() => null) : null
      if (cancelled) return
      await Promise.all(formats.filter(format => format.key !== 'poster').map(async format => {
        try {
          const blob = await createLegacyMaterial({ width: format.width, height: format.height,
            performerName, storeName, visitDate, photo })
          if (cancelled) return
          const url = URL.createObjectURL(blob)
          urls.push(url)
          setMaterials(current => ({ ...current, [format.key]: { blob, url } }))
        } catch {
          if (!cancelled) setFailures(current => ({ ...current, [format.key]: '画像を作成できませんでした。ページを再読み込みしてください。' }))
        } finally {
          if (!cancelled) setPending(current => ({ ...current, [format.key]: false }))
        }
      }))
    }
    void generate()
    return () => { cancelled = true; urls.forEach(url => URL.revokeObjectURL(url)) }
  }, [photos, selectedPhoto, performerName, storeName, visitDate])

  async function saveMaterial(format: FormatKey) {
    const material = materials[format]
    if (!material) return

    const filename = `raiten-navi-${offerId.slice(0, 8)}-${format}.png`
    setSavingKey(format)

    try {
      const file = new File([material.blob], filename, { type: 'image/png' })
      const shareData = { files: [file], title: '来店ナビ 告知素材' }

      if (
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData)
        return
      }

      const link = document.createElement('a')
      link.href = material.url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (saveError) {
      if ((saveError as Error)?.name !== 'AbortError') {
        setError('画像を保存できませんでした。もう一度お試しください。')
      }
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#C2410C]">
            <ImageIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-black text-slate-950">使用する写真</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {photos.length > 1
                ? '演者が登録している写真から、告知素材に使用する写真を選べます。'
                : photos.length === 1
                  ? '現在登録されている演者写真を使用します。'
                  : '演者写真が未登録のため、来店ナビの背景デザインで生成します。'}
            </p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {photos.map((photo, index) => {
              const selected = selectedPhoto === index
              return (
                <button
                  key={photo}
                  type="button"
                  onClick={() => { setSelectedPhoto(index); setPhotoScale(1); setPhotoOffsetY(0) }}
                  className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-100 transition sm:h-28 sm:w-24 ${
                    selected ? 'border-[#FF5A1F] ring-2 ring-orange-100' : 'border-slate-200'
                  }`}
                  aria-label={`写真${index + 1}を使用`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#FF5A1F] text-white shadow">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
        {photos.length > 0 && (
          <details className="mt-4 rounded-xl border border-slate-200 p-3">
            <summary className="cursor-pointer text-sm font-bold text-slate-700">A4ポスターの写真位置を調整</summary>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-600">人物の大きさ
                <input aria-label="人物の大きさ" type="range" min="0.7" max="1.6" step="0.05" value={photoScale}
                  onChange={event => setPhotoScale(Number(event.target.value))}
                  className="mt-2 block w-full accent-orange-600" />
              </label>
              <label className="text-sm text-slate-600">人物の上下位置
                <input aria-label="人物の上下位置" type="range" min="-120" max="240" step="10" value={photoOffsetY}
                  onChange={event => setPhotoOffsetY(Number(event.target.value))}
                  className="mt-2 block w-full accent-orange-600" />
              </label>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">背景は自動で除去します。髪や服の輪郭、顔に文字が重なっていないか、保存前に確認してください。</p>
          </details>
        )}
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-black text-slate-950">保存する画像</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {performerName} / {storeName} の案件情報を自動反映しています。「主催：来店ナビ」は固定表示です。
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            iPhoneでは保存ボタンを押すと共有メニューが開きます。「画像を保存」または「ファイルに保存」を選んでください。別画面へ移動しません。
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {formats.map(format => {
            const material = materials[format.key]

            return (
              <article
                id={format.key}
                key={format.key}
                className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]"
              >
                <div className="border-b border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-950">{format.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{format.usage}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      {format.size}
                    </span>
                  </div>
                </div>

                <div className="flex min-h-[360px] items-center justify-center bg-slate-100 p-4">
                  {pending[format.key] ? (
                    <div className="flex flex-col items-center gap-2 text-sm font-bold text-slate-500">
                      <Loader2 className="h-6 w-6 animate-spin text-[#FF5A1F]" />
                      <span role="status">{format.key === 'poster' ? posterProgress : '画像を作成中…'}</span>
                    </div>
                  ) : !material ? (
                    <div className="space-y-3 text-center text-sm text-slate-600" role="alert">
                      <p>{failures[format.key] || '画像を作成できませんでした。'}</p>
                      {format.key === 'poster' && <button type="button" onClick={() => setRetry(value => value + 1)}
                        className="rounded-lg border border-orange-300 bg-white px-4 py-2 font-bold text-orange-700">もう一度作成する</button>}
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={material.url}
                      alt={`${format.title}プレビュー`}
                      className="max-h-[520px] w-auto max-w-full rounded-lg object-contain shadow-xl"
                    />
                  )}
                </div>

                <div className="p-4">
                  <button
                    type="button"
                    onClick={() => void saveMaterial(format.key)}
                    disabled={!material || pending[format.key] || savingKey !== null}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-4 text-sm font-black text-white transition hover:bg-[#E94F18] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingKey === format.key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
                      <Share2 className="h-4 w-4" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    PNGを保存
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
