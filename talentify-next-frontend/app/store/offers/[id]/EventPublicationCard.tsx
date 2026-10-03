'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Copy, ExternalLink, EyeOff, Megaphone } from 'lucide-react'

type Publication = {
  id: string
  offer_id: string
  slug: string
  status: string
  publish_at: string | null
  published_at: string | null
  show_time: boolean
  public_note: string | null
}

function toLocalDateTimeInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return shifted.toISOString().slice(0, 16)
}

function publicationLabel(publication: Publication | null) {
  if (!publication) return '未公開'
  if (
    publication.status === 'scheduled' &&
    publication.publish_at &&
    new Date(publication.publish_at).getTime() > Date.now()
  ) {
    return '公開予約'
  }
  if (publication.status === 'published' || publication.status === 'scheduled') return '公開中'
  if (publication.status === 'hidden') return '非公開'
  if (publication.status === 'ended') return '終了'
  if (publication.status === 'canceled') return 'キャンセル'
  return '未公開'
}

export default function EventPublicationCard({
  offerId,
  offerStatus,
  initialPublication,
}: {
  offerId: string
  offerStatus: string
  initialPublication: Publication | null
}) {
  const [publication, setPublication] = useState<Publication | null>(initialPublication)
  const [mode, setMode] = useState<'now' | 'scheduled'>(() => {
    if (
      initialPublication?.status === 'scheduled' &&
      initialPublication.publish_at &&
      new Date(initialPublication.publish_at).getTime() > Date.now()
    ) {
      return 'scheduled'
    }
    return 'now'
  })
  const [scheduledAt, setScheduledAt] = useState(() =>
    toLocalDateTimeInput(initialPublication?.publish_at ?? null)
  )
  const [showTime, setShowTime] = useState(initialPublication?.show_time ?? true)
  const [publicNote, setPublicNote] = useState(initialPublication?.public_note ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const canPublish = offerStatus === 'confirmed'
  const label = publicationLabel(publication)
  const isFutureScheduled =
    publication?.status === 'scheduled' &&
    Boolean(publication.publish_at) &&
    new Date(publication.publish_at as string).getTime() > Date.now()
  const isPubliclyVisible =
    publication?.status === 'published' ||
    publication?.status === 'ended' ||
    publication?.status === 'canceled' ||
    (publication?.status === 'scheduled' && !isFutureScheduled)

  const publicPath = isPubliclyVisible && publication?.slug ? `/events/${publication.slug}` : null

  const statusClass = useMemo(() => {
    if (label === '公開中') return 'bg-emerald-100 text-emerald-800'
    if (label === '公開予約') return 'bg-blue-100 text-blue-800'
    if (label === 'キャンセル') return 'bg-red-100 text-red-800'
    if (label === '終了') return 'bg-slate-200 text-slate-700'
    return 'bg-slate-100 text-slate-600'
  }, [label])

  const savePublication = async () => {
    setMessage(null)

    if (mode === 'scheduled' && !scheduledAt) {
      setMessage('公開日時を指定してください。')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/store/offers/${offerId}/publication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          publishAt: mode === 'scheduled' ? new Date(scheduledAt).toISOString() : null,
          showTime,
          publicNote,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        setMessage(result.error || '公開設定の保存に失敗しました。')
        return
      }
      setPublication(result.publication)
      setMessage(mode === 'scheduled' ? '公開日時を予約しました。' : '来店情報を公開しました。')
    } catch {
      setMessage('通信に失敗しました。もう一度お試しください。')
    } finally {
      setSaving(false)
    }
  }

  const hidePublication = async () => {
    setMessage(null)
    setSaving(true)
    try {
      const response = await fetch(`/api/store/offers/${offerId}/publication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hide' }),
      })
      const result = await response.json()
      if (!response.ok) {
        setMessage(result.error || '公開停止に失敗しました。')
        return
      }
      setPublication(result.publication)
      setMessage('来店情報を非公開にしました。')
    } catch {
      setMessage('通信に失敗しました。もう一度お試しください。')
    } finally {
      setSaving(false)
    }
  }

  const copyUrl = async () => {
    if (!publicPath) return
    const url = `${window.location.origin}${publicPath}`
    try {
      await navigator.clipboard.writeText(url)
      setMessage('公開URLをコピーしました。')
    } catch {
      setMessage('URLをコピーできませんでした。')
    }
  }

  if (!publication && !canPublish) {
    return null
  }

  return (
    <section className="rounded-2xl border border-orange-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#C2410C]">
          <Megaphone className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-slate-950">来店情報の公開</p>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass}`}>
              {label}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            一般ユーザー向けの「来店情報」に掲載し、SNSなどで共有できるURLを発行します。
          </p>
        </div>
      </div>

      {publicPath && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0B1F3B] px-3 text-xs font-bold text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            公開ページを見る
          </Link>
          <button
            type="button"
            onClick={copyUrl}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Copy className="h-3.5 w-3.5" />
            URLをコピー
          </button>
        </div>
      )}

      {canPublish && publication?.status !== 'canceled' && publication?.status !== 'ended' && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-bold text-slate-700">公開タイミング</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700">
                <input
                  type="radio"
                  name={`publication-mode-${offerId}`}
                  checked={mode === 'now'}
                  onChange={() => setMode('now')}
                />
                今すぐ
              </label>
              <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700">
                <input
                  type="radio"
                  name={`publication-mode-${offerId}`}
                  checked={mode === 'scheduled'}
                  onChange={() => setMode('scheduled')}
                />
                日時を指定
              </label>
            </div>
          </div>

          {mode === 'scheduled' && (
            <div>
              <label className="text-xs font-bold text-slate-700" htmlFor={`publish-at-${offerId}`}>
                公開日時
              </label>
              <input
                id={`publish-at-${offerId}`}
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          )}

          <label className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-5 text-slate-700">
            <input
              type="checkbox"
              checked={showTime}
              onChange={(event) => setShowTime(event.target.checked)}
              className="mt-0.5"
            />
            来店の開始・終了時間を一般ページに表示する
          </label>

          <div>
            <label className="text-xs font-bold text-slate-700" htmlFor={`public-note-${offerId}`}>
              一般向け補足 <span className="font-medium text-slate-400">（任意）</span>
            </label>
            <textarea
              id={`public-note-${offerId}`}
              value={publicNote}
              onChange={(event) => setPublicNote(event.target.value.slice(0, 500))}
              rows={3}
              placeholder="来店情報に補足したい内容があれば入力"
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
            <p className="mt-1 text-right text-[10px] text-slate-400">{publicNote.length}/500</p>
          </div>

          <button
            type="button"
            onClick={savePublication}
            disabled={saving}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#FF5A1F] px-4 text-sm font-black text-white transition hover:bg-[#E94F18] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? '保存中…' : mode === 'scheduled' ? '公開日時を予約する' : '来店情報を公開する'}
          </button>

          {publication && ['published', 'scheduled'].includes(publication.status) && (
            <button
              type="button"
              onClick={hidePublication}
              disabled={saving}
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <EyeOff className="h-3.5 w-3.5" />
              公開を停止する
            </button>
          )}
        </div>
      )}

      {message && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium leading-5 text-slate-600">
          {message}
        </p>
      )}
    </section>
  )
}
