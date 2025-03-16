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
import { CustomTabs, CustomTabsList, CustomTabsTrigger, CustomTabsContent } from "@/components/ui/custom-tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Braces, Terminal, Settings } from "lucide-react"

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
  const [activeTab, setActiveTab] = useState("editor")

  // Editor settings state
  const [editorTheme, setEditorTheme] = useState<EditorTheme>("dark")
  const [fontSize, setFontSize] = useState<FontSize>("14px")
  const [tabSize, setTabSize] = useState<TabSize>(2)

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
        <div className="lg:col-span-8">
          <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
            <CustomTabs defaultValue="editor" className="w-full" onValueChange={setActiveTab}>
              <div className="flex items-center justify-between p-2 bg-muted/50">
                <CustomTabsList className="bg-background/50">
                  <CustomTabsTrigger value="editor" className="data-[state=active]:bg-primary/10">
                    <Braces className="h-4 w-4 mr-2" />
                    Editor
                  </CustomTabsTrigger>
                  <CustomTabsTrigger value="console" className="data-[state=active]:bg-primary/10">
                    <Terminal className="h-4 w-4 mr-2" />
                    Console
                  </CustomTabsTrigger>
                  <CustomTabsTrigger value="settings" className="data-[state=active]:bg-primary/10">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </CustomTabsTrigger>
                </CustomTabsList>
                <div className="text-xs text-muted-foreground px-2 py-1 rounded bg-background/50">
                  {selectedLanguage
                    ? `${selectedLanguage} ${LANGUAGE_VERSIONS[selectedLanguage]}`
                    : "Select a language"}
                </div>
              </div>

              <CustomTabsContent value="editor" className="m-0">
                <div className="border-t">
                  <SimpleCodeEditor
                    value={value}
                    setValue={setValue}
                    selectedLanguage={selectedLanguage}
                    editorTheme={editorTheme}
                    fontSize={fontSize}
                    tabSize={tabSize}
                  />
                </div>
              </CustomTabsContent>

              <CustomTabsContent value="console" className="m-0">
                <div className="border-t p-4 h-[70vh] bg-gray-900 text-gray-100 font-mono text-sm overflow-auto">
                  {output ? (
                    <pre className={isError ? "text-red-400" : ""}>{output}</pre>
                  ) : (
                    <div className="text-gray-500 italic">Run your code to see output here</div>
                  )}
                </div>
              </CustomTabsContent>

              <CustomTabsContent value="settings" className="m-0">
                <div className="border-t p-6 h-[70vh] overflow-auto">
                  <h3 className="text-lg font-medium mb-4">Editor Settings</h3>
                  <p className="text-muted-foreground mb-6">Configure your editor preferences</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Theme</span>
                      <select
                        className="bg-background border rounded px-2 py-1"
                        value={editorTheme}
                        onChange={(e) => setEditorTheme(e.target.value as EditorTheme)}
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Font Size</span>
                      <select
                        className="bg-background border rounded px-2 py-1"
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value as FontSize)}
                      >
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tab Size</span>
                      <select
                        className="bg-background border rounded px-2 py-1"
                        value={tabSize}
                        onChange={(e) => setTabSize(Number.parseInt(e.target.value) as TabSize)}
                      >
                        <option value="2">2</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CustomTabsContent>
            </CustomTabs>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="border-2 border-primary/10 shadow-lg h-full">
            <CardContent className="p-4">
              {activeTab !== "console" && (
                <div className="space-y-4">
                  <IO input={input} setInput={setInput} output={output} isError={isError} />
                  <div className="grid grid-cols-1 gap-3 pt-3 border-t">
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
                </div>
              )}

              {activeTab === "console" && (
                <div className="h-full flex flex-col justify-center items-center p-6 text-center">
                  <Terminal className="h-12 w-12 text-primary/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Console View Active</h3>
                  <p className="text-muted-foreground">
                    You're currently viewing the console output in the main panel.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Playground

