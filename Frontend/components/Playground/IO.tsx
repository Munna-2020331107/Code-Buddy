"use client"

import { Textarea } from "@/components/ui/textarea"
import { ArrowDownUp, AlertTriangle } from "@/components/icons"

interface IOProps {
  input: string
  setInput: (input: string) => void
  output: string
  isError: boolean
}

const IO = ({ input, setInput, output, isError }: IOProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center text-sm font-medium">
          <ArrowDownUp className="h-4 w-4 mr-2 text-primary/70" />
          Input
        </div>
        <Textarea
          id="input"
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your input here..."
          className="w-full resize-none border focus-visible:ring-1 focus-visible:ring-primary bg-card"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium">
            {isError ? (
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
            ) : (
              <ArrowDownUp className="h-4 w-4 mr-2 text-primary/70" />
            )}
            Output
          </div>
          {isError && <span className="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">Error</span>}
        </div>
        <div
          className={`font-mono text-sm rounded-md p-3 ${isError ? "bg-red-500/5 border border-red-500/30" : "bg-muted/20 border"} h-32 overflow-auto`}
        >
          {output ? (
            <pre className={isError ? "text-red-500" : ""}>{output}</pre>
          ) : (
            <div className="text-muted-foreground italic">Run your code to see output here</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IO

