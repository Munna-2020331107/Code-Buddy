"use client"

import { useState } from "react"
import { LANGUAGE_VERSIONS } from "./LanguageVersions"
import AiFeedback from "./AiFeedback"
import PreviousFeedbackModal from "./PreviousFeedbackModal"
import IO from "./IO"
import RunButton from "./RunButton"
import LanguageSelector from "./LanguageSelector"
import SimpleCodeEditor from "./SimpleCodeEditor"
import "./Playground.css"
import { Card, CardContent } from "@/components/ui/card"
import { Braces, Terminal, Settings, Sun, Moon, Type } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define editor settings types
type EditorTheme = "dark" | "light"
type FontSize = "12px" | "14px" | "16px" | "18px"
type TabSize = 2 | 4

const Playground = () => {
  const [value, setValue] = useState("")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isError, setIsError] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")

  // Editor settings state
  const [editorTheme, setEditorTheme] = useState<EditorTheme>("dark")
  const [fontSize, setFontSize] = useState<FontSize>("14px")
  const [tabSize, setTabSize] = useState<TabSize>(2)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  const executeCode = async (lang: string, code: string, inp: string) => {
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: lang,
          version: LANGUAGE_VERSIONS[lang],
          files: [
            {
              content: code,
            },
          ],
          stdin: inp,
        }),
      })

      return await response.json()
    } catch (error) {
      console.error("Error executing code:", error)
      throw error
    }
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="w-full md:w-auto">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            setValue={setValue}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettingsDialog(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Editor Settings</span>
          </Button>
          <RunButton
            executeCode={executeCode}
            sourceCode={value}
            input={input}
            setOutput={setOutput}
            selectedLanguage={selectedLanguage}
            setIsError={setIsError}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Code Editor - Left Side */}
        <div className="lg:col-span-7">
          <Card className="border-2 border-primary/10 shadow-lg overflow-hidden h-full">
            <div className="flex items-center justify-between p-2 bg-muted/50">
              <div className="text-sm font-medium flex items-center">
                <Braces className="h-4 w-4 mr-2" />
                Code Editor
                {editorTheme === "dark" ? (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-gray-800 text-gray-200 rounded-full">Dark</span>
                ) : (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full">Light</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground px-2 py-1 rounded bg-background/50">
                {selectedLanguage ? `${selectedLanguage} ${LANGUAGE_VERSIONS[selectedLanguage]}` : "Select a language"}
              </div>
            </div>
            <div className="border-t h-[70vh]">
              <SimpleCodeEditor
                value={value}
                setValue={setValue}
                selectedLanguage={selectedLanguage}
                editorTheme={editorTheme}
                fontSize={fontSize}
                tabSize={tabSize}
              />
            </div>
          </Card>
        </div>

        {/* Input/Output and Feedback - Right Side */}
        <div className="lg:col-span-5">
          <div className="space-y-6">
            {/* Input/Output Section */}
            <Card className="border-2 border-primary/10 shadow-lg">
              <div className="p-2 bg-muted/50 border-b">
                <div className="text-sm font-medium flex items-center">
                  <Terminal className="h-4 w-4 mr-2" />
                  Input / Output
                </div>
              </div>
              <CardContent className="p-4">
                <IO input={input} setInput={setInput} output={output} isError={isError} />
              </CardContent>
            </Card>

            {/* AI Feedback Section */}
            <Card className="border-2 border-primary/10 shadow-lg">
              <div className="p-2 bg-muted/50 border-b">
                <div className="text-sm font-medium flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  AI Feedback
                </div>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-3">
                  <AiFeedback
                    language={selectedLanguage}
                    sourceCode={value}
                    input={input}
                    output={output}
                    isError={isError}
                    setFeedbackText={setFeedbackText}
                  />
                  <PreviousFeedbackModal text={feedbackText} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Editor Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Theme Setting */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-medium">Editor Theme</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant={editorTheme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditorTheme("light")}
                    className="w-24 h-24 flex flex-col gap-2"
                  >
                    <Sun className="h-8 w-8" />
                    <span>Light</span>
                  </Button>

                  <Button
                    variant={editorTheme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditorTheme("dark")}
                    className="w-24 h-24 flex flex-col gap-2"
                  >
                    <Moon className="h-8 w-8" />
                    <span>Dark</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Font Size Setting */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Type className="h-4 w-4" />
                Font Size
              </h3>
              <Select value={fontSize} onValueChange={(value) => setFontSize(value as FontSize)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12px">12px</SelectItem>
                  <SelectItem value="14px">14px</SelectItem>
                  <SelectItem value="16px">16px</SelectItem>
                  <SelectItem value="18px">18px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tab Size Setting */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Tab Size</h3>
              <div className="flex items-center gap-4">
                <Button
                  variant={tabSize === 2 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTabSize(2)}
                  className="w-16"
                >
                  2 spaces
                </Button>
                <Button
                  variant={tabSize === 4 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTabSize(4)}
                  className="w-16"
                >
                  4 spaces
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowSettingsDialog(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Playground

