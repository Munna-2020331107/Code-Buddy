"use client"

import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { CODE_SNIPPETS, LANGUAGE_VERSIONS } from "./LanguageVersions"
import { Code, FileCode, Coffee, Hash, FileType, Database } from "@/components/icons"

interface LanguageSelectorProps {
  selectedLanguage: string
  setSelectedLanguage: (language: string) => void
  setValue: (value: string) => void
}

const LanguageSelector = ({ selectedLanguage, setSelectedLanguage, setValue }: LanguageSelectorProps) => {
  const languages = Object.entries(LANGUAGE_VERSIONS).filter(([lang]) => lang !== "text" && lang !== "json")

  const updateLanguage = (language: string) => {
    setSelectedLanguage(language)
    setValue(CODE_SNIPPETS[language] || "")
  }

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case "javascript":
        return <Code className="h-4 w-4 text-yellow-400" />
      case "python":
        return <FileCode className="h-4 w-4 text-blue-500" />
      case "java":
        return <Coffee className="h-4 w-4 text-orange-600" />
      case "cpp":
        return <FileType className="h-4 w-4 text-blue-700" />
      case "csharp":
        return <Hash className="h-4 w-4 text-purple-600" />
      case "php":
        return <Database className="h-4 w-4 text-indigo-500" />
      default:
        return <Code className="h-4 w-4" />
    }
  }

  return (
    <div>
      <Select onValueChange={updateLanguage} defaultValue={selectedLanguage}>
        <SelectTrigger className="w-full md:w-[240px] border-2 border-primary/10 bg-card">
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map(([language, version]) => (
            <SelectItem key={language} value={language} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {getLanguageIcon(language)}
                <span className={language === selectedLanguage ? "font-bold" : ""}>
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">{version}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default LanguageSelector

