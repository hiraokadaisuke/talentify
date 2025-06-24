'use client'
import { useState } from 'react'
import { StarIcon as SolidStar } from '@heroicons/react/24/solid'
import { StarIcon as OutlineStar } from '@heroicons/react/24/outline'

export default function StarRating({ value = 0, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover || value)
        const Icon = filled ? SolidStar : OutlineStar
        return (
          <Icon
            key={n}
            className="w-6 h-6 cursor-pointer text-yellow-400"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange && onChange(n)}
          />
        )
      })
    </div>
  )
}
