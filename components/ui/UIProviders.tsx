"use client"

import { ReactNode } from "react"
import { ToastProvider } from "./Toast"
import { ConfirmProvider } from "./ConfirmModal"

export function UIProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        {children}
      </ConfirmProvider>
    </ToastProvider>
  )
}
