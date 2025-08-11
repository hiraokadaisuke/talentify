'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalClose,
  ModalTrigger,
} from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import StarRatingInput from '@/components/StarRatingInput'
import { addNotification } from '@/utils/notifications'
import { toast } from 'sonner'

function compact<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
}

export default function ReviewModal({
  offerId,
  talentId,
  trigger,
  onSubmitted,
}: {
  offerId: string
  talentId: string
  trigger: React.ReactNode
  onSubmitted?: () => void
}) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [time, setTime] = useState<number | null>(null)
  const [attitude, setAttitude] = useState<number | null>(null)
  const [fan, setFan] = useState<number | null>(null)
  const [play, setPlay] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return toast.error('投稿にはログインが必要です')
      }
      setSubmitting(true)
      const categoryRatings = compact({ time, attitude, fan, play })
      const payload = compact({
        offer_id: offerId,
        rating: Number(rating),
        comment: comment || null,
        is_public: isPublic ?? true,
        category_ratings: Object.keys(categoryRatings).length ? categoryRatings : {},
      })
      const { error } = await supabase
        .from('reviews')
        .insert([payload])
        .select('id')
      setSubmitting(false)
      if (!error) {
        if (talentId) {
          await addNotification({
            user_id: talentId,
            offer_id: offerId,
            type: 'review_received',
            title: 'レビューが投稿されました',
          })
        }
        toast.success('レビューを投稿しました')
        setOpen(false)
        onSubmitted?.()
      } else {
        console.error('[reviews.insert] failed', { payload, error })
        toast.error(`投稿に失敗しました: ${error.message}`)
      }
    }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>{trigger}</ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>レビューを投稿</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-medium mb-1">総合評価<span className="text-red-500">*</span></label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          <div className="space-y-2">
            <div>
              <label className="block mb-1">時間厳守</label>
              <StarRatingInput value={time ?? 0} onChange={(v)=>setTime(v)} />
            </div>
            <div>
              <label className="block mb-1">接客態度</label>
              <StarRatingInput value={attitude ?? 0} onChange={(v)=>setAttitude(v)} />
            </div>
            <div>
              <label className="block mb-1">ファンサービス</label>
              <StarRatingInput value={fan ?? 0} onChange={(v)=>setFan(v)} />
            </div>
            <div>
              <label className="block mb-1">遊技姿勢</label>
              <StarRatingInput value={play ?? 0} onChange={(v)=>setPlay(v)} />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">コメント</label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="具体的な様子や印象を記載してください"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_public"
              type="checkbox"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
            />
            <label htmlFor="is_public">このレビューを他ホールにも表示する</label>
          </div>
          <ModalFooter>
            <ModalClose asChild>
              <Button type="button" variant="secondary">キャンセル</Button>
            </ModalClose>
            <Button type="submit" disabled={submitting}>投稿</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
