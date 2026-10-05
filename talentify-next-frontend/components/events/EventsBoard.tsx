import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Clock3, MapPin, Search, Store, UserRound } from 'lucide-react'
import { toTokyoDateKey, type PublicEvent } from '@/lib/events/publicEvents'
import EventPhoto from './EventPhoto'
import './events.css'

export type EventSearchParams = { view?: string; prefecture?: string; q?: string }

function shiftDay(key: string, days: number) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}
function dateLabel(key: string) {
  return new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', weekday: 'short' }).format(new Date(`${key}T00:00:00+09:00`))
}
function href(view: string, prefecture: string, q: string) {
  const params = new URLSearchParams({ view })
  if (prefecture) params.set('prefecture', prefecture)
  if (q) params.set('q', q)
  return `/events?${params}`
}
function EventCard({ event }: { event: PublicEvent }) {
  const time = event.startTime ? `${event.startTime}〜${event.endTime || ''}` : '時間非公開'
  return <Link className="events-card" href={`/events/${event.slug}`}>
    <div className="events-photo"><EventPhoto src={event.talent.avatarUrl} name={event.talent.name} /></div>
    <div className="events-card-copy"><span className="events-card-date"><CalendarDays size={13} />{dateLabel(event.dateKey)}</span><h3>{event.store.name}</h3><p className="events-talent">{event.talent.name}<span>来店</span></p><div className="events-card-meta"><span><MapPin size={13} />{event.store.prefecture || '地域未登録'}</span><span><Clock3 size={13} />{time}</span></div><span className="events-card-link">来店情報を見る<ArrowRight size={14} /></span></div>
  </Link>
}

