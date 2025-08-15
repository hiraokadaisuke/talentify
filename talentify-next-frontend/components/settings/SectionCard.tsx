import { PropsWithChildren } from 'react'

interface SectionCardProps {
  title: string
  description?: string
}

export function SectionCard({ title, description, children }: PropsWithChildren<SectionCardProps>) {
  return (
    <section className="border rounded-md p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  )
}
