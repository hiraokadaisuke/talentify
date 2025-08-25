import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { PublicTalent } from '@/types/talent'
import { ZoomIn } from 'lucide-react'

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
  const subInfo =
    talent.rate != null
      ? `料金: ${talent.rate}`
      : talent.genre || talent.area || ''

  return (
    <Link
      href={`/talents/${talent.id}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-2xl"
    >
      <div className="overflow-hidden rounded-2xl border bg-white transition hover:translate-y-[-2px] hover:shadow-lg">
        <div className="relative aspect-[4/5] bg-gray-100">
          <Image
            src={imageSrc}
            alt={talent.stage_name ?? 'Avatar'}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 45vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-end justify-end p-2 transition">
            <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100" />
          </div>
        </div>
        <div className="p-3 space-y-1">
          <p className="text-base font-semibold line-clamp-2">{talent.stage_name}</p>
          {subInfo && (
            <p className="text-sm text-muted-foreground line-clamp-1">{subInfo}</p>
          )}
          {talent.genre && <Badge className="mt-1">{talent.genre}</Badge>}
        </div>
      </div>
    </Link>
  )
}
