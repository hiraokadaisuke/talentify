'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'

export default function StarRatingInput({
  value,
  onChange,
  className = '',
}: {
  value?: number
  onChange: (val: number) => void
  className?: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  return (
    <div className={`flex gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(n)}
        >
          <Star
            className={`w-5 h-5 ${n <= (hover ?? value ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  )
}
