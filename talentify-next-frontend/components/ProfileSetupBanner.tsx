import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/lib/getUserRole'

export default function ProfileSetupBanner({
  role,
  isSetupComplete,
}: {
  role: UserRole
  isSetupComplete: boolean
}) {
  if (isSetupComplete) return null

  const href = role === 'store' ? '/store/edit' : '/talent/edit'
  const label = role === 'store' ? '店舗プロフィールを登録' : '演者プロフィールを登録'

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
      <div>
        <p className="font-semibold text-slate-900">アカウント登録は完了しています</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          プロフィールはあとから登録できます。サービスを見てから、必要なタイミングで設定してください。
          {role === 'store'
            ? ' オファーを送る前に店舗プロフィールの登録が必要です。'
            : ' プロフィール登録が完了すると演者一覧に公開されます。'}
        </p>
      </div>
      <Button asChild className="mt-3 shrink-0 sm:mt-0">
        <Link href={href} prefetch={false}>{label}</Link>
      </Button>
    </section>
  )
}
