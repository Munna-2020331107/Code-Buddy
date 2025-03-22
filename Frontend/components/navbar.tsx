"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "@/components/icons"
import { useTheme } from "@/components/theme-provider"
import { Logo } from "@/components/logo"
import "./navbar.css"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const routes = [
    { href: "/code-execution-and-error-analysis", label: "Code Execution and Error Analysis" },
    { href: "/code-collaboration", label: "Code Collaboration" },
    { href: "/image-code-identifier", label: "Image Code Identifier" },
    { href: "/learning-schedule", label: "Learning Schedule" },
  ]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
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
          <Link href="/sign-in" className="sign-in-button">
            Sign In
          </Link>
        </div>
      </div>
    </header>
  )
}

