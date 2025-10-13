'use client'

import { useEffect, useState, type ComponentType } from 'react'

export default function TalentSchedulePage() {
  const [CalendarComp, setCalendarComp] = useState<ComponentType | null>(null)

  useEffect(() => {
    let mounted = true
    void import('./TalentCalendarClient').then((mod) => {
      if (!mounted) return
      setCalendarComp(() => mod.default)
    })
    return () => {
      mounted = false
    }
  }, [])

  if (!CalendarComp) return null

  const Calendar = CalendarComp
  return <Calendar />
}
