import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function ProfileProgressCard() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: talent } = await supabase
    .from('talents')
    .select('stage_name, genre, area, rate, bio, profile, avatar_url')
    .eq('user_id', user.id)
    .single()

  const missingItems: string[] = []

  if (!talent?.stage_name?.trim()) missingItems.push('ステージ名')
  if (!talent?.genre) missingItems.push('ジャンル')
  if (!talent?.area) missingItems.push('エリア')
  if (!talent?.rate || talent.rate <= 0) missingItems.push('出演料')
  const bioText = (talent?.bio ?? talent?.profile ?? '').trim()
  if (bioText.length < 20) missingItems.push('自己紹介')
  if (!talent?.avatar_url) missingItems.push('プロフィール画像')

  const totalRequired = 6
  const progressPercent = Math.round(((totalRequired - missingItems.length) / totalRequired) * 100)

  return (
    <Card className='bg-white/80 backdrop-blur-sm shadow-md'>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>プロフィール進捗</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Progress value={progressPercent} />
          <div className='text-xs text-gray-600 mt-1'>{progressPercent}% 完了</div>
        </div>

        {missingItems.length > 0 && (
          <div className='space-y-1 text-sm text-gray-700'>
            <div className='flex items-center gap-1 text-red-600 font-medium'>
              <AlertCircle className='w-4 h-4' /> 未入力項目：
            </div>
            <ul className='list-disc ml-5'>
              {missingItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <Button variant='default' size='sm' className='w-full'>
          プロフィールを編集する
        </Button>
      </CardContent>
    </Card>
  )
}
