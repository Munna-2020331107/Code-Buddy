"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Sparkles, Download, Copy } from "@/components/icons"
import FeedbackContainer from "./FeedbackContainer"

interface AiFeedbackProps {
  language: string
  sourceCode: string
  input: string
  output: string
  isError: boolean
  setFeedbackText: (text: string) => void
}

const AiFeedback = ({ language, sourceCode, input, output, isError, setFeedbackText }: AiFeedbackProps) => {
  const [aiResponseText, setAiResponseText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleAiFeedback = async () => {
    setIsLoading(true)

    if (!language) {
      toast({
        title: "Language Required",
        description: "Please select a programming language first",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/code-execution`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          language,
          code: sourceCode,
          input,
          output,
          isError,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI feedback")
      }

      const result = await response.json()
      
      if (result.aiAnalysis) {
        const feedback = result.aiAnalysis.suggestions.join("\n\n")
        setAiResponseText(feedback)
        setFeedbackText(feedback)
        setIsOpen(true)
      } else {
        throw new Error("No AI analysis available")
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "An error occurred while generating feedback",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiResponseText)
    toast({
      title: "Copied",
      description: "Feedback copied to clipboard",
    })
  }

  return (
    <div>
      <Button 
        onClick={handleAiFeedback}
        disabled={isLoading} 
        className="w-full bg-secondary hover:bg-secondary/90"
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Analyzing Code...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Get AI Feedback
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Code Analysis
            </DialogTitle>
          </DialogHeader>
          <div className="bg-card/50 rounded-md p-1">
            <FeedbackContainer text={aiResponseText} />
          </div>
          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                onClick={copyToClipboard}
                className="bg-transparent hover:bg-transparent border border-input hover:bg-accent hover:text-accent-foreground"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button 
                className="bg-transparent hover:bg-transparent border border-input hover:bg-accent hover:text-accent-foreground"
              >
                <Download className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            <Button 
              onClick={() => setIsOpen(false)}
              className="bg-primary hover:bg-primary/90"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AiFeedback

