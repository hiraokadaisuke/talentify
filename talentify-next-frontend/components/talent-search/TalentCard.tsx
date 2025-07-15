import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export type Talent = {
  id: number
  name: string
  genre: string
  gender: string
  ageGroup: string
  location: string
  bio: string
  agency?: string
  avatar: string
}

export default function TalentCard({ talent }: { talent: Talent }) {
  return (
    <Card className="flex flex-col transition-transform hover:shadow-md hover:scale-[1.02]">
      <CardHeader className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
          <Image src={talent.avatar} alt={talent.name} width={64} height={64} className="object-cover w-full h-full" />
        </div>
        <div className="text-lg font-semibold">{talent.name}</div>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <p className="text-gray-600">
          {talent.genre}・{talent.location}
        </p>
        <p className="line-clamp-2">{talent.bio}</p>
        {talent.agency && <p className="text-xs text-gray-500">所属: {talent.agency}</p>}
      </CardContent>
      <CardFooter className="mt-auto flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/talents/${talent.id}`}>詳細を見る</Link>
        </Button>
        <Button className="flex-1">オファーする</Button>
      </CardFooter>
    </Card>
  )
}
