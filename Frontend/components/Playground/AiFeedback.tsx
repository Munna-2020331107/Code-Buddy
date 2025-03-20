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

  const getAiFeedbackPrompt = (
    language: string,
    sourceCode: string,
    input: string,
    output: string,
    isError: boolean,
  ) => {
    return `
      You are an expert programming tutor. Analyze the following code and provide detailed feedback.
      
      Language: ${language}
      
      Code:
      \`\`\`${language}
      ${sourceCode}
      \`\`\`
      
      Input:
      \`\`\`
      ${input}
      \`\`\`
      
      Output:
      \`\`\`
      ${output}
      \`\`\`
      
      ${isError ? "The code produced an error. Please explain what went wrong and how to fix it." : ""}
      
      Please provide:
      1. A brief explanation of what the code does
      2. Analysis of the code quality and structure
      3. Suggestions for improvement
      4. ${isError ? "Detailed explanation of the error and how to fix it" : "Potential edge cases or bugs to watch out for"}
      5. Best practices that could be applied
      
      Format your response in markdown.
    `
  }

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
      // This is a mock implementation since we don't have the actual AI service
      // In a real implementation, you would call your AI service here
      setTimeout(() => {
        const mockResponse = `
## Code Analysis

### What the Code Does
This ${language} code ${isError ? "attempts to" : ""} ${language === "python" ? "generate a random number between 0 and 100 using the random module" : "creates a function that generates a random number between 0 and 100"}.

### Code Quality and Structure
${isError ? "The code has some issues that are causing errors:" : "The code is generally well-structured and follows basic conventions:"}
${isError ? "- Error in syntax or logic" : "- Good use of functions to encapsulate logic"}
${isError ? "- Possible missing imports or incorrect function calls" : "- Clear variable naming"}

### Suggestions for Improvement
1. Add comments to explain the purpose of the function
2. Consider adding parameter validation
3. Make the range configurable by accepting min/max parameters

${
  isError
    ? `### Error Explanation
The error appears to be ${output.includes("import") ? "related to missing imports" : "a syntax error"}. To fix this:
1. Check that all required modules are imported
2. Verify that function calls have the correct syntax
3. Ensure all variables are properly defined before use`
    : `### Potential Edge Cases
1. Consider what happens with very large ranges
2. Think about handling negative numbers if needed`
}

### Best Practices
1. Add error handling with try/catch blocks
2. Include unit tests to verify functionality
3. Consider using type hints or documentation for better code readability

I hope this helps! Let me know if you need more specific guidance.
        `

        setAiResponseText(mockResponse)
        setFeedbackText(mockResponse)
        setIsOpen(true)
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while generating feedback",
        variant: "destructive",
      })
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
      <Button variant="secondary" disabled={isLoading} className="w-full" onClick={handleAiFeedback}>
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
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            <Button variant="default" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AiFeedback

