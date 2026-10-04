'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, HelpCircle, Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import PublicPageHero from '@/components/public/PublicPageHero'

const INITIAL_FORM = {
  category: 'service',
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  website: '',
}

const fieldClass =
  'h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-none outline-none transition focus-visible:border-[#FF8A00] focus-visible:ring-2 focus-visible:ring-orange-100 sm:text-sm'

function FieldLabel({ children, optional = false }) {
  return (
    <label className="mb-2 block text-sm font-black text-slate-800">
      {children}
      {optional ? <span className="ml-2 text-xs font-medium text-slate-400">任意</span> : null}
    </label>
  )
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
    <main className="min-h-screen bg-[#F7F9FC] pt-16 text-slate-950">
      <PublicPageHero
        eyebrow="CONTACT"
        title="お問い合わせ"
        description="サービスについてのご質問、不具合のご報告、ご意見・ご要望を受け付けています。内容に合う種別を選んでお送りください。"
      />

      <div className="mx-auto grid w-full max-w-[1120px] gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <section>
          {reference !== null ? (
            <div className="rounded-[24px] border border-emerald-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,.06)] sm:p-8">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-950">お問い合わせを受け付けました</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                内容を確認のうえ、ご入力いただいたメールアドレスへご連絡します。
              </p>
              {reference ? (
                <p className="mt-4 inline-flex rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
                  受付番号：{reference}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="mt-6 h-11 rounded-xl border-slate-200 px-5 font-bold"
                onClick={() => setReference(null)}
              >
                別のお問い合わせを送る
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,.06)] sm:p-7"
            >
              <div className="mb-6 border-b border-slate-100 pb-5">
                <p className="text-xs font-black tracking-[0.16em] text-[#FF5A1F]">FORM</p>
                <h2 className="mt-2 text-xl font-black">お問い合わせ内容を入力</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">必須項目をご入力のうえ送信してください。</p>
              </div>

              <div>
                <FieldLabel>お問い合わせ種別</FieldLabel>
                <select
                  value={form.category}
                  onChange={update('category')}
                  className={fieldClass + ' w-full appearance-auto'}
                  required
                >
                  <option value="service">サービスについて</option>
                  <option value="bug">不具合報告</option>
                  <option value="feedback">ご意見・ご要望</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel>お名前</FieldLabel>
                  <Input
                    type="text"
                    value={form.name}
                    onChange={update('name')}
                    maxLength={100}
                    autoComplete="name"
                    className={fieldClass}
                    required
                  />
                </div>
                <div>
                  <FieldLabel>メールアドレス</FieldLabel>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    maxLength={254}
                    autoComplete="email"
                    className={fieldClass}
                    required
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel optional>電話番号</FieldLabel>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    maxLength={30}
                    autoComplete="tel"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <FieldLabel>件名</FieldLabel>
                  <Input
                    type="text"
                    value={form.subject}
                    onChange={update('subject')}
                    maxLength={200}
                    className={fieldClass}
                    required
                  />
                </div>
              </div>

              <div className="mt-5">
                <FieldLabel>お問い合わせ内容</FieldLabel>
                <Textarea
                  rows={7}
                  value={form.message}
                  onChange={update('message')}
                  maxLength={5000}
                  className="min-h-44 rounded-xl border-slate-200 bg-white px-4 py-3 text-base shadow-none focus-visible:border-[#FF8A00] focus-visible:ring-2 focus-visible:ring-orange-100 sm:text-sm"
                  required
                />
                <p className="mt-1.5 text-right text-xs font-medium text-slate-400">
                  {form.message.length}/5000
                </p>
              </div>

              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
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

              <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <input
                  id="agree"
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[#FF5A1F]"
                  required
                />
                <label htmlFor="agree" className="text-sm leading-6 text-slate-600">
                  <Link href="/privacy" className="font-bold text-[#C2410C] underline underline-offset-2">
                    プライバシーポリシー
                  </Link>
                  に同意して送信します。
                </label>
              </div>

              <Button
                type="submit"
                className="mt-6 h-12 w-full rounded-xl bg-[#FF5A1F] text-sm font-black text-white shadow-[0_10px_24px_rgba(255,90,31,.18)] hover:bg-[#E94F18]"
                disabled={submitting}
              >
                {submitting ? '送信中...' : '送信する'}
              </Button>
            </form>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Link
            href="/faq"
            className="group block rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.04)] transition hover:-translate-y-0.5 hover:border-orange-200"
          >
            <HelpCircle className="h-5 w-5 text-[#FF5A1F]" />
            <p className="mt-4 text-base font-black">よくある質問</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">登録・操作・案件進行で迷いやすい内容をまとめています。</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-[#C2410C]">
              FAQを見る <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>

          <div className="rounded-[22px] border border-slate-200 bg-white p-5">
            <Mail className="h-5 w-5 text-[#0B1F3B]" />
            <p className="mt-4 text-sm font-black">返信について</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">内容を確認後、ご入力いただいたメールアドレスへご連絡します。</p>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-5">
            <ShieldCheck className="h-5 w-5 text-[#0B1F3B]" />
            <p className="mt-4 text-sm font-black">個人情報の取り扱い</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">入力情報はお問い合わせ対応のために取り扱います。</p>
          </div>
        </aside>
      </div>
    </main>
  )
}
