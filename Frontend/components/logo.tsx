import { Code } from "@/components/icons"
import Link from "next/link"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-md p-1.5">
        <Code className="h-5 w-5" />
      </div>
      <span className="font-bold text-xl">Code Buddy</span>
    </Link>
  )
}

