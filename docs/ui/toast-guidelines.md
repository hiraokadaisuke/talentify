# Toast Guidelines

This project uses [sonner](https://sonner.emilkowal.ski/) for toast notifications.
All toasts are rendered through a single `<Toaster />` mounted in `app/layout.tsx`.

## Usage

```tsx
import { toast } from "sonner"

toast.success("保存しました")
toast.error("エラーが発生しました")
```

Do **not** mount `<Toaster />` inside pages or components. Use the global instance and the
`toast` API instead.

## Z-index policy

Global z-index variables are defined in `app/globals.css`:

```css
:root {
  --z-header: 50;
  --z-toast: 9999;
}
```

The toast portal uses `z-[var(--z-toast)]` so it always appears above the fixed header
(`z-[var(--z-header)]`). If you introduce other layers (e.g. modals), ensure their
z-index is higher than `--z-toast`.

## Safe area

For devices with a notch, the toast container applies `padding-top: env(safe-area-inset-top)`
to avoid overlap with the system status bar.

## Prohibited patterns

- Adding `transform` or `overflow: hidden` to `html`, `body` or layout wrappers.
- Rendering additional `<Toaster />` instances.
- Manually positioning page-specific toast elements.

## Checklist

- [ ] Use `toast` from `sonner` for notifications.
- [ ] No page-level `Toaster` or custom toast markup.
- [ ] Headers and other layers use the shared z-index variables.
