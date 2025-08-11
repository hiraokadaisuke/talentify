"use client"

import React from "react"
import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return React.createElement(Sonner, {
    position: "top-center",
    className: "toast-portal toast-top z-[var(--z-toast)]",
  })
}
