'use client'

import { useEffect, useRef, useState } from 'react'
import { UserRound } from 'lucide-react'

export default function EventPhoto({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const image = imageRef.current
    if (image?.complete && image.naturalWidth === 0) setFailed(true)
  }, [src])
  return src && !failed ? (
    // Profile URLs can be hosted outside the image optimizer's allowed domains.
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={imageRef} src={src} alt={name} loading="lazy" decoding="async" onError={() => setFailed(true)} />
  ) : <div className="events-photo-empty"><UserRound aria-hidden="true" /><span>写真未登録</span></div>
}
