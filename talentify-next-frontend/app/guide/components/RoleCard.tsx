interface RoleCardProps {
  href: string
  title: string
  description: string
}

export function RoleCard({ href, title, description }: RoleCardProps) {
  return (
    <a
      href={href}
      className="group block rounded-2xl border border-[#d7dce3] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#c89211] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c89211] focus-visible:ring-offset-2"
    >
      <h3 className="text-xl font-semibold text-[#0f172a]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#334155]">{description}</p>
      <p className="mt-5 inline-flex items-center text-sm font-semibold text-[#c89211] transition-colors group-hover:text-[#b8820f]">
        流れを見る
      </p>
    </a>
  )
}
