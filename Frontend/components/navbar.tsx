"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun, Code } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import "./navbar.css"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const routes = [
    { href: "/services", label: "Code Execution and Error Analysis" },
    { href: "/courses", label: "Code Collaboration" },
    { href: "/resources", label: "Image Code Identifier" },
    { href: "/about", label: "Learning Schedule" },
  ]

  return (
    <header className="header">
      <div className="header-container">
        <div className="brand">
          <Link href="/" className="brand-link">
            <Code className="h-6 w-6 brand-icon" />
            <span className="brand-text">Code Buddy</span>
          </Link>
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
          <button
            aria-label="Toggle Theme"
            className="theme-button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
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

