"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import FeedbackContainer from "./FeedbackContainer"

interface PreviousFeedbackModalProps {
  text: string
}

const PreviousFeedbackModal = ({ text }: PreviousFeedbackModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="outline" disabled={!text} className="w-full" onClick={() => setIsOpen(true)}>
        Show Previous Feedback
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Previous AI Feedback</DialogTitle>
          </DialogHeader>
          <FeedbackContainer text={text} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PreviousFeedbackModal

