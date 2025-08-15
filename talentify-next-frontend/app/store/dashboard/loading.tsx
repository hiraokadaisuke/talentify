import { CardSkeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <CardSkeleton className="sm:col-span-2" />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton className="sm:col-span-2" />
        <CardSkeleton className="sm:col-span-2" />
      </div>
    </div>
  )
}
