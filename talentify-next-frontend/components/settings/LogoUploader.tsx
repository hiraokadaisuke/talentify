'use client'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  value?: string | null
  onChange?: (file: File | null, preview: string | null) => void
}

export function LogoUploader({ value, onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(value ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      // TODO: show error
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      // TODO: show error
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange?.(file, url)
  }

  const handleRemove = () => {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
    onChange?.(null, null)
  }

  return (
    <div className="space-y-2">
      {preview && (
        <div className="w-32 h-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="logo" className="object-contain w-full h-full rounded" />
        </div>
      )}
      <div className="flex gap-2">
        <input ref={inputRef} id="logo" type="file" accept="image/*" className="hidden" onChange={handleSelect} />
        <Button type="button" onClick={() => inputRef.current?.click()}>アップロード</Button>
        {preview && (
          <Button type="button" variant="outline" onClick={handleRemove}>
            削除
          </Button>
        )}
      </div>
    </div>
  )
}
