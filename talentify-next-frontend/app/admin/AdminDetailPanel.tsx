'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DetailTarget = {
  kind: 'user' | 'offer'
  id: string
}

type AdminDetailPanelProps = {
  kind: 'user' | 'offer'
  id: string
  onClose: () => void
}

type UserDetail = {
  user: {
    id: string
    auth_user_id: string
    email: string
    phone: string | null
    role: string | null
    status: string
    created_at: string | null
    updated_at: string | null
    terms_version: string | null
    privacy_version: string | null
    legal_accepted_at: string | null
  }
  profile: Record<string, unknown> | null
  summary: {
    offers: number
    invoices: number
    reviews: number
    messages: number
  }
  offers: Array<{
    id: string
    date: string | null
    status: string | null
    event_name: string | null
    reward: number | string | null
    store_name: string | null
    talent_name: string | null
    updated_at: string | null
  }>
}

type OfferDetail = {
  offer: Record<string, unknown> & {
    id: string
    status: string | null
    event_name: string | null
    date: string | null
    start_time: string | null
    end_time: string | null
    time_range: string | null
    reward: number | string | null
    invoice_amount: number | string | null
    message: string | null
    notes: string | null
    accepted_at: string | null
    paid_at: string | null
    created_at: string | null
    updated_at: string | null
    visit_completed_at: string | null
    canceled_at: string | null
    canceled_by_role: string | null
    cancellation_reason: string | null
    cancellation_stage: string | null
    no_show_at: string | null
    no_show_reason: string | null
    contract_url: string | null
    invoice_url: string | null
  }
  store: (Record<string, unknown> & {
    store_name?: string | null
    contact_name?: string | null
    contact_phone?: string | null
    contact_email?: string | null
    store_address?: string | null
    account?: {
      email?: string | null
      phone?: string | null
      status?: string | null
    } | null
  }) | null
  talent: (Record<string, unknown> & {
    stage_name?: string | null
    display_name?: string | null
    name?: string | null
    agency_name?: string | null
    preferred_contact_method?: string | null
    phone_contact_allowed?: boolean | null
    phone_available_hours?: string | null
    account?: {
      email?: string | null
      phone?: string | null
      status?: string | null
    } | null
  }) | null
  invoices: Array<Record<string, unknown> & {
    id: string
    amount?: number | string | null
    status?: string | null
    payment_status?: string | null
    due_date?: string | null
    invoice_number?: string | null
    paid_at?: string | null
    transport_fee?: number | string | null
    extra_fee?: number | string | null
    notes?: string | null
    contract_snapshot?: unknown
    invoice_url?: string | null
    created_at?: string | null
  }>
  messages: Array<{
    id: string
    sender_role: string | null
    body: string | null
    attachments: unknown
    created_at: string | null
    read_at: string | null
  }>
  reviews: Array<{
    id: string
    rating: number | null
    comment: string | null
    category_ratings: unknown
    is_public: boolean | null
    created_at: string | null
  }>
}

function formatDate(value: unknown) {
  if (!value || typeof value !== 'string') return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatMoney(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return String(value)
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount)
}

function statusLabel(status: unknown) {
  if (!status || typeof status !== 'string') return '-'
  const labels: Record<string, string> = {
    pending_email_verification: 'メール確認待ち',
    onboarding: '初期設定中',
    active: '利用中',
    suspended: '利用停止',
    pending: '対応待ち',
    accepted: '承認済み',
    rejected: '辞退',
    canceled: 'キャンセル',
    completed: '完了',
    no_show: '来店なし',
    unpaid: '未払い',
    paid: '支払い済み',
    draft: '下書き',
    submitted: '提出済み',
  }
  return labels[status] ?? status
}

