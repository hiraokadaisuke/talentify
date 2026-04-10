interface RoleCardProps {
  href: string
  title: string
  description: string
}

export function RoleCard({ href, title, description }: RoleCardProps) {
  return (
    <a
      href={href}
      className="group block rounded-2xl border border-amber-200 bg-amber-50/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
    >
      <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <p className="mt-4 text-sm font-medium text-amber-700">流れを見る</p>
    </a>
  )
}
