'use client'
import Link from 'next/link'

interface Tab {
  href: string
  label: string
}

interface Props {
  tabs: Tab[]
  current: string
}

export function SettingsTabs({ tabs, current }: Props) {
  return (
    <div className="mb-4">
      <div className="hidden sm:block border-b">
        <nav className="-mb-px flex space-x-4">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                current === t.href ? 'border-primary' : 'border-transparent text-muted-foreground'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="sm:hidden">
        <select
          className="w-full border rounded p-2"
          value={current}
          onChange={(e) => {
            window.location.href = e.target.value
          }}
        >
          {tabs.map((t) => (
            <option key={t.href} value={t.href}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
