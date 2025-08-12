import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { PublicTalent } from '@/types/talent'

export default function TalentCard({ talent }: { talent: PublicTalent }) {
  const isValidHttpUrl = (url: string) => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  const imageSrc = talent.avatar_url && isValidHttpUrl(talent.avatar_url)
    ? talent.avatar_url
    : '/avatar-default.svg'

  return (
    <Link
      href={`/talents/${talent.id}`}
      className="block focus:outline-none focus:ring-2 focus:ring-offset-2"
    >
      <Card className="flex flex-col transition-transform hover:shadow-md hover:scale-[1.02]">
        <CardHeader className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
            <Image
              src={imageSrc}
              alt={talent.stage_name ?? 'Avatar'}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
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
    </Link>
  )
}
