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
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const premium = localStorage.getItem("premium")
    setIsLoggedIn(!!token)
    setIsPremium(premium === "true")
  }, [pathname]) // Add pathname as dependency to update on route change

  const routes = [
    { href: "/code-execution-and-error-analysis", label: "Code Execution and Error Analysis", requiresAuth: true },
    { href: "/code-collaboration", label: "Code Collaboration", requiresAuth: true },
    { href: "/image-code-identifier", label: "Image Code Identifier", requiresAuth: true, requiresPremium: true },
    { href: "/learning-schedule", label: "Learning Schedule", requiresAuth: true, requiresPremium: true },
    { href: "/CloudStorage", label: "Cloud Storage", requiresAuth: true },
    { href: "/pricing", label: "Pricing", requiresAuth: false },
  ]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    localStorage.removeItem("premium")
    localStorage.removeItem("premium_type")
    localStorage.removeItem("premium_expiry_date")
    setIsLoggedIn(false)
    setIsPremium(false)
    toast.success("Logged out successfully")
    router.push("/sign-in")
  }

  const handleRouteClick = (route: any, e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault()
      toast.error("Please sign in to access this feature")
      router.push("/sign-in")
      return
    }

    if (route.requiresPremium && !isPremium) {
      e.preventDefault()
      toast.error("This feature requires a premium subscription")
      router.push("/pricing")
      return
    }
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
              onClick={(e) => handleRouteClick(route, e)}
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

