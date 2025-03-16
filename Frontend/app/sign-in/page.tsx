"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSignIn = async () => {
    try {
      console.log("Email:", email)
      console.log("Password:", password)
      
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log(data)

      if (data.success) {
        console.log("Login successful!")
      } else {
        setError("Invalid email or password")
      }
    } catch (error) {
      console.error("Error during sign-in:", error)
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center relative">
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>
      </div>

      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary/30 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-secondary/30 rounded-full filter blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border-primary/10 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Sign in to Code Buddy
          </CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-primary/20 focus:border-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-medium">
                Password
              </Label>
              <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                placeholder="Password"                
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-primary/20 focus:border-primary/50 transition-all pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <button
            onClick={handleSignIn}
            className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
          >
            Sign In
          </button>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
  href="/sign-up"  // This is the correct path to the app/sign-up/page.tsx file
  className="text-primary hover:text-secondary underline-offset-4 hover:underline transition-colors"
>
  Sign up
</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

