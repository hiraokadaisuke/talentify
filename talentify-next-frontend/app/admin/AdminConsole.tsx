'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Eye, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdminDetailPanel from './AdminDetailPanel'

type Summary = {
  users: number
  stores: number
  talents: number
  offers: number
  openInquiries: number
  suspendedUsers: number
}

type AdminUser = {
  id: string
  auth_user_id: string
  email: string
  phone: string | null
  role: string | null
  status: string
  created_at: string | null
  updated_at: string | null
  legal_accepted_at: string | null
  profile_label: string | null
}

type AdminOffer = {
  id: string
  store_id: string | null
  talent_id: string | null
  store_name: string | null
  talent_name: string | null
  date: string
  status: string | null
  event_name: string | null
  updated_at: string | null
  created_at: string | null
}

type Inquiry = {
  id: string
  created_at: string
  category: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: string
}

type Audit = {
  id: string
  action: string
  target_type: string | null
  target_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type Overview = {
  summary: Summary
  users: AdminUser[]
  offers: AdminOffer[]
  inquiries: Inquiry[]
  audits: Audit[]
  filters: {
    offerStatuses: string[]
  }
}

type Tab = 'users' | 'inquiries' | 'offers' | 'audit'

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_email_verification: 'メール確認待ち',
    onboarding: '初期設定中',
    active: '利用中',
    suspended: '利用停止',
    new: '未対応',
    in_progress: '対応中',
    resolved: '対応済み',
    spam: '迷惑',
    pending: '対応待ち',
    accepted: '承認済み',
    rejected: '辞退',
    canceled: 'キャンセル',
    completed: '完了',
    no_show: '来店なし',
  }
  return labels[status] ?? status
}

function roleLabel(role: string | null) {
  if (role === 'store') return '店舗'
  if (role === 'talent') return '演者'
  return role || '-'
}

