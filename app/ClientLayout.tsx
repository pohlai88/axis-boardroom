"use client"

import type React from "react"

import { useEffect } from "react"
import { QueryProvider } from "@/lib/client/providers/query-provider"
import { AuthProvider } from "@/components/features/auth"

/**
 * ClientLayout - Handles theme initialization and synchronization
 * 
 * This component:
 * - Initializes theme from localStorage on mount
 * - Listens for localStorage changes (cross-tab synchronization)
 * - Respects system preference if no saved theme
 * - Wraps children with TanStack Query provider and Auth provider
 */
export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  useEffect(() => {
    // Initialize theme on mount
    const applyTheme = () => {
      const savedTheme = localStorage.getItem("theme")
      const html = document.documentElement
      
      if (savedTheme === "dark") {
        html.classList.add("dark")
      } else if (savedTheme === "light") {
        html.classList.remove("dark")
      } else {
        // No saved theme - use system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (prefersDark) {
          html.classList.add("dark")
        } else {
          html.classList.remove("dark")
        }
      }
    }

    // Apply theme immediately
    applyTheme()

    // Listen for storage changes (cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        applyTheme()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Listen for custom theme change events (same-tab updates)
    const handleThemeChange = () => {
      applyTheme()
    }

    window.addEventListener("theme-change", handleThemeChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("theme-change", handleThemeChange)
    }
  }, [])

  return (
    <AuthProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    </AuthProvider>
  )
}
