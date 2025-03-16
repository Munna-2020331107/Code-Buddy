"use client"

import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownUp, AlertTriangle } from "lucide-react"

interface IOProps {
  input: string
  setInput: (input: string) => void
  output: string
  isError: boolean
}

const IO = ({ input, setInput, output, isError }: IOProps) => {
  return (
    <div className="space-y-4">
      <Card className="border border-primary/10">
        <CardHeader className="py-3 px-4 bg-muted/30">
          <CardTitle className="text-sm font-medium flex items-center">
            <ArrowDownUp className="h-4 w-4 mr-2 text-primary/70" />
            Input
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <Textarea
            id="input"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your input here..."
            className="w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          />
        </CardContent>
      </Card>

      <Card className={`border ${isError ? "border-red-500/50" : "border-primary/10"}`}>
        <CardHeader
          className={`py-3 px-4 ${isError ? "bg-red-500/10" : "bg-muted/30"} flex flex-row items-center justify-between`}
        >
          <CardTitle className="text-sm font-medium flex items-center">
            {isError ? (
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
            ) : (
              <ArrowDownUp className="h-4 w-4 mr-2 text-primary/70" />
            )}
            Output
          </CardTitle>
          {isError && <span className="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">Error</span>}
        </CardHeader>
        <CardContent className="p-3">
          <div
            className={`font-mono text-sm rounded-md p-2 ${isError ? "bg-red-500/5" : "bg-muted/20"} h-32 overflow-auto`}
          >
            {output ? (
              <pre className={isError ? "text-red-500" : ""}>{output}</pre>
            ) : (
              <div className="text-muted-foreground italic">Run your code to see output here</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default IO

