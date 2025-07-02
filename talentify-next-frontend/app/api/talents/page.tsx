import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic' // SSR強制（開発中向け）

export default async function TalentListPage() {
  const supabase = createClient()
  const { data: talents, error } = await supabase.from('talents').select('*')

  if (error) {
    return <div className="p-4 text-red-500">エラー: {error.message}</div>
  }

  return (
    <div className="p-6 grid gap-4">
      <h1 className="text-2xl font-bold">演者一覧</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {talents?.map((talent) => (
          <Card key={talent.id} className="shadow">
            <CardContent className="p-4">
              <p className="text-lg font-semibold">{talent.name}</p>
              <p className="text-sm text-gray-500">{talent.category}</p>
              {talent.twitter_url && (
                <a
                  href={talent.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm underline"
                >
                  Twitterを見る
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
