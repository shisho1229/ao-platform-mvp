"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider")
  }
  return context
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolver(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    resolver?.(true)
  }

  const handleCancel = () => {
    setIsOpen(false)
    resolver?.(false)
  }

  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
    info: "bg-blue-600 hover:bg-blue-700",
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleCancel}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            {options.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {options.title}
              </h3>
            )}
            <p className="text-gray-600 mb-6">{options.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {options.cancelText || "キャンセル"}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  variantStyles[options.variant || "info"]
                }`}
              >
                {options.confirmText || "確認"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