export default function AdminConsole() {
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [tab, setTab] = useState<Tab>('users')
  const [actionId, setActionId] = useState<string | null>(null)
  const [detailTarget, setDetailTarget] = useState<{ kind: 'user' | 'offer'; id: string } | null>(null)

  const [queryInput, setQueryInput] = useState('')
  const [query, setQuery] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userStatus, setUserStatus] = useState('')

  const [offerQueryInput, setOfferQueryInput] = useState('')
  const [offerQuery, setOfferQuery] = useState('')
  const [offerStatus, setOfferStatus] = useState('')

  const [inquiryQueryInput, setInquiryQueryInput] = useState('')
  const [inquiryQuery, setInquiryQuery] = useState('')
  const [inquiryStatus, setInquiryStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)

    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (userRole) params.set('role', userRole)
      if (userStatus) params.set('userStatus', userStatus)
      if (offerQuery) params.set('offerQ', offerQuery)
      if (offerStatus) params.set('offerStatus', offerStatus)
      if (inquiryQuery) params.set('inquiryQ', inquiryQuery)
      if (inquiryStatus) params.set('inquiryStatus', inquiryStatus)

      const response = await fetch(`/api/admin/overview?${params.toString()}`, {
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('admin_overview_failed')
      const payload = (await response.json()) as { data?: Overview }
      if (!payload.data) throw new Error('admin_overview_missing')
      setData(payload.data)
    } catch (error) {
      console.error('failed to load admin overview', error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [
    inquiryQuery,
    inquiryStatus,
    offerQuery,
    offerStatus,
    query,
    userRole,
    userStatus,
  ])

  useEffect(() => {
    void load()
  }, [load])

  const onUserSearch = (event: FormEvent) => {
    event.preventDefault()
    setQuery(queryInput.trim())
  }

  const onOfferSearch = (event: FormEvent) => {
    event.preventDefault()
    setOfferQuery(offerQueryInput.trim())
  }

  const onInquirySearch = (event: FormEvent) => {
    event.preventDefault()
    setInquiryQuery(inquiryQueryInput.trim())
  }

  const updateUserStatus = async (user: AdminUser, status: 'active' | 'suspended') => {
    if (actionId) return
    const confirmed = window.confirm(
      status === 'suspended'
        ? `${user.email} を利用停止にしますか？`
        : `${user.email} の利用を再開しますか？`,
    )
    if (!confirmed) return

    setActionId(user.id)
    try {
      const response = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? 'user_status_update_failed')
      }
      await load()
    } catch (error) {
      console.error(error)
      window.alert('ユーザー状態を変更できませんでした。')
    } finally {
      setActionId(null)
    }
  }

  const updateInquiryStatus = async (inquiryId: string, status: string) => {
    if (actionId) return
    setActionId(inquiryId)
    try {
      const response = await fetch('/api/admin/inquiries/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId, status }),
      })
      if (!response.ok) throw new Error('inquiry_status_update_failed')
      await load()
    } catch (error) {
      console.error(error)
      window.alert('お問い合わせ状態を変更できませんでした。')
    } finally {
      setActionId(null)
    }
  }

  const summaryItems = data
    ? [
        ['ユーザー', data.summary.users],
        ['店舗', data.summary.stores],
        ['演者', data.summary.talents],
        ['オファー', data.summary.offers],
        ['未完了問い合わせ', data.summary.openInquiries],
        ['利用停止', data.summary.suspendedUsers],
      ]
    : []

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-700">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-bold tracking-[0.18em]">ADMIN</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold">Talentify 運営管理</h1>
            <p className="mt-1 text-sm text-slate-500">
              ユーザー・問い合わせ・案件状況を確認し、必要な運営対応を行います。
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              再読み込み
            </Button>
            <Button asChild variant="outline">
              <Link href="/">サイトへ戻る</Link>
            </Button>
          </div>
        </header>

        {loadError ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-red-600" />
            <p className="mt-2 font-semibold text-red-900">管理情報を読み込めませんでした</p>
            <p className="mt-1 text-sm text-red-700">通信状況を確認して再読み込みしてください。</p>
            <Button variant="outline" className="mt-4" onClick={() => void load()}>
              再読み込み
            </Button>
          </div>
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {summaryItems.map(([label, value]) => (
                <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold">{String(value)}</p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  {([
                    ['users', 'ユーザー'],
                    ['inquiries', '問い合わせ'],
                    ['offers', '案件'],
                    ['audit', '監査ログ'],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTab(key)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        tab === key
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {tab === 'users' && (
                  <form onSubmit={onUserSearch} className="mt-4 grid gap-2 lg:grid-cols-[minmax(260px,1fr)_160px_180px_auto]">
                    <label className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={queryInput}
                        onChange={event => setQueryInput(event.target.value)}
                        placeholder="メール・電話・店舗名・演者名"
                        className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm"
                      />
                    </label>
                    <select
                      value={userRole}
                      onChange={event => setUserRole(event.target.value)}
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="">すべての役割</option>
                      <option value="store">店舗</option>
                      <option value="talent">演者</option>
                    </select>
                    <select
                      value={userStatus}
                      onChange={event => setUserStatus(event.target.value)}
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="">すべての状態</option>
                      <option value="active">利用中</option>
                      <option value="suspended">利用停止</option>
                      <option value="onboarding">初期設定中</option>
                      <option value="pending_email_verification">メール確認待ち</option>
                    </select>
                    <Button type="submit" variant="outline">検索</Button>
                  </form>
                )}

                {tab === 'inquiries' && (
                  <form onSubmit={onInquirySearch} className="mt-4 grid gap-2 lg:grid-cols-[minmax(260px,1fr)_180px_auto]">
                    <label className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={inquiryQueryInput}
                        onChange={event => setInquiryQueryInput(event.target.value)}
                        placeholder="氏名・メール・件名"
                        className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm"
                      />
                    </label>
                    <select
                      value={inquiryStatus}
                      onChange={event => setInquiryStatus(event.target.value)}
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="">すべての状態</option>
                      <option value="new">未対応</option>
                      <option value="in_progress">対応中</option>
                      <option value="resolved">対応済み</option>
                      <option value="spam">迷惑</option>
                    </select>
                    <Button type="submit" variant="outline">検索</Button>
                  </form>
                )}

                {tab === 'offers' && (
                  <form onSubmit={onOfferSearch} className="mt-4 grid gap-2 lg:grid-cols-[minmax(260px,1fr)_180px_auto]">
                    <label className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={offerQueryInput}
                        onChange={event => setOfferQueryInput(event.target.value)}
                        placeholder="店舗・演者・案件名・完全ID"
                        className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm"
                      />
                    </label>
                    <select
                      value={offerStatus}
                      onChange={event => setOfferStatus(event.target.value)}
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="">すべての状態</option>
                      {(data?.filters.offerStatuses ?? []).map(status => (
                        <option key={status} value={status}>{statusLabel(status)}</option>
                      ))}
                    </select>
                    <Button type="submit" variant="outline">検索</Button>
                  </form>
                )}
              </div>

              <div className="overflow-x-auto p-4">
                {loading && <p className="py-10 text-center text-sm text-slate-500">読み込み中...</p>}

                {!loading && data && tab === 'users' && (
                  data.users.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-500">該当するユーザーはいません。</p>
                  ) : (
                    <table className="w-full min-w-[900px] text-left text-sm">
                      <thead className="text-xs text-slate-500">
                        <tr>
                          <th className="pb-3">ユーザー</th>
                          <th className="pb-3">役割</th>
                          <th className="pb-3">状態</th>
                          <th className="pb-3">登録日</th>
                          <th className="pb-3">規約同意</th>
                          <th className="pb-3 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.users.map(user => (
                          <tr key={user.id} className="border-t border-slate-100">
                            <td className="py-3">
                              <p className="font-medium">{user.email}</p>
                              {user.profile_label && (
                                <p className="text-xs font-medium text-slate-600">{user.profile_label}</p>
                              )}
                              <p className="text-xs text-slate-400">{user.phone || '-'}</p>
                              <button
                                type="button"
                                onClick={() => setDetailTarget({ kind: 'user', id: user.id })}
                                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                詳細を見る
                              </button>
                            </td>
                            <td className="py-3">{roleLabel(user.role)}</td>
                            <td className="py-3">{statusLabel(user.status)}</td>
                            <td className="py-3">{formatDate(user.created_at)}</td>
                            <td className="py-3">{user.legal_accepted_at ? formatDate(user.legal_accepted_at) : '未記録'}</td>
                            <td className="py-3 text-right">
                              {user.status === 'suspended' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={actionId === user.id}
                                  onClick={() => void updateUserStatus(user, 'active')}
                                >
                                  利用再開
                                </Button>
                              ) : user.status === 'active' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={actionId === user.id}
                                  onClick={() => void updateUserStatus(user, 'suspended')}
                                >
                                  利用停止
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-400">状態変更不可</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}

                {!loading && data && tab === 'inquiries' && (
                  <div className="space-y-3">
                    {data.inquiries.length === 0 ? (
                      <p className="py-10 text-center text-sm text-slate-500">該当するお問い合わせはありません。</p>
                    ) : data.inquiries.map(inquiry => (
                      <article key={inquiry.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{inquiry.category}</span>
                              <span className="text-xs text-slate-400">{formatDate(inquiry.created_at)}</span>
                            </div>
                            <h2 className="mt-2 font-semibold">{inquiry.subject}</h2>
                            <p className="mt-1 text-sm text-slate-600">
                              {inquiry.name} / {inquiry.email}{inquiry.phone ? ` / ${inquiry.phone}` : ''}
                            </p>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{inquiry.message}</p>
                          </div>
                          <select
                            value={inquiry.status}
                            disabled={actionId === inquiry.id}
                            onChange={event => void updateInquiryStatus(inquiry.id, event.target.value)}
                            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                          >
                            <option value="new">未対応</option>
                            <option value="in_progress">対応中</option>
                            <option value="resolved">対応済み</option>
                            <option value="spam">迷惑</option>
                          </select>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {!loading && data && tab === 'offers' && (
                  data.offers.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-500">該当する案件はありません。</p>
                  ) : (
                    <table className="w-full min-w-[950px] text-left text-sm">
                      <thead className="text-xs text-slate-500">
                        <tr>
                          <th className="pb-3">更新</th>
                          <th className="pb-3">来店日</th>
                          <th className="pb-3">案件</th>
                          <th className="pb-3">店舗</th>
                          <th className="pb-3">演者</th>
                          <th className="pb-3">状態</th>
                          <th className="pb-3">ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.offers.map(offer => (
                          <tr key={offer.id} className="border-t border-slate-100">
                            <td className="py-3">{formatDate(offer.updated_at)}</td>
                            <td className="py-3">{formatDate(offer.date)}</td>
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() => setDetailTarget({ kind: 'offer', id: offer.id })}
                                className="inline-flex items-center gap-1 font-medium text-slate-900 hover:text-blue-700 hover:underline"
                              >
                                {offer.event_name || '案件'}
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </td>
                            <td className="py-3">{offer.store_name || '-'}</td>
                            <td className="py-3">{offer.talent_name || '-'}</td>
                            <td className="py-3">{offer.status ? statusLabel(offer.status) : '-'}</td>
                            <td className="py-3 font-mono text-xs text-slate-400" title={offer.id}>
                              {offer.id.slice(0, 8)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}

                {!loading && data && tab === 'audit' && (
                  <div className="space-y-2">
                    {data.audits.length === 0 ? (
                      <p className="py-10 text-center text-sm text-slate-500">管理操作の記録はまだありません。</p>
                    ) : data.audits.map(audit => (
                      <div key={audit.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold">{audit.action}</p>
                          <span className="text-xs text-slate-400">{formatDate(audit.created_at)}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {audit.target_type || '-'} / {audit.target_id || '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {detailTarget && (
        <AdminDetailPanel
          kind={detailTarget.kind}
          id={detailTarget.id}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </main>
  )
}
