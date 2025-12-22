"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 常に最初のページを表示
      pages.push(1)

      if (currentPage > 3) {
        pages.push("...")
      }

      // 現在のページの周辺を表示
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("...")
      }

      // 常に最後のページを表示
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <nav className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="前のページ"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {getPageNumbers().map((page, index) => (
        typeof page === "number" ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-2 text-gray-400">
            {page}
          </span>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="次のページ"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  )
}
