"use client"

interface FeedbackContainerProps {
  text: string
}

const FeedbackContainer = ({ text }: FeedbackContainerProps) => {
  return (
    <div className="feedback-container prose prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }} />
    </div>
  )
}

// Simple markdown formatter (in a real app, use a proper markdown library)
function formatMarkdown(text: string): string {
  if (!text) return ""

  // Convert headers
  text = text.replace(/^### (.*$)/gim, "<h3>$1</h3>")
  text = text.replace(/^## (.*$)/gim, "<h2>$1</h2>")
  text = text.replace(/^# (.*$)/gim, "<h1>$1</h1>")

  // Convert lists
  text = text.replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
  text = text.replace(/^- (.*$)/gim, "<li>$1</li>")

  // Wrap lists
  text = text.replace(/<\/li>\n<li>/g, "</li><li>")
  text = text.replace(/<li>(.*?)<\/li>/gs, "<ul>$&</ul>")
  text = text.replace(/<\/ul>\n<ul>/g, "")

  // Convert code blocks
  text = text.replace(/```(.*?)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")

  // Convert inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>")

  // Convert paragraphs
  text = text.replace(/\n\n/g, "</p><p>")
  text = text.replace(/^([^<].*)/gim, "<p>$1</p>")

  // Clean up extra paragraph tags
  text = text.replace(/<\/p><p><\/p><p>/g, "</p><p>")
  text = text.replace(/<p><\/p>/g, "")

  return text
}

export default FeedbackContainer