function roleLabel(role: unknown) {
  if (role === 'store') return '店舗'
  if (role === 'talent') return '演者'
  if (role === 'admin') return '運営'
  return role ? String(role) : '-'
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'はい' : 'いいえ'
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function attachmentCount(value: unknown) {
  if (!value) return 0
  if (Array.isArray(value)) return value.length
  return 1
}

function safeHttpUrl(value: unknown) {
  if (!value || typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return value
  } catch {
    return null
  }
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Fields({
  items,
}: {
  items: Array<[string, unknown]>
}) {
  return (
    <dl className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[11px] font-semibold text-slate-400">{label}</dt>
          <dd className="mt-1 break-words text-sm text-slate-700">{displayValue(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

function UserDetailView({
  data,
  onOpenOffer,
}: {
  data: UserDetail
  onOpenOffer: (id: string) => void
}) {
  const { user, profile } = data
  const profileItems: Array<[string, unknown]> =
    user.role === 'store'
      ? [
          ['店舗名', profile?.store_name],
          ['担当者', profile?.contact_name],
          ['連絡先電話', profile?.contact_phone],
          ['連絡先メール', profile?.contact_email],
          ['都道府県', profile?.store_prefect],
          ['住所', profile?.store_address],
          ['プロフィール完了', profile?.is_profile_complete],
          ['初期設定完了', profile?.is_setup_complete],
        ]
      : [
          ['演者名', profile?.stage_name || profile?.display_name || profile?.name],
          ['所属', profile?.agency_name],
          ['ジャンル', profile?.genre],
          ['居住地', profile?.residence || profile?.location || profile?.area],
          ['出演目安', profile?.rate],
          ['交通', profile?.transportation],
          ['最低時間', profile?.min_hours],
          ['希望連絡方法', profile?.preferred_contact_method],
          ['電話対応', profile?.phone_contact_allowed],
          ['電話可能時間', profile?.phone_available_hours],
          ['プロフィール完了', profile?.is_profile_complete],
          ['初期設定完了', profile?.is_setup_complete],
        ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['案件', data.summary.offers],
          ['請求', data.summary.invoices],
          ['メッセージ', data.summary.messages],
          ['レビュー', data.summary.reviews],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl bg-slate-100 p-3">
            <p className="text-[11px] font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{String(value)}</p>
          </div>
        ))}
      </div>

      <Section title="アカウント">
        <Fields
          items={[
            ['メール', user.email],
            ['電話番号', user.phone],
            ['役割', roleLabel(user.role)],
            ['状態', statusLabel(user.status)],
            ['登録日', formatDate(user.created_at)],
            ['更新日', formatDate(user.updated_at)],
            ['規約同意', formatDate(user.legal_accepted_at)],
            ['利用規約version', user.terms_version],
            ['プライバシーversion', user.privacy_version],
            ['User ID', user.id],
            ['Auth User ID', user.auth_user_id],
          ]}
        />
      </Section>

      <Section title={user.role === 'store' ? '店舗プロフィール' : '演者プロフィール'}>
        {profile ? (
          <Fields items={profileItems} />
        ) : (
          <p className="text-sm text-slate-500">プロフィールはまだ作成されていません。</p>
        )}
      </Section>

      <Section title="関連案件">
        {data.offers.length === 0 ? (
          <p className="text-sm text-slate-500">関連案件はありません。</p>
        ) : (
          <div className="space-y-2">
            {data.offers.map(offer => (
              <button
                key={offer.id}
                type="button"
                onClick={() => onOpenOffer(offer.id)}
                className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">
                    {offer.event_name || '案件'}
                  </p>
                  <span className="text-xs text-slate-500">{statusLabel(offer.status)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {offer.store_name || '-'} → {offer.talent_name || '-'}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>来店: {formatDate(offer.date)}</span>
                  <span>報酬: {formatMoney(offer.reward)}</span>
                  <span>ID: {offer.id.slice(0, 8)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function OfferDetailView({ data }: { data: OfferDetail }) {
  const { offer, store, talent } = data
  const contractUrl = safeHttpUrl(offer.contract_url)
  const offerInvoiceUrl = safeHttpUrl(offer.invoice_url)

  return (
    <div className="space-y-4">
      <Section title="案件概要">
        <Fields
          items={[
            ['案件ID', offer.id],
            ['状態', statusLabel(offer.status)],
            ['案件名', offer.event_name],
            ['来店日', formatDate(offer.date)],
            ['開始', offer.start_time],
            ['終了', offer.end_time],
            ['時間帯', offer.time_range],
            ['報酬', formatMoney(offer.reward)],
            ['請求額', formatMoney(offer.invoice_amount)],
            ['作成日', formatDate(offer.created_at)],
            ['更新日', formatDate(offer.updated_at)],
          ]}
        />
        {(offer.message || offer.notes) && (
          <div className="mt-4 space-y-3">
            {offer.message && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400">依頼メッセージ</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{offer.message}</p>
              </div>
            )}
            {offer.notes && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400">メモ</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{offer.notes}</p>
              </div>
            )}
          </div>
        )}
        {(contractUrl || offerInvoiceUrl) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {contractUrl && (
              <a
                href={contractUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                契約書を開く <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {offerInvoiceUrl && (
              <a
                href={offerInvoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                請求書を開く <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="店舗">
          <Fields
            items={[
              ['店舗名', store?.store_name],
              ['担当者', store?.contact_name],
              ['電話', store?.contact_phone || store?.account?.phone],
              ['メール', store?.contact_email || store?.account?.email],
              ['住所', store?.store_address],
              ['アカウント状態', statusLabel(store?.account?.status)],
            ]}
          />
        </Section>

        <Section title="演者">
          <Fields
            items={[
              ['演者名', talent?.stage_name || talent?.display_name || talent?.name],
              ['所属', talent?.agency_name],
              ['希望連絡方法', talent?.preferred_contact_method],
              ['電話対応', talent?.phone_contact_allowed],
              ['電話可能時間', talent?.phone_available_hours],
              ['メール', talent?.account?.email],
              ['電話', talent?.account?.phone],
              ['アカウント状態', statusLabel(talent?.account?.status)],
            ]}
          />
        </Section>
      </div>

      <Section title="進行・例外記録">
        <Fields
          items={[
            ['承認', formatDate(offer.accepted_at)],
            ['来店完了', formatDate(offer.visit_completed_at)],
            ['支払い', formatDate(offer.paid_at)],
            ['キャンセル', formatDate(offer.canceled_at)],
            ['キャンセル側', roleLabel(offer.canceled_by_role)],
            ['キャンセル段階', offer.cancellation_stage],
            ['キャンセル理由', offer.cancellation_reason],
            ['来店なし', formatDate(offer.no_show_at)],
            ['来店なし理由', offer.no_show_reason],
          ]}
        />
      </Section>

      <Section title={`請求・契約（${data.invoices.length}件）`}>
        {data.invoices.length === 0 ? (
          <p className="text-sm text-slate-500">請求情報はありません。</p>
        ) : (
          <div className="space-y-3">
            {data.invoices.map(invoice => {
              const invoiceUrl = safeHttpUrl(invoice.invoice_url)
              return (
                <div key={invoice.id} className="rounded-xl border border-slate-200 p-3">
                  <Fields
                    items={[
                      ['請求番号', invoice.invoice_number],
                      ['金額', formatMoney(invoice.amount)],
                      ['交通費', formatMoney(invoice.transport_fee)],
                      ['追加費用', formatMoney(invoice.extra_fee)],
                      ['状態', statusLabel(invoice.status)],
                      ['支払い状態', statusLabel(invoice.payment_status)],
                      ['支払期限', formatDate(invoice.due_date)],
                      ['支払日', formatDate(invoice.paid_at)],
                      ['作成日', formatDate(invoice.created_at)],
                    ]}
                  />
                  {invoice.notes && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{invoice.notes}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {invoiceUrl && (
                      <a
                        href={invoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        請求書を開く <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {invoice.contract_snapshot !== null && invoice.contract_snapshot !== undefined && (
                      <details className="w-full rounded-lg bg-slate-50 p-3 text-xs">
                        <summary className="cursor-pointer font-semibold text-slate-600">契約スナップショット</summary>
                        <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-5 text-slate-600">
                          {JSON.stringify(invoice.contract_snapshot, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title={`メッセージ（${data.messages.length}件）`}>
        {data.messages.length === 0 ? (
          <p className="text-sm text-slate-500">メッセージはありません。</p>
        ) : (
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {data.messages.map(message => (
              <div key={message.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">{roleLabel(message.sender_role)}</span>
                  <span className="text-[11px] text-slate-400">{formatDate(message.created_at)}</span>
                </div>
                {message.body && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{message.body}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
                  <span>添付 {attachmentCount(message.attachments)}件</span>
                  <span>{message.read_at ? `既読 ${formatDate(message.read_at)}` : '未読'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={`レビュー（${data.reviews.length}件）`}>
        {data.reviews.length === 0 ? (
          <p className="text-sm text-slate-500">レビューはありません。</p>
        ) : (
          <div className="space-y-2">
            {data.reviews.map(review => (
              <div key={review.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">評価 {review.rating ?? '-'}</p>
                  <span className="text-[11px] text-slate-400">{formatDate(review.created_at)}</span>
                </div>
                {review.comment && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.comment}</p>
                )}
                <p className="mt-2 text-[11px] text-slate-400">
                  公開: {review.is_public ? 'はい' : 'いいえ'}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

export default function AdminDetailPanel({
  kind,
  id,
  onClose,
}: AdminDetailPanelProps) {
  const initial: DetailTarget = { kind, id }
  const [target, setTarget] = useState<DetailTarget>(initial)
  const [userData, setUserData] = useState<UserDetail | null>(null)
  const [offerData, setOfferData] = useState<OfferDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setLoadError(false)
      setUserData(null)
      setOfferData(null)

      try {
        const url =
          target.kind === 'user'
            ? `/api/admin/users/detail?userId=${encodeURIComponent(target.id)}`
            : `/api/admin/offers/detail?offerId=${encodeURIComponent(target.id)}`
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) throw new Error('admin_detail_failed')
        const payload = await response.json()
        if (cancelled) return

        if (target.kind === 'user') {
          setUserData(payload.data as UserDetail)
        } else {
          setOfferData(payload.data as OfferDetail)
        }
      } catch (error) {
        console.error('failed to load admin detail', error)
        if (!cancelled) setLoadError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [target])

  const canGoBackToUser =
    initial.kind === 'user' &&
    target.kind === 'offer' &&
    target.id !== initial.id

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/35" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative h-full w-full max-w-3xl overflow-y-auto bg-slate-50 shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {canGoBackToUser && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTarget(initial)}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  ユーザーへ戻る
                </Button>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-[0.15em] text-blue-600">READ ONLY</p>
                <h2 className="truncate text-lg font-bold text-slate-950">
                  {target.kind === 'user' ? 'ユーザー詳細' : '案件詳細'}
                </h2>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading && (
            <div className="grid min-h-64 place-items-center">
              <div className="text-center text-sm text-slate-500">
                <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                読み込み中...
              </div>
            </div>
          )}

          {!loading && loadError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-semibold text-red-900">詳細情報を読み込めませんでした。</p>
              <button
                type="button"
                onClick={() => setTarget(current => ({ ...current }))}
                className="mt-3 text-sm font-semibold text-red-700 underline"
              >
                再試行
              </button>
            </div>
          )}

          {!loading && !loadError && target.kind === 'user' && userData && (
            <UserDetailView
              data={userData}
              onOpenOffer={offerId => setTarget({ kind: 'offer', id: offerId })}
            />
          )}

          {!loading && !loadError && target.kind === 'offer' && offerData && (
            <OfferDetailView data={offerData} />
          )}
        </div>
      </div>
    </div>
  )
}
