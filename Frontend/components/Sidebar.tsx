"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Moon, Sun } from "@/components/icons"
import { useTheme } from "@/components/theme-provider"
import { useEffect, useState } from "react"
import "./Sidebar.css"
import toast from "react-hot-toast"

// User and Logout icons
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
  </svg>
);
const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export function Sidebar({ onClose }: { onClose?: () => void }) {
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
  }, [pathname])

  const routes = [
    { href: "/code-execution-and-error-analysis", label: "Code Execution and Error Analysis", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 9h8M8 13h6"/></svg>, requiresAuth: true },
    { href: "/code-collaboration", label: "Code Collaboration", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>, requiresAuth: true },
    { href: "/image-code-identifier", label: "Image Code Identifier", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, requiresAuth: true, requiresPremium: true },
    { href: "/learning-schedule", label: "Learning Schedule", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 7h20M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><rect x="2" y="7" width="20" height="14" rx="2"/></svg>, requiresAuth: true, requiresPremium: true },
    { href: "/CloudStorage", label: "Cloud Storage", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>, requiresAuth: true },
    { href: "/pricing", label: "Pricing", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1v22M17 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/></svg>, requiresAuth: false },
  ]

  const handleRouteClick = (route: any, e: React.MouseEvent) => {
    if (!isLoggedIn && route.requiresAuth) {
      e.preventDefault()
      toast.error("Please sign in to access this feature")
      router.push("/sign-in")
      return
    }
    if (route.requiresPremium && !isPremium) {
      e.preventDefault()
      router.push("/pricing")
      return
    }
  }

  return (
    <aside className="sidebar">
      {onClose && (
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 24,
            cursor: "pointer"
          }}
          aria-label="Close sidebar"
        >
          ×
        </button>
      )}
      <div className="sidebar-title" style={{ marginBottom: '1.5rem' }}>Code Buddy</div>
      <div className="sidebar-divider" style={{ marginBottom: '1.5rem' }} />
      <nav className="sidebar-nav">
        <Link
          href="/"
          className={`sidebar-link${pathname === '/' ? ' active' : ''}`}
          onClick={onClose}
        >
          <span className="sidebar-icon">🏠</span>
          Home
        </Link>
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={`sidebar-link${pathname === route.href ? " active" : ""}`}
            onClick={(e) => handleRouteClick(route, e)}
          >
            <span className="sidebar-icon">{route.icon}</span>
            {route.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {isLoggedIn ? (
            <button
              className="sidebar-sign-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}
              onClick={() => {
                localStorage.removeItem("token")
                setIsLoggedIn(false)
                router.push("/sign-in")
              }}
            >
              <LogoutIcon />
              Sign Out
            </button>
          ) : (
            <Link href="/sign-in" className="sidebar-sign-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <UserIcon />
              Sign In
            </Link>
          )}
          <button
            aria-label="Toggle Theme"
            className="sidebar-theme-btn"
            style={{ marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            type="button"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
        </div>
      </div>
    </aside>
  )
}
