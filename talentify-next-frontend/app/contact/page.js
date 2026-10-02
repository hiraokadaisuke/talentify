'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const INITIAL_FORM = {
  category: 'service',
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  website: '',
}

export default function ContactPage() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [reference, setReference] = useState(null)

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(body?.error || '送信に失敗しました')
      }

      setReference(body?.reference || null)
      setForm(INITIAL_FORM)
      toast.success('お問い合わせを受け付けました')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '送信に失敗しました。時間をおいて再度お試しください'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold text-[#FF5A1F]">CONTACT</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          お問い合わせ
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          サービスについてのご質問、不具合のご報告、ご意見・ご要望はこちらからお送りください。
        </p>
      </div>

      {reference !== null ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-lg font-semibold text-emerald-900">
            お問い合わせを受け付けました
          </h2>
          <p className="mt-2 text-sm leading-6 text-emerald-800">
            内容を確認のうえ、ご入力いただいたメールアドレスへご連絡します。
          </p>
          {reference && (
            <p className="mt-3 text-xs text-emerald-700">
              受付番号：{reference}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={() => setReference(null)}
          >
            別のお問い合わせを送る
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              お問い合わせ種別
            </label>
            <select
              value={form.category}
              onChange={update('category')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              required
            >
              <option value="service">サービスについて</option>
              <option value="bug">不具合報告</option>
              <option value="feedback">ご意見・ご要望</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              お名前
            </label>
            <Input
              type="text"
              value={form.name}
              onChange={update('name')}
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              メールアドレス
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={update('email')}
              maxLength={254}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              電話番号 <span className="font-normal text-slate-400">（任意）</span>
            </label>
            <Input
              type="tel"
              value={form.phone}
              onChange={update('phone')}
              maxLength={30}
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              件名
            </label>
            <Input
              type="text"
              value={form.subject}
              onChange={update('subject')}
              maxLength={200}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              お問い合わせ内容
            </label>
            <Textarea
              rows={7}
              value={form.message}
              onChange={update('message')}
              maxLength={5000}
              required
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {form.message.length}/5000
            </p>
          </div>

          <div
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
          >
            <label htmlFor="company-website">Webサイト</label>
            <input
              id="company-website"
              type="text"
              name="company_website"
              value={form.website}
              onChange={update('website')}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              id="agree"
              type="checkbox"
              className="mt-1"
              required
            />
            <label htmlFor="agree" className="text-sm leading-6 text-slate-600">
              <Link
                href="/privacy"
                className="font-medium text-[#FF5A1F] underline underline-offset-2"
              >
                プライバシーポリシー
              </Link>
              に同意して送信します。
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? '送信中...' : '送信する'}
          </Button>
        </form>
      )}

      <div className="mt-6 text-sm text-slate-500">
        お問い合わせの前に
        <Link
          href="/faq"
          className="mx-1 font-medium text-[#FF5A1F] underline underline-offset-2"
        >
          よくある質問
        </Link>
        もご確認ください。
      </div>
    </main>
  )
}
