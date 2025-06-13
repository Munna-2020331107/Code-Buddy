"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Code,
  FileJson,
  Database,
  Terminal,
  Braces,
  Hash,
  Coffee,
  FileType2,
  Cpu,
  BookOpen,
  Server,
  Users,
  Lightbulb,
  Sparkles,
} from "@/components/icons"
import "./styles/home.css"
import { useEffect, useState } from "react"
import { initParallax } from "./scripts/parallax"
import { Sidebar } from "@/components/Sidebar"
import toast from "react-hot-toast"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const cleanup = initParallax();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token")
    const premium = localStorage.getItem("premium")
    setIsLoggedIn(!!token)
    setIsPremium(premium === "true")
  }, [])

  const routes = [
    { 
      href: "/code-execution-and-error-analysis", 
      label: "Code Execution and Error Analysis",
      icon: <Server className="h-10 w-10" />,
      requiresAuth: true 
    },
    { 
      href: "/code-collaboration", 
      label: "Code Collaboration",
      icon: <BookOpen className="h-10 w-10" />,
      requiresAuth: true 
    },
    { 
      href: "/image-code-identifier", 
      label: "Image Code Identifier",
      icon: <Lightbulb className="h-10 w-10" />,
      requiresAuth: true,
      requiresPremium: true 
    },
    { 
      href: "/learning-schedule", 
      label: "Learning Schedule",
      icon: <Users className="h-10 w-10" />,
      requiresAuth: true,
      requiresPremium: true 
    },
    { 
      href: "/CloudStorage", 
      label: "Code Storage",
      icon: <Database className="h-10 w-10" />,
      requiresAuth: true 
    },
    { 
      href: "/pricing", 
      label: "Pricing",
      icon: <Sparkles className="h-10 w-10" />,
      requiresAuth: false 
    },
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
    <div style={{ display: "flex" }}>
      {/* Sidebar floating button */}
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
      
      <div className="page-decoration decoration-1"></div>
      <div className="page-decoration decoration-2"></div>

      <main className="main-container safe-area">
        <div className="welcome-container">
          <h1 className="welcome-heading">Welcome to Code Buddy</h1>
          <p className="welcome-subheading">
            Code Buddy lets users run, analyze, store, convert, and learn from code with AI assistance.
          </p>

          <div className="language-icons-container">
            <div className="language-icon-wrapper">
              <div className="icon-circle icon-html">
                <Code className="h-8 w-8" />
              </div>
              <span className="language-label">HTML/CSS</span>
            </div>
            <div className="language-icon-wrapper">
              <div className="icon-circle icon-javascript">
                <FileJson className="h-8 w-8" />
              </div>
              <span className="language-label">JavaScript</span>
            </div>
            <div className="language-icon-wrapper">
              <div className="icon-circle icon-react">
                <Braces className="h-8 w-8" />
              </div>
              <span className="language-label">React</span>
            </div>
            <div className="language-icon-wrapper">
              <div className="icon-circle icon-typescript">
                <FileType2 className="h-8 w-8" />
              </div>
              <span className="language-label">TypeScript</span>
            </div>
            <div className="language-icon-wrapper">
              <div className="icon-circle icon-python">
                <Terminal className="h-8 w-8" />
              </div>
              <span className="language-label">Python</span>
            </div>
            <div className="language-icon-wrapper">
              <div className="icon-circle icon-sql">
                <Database className="h-8 w-8" />
              </div>
              <span className="language-label">SQL</span>
            </div>
            <div className="language-icon-wrapper">
              <div className="icon-circle icon-csharp">
                <Hash className="h-8 w-8" />
              </div>
              <span className="language-label">C#</span>
            </div>
            <div className="language-icon-wrapper">
              <div className="icon-circle icon-cpp">
                <Cpu className="h-8 w-8" />
              </div>
              <span className="language-label">C++</span>
            </div>
            <div className="language-icon-wrapper">
              <div className="icon-circle icon-c">
                <Cpu className="h-8 w-8" />
              </div>
              <span className="language-label">C</span>
            </div>
            <div className="language-icon-wrapper">
              <div className="icon-circle icon-java">
                <Coffee className="h-8 w-8" />
              </div>
              <span className="language-label">Java</span>
            </div>
          </div>
        </div>

        <div className="services-grid">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="service-link"
              onClick={(e) => handleRouteClick(route, e)}
            >
              <div className="service-icon">
                {route.icon}
              </div>
              <h2 className="service-title">
                {route.label} <span className="service-arrow">→</span>
              </h2>
              <p className="service-description">
                {route.requiresAuth && !isLoggedIn 
                  ? "Sign in to access this feature"
                  : route.requiresPremium && !isPremium
                  ? "Upgrade to premium to access this feature"
                  : getServiceDescription(route.href)}
              </p>
            </Link>
          ))}
        </div>

        <footer className="business-footer">
          <div className="business-footer-content">
            <div className="footer-col company">
              <h3>Code Buddy</h3>
              <p>
                Your AI-powered coding companion for business, learning, and collaboration.
              </p>
              <div className="footer-socials">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <svg width="24" height="24" fill="#fff" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.762-1.604-2.665-.305-5.466-1.334-5.466-5.93 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <svg width="24" height="24" fill="#1da1f2" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.555-2.005.959-3.127 1.184A4.916 4.916 0 0 0 16.616 3c-2.72 0-4.924 2.204-4.924 4.924 0 .386.045.763.127 1.124C7.691 8.095 4.066 6.13 1.64 3.161c-.423.722-.666 1.561-.666 2.475 0 1.708.87 3.216 2.188 4.099-.807-.026-1.566-.247-2.229-.616v.062c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.318-3.809 2.105-6.102 2.105-.396 0-.788-.023-1.175-.067C2.29 19.29 5.01 20 7.728 20c9.142 0 14.307-7.721 14.307-14.417 0-.22-.005-.439-.015-.657A10.025 10.025 0 0 0 24 4.557z"/></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg width="24" height="24" fill="#1877f3" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg width="24" height="24" fill="#0077b5" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/press">Press</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/cookies">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="business-footer-bottom">
            <span>© {new Date().getFullYear()} Code Buddy. All rights reserved.</span>
          </div>
        </footer>
      </main>
    </div>
  )
}

function getServiceDescription(path: string): string {
  const descriptions: { [key: string]: string } = {
    "/code-execution-and-error-analysis": "Run code and get detailed error analysis with AI assistance.",
    "/code-collaboration": "Work together on code projects in real-time with team members.",
    "/image-code-identifier": "Extract and analyze code from images with our AI tools.",
    "/learning-schedule": "Create personalized learning paths for your coding journey.",
    "/CloudStorage": "Store and manage your code and files securely in the cloud.",
    "/pricing": "Explore our flexible pricing plans and premium features."
  }
  return descriptions[path] || ""
}

