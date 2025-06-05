"use client"

import { useEffect, useRef } from "react"
import Editor from "@monaco-editor/react"
import { useTheme } from "next-themes"

interface CodeEditorProps {
  language: string
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

export default function CodeEditor({ language, value, onChange, readOnly = false }: CodeEditorProps) {
  const { theme } = useTheme()
  const editorRef = useRef(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={(value) => onChange(value || "")}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          readOnly,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
          },
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  )
}

