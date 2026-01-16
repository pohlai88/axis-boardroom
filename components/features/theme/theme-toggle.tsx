"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/_internal/ui/button"

/**
 * ThemeToggle - Toggle between light and dark themes
 * 
 * Features:
 * - Syncs with localStorage
 * - Dispatches custom events for same-tab updates
 * - Shows correct icon based on current theme
 * - Prevents hydration mismatch
 */
export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light")
  const [mounted, setMounted] = React.useState(false)

  // Initialize theme on mount
  React.useEffect(() => {
    setMounted(true)
    
    // Get current theme from DOM or localStorage
    const html = document.documentElement
    const savedTheme = localStorage.getItem("theme")
    
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme)
    } else {
      // Use current DOM state
      const isDark = html.classList.contains("dark")
      setTheme(isDark ? "dark" : "light")
    }
  }, [])

  // Listen for storage changes (cross-tab sync)
  React.useEffect(() => {
    if (!mounted) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        const newTheme = e.newValue as "light" | "dark"
        setTheme(newTheme)
        const html = document.documentElement
        if (newTheme === "dark") {
          html.classList.add("dark")
        } else {
          html.classList.remove("dark")
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [mounted])

  const toggleTheme = () => {
    const html = document.documentElement
    const isDark = html.classList.contains("dark")
    const newTheme = isDark ? "light" : "dark"

    // Update DOM
    if (newTheme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }

    // Update state
    setTheme(newTheme)

    // Save to localStorage
    localStorage.setItem("theme", newTheme)

    // Dispatch custom event for same-tab synchronization
    window.dispatchEvent(new Event("theme-change"))
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" aria-label="Toggle theme" disabled>
        <HugeiconsIcon icon={MoonIcon} strokeWidth={2} />
      </Button>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme} 
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Current theme: ${theme}`}
    >
      {theme === "dark" ? (
        <HugeiconsIcon icon={SunIcon} strokeWidth={2} />
      ) : (
        <HugeiconsIcon icon={MoonIcon} strokeWidth={2} />
      )}
    </Button>
  )
}
