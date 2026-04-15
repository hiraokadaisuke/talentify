'use client'

import { useEffect, useState } from 'react'
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
  const supabase = createClient()
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

  useEffect(() => {
    if (open) {
      if (initialDate) setVisitDate(formatDate(initialDate))
      loadTalents()
      loadTemplates()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialDate])

  const formatDate = (d: Date) => d.toISOString().slice(0, 10)

  const loadTalents = async () => {
    const { data, error } = await supabase.from('talents').select('id, stage_name')
    if (!error && data) setTalents(data)
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
    if (!startTime || !endTime) {
      alert('希望時間帯を選択してください')
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
      <ModalContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <ModalHeader className="mb-0 border-b border-slate-200 bg-white px-6 py-4">
          <ModalTitle>オファー作成</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="flex max-h-[calc(90vh-65px)] flex-col">
          <div className="space-y-4 overflow-y-auto bg-slate-50 px-6 py-5">
            <section className="rounded-lg border border-slate-200 bg-slate-100 p-4">
              <h3 className="text-sm font-semibold text-slate-700">オファー対象</h3>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">演者</label>
                  <select
                    value={talentId}
                    onChange={e => setTalentId(e.target.value)}
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">選択してください</option>
                    {talents.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.stage_name || t.id}
                      </option>
                    ))}
                  </select>
                </div>
                {templates.length > 0 && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">テンプレート</label>
                    <select
                      defaultValue=""
                      onChange={e => applyTemplate(Number(e.target.value))}
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                  <p>演者: {selectedTalent?.stage_name || selectedTalent?.id || '未選択'}</p>
                  <p>来店日: {visitDate || '未選択'}</p>
                  <p>希望時間帯: {timeRange || '未選択'}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-700">オファー内容</h3>
              <div>
                <label className="mb-1 block text-sm font-medium">希望日</label>
                <Input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">開始時間</label>
                  <select
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">選択してください</option>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">終了時間</label>
                  <select
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">選択してください</option>
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
                <label className="mb-1 block text-sm font-medium">提示金額</label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    inputMode="numeric"
                    value={reward}
                    onChange={e => setReward(e.target.value)}
                    className="pr-10"
                    placeholder="例: 15000"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">円</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="modal-agreed"
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  required
                />
                <label htmlFor="modal-agreed" className="text-sm">出演条件に同意します</label>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">メッセージ</label>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="出演依頼内容などを入力"
                />
              </div>
            </section>
          </div>
          <ModalFooter className="mt-0 justify-between border-t border-slate-200 bg-white px-6 py-4">
            <Button type="button" variant="outline" className="h-10" onClick={saveTemplate}>
              テンプレート保存
            </Button>
            <div className="flex gap-2">
              <ModalClose asChild>
                <Button type="button" variant="outline" className="h-10 px-5">
                  キャンセル
                </Button>
              </ModalClose>
              <Button type="submit" className="h-10 px-6">
                オファー送信
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
