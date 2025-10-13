import dynamic from 'next/dynamic'

const TalentCalendar = dynamic(() => import('./TalentCalendarClient'), {
  ssr: false,
})

export default function TalentSchedulePage() {
  return <TalentCalendar />
}
