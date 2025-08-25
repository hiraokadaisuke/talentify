import { Skeleton } from '@/components/ui/skeleton'

export default function TalentCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-3 shadow-md space-y-3">
      <Skeleton className="w-full aspect-[4/5] rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

