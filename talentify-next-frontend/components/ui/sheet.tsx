"use client"

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger

export const SheetClose = DialogPrimitive.Close

export function SheetOverlay({ className, ...props }: DialogPrimitive.DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn('fixed inset-0 z-50 bg-black/30', className)}
      {...props}
    />
  )
}

export const SheetPortal = DialogPrimitive.Portal

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'left' | 'right' | 'top' | 'bottom'
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 flex flex-col bg-white shadow-md',
        side === 'left' && 'inset-y-0 left-0 w-64',
        side === 'right' && 'inset-y-0 right-0 w-64',
        side === 'top' && 'inset-x-0 top-0',
        side === 'bottom' && 'inset-x-0 bottom-0',
        className
      )}
      {...props}
    >
      {children}
      <SheetClose className="absolute right-2 top-2 rounded-sm opacity-70 transition-opacity hover:opacity-100">
        <X className="h-4 w-4" />
      </SheetClose>
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = 'SheetContent'

