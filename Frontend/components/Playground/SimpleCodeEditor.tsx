"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SimpleCodeEditorProps {
  value: string
  setValue: (value: string) => void
  selectedLanguage: string
  editorTheme?: "dark" | "light"
  fontSize?: string
  tabSize?: number
}

const SimpleCodeEditor = ({
  value,
  setValue,
  selectedLanguage,
  editorTheme = "dark",
  fontSize = "14px",
  tabSize = 2,
}: SimpleCodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Handle tab key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd

      // Insert spaces for tab
      const spaces = " ".repeat(tabSize)
      const newValue = value.substring(0, start) + spaces + value.substring(end)

      setValue(newValue)

      // Move cursor to the right position after inserting tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + tabSize
          textareaRef.current.selectionEnd = start + tabSize
        }
      }, 0)
    }
  }

  // Focus the textarea when language changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [selectedLanguage])

  return (
    <div className={cn("h-[70vh] overflow-hidden rounded-b-lg", editorTheme === "dark" ? "bg-[#1e1e2e]" : "bg-white")}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full h-full p-4 font-mono resize-none outline-none",
          "border-none focus:ring-0 focus:outline-none",
          editorTheme === "dark" ? "bg-[#1e1e2e] text-gray-200" : "bg-white text-gray-800",
          "transition-colors duration-200",
        )}
        style={{
          fontSize,
          lineHeight: "1.5",
          tabSize: `${tabSize}`,
        }}
        placeholder="// Select a language and start coding"
        spellCheck="false"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  )
}

export default SimpleCodeEditor

