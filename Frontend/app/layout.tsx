"use client"
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import { useState } from "react"
import { usePathname } from "next/navigation"

import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/Sidebar"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Sidebar floating button (left, outside navbar, hidden on home) */}
          {pathname !== '/' && (
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(true)}
              style={{
                position: "fixed",
                top: 20,
                left: 20,
                zIndex: 200,
                background: "#4285f4",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                fontSize: 25,
                cursor: "pointer",
                display: sidebarOpen ? "none" : "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(66,133,244,0.15)"
              }}
              aria-label="Open sidebar"
            >
              <span style={{ fontSize: 24, lineHeight: 1 }}>&#9776;</span>
            </button>
          )}
          {/* Sidebar and overlay */}
          {sidebarOpen && (
            <>
              <Sidebar onClose={() => setSidebarOpen(false)} />
              <div
                className="sidebar-overlay"
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.2)",
                  zIndex: 99
                }}
              />
            </>
          )}
          <div className="relative flex min-h-screen flex-col">
            <main className="main-container safe-area">
              <div className="flex-1">{children}</div>
            </main>
          </div>
        </ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}

import './globals.css'