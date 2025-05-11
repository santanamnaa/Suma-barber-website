"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div className="flex items-center space-x-2">
      {/* System Button */}
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-full transition-all ${
          theme === "system"
            ? "bg-primary text-white shadow-md"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <Monitor className="h-5 w-5" />
      </button>

      {/* Light Button */}
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full transition-all ${
          currentTheme === "light"
            ? "bg-yellow-400 text-white shadow-md"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <Sun className="h-5 w-5" />
      </button>

      {/* Dark Button */}
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full transition-all ${
          currentTheme === "dark"
            ? "bg-gray-900 text-white shadow-md"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <Moon className="h-5 w-5" />
      </button>
    </div>
  )
}
