"use client"

import { usePathname } from "next/navigation"
import Navbar from "./Navbar"

export default function ConditionalNavbar() {
  const pathname = usePathname()

  // ログインページとサインアップページではNavbarを表示しない
  const hideNavbar = pathname === "/auth/signin" || pathname === "/auth/signup"

  if (hideNavbar) {
    return null
  }

  return <Navbar />
}
