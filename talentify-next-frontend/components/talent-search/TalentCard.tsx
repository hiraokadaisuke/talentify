import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

// Public talent information used on the search page
export type Talent = {
  id: string
  stage_name: string
  genre: string | null
  gender: string | null
  age_group: string | null
  location: string | null
  comment: string | null
  avatar_url: string | null
}

export default function TalentCard({ talent }: { talent: Talent }) {
  return (
    <Card className="flex flex-col transition-transform hover:shadow-md hover:scale-[1.02]">
      <CardHeader className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
          {talent.avatar_url && (
            <Image
              src={talent.avatar_url}
              alt={talent.stage_name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          )}
        </div>
        <div className="text-lg font-semibold">{talent.stage_name}</div>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        {(talent.genre || talent.location) && (
          <p className="text-gray-600">
            {talent.genre}
            {talent.genre && talent.location ? '・' : ''}
            {talent.location}
          </p>
        )}
        {(talent.gender || talent.age_group) && (
          <p className="text-gray-600">
            {[talent.gender, talent.age_group].filter(Boolean).join('・')}
          </p>
        )}
        {talent.comment && <p className="line-clamp-2">{talent.comment}</p>}
      </CardContent>
      <CardFooter className="mt-auto">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/talents/${talent.id}`}>詳細を見る</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
