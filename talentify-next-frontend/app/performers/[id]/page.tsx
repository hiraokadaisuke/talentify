import PerformerDetailPageClient from './PerformerDetailPageClient'

type PageProps = {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  return <PerformerDetailPageClient id={params.id} />
}