export default function EventsBoard({ events, searchParams = {} }: { events: PublicEvent[]; searchParams?: EventSearchParams }) {
  const today = toTokyoDateKey(new Date())
  const tomorrow = shiftDay(today, 1)
  const weekEnd = shiftDay(today, 6)
  const view = ['today', 'tomorrow', 'week'].includes(searchParams.view || '') ? searchParams.view! : 'today'
  const prefecture = searchParams.prefecture?.trim() || ''
  const q = searchParams.q?.trim() || ''
  const active = events.filter(event => !['canceled', 'ended'].includes(event.publicationStatus) && event.dateKey >= today)
  const prefectures = [...new Set(active.map(event => event.store.prefecture).filter((p): p is string => Boolean(p)))].sort((a,b) => a.localeCompare(b,'ja'))
  if (prefecture && !prefectures.includes(prefecture)) prefectures.push(prefecture)
  const matching = active.filter(event => (!prefecture || event.store.prefecture === prefecture) && (!q || `${event.store.name} ${event.talent.name}`.normalize('NFKC').toLocaleLowerCase('ja').includes(q.normalize('NFKC').toLocaleLowerCase('ja'))))
  const periods = [
    { key: 'today', label: '今日', date: dateLabel(today), items: matching.filter(event => event.dateKey === today) },
    { key: 'tomorrow', label: '明日', date: dateLabel(tomorrow), items: matching.filter(event => event.dateKey === tomorrow) },
    { key: 'week', label: '今週', date: '今日から7日間', items: matching.filter(event => event.dateKey <= weekEnd) },
  ]
  const selected = periods.find(period => period.key === view)!
  const upcoming = selected.items.length ? [] : matching.filter(event => view === 'today' ? event.dateKey > today : view === 'tomorrow' ? event.dateKey > tomorrow : event.dateKey > weekEnd).slice(0,6)
  const groups = [...new Set(selected.items.map(event => event.dateKey))]
  return <main className="events-board">
    <section className="events-masthead"><Image src="/lp/hero/hero-bg.webp" alt="" fill priority sizes="100vw" /><div className="events-container events-masthead-inner"><div><p className="events-eyebrow">全国の演者来店スケジュール</p><h1>来店情報</h1><p className="events-lead">日付・地域・店舗から来店予定を探せます。</p></div><span className="events-today"><CalendarDays size={18} />今日の日付<b>{dateLabel(today)}</b></span></div></section>
    <div className="events-container events-content">
      <section className="events-search" aria-label="来店情報を検索"><nav className="events-periods" aria-label="日付から探す">{periods.map(period => <Link key={period.key} href={href(period.key,prefecture,q)} aria-current={view === period.key ? 'page' : undefined}><span>{period.label}<b>{period.items.length}<small>件</small></b></span><small>{period.date}</small></Link>)}</nav>
      <form action="/events" method="get" className="events-filter"><input type="hidden" name="view" value={view} /><label><span><MapPin size={14} />地域</span><select aria-label="地域" name="prefecture" defaultValue={prefecture}><option value="">全国</option>{prefectures.map(p => <option key={p} value={p}>{p}</option>)}</select></label><label className="events-keyword"><span><Search size={14} />店舗名・演者名</span><input aria-label="店舗名・演者名" name="q" defaultValue={q} placeholder="名前を入力" type="search" /></label><button type="submit"><Search size={16} />検索する</button></form></section>
      <div className="events-layout"><section className="events-results" aria-labelledby="events-results-title"><div className="events-result-heading"><div><p>{prefecture || '全国'}の来店予定</p><h2 id="events-results-title">{selected.label}の来店情報</h2></div><span><b>{selected.items.length}</b>件</span></div>
      {(prefecture || q) && <div className="events-applied"><span>検索条件：{[prefecture,q && `「${q}」`].filter(Boolean).join(' / ')}</span><Link href={href(view,'','')}>条件を解除</Link></div>}
      {selected.items.length ? groups.map(day => <section className="events-day-group" key={day} aria-label={dateLabel(day)}>{view === 'week' && <h3 className="events-day-heading"><CalendarDays size={16} />{dateLabel(day)}<span>{selected.items.filter(event => event.dateKey === day).length}件</span></h3>}<div className="events-grid">{selected.items.filter(event => event.dateKey === day).map(event => <EventCard event={event} key={event.id} />)}</div></section>) : <div className="events-empty"><span><CalendarDays size={30} /></span><h3>該当する来店情報はありません</h3><p>日付や検索条件を変えてお探しください。<br />新しい来店情報は、公開後に表示されます。</p><Link href={href(view === 'week' ? 'today' : 'week',prefecture,q)}>{view === 'week' ? '今日' : '今週'}の来店情報を見る<ArrowRight size={15} /></Link></div>}
      {upcoming.length > 0 && <section className="events-upcoming"><h2>この条件で見つかる今後の来店予定</h2><div className="events-grid">{upcoming.map(event => <EventCard event={event} key={event.id} />)}</div></section>}
      <p className="events-notice">来店予定は変更・中止になる場合があります。お出かけ前に店舗・演者の最新の案内もご確認ください。</p></section>
      <aside className="events-sidebar" aria-label="ほかの探し方"><div className="events-discovery"><h2>地域・店舗から探す</h2><Link href="/areas"><MapPin /><span><b>地域から探す</b><small>都道府県ごとの店舗一覧</small></span><ArrowRight size={16} /></Link><Link href="/stores"><Store /><span><b>店舗から探す</b><small>店舗名から来店予定を確認</small></span><ArrowRight size={16} /></Link><Link href="/performers"><UserRound /><span><b>演者から探す</b><small>演者ごとの来店予定</small></span><ArrowRight size={16} /></Link></div>
      {prefectures.length > 0 && <div className="events-area-list"><h2>来店予定のある地域</h2><div>{prefectures.filter(p => active.some(event => event.store.prefecture === p)).map(p => <Link key={p} href={href(view,p,q)}>{p}<ArrowRight size={12} /></Link>)}</div></div>}
      <Link className="events-service-link" href="/service"><span>店舗・演者の方へ</span><b>来店依頼・予定の管理に</b><small>来店ナビのサービス紹介<ArrowRight size={14} /></small></Link></aside></div>
    </div>
  </main>
}
