import { PropsWithChildren } from 'react'

interface SectionCardProps {
  title: string
  description?: string
}

export function SectionCard({ title, description, children }: PropsWithChildren<SectionCardProps>) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-5">
      <div>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  )
}
