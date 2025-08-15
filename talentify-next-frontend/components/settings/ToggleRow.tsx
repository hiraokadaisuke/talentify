import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface ToggleRowProps {
  id: string
  label: string
  description?: string
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function ToggleRow({ id, label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-1">
        <Label htmlFor={id}>{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
