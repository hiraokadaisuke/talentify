import TalentDetailPageClient from './TalentDetailPageClient'

type PageProps = {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  return <TalentDetailPageClient id={params.id} />
}
