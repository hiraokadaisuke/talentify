'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, Circle, X } from 'lucide-react'

type Role = 'store' | 'talent'

type ProgressStep = {
  key: string
  complete: boolean
}

const STEP_CONFIG = {
  store: [
    {
      key: 'profile',
      title: '店舗プロフィールを完成する',
      description: '店舗名や基本情報を登録します。',
      href: '/store/edit',
    },
    {
      key: 'discover',
      title: '演者を探してみる',
      description: '検索して、気になる演者を見つけましょう。',
      href: '/search',
    },
    {
      key: 'offer',
      title: 'オファーを送ってみる',
      description: '条件を入力して出演依頼を送信します。',
      href: '/search',
    },
  ],
  talent: [
    {
      key: 'profile',
      title: '演者プロフィールを完成する',
      description: '店舗が判断しやすいプロフィールを整えます。',
      href: '/talent/edit',
    },
    {
      key: 'schedule',
      title: 'スケジュールを設定する',
      description: '出演できる日・難しい日を登録します。',
      href: '/talent/schedule',
    },
    {
      key: 'billing',
      title: '請求情報を登録する',
      description: '見積・請求に使う情報を準備します。',
      href: '/talent/settings',
    },
    {
      key: 'offer',
      title: '届いたオファーを確認する',
      description: 'オファーが届くと、ここから案件が始まります。',
      href: '/talent/offers',
    },
  ],
} as const

function storageKey(role: Role) {
  return `talentify:getting-started-dismissed:${role}`
}

export default function GettingStartedCard({ role }: { role: Role }) {
  const [steps, setSteps] = useState<ProgressStep[] | null>(null)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    setDismissed(window.localStorage.getItem(storageKey(role)) === '1')

    let cancelled = false
    void fetch(`/api/onboarding/status?role=${role}`, { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('onboarding_status_failed')
        return response.json()
      })
      .then(payload => {
        if (!cancelled && Array.isArray(payload?.data?.steps)) {
          setSteps(payload.data.steps)
        }
      })
      .catch(error => {
        console.error('failed to load onboarding progress', error)
      })

    return () => {
      cancelled = true
    }
  }, [role])

  const configuredSteps = STEP_CONFIG[role]
  const completedCount = useMemo(
    () => configuredSteps.filter(step => steps?.find(item => item.key === step.key)?.complete).length,
    [configuredSteps, steps],
  )

  if (dismissed || !steps || completedCount === configuredSteps.length) {
    return null
  }

  const dismiss = () => {
    window.localStorage.setItem(storageKey(role), '1')
    setDismissed(true)
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-blue-600">GETTING STARTED</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">はじめにすること</h2>
          <p className="mt-1 text-sm text-slate-600">
            {completedCount}/{configuredSteps.length} 完了。必要なところだけ進めればOKです。
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
          aria-label="初回ナビを閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {configuredSteps.map(step => {
          const complete = Boolean(steps.find(item => item.key === step.key)?.complete)
          return (
            <Link
              key={step.key}
              href={step.href}
              className="group flex min-h-24 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-sm"
            >
              <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                complete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {complete ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">{step.title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{step.description}</span>
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
            </Link>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>邪魔な場合は右上の×でいつでも非表示にできます。</span>
        <Link href="/guide" className="font-semibold text-blue-700 hover:underline">
          詳しい使い方を見る
        </Link>
      </div>
    </section>
  )
}
