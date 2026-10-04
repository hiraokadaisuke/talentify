import Image from 'next/image'
import type { ReactNode } from 'react'

type PublicPageHeroProps = {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}

export default function PublicPageHero({
  eyebrow,
  title,
  description,
  children,
}: PublicPageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#081426] text-white">
      <Image
        src="/lp/hero/hero-bg.webp"
        alt=""
        fill
        priority
        quality={65}
        sizes="100vw"
        className="object-cover object-center opacity-60"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#081426] via-[#081426]/88 to-[#081426]/48" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#081426]/28" />
      <div aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#FFC400]/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 left-[58%] h-72 w-72 rounded-full bg-[#FF5A1F]/10 blur-3xl" />
      <div className="relative mx-auto w-full max-w-[1120px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="h-1 w-10 rounded-full bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
          <p className="text-[11px] font-black tracking-[0.22em] text-[#FFC400]">{eyebrow}</p>
        </div>
        <h1 className="mt-4 text-[32px] font-black leading-tight tracking-[-0.03em] sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-white/72 sm:text-base sm:leading-8">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  )
}
