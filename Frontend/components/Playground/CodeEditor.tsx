"use client"

import { useRef, useEffect } from "react"
import Editor from "@monaco-editor/react"

interface CodeEditorProps {
  value: string
  setValue: (value: string) => void
  selectedLanguage: string
  editorTheme?: "dark" | "light"
  fontSize?: string
  tabSize?: number
}

const CodeEditor = ({
  value,
  setValue,
  selectedLanguage,
  editorTheme = "dark",
  fontSize = "14px",
  tabSize = 2,
}: CodeEditorProps) => {
  const editorRef = useRef(null)
  const monacoRef = useRef(null)

  // Extract numeric value from fontSize (e.g., '14px' -> 14)
  const fontSizeNumeric = Number.parseInt(fontSize.replace("px", ""))

  const onMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    editor.focus()

    // Initial editor customizations will be updated in useEffect
  }

  // Update editor options when settings change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: fontSizeNumeric,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        tabSize: tabSize,
        minimap: {
          enabled: true,
          scale: 0.75,
          showSlider: "mouseover",
        },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        bracketPairColorization: {
          enabled: true,
        },
        padding: {
          top: 16,
          bottom: 16,
        },
      })
    }
  }, [fontSizeNumeric, tabSize])

  // Handle editor theme setup
  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme("codebuddyDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a9955", fontStyle: "italic" },
        { token: "keyword", foreground: "c586c0", fontStyle: "bold" },
        { token: "string", foreground: "ce9178" },
        { token: "number", foreground: "b5cea8" },
      ],
      colors: {
        "editor.background": "#1e1e2e",
        "editor.foreground": "#d4d4d4",
        "editorCursor.foreground": "#a78bfa",
        "editor.lineHighlightBackground": "#2d2d3d",
        "editorLineNumber.foreground": "#6b7280",
        "editor.selectionBackground": "#483d8b40",
        "editor.inactiveSelectionBackground": "#3a3a4a",
      },
    })

    monaco.editor.defineTheme("codebuddyLight", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "008000", fontStyle: "italic" },
        { token: "keyword", foreground: "0000ff", fontStyle: "bold" },
        { token: "string", foreground: "a31515" },
        { token: "number", foreground: "098658" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#000000",
        "editorCursor.foreground": "#7c3aed",
        "editor.lineHighlightBackground": "#f3f4f6",
        "editorLineNumber.foreground": "#6b7280",
        "editor.selectionBackground": "#d8b4fe40",
        "editor.inactiveSelectionBackground": "#e9d5ff40",
      },
    })
  }

  // Determine which theme to use
  const theme = editorTheme === "dark" ? "codebuddyDark" : "codebuddyLight"

  return (
    <div className="rounded-lg overflow-hidden h-[70vh]">
      <Editor
        height="100%"
        language={selectedLanguage || "javascript"}
        theme={theme}
        defaultValue="// Select a language and start coding"
        value={value}
        onChange={(value) => setValue(value || "")}
        onMount={onMount}
        beforeMount={handleEditorWillMount}
        options={{
          fontSize: fontSizeNumeric,
          tabSize: tabSize,
        }}
        loading={
          <div
            className={`h-full w-full flex items-center justify-center ${editorTheme === "dark" ? "bg-[#1e1e2e]" : "bg-white"}`}
          >
            <div className="animate-pulse text-primary/50">Loading editor...</div>
          </div>
        }
      />
    </div>
  )
}

export default CodeEditor

