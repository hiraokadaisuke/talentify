'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SectionCard } from '@/components/settings/SectionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const BANK_OPTIONS = [
  '三井住友銀行',
  '三菱UFJ銀行',
  'みずほ銀行',
  'りそな銀行',
  'ゆうちょ銀行',
  '楽天銀行',
  'PayPay銀行',
  '住信SBIネット銀行',
  'auじぶん銀行',
  'ソニー銀行',
  'セブン銀行',
  'イオン銀行',
  'みなと銀行',
  '池田泉州銀行',
  '京都銀行',
  '関西みらい銀行',
] as const

const ACCOUNT_TYPES = ['普通', '当座', '貯蓄'] as const

export default function TalentSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [billingSaving, setBillingSaving] = useState(false)
  const [billingNameSuggestion, setBillingNameSuggestion] = useState('')
  const [bankInfo, setBankInfo] = useState({
    bank_name: '',
    branch_name: '',
    account_type: '',
    account_number: '',
    account_holder: '',
  })
  const [billingInfo, setBillingInfo] = useState({
    billing_name: '',
    billing_address: '',
    invoice_registration_number: '',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      const [profileRes, billingRes] = await Promise.all([
        fetch('/api/talent/profile'),
        fetch('/api/talent/billing-profile'),
      ])

      if (profileRes.ok) {
        const data = await profileRes.json()
        setBankInfo({
          bank_name: data.bank_name ?? '',
          branch_name: data.branch_name ?? '',
          account_type: data.account_type ?? '',
          account_number: data.account_number ?? '',
          account_holder: data.account_holder ?? '',
        })
      }

      if (billingRes.ok) {
        const data = await billingRes.json()
        setBillingInfo({
          billing_name: data.billing_name ?? '',
          billing_address: data.billing_address ?? '',
          invoice_registration_number: data.invoice_registration_number ?? '',
        })
        setBillingNameSuggestion(data.suggested_billing_name ?? '')
      }
    }

    void fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/talent/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankInfo),
      })
      if (!res.ok) throw new Error('failed')
      toast.success('振込先を保存しました')
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleBillingSave = async () => {
    setBillingSaving(true)
    try {
      const res = await fetch('/api/talent/billing-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billingInfo),
      })
      const result = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(result?.message || '保存に失敗しました')
      }

      toast.success('請求書発行者情報を保存しました')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存に失敗しました')
    } finally {
      setBillingSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-screen-md space-y-6 p-4">
      <h1 className="text-2xl font-bold">設定</h1>

      <SectionCard title="振込先" description="請求書に記載する振込口座です。候補から選ぶか、そのまま直接入力できます。">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank_name">銀行名</Label>
            <Input
              id="bank_name"
              list="bank-options"
              value={bankInfo.bank_name}
              onChange={(e) =>
                setBankInfo((current) => ({ ...current, bank_name: e.target.value }))
              }
              placeholder="例：三井住友銀行"
              autoComplete="off"
            />
            <datalist id="bank-options">
              {BANK_OPTIONS.map((bank) => (
                <option key={bank} value={bank} />
              ))}
            </datalist>
            <p className="text-xs text-slate-500">候補にない銀行も直接入力できます。</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch_name">支店名</Label>
            <Input
              id="branch_name"
              value={bankInfo.branch_name}
              onChange={(e) =>
                setBankInfo((current) => ({ ...current, branch_name: e.target.value }))
              }
              placeholder="例：神戸支店"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label>口座種別</Label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map((type) => {
                const selected = bankInfo.account_type === type
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setBankInfo((current) => ({ ...current, account_type: type }))
                    }
                    className={`min-h-11 rounded-xl border px-3 text-sm font-bold transition ${
                      selected
                        ? 'border-orange-300 bg-orange-50 text-[#C2410C]'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number">口座番号</Label>
            <Input
              id="account_number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={bankInfo.account_number}
              onChange={(e) =>
                setBankInfo((current) => ({
                  ...current,
                  account_number: e.target.value.replace(/\D/g, ''),
                }))
              }
              placeholder="例：1234567"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_holder">口座名義人</Label>
            <Input
              id="account_holder"
              value={bankInfo.account_holder}
              onChange={(e) =>
                setBankInfo((current) => ({ ...current, account_holder: e.target.value }))
              }
              placeholder="例：ヤマダ タロウ"
              autoComplete="off"
            />
            <p className="text-xs text-slate-500">通帳や口座情報に記載されている名義どおりに入力してください。</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]">
              {saving ? '保存中...' : '振込先を保存'}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="請求書発行者情報"
        description="締結書兼請求書に使用する非公開情報です。公開プロフィールには表示されません。"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="billing_name">請求書名義</Label>
              {billingNameSuggestion && billingInfo.billing_name !== billingNameSuggestion && (
                <button
                  type="button"
                  onClick={() =>
                    setBillingInfo((current) => ({
                      ...current,
                      billing_name: billingNameSuggestion,
                    }))
                  }
                  className="text-xs font-bold text-[#C2410C] hover:underline"
                >
                  本名を使う
                </button>
              )}
            </div>
            <Input
              id="billing_name"
              value={billingInfo.billing_name}
              onChange={(e) =>
                setBillingInfo({ ...billingInfo, billing_name: e.target.value })
              }
              placeholder="例：山田 太郎 / 株式会社○○"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_address">住所</Label>
            <Input
              id="billing_address"
              value={billingInfo.billing_address}
              onChange={(e) =>
                setBillingInfo({ ...billingInfo, billing_address: e.target.value })
              }
              placeholder="例：東京都○○区○○1-2-3"
              autoComplete="street-address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_registration_number">
              適格請求書発行事業者登録番号（任意）
            </Label>
            <Input
              id="invoice_registration_number"
              value={billingInfo.invoice_registration_number}
              onChange={(e) =>
                setBillingInfo({
                  ...billingInfo,
                  invoice_registration_number: e.target.value,
                })
              }
              placeholder="例：T1234567890123"
              autoCapitalize="characters"
            />
            <p className="text-xs text-slate-500">
              登録済みの場合のみ入力してください。Tから始まる13桁の数字です。
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleBillingSave} disabled={billingSaving} className="rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]">
              {billingSaving ? '保存中...' : '請求書発行者情報を保存'}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="パスワード" description="登録メールアドレスへ再設定リンクを送信します">
        <Button asChild variant="outline">
          <Link href="/password-reset">パスワードを再設定</Link>
        </Button>
      </SectionCard>
    </main>
  )
}
