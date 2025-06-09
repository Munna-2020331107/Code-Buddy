"use client"

import { Suspense } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Terminal, Code, Lightbulb, Zap } from "@/components/icons"
import Playground from "@/components/Playground/Playground"

function PlaygroundLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Spinner className="w-10 h-10 text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">Loading Code Playground...</p>
    </div>
  )
}

export default function CodeExecutionPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 mb-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Code Execution & Analysis
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-6">
          Write, run, and debug your code with our powerful editor and AI-powered analysis tools.
        </p>

        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Terminal size={18} className="text-primary" />
            <span className="text-sm font-medium">Multiple Languages</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Zap size={18} className="text-primary" />
            <span className="text-sm font-medium">Real-time Execution</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Lightbulb size={18} className="text-primary" />
            <span className="text-sm font-medium">AI-powered Feedback</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Code size={18} className="text-primary" />
            <span className="text-sm font-medium">Syntax Highlighting</span>
          </div>
        </div>
      </div>

      {/* Playground Section */}
      <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b">
          <h2 className="text-xl font-semibold">Code Playground</h2>
          <p className="text-sm text-muted-foreground">
            Select a language, write your code, and run it to see the results
          </p>
        </div>

        <Suspense fallback={<PlaygroundLoader />}>
          <Playground />
        </Suspense>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Terminal size={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Multi-language Support</h3>
          <p className="text-muted-foreground">
            Write and execute code in JavaScript, Python, Java, C++, C#, and PHP with full syntax highlighting and
            language-specific features.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lightbulb size={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">AI-powered Analysis</h3>
          <p className="text-muted-foreground">
            Get intelligent feedback on your code, including suggestions for improvements, best practices, and error
            detection with detailed explanations.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Zap size={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Real-time Execution</h3>
          <p className="text-muted-foreground">
            Run your code instantly in a secure, sandboxed environment with support for custom inputs and detailed
            output analysis.
          </p>
        </div>
      </div>
    </div>
  )
}

