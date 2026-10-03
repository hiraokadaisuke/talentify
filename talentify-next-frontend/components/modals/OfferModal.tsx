'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalClose,
} from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { getTodayJstDateString, toJstDateInputValue } from '@/utils/jstDate'
import {
  CalendarDays,
  Clock3,
  JapaneseYen,
  MessageSquare,
  Send,
  UserRound,
} from 'lucide-react'

interface OfferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate: Date | null
}

type Template = {
  name: string
  talentId: string
  message: string
}

const TEMPLATE_KEY = 'offer_templates'

export default function OfferModal({ open, onOpenChange, initialDate }: OfferModalProps) {
  const supabase = useMemo(() => createClient(), [])
  const [talents, setTalents] = useState<{ id: string; stage_name: string | null }[]>([])
  const [visitDate, setVisitDate] = useState('')
  const [talentId, setTalentId] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reward, setReward] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [message, setMessage] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const timeOptions = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 8
    return `${String(hour).padStart(2, '0')}:00`
  })

  const selectedTalent = talents.find(t => t.id === talentId)
  const timeRange = startTime && endTime ? `${startTime}〜${endTime}` : ''
  const minVisitDate = getTodayJstDateString()

  useEffect(() => {
    if (open) {
      if (initialDate) setVisitDate(formatDate(initialDate))
      loadTemplates()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialDate])

  useEffect(() => {
    if (!open) return
    void loadTalents(visitDate, startTime, endTime)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, visitDate, startTime, endTime])

  const formatDate = (d: Date) => toJstDateInputValue(d)

  const loadTalents = async (date: string, start: string, end: string) => {
    if (!date) {
      setTalents([])
      setTalentId('')
      return
    }

    const params = new URLSearchParams({ date })
    if (start && end && start < end) {
      params.set('start', start)
      params.set('end', end)
    }

    const response = await fetch(`/api/talents/search-by-date?${params.toString()}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Failed to load available talents')
      setTalents([])
      return
    }

    const data = (await response.json()) as {
      id: string
      stage_name: string | null
    }[]

    setTalents(data)
    setTalentId(current =>
      current && data.some(talent => talent.id === current) ? current : ''
    )
  }

  const loadTemplates = () => {
    try {
      const t = JSON.parse(localStorage.getItem(TEMPLATE_KEY) || '[]') as Template[]
      setTemplates(t)
    } catch {
      setTemplates([])
    }
  }

  const applyTemplate = (index: number) => {
    const t = templates[index]
    if (!t) return
    setTalentId(t.talentId)
    setMessage(t.message)
  }

  const saveTemplate = () => {
    const name = window.prompt('テンプレート名を入力してください')
    if (!name) return
    const newTemplates = [...templates, { name, talentId, message }]
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(newTemplates))
    setTemplates(newTemplates)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!talentId) {
      alert('演者を選択してください')
      return
    }
    if (!visitDate) {
      alert('希望日を選択してください')
      return
    }
    if (visitDate < minVisitDate) {
      alert('希望日は本日以降を選択してください')
      return
    }
    if (!startTime || !endTime) {
      alert('希望時間帯を選択してください')
      return
    }
    if (startTime >= endTime) {
      alert('終了時間は開始時間より後を選択してください')
      return
    }
    if (!agreed) {
      alert('出演条件への同意が必要です')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      alert('ログインしてください')
      return
    }

    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!store) {
      alert('店舗情報が見つかりません')
      return
    }

    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: store.id,
        talent_id: talentId,
        date: visitDate,
        start_time: startTime,
        end_time: endTime,
        time_range: timeRange,
        reward: reward ? Number(reward) : null,
        agreed,
        message,
      }),
    })
    const result = await res.json()
    if (!res.ok || !result.ok) {
      alert(result.reason ? String(result.reason) : '送信に失敗しました')
      return
    }
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl sm:w-full">
        <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
        <ModalHeader className="mb-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0B1F3B] text-[#FFC400]">
              <Send className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-[0.16em] text-[#C2410C]">OFFER</p>
              <ModalTitle className="mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                オファー作成
              </ModalTitle>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                演者と来店条件を確認して、オファーを送信します。
              </p>
            </div>
          </div>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[#F8FAFC] px-3 py-4 sm:px-6 sm:py-5">
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0B1F3B]/5 text-[#0B1F3B]">
                  <UserRound className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-950">オファー対象</p>
                  <p className="text-[11px] text-slate-500">この日に受付可能な演者から選択します</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">演者</label>
                  <select
                    value={talentId}
                    onChange={e => setTalentId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0B1F3B] focus:ring-2 focus:ring-[#0B1F3B]/10 disabled:bg-slate-100 disabled:text-slate-400"
                    disabled={!visitDate}
                    required
                  >
                    <option value="">
                      {visitDate ? '選択してください' : '先に希望日を選択してください'}
                    </option>
                    {talents.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.stage_name || t.id}
                      </option>
                    ))}
                  </select>
                </div>

                {templates.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">テンプレート</label>
                    <select
                      defaultValue=""
                      onChange={e => applyTemplate(Number(e.target.value))}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#0B1F3B] focus:ring-2 focus:ring-[#0B1F3B]/10"
                    >
                      <option value="">選択してください</option>
                      {templates.map((t, i) => (
                        <option key={i} value={i}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:grid-cols-3">
                  <div>
                    <p className="text-slate-400">演者</p>
                    <p className="mt-0.5 font-bold text-slate-800">
                      {selectedTalent?.stage_name || selectedTalent?.id || '未選択'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">来店日</p>
                    <p className="mt-0.5 font-bold text-slate-800">{visitDate || '未選択'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">希望時間帯</p>
                    <p className="mt-0.5 font-bold text-slate-800">{timeRange || '未選択'}</p>
                  </div>
                  {visitDate && talents.length === 0 && (
                    <p className="sm:col-span-3 rounded-lg bg-amber-50 px-3 py-2 font-bold text-amber-800">
                      この条件で受付可能な演者はいません。
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0B1F3B]/5 text-[#0B1F3B]">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-950">オファー内容</p>
                  <p className="text-[11px] text-slate-500">希望日・時間・条件を入力してください</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="min-w-0">
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    希望日
                  </label>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <label className="relative flex h-11 min-w-0 cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 transition focus-within:border-[#0B1F3B] focus-within:ring-2 focus-within:ring-[#0B1F3B]/10">
                      <span className={visitDate ? 'truncate text-slate-900' : 'truncate text-slate-400'}>
                        {visitDate ? visitDate.replace(/-/g, '/') : '日付を選択'}
                      </span>
                      <CalendarDays className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
                      <input
                        type="date"
                        value={visitDate}
                        min={minVisitDate}
                        onChange={e => setVisitDate(e.target.value)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        aria-label="希望日"
                        required
                      />
                    </label>
                    <span aria-hidden className="w-[1ch]" />
                    <span aria-hidden />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                    希望時間帯
                  </label>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <select
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="h-11 min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0B1F3B] focus:ring-2 focus:ring-[#0B1F3B]/10"
                      required
                    >
                      <option value="">開始</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm font-bold text-slate-400">〜</span>
                    <select
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="h-11 min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0B1F3B] focus:ring-2 focus:ring-[#0B1F3B]/10"
                      required
                    >
                      <option value="">終了</option>
                      {timeOptions
                        .filter(time => !startTime || time > startTime)
                        .map(time => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <JapaneseYen className="h-3.5 w-3.5 text-slate-400" />
                    提示金額
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      inputMode="numeric"
                      value={reward}
                      onChange={e => setReward(e.target.value)}
                      className="h-11 rounded-xl border-slate-300 bg-white pr-10"
                      placeholder="例: 15000"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-slate-500">
                      円
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                    メッセージ
                  </label>
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="来店内容や相談事項などを入力"
                    className="min-h-[96px] rounded-xl border-slate-300 bg-white"
                  />
                </div>

                <label
                  htmlFor="modal-agreed"
                  className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <input
                    id="modal-agreed"
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#0B1F3B]"
                    required
                  />
                  <span className="text-xs leading-5 text-slate-600">
                    入力した内容を確認し、この条件でオファーを送信します。
                  </span>
                </label>
              </div>
            </section>
          </div>

          <ModalFooter
            className="mt-0 shrink-0 border-t border-slate-200 bg-white px-3 pt-3 sm:px-6 sm:py-4"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            <div className="grid w-full gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <Button
                type="button"
                variant="ghost"
                className="h-10 justify-start px-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 sm:justify-center"
                onClick={saveTemplate}
              >
                テンプレート保存
              </Button>

              <div className="hidden sm:block" />

              <div className="grid grid-cols-[auto_1fr] gap-2">
                <ModalClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl border-slate-300 bg-white px-4 font-bold text-slate-700"
                  >
                    キャンセル
                  </Button>
                </ModalClose>
                <Button
                  type="submit"
                  className="h-11 rounded-xl bg-[#FF5A1F] px-5 font-black text-white shadow-sm hover:bg-[#E94F18] focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/30"
                >
                  <Send className="mr-1.5 h-4 w-4" />
                  オファー送信
                </Button>
              </div>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
