// app/performers/[id]/page.tsx
import dynamic from 'next/dynamic'

const PerformerDetailPage = dynamic(() => import('./PerformerDetailPage'), {
  ssr: false,
})

export default function Page() {
  return <PerformerDetailPage />
}
