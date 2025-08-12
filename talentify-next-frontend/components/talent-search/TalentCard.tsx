import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export type PublicTalent = {
  stage_name: string | null
  genre: string | null
  area: string | null
  avatar_url: string | null
  rating: number | null
  rate: number | null
  bio: string | null
  display_name?: string | null
}

export default function TalentCard({ talent }: { talent: PublicTalent }) {
  return (
    <Card className="flex flex-col transition-transform hover:shadow-md hover:scale-[1.02]">
      <CardHeader className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
          {talent.avatar_url && (
            <Image
              src={talent.avatar_url}
              alt={talent.stage_name ?? ''}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          )}
        </div>
        <div className="text-lg font-semibold">{talent.stage_name}</div>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        {(talent.genre || talent.area) && (
          <p className="text-gray-600">
            {talent.genre}
            {talent.genre && talent.area ? '・' : ''}
            {talent.area}
          </p>
        )}
        {talent.rating != null && (
          <p className="text-gray-600">評価: {talent.rating}</p>
        )}
        {talent.rate != null && (
          <p className="text-gray-600">料金: {talent.rate}</p>
        )}
        {talent.bio && <p className="line-clamp-2">{talent.bio}</p>}
      </CardContent>
    </Card>
  )
}
