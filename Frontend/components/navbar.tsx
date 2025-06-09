"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Moon, Sun } from "@/components/icons"
import { useTheme } from "@/components/theme-provider"
import { Logo } from "@/components/logo"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import "./navbar.css"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  const routes = [
    { href: "/code-execution-and-error-analysis", label: "Code Execution and Error Analysis" },
    { href: "/code-collaboration", label: "Code Collaboration" },
    { href: "/image-code-identifier", label: "Image Code Identifier" },
    { href: "/learning-schedule", label: "Learning Schedule" },
    { href: "/CloudStorage", label: "Cloud Storage" },
  ]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    toast.success("Logged out successfully")
    router.push("/sign-in")
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="brand">
          <Logo className="brand-link" />
        </div>
        <nav className="nav">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`nav-link ${pathname === route.href ? "nav-link-active" : "nav-link-inactive"}`}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="actions">
          <button aria-label="Toggle Theme" className="theme-button" onClick={toggleTheme}>
            <Sun className="sun-icon" />
            <Moon className="moon-icon" />
            <span className="sr-only">Toggle theme</span>
          </button>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="sign-in-button">
              Sign Out
            </button>
          ) : (
            <Link href="/sign-in" className="sign-in-button">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

