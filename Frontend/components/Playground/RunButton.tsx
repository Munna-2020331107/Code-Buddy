"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { Play, AlertCircle } from "@/components/icons"

interface RunButtonProps {
  executeCode: (lang: string, code: string, input: string) => Promise<any>
  sourceCode: string
  input: string
  setOutput: (output: string) => void
  selectedLanguage: string
  setIsError: (isError: boolean) => void
}

const RunButton = ({ executeCode, sourceCode, input, setOutput, selectedLanguage, setIsError }: RunButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleRunCode = async () => {
    if (!selectedLanguage) {
      toast({
        title: "Language Required",
        description: "Please select a programming language first",
        variant: "destructive",
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }

    if (!sourceCode.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code to run",
        variant: "destructive",
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }

    try {
      setIsLoading(true)
      const result = await executeCode(selectedLanguage, sourceCode, input)

      if (result && result.run) {
        setOutput(result.run.output)

        if (result.run.stderr) {
          setIsError(true)
          toast({
            title: "Execution Error",
            description: "Your code ran with errors. Check the output for details.",
            variant: "destructive",
          })
        } else {
          setIsError(false)
          toast({
            title: "Success",
            description: "Your code executed successfully!",
            variant: "default",
          })
        }
      } else {
        setOutput("Error: Unexpected response format")
        setIsError(true)
        toast({
          title: "Execution Failed",
          description: "Received an unexpected response from the server",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Service Error",
        description: "Failed to execute code. Please try again later.",
        variant: "destructive",
      })
      setOutput("Error executing code. Please try again.")
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleRunCode} disabled={isLoading} className="glow-run-on-hover px-6 py-2 h-10" size="sm">
      {isLoading ? (
        <>
          <Spinner className="w-4 h-4 mr-2" />
          Running...
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          Run Code
        </>
      )}
    </Button>
  )
}

export default RunButton

