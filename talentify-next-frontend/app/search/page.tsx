'use client'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function SearchTopPage() {
  const options = [
    {
      href: '/search/talents',
      title: '演者から探す',
      description: '希望の演者が決まっている場合はこちら',
    },
    {
      href: '/search/calendar',
      title: '日時から探す',
      description: '空いている演者をスケジュールから検索',
    },
  ]

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">演者検索</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((o) => (
          <Link key={o.href} href={o.href} className="block">
            <Card className="h-full transition hover:shadow-lg hover:border-primary">
              <CardHeader>
                <CardTitle>{o.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {o.description}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
