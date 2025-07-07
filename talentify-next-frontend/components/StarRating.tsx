// components/StarRating.tsx
export function StarRating({ rating }: { rating: number }) {
  const filledStars = Math.floor(rating)
  const hasHalfStar = rating - filledStars >= 0.5
  const emptyStars = 5 - filledStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center space-x-1">
      {[...Array(filledStars)].map((_, i) => (
        <span key={`filled-${i}`} className="text-yellow-400">★</span>
      ))}
      {hasHalfStar && <span className="text-yellow-400">☆</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      ))}
      <span className="ml-2 text-sm text-gray-500">{rating.toFixed(1)}</span>
    </div>
  )
}
