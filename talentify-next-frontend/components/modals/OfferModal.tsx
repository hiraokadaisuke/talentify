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
  const [date, setDate] = useState('')
  const [talentId, setTalentId] = useState('')
  const [message, setMessage] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    if (open) {
      if (initialDate) setDate(formatDate(initialDate))
      loadTalents()
      loadTemplates()
    }
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('ログインしてください')
      return
    }
    const { error } = await supabase.from('offers').insert([
      { user_id: user.id, talent_id: talentId, message, date, status: 'pending' },
    ])
    if (error) {
      alert('送信に失敗しました')
      return
    }
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>オファー作成</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">日付</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">演者</label>
            <select
              value={talentId}
              onChange={e => setTalentId(e.target.value)}
              className="h-9 w-full rounded-md border px-2"
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
              <label className="block text-sm font-medium mb-1">テンプレート</label>
              <select
                defaultValue=""
                onChange={e => applyTemplate(Number(e.target.value))}
                className="h-9 w-full rounded-md border px-2"
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
          <div>
            <label className="block text-sm font-medium mb-1">メッセージ</label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="出演依頼内容などを入力"
            />
          </div>
          <ModalFooter className="justify-between">
            <Button type="button" variant="outline" onClick={saveTemplate}>
              テンプレート保存
            </Button>
            <div className="flex gap-2">
              <ModalClose asChild>
                <Button type="button" variant="secondary">
                  キャンセル
                </Button>
              </ModalClose>
              <Button type="submit">送信</Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
