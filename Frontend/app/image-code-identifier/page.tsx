"use client"

import type React from "react"
import type { JSX } from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import SimpleCodeEditor from "@/components/Playground/SimpleCodeEditor"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import RunButton from "@/components/Playground/RunButton"
import AiFeedback from "@/components/Playground/AiFeedback"
import { LANGUAGE_VERSIONS } from "@/components/Playground/LanguageVersions"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import "./styles.css"
import { formatMarkdown } from "@/lib/utils"
import { Upload, ImageIcon, Code, Zap, Sparkles, FileText } from "@/components/icons"

export default function ImageCodeIdentifierPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [extractedCode, setExtractedCode] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [output, setOutput] = useState("")
  const [isError, setIsError] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [previousFeedback, setPreviousFeedback] = useState<string[]>([])
  const [isCodeExecutionDialogOpen, setIsCodeExecutionDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [convertedImages, setConvertedImages] = useState<any[]>([])
  const [isViewImagesDialogOpen, setIsViewImagesDialogOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Use the environment variable for the API base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Create a URL for the image preview
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)

    // Upload to imgbb
    setIsProcessing(true)
    try {
      const imgbbUrl = await uploadToImgbb(file)
      setImageUrl(imgbbUrl)

      // Once we have the image URL, send it to the backend for code extraction
      await extractCodeFromImage(imgbbUrl)
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Function to upload image to imgbb
  const uploadToImgbb = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch('https://api.imgbb.com/1/upload?key=1ffb1fe59f5b7f45243c3423aab3a7aa', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    if (data.success) {
      return data.data.url
    } else {
      throw new Error('Failed to upload image to imgbb')
    }
  }

  // Function to fetch all converted images
  const fetchConvertedImages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/image-to-code`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setConvertedImages(data)
    } catch (error) {
      console.error('Error fetching converted images:', error)
      toast({
        title: "Error",
        description: "Failed to fetch converted images",
        variant: "destructive",
      })
    }
  }

  // Update the extractCodeFromImage function to use your backend API
  const extractCodeFromImage = async (imageUrl: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`${API_URL}/api/image-to-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ imageUrl })
      })
      
      const data = await response.json()
      if (data.status === 'processing') {
        // Poll for status updates
        const pollInterval = setInterval(async () => {
          const statusResponse = await fetch(`${API_URL}/api/image-to-code/${data._id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          const statusData = await statusResponse.json()
          
          if (statusData.status === 'completed') {
            clearInterval(pollInterval)
            setExtractedCode(statusData.convertedCode)
            setIsProcessing(false)
            toast({
              title: "Success",
              description: "Code has been extracted from the image",
            })
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval)
            setIsProcessing(false)
            toast({
              title: "Error",
              description: "Failed to extract code from image",
              variant: "destructive",
            })
          }
        }, 2000) // Poll every 2 seconds
      }
    } catch (error) {
      console.error('Error extracting code:', error)
      setIsProcessing(false)
      toast({
        title: "Error",
        description: "Failed to extract code from image",
        variant: "destructive",
      })
    }
  }

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language)

    // If code has already been extracted, update it for the new language
    if (imageUrl) {
      // Simulate OCR for the new language
      setIsProcessing(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await extractCodeFromImage(imageUrl)

      toast({
        title: "Language Changed",
        description: `Code converted to ${language}`,
      })
    }
  }

  const executeCode = async (lang: string, code: string, inp: string) => {
    if (!(lang in LANGUAGE_VERSIONS)) {
      throw new Error(`Unsupported language: ${lang}`);
    }
    const validLang = lang as keyof typeof LANGUAGE_VERSIONS;
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: validLang,
          version: LANGUAGE_VERSIONS[validLang],
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

  const handleRunCode = async () => {
    if (!extractedCode) {
      toast({
        title: "No code to run",
        description: "Please extract code from an image first",
        variant: "destructive",
      })
      return
    }

    setIsCodeExecutionDialogOpen(true)
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 mb-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Image Code Identifier
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-6">
          Extract, identify, and run code from images with our advanced OCR technology.
        </p>

        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <ImageIcon width={18} height={18} className="text-primary" />
            <span className="text-sm font-medium">Image Upload</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <FileText width={18} height={18} className="text-primary" />
            <span className="text-sm font-medium">OCR Extraction</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Code width={18} height={18} className="text-primary" />
            <span className="text-sm font-medium">Multi-language Support</span>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-8 flex gap-4">
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <Button
          onClick={handleUploadButtonClick}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
          size="lg"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Spinner className="mr-2 h-5 w-5" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Upload Image with Code
            </>
          )}
        </Button>
        
        <Button
          onClick={() => {
            fetchConvertedImages()
            setIsViewImagesDialogOpen(true)
          }}
          variant="outline"
          size="lg"
        >
          <ImageIcon className="mr-2 h-5 w-5" />
          View Converted Images
        </Button>
      </div>

      {/* Main Content */}
      {!selectedImage ? (
        <div className="bg-card rounded-xl border shadow-lg p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">No Image Selected</h2>
            <p className="text-muted-foreground max-w-md">
              Upload an image containing code to extract and analyze it. Our AI will automatically detect and extract
              the code.
            </p>
            <Button onClick={handleUploadButtonClick} variant="outline" className="mt-4">
              <Upload className="mr-2 h-4 w-4" />
              Select Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Image */}
          <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
            <div className="bg-muted/50 p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center">
                  <ImageIcon width={18} height={18} className="h-5 w-5 mr-2 text-primary" />
                  Uploaded Image
                </h2>
              </div>
            </div>
            <CardContent className="p-4 flex items-center justify-center">
              <div className="relative w-full">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Uploaded code"
                  className="w-full h-auto max-h-[50vh] object-contain rounded-md border border-border"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Spinner className="w-10 h-10 text-primary mb-4" />
                    <p className="text-sm font-medium">Processing image...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Extracted Code */}
          <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
            <Tabs defaultValue="extracted" className="w-full">
              <div className="bg-muted/50 p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Code width={18} height={18} className="h-5 w-5 mr-2 text-primary" />
                      Extracted Code
                    </h2>
                  </div>
                  <Button
                    onClick={handleRunCode}
                    size="sm"
                    className="glow-run-on-hover"
                    disabled={isProcessing || !extractedCode}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Run Code
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <TabsList className="bg-background/50">
                    <TabsTrigger value="extracted" className="data-[state=active]:bg-primary/10">
                      <Code width={18} height={18} className="h-4 w-4 mr-2" />
                      Code Editor
                    </TabsTrigger>
                  </TabsList>

                  {/* Language Selector */}
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LANGUAGE_VERSIONS)
                        .filter(([lang]) => lang !== "text" && lang !== "json")
                        .map(([lang, version]) => (
                          <SelectItem key={lang} value={lang} className="text-xs">
                            {lang.charAt(0).toUpperCase() + lang.slice(1)} ({version})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="extracted" className="m-0">
                {isProcessing ? (
                  <div className="h-[50vh] flex flex-col items-center justify-center">
                    <Spinner className="w-10 h-10 text-primary mb-4" />
                    <p className="text-muted-foreground">Extracting code from image...</p>
                    <p className="text-xs text-muted-foreground mt-2">Using OCR to convert image to text</p>
                  </div>
                ) : !extractedCode ? (
                  <div className="h-[50vh] flex flex-col items-center justify-center">
                    <FileText width={18} height={18} className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No code extracted yet</p>
                    <p className="text-xs text-muted-foreground mt-2">Upload an image to extract code</p>
                  </div>
                ) : (
                  <div className="h-[50vh]">
                    <SimpleCodeEditor
                      value={extractedCode}
                      setValue={setExtractedCode}
                      selectedLanguage={selectedLanguage}
                      editorTheme="dark"
                      fontSize="14px"
                      tabSize={2}
                    />
                  </div>
                )}
              </TabsContent>

              {/* AI Feedback Section */}
              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    AI Code Analysis
                  </h3>

                  {previousFeedback.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDialogOpen(true)}
                      className="text-xs h-7 px-2"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Previous Feedback
                    </Button>
                  )}
                </div>
                <AiFeedback
                  language={selectedLanguage}
                  sourceCode={extractedCode}
                  input=""
                  output={output}
                  isError={isError}
                  setFeedbackText={(text) => {
                    setFeedbackText(text)
                    if (text) {
                      setPreviousFeedback((prev) => [text, ...prev.slice(0, 4)])
                    }
                  }}
                />
              </div>
            </Tabs>
          </Card>
        </div>
      )}

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ImageIcon width={24} height={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Image Upload</h3>
          <p className="text-muted-foreground">
            Upload images containing code snippets directly from your device. We support various image formats.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText width={24} height={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">OCR Text Extraction</h3>
          <p className="text-muted-foreground">
            Our OCR technology converts your code images into editable text that you can run and modify.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Code width={24} height={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Multi-language Support</h3>
          <p className="text-muted-foreground">
            Select from various programming languages including JavaScript, Python, Java, and more to properly execute
            your code.
          </p>
        </div>
      </div>

      {/* Code Execution Dialog */}
      <Dialog open={isCodeExecutionDialogOpen} onOpenChange={setIsCodeExecutionDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Code Execution
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-muted/30 rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Extracted Code ({selectedLanguage})</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">{extractedCode}</pre>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Output</h3>
              <RunButton
                executeCode={executeCode}
                sourceCode={extractedCode}
                input=""
                setOutput={setOutput}
                selectedLanguage={selectedLanguage}
                setIsError={setIsError}
              />
            </div>

            <div
              className={`border rounded-md p-4 min-h-[100px] font-mono text-sm whitespace-pre-wrap ${
                isError ? "border-red-500 bg-red-500/5 text-red-500" : ""
              }`}
            >
              {output || <span className="text-muted-foreground italic">Run the code to see output here</span>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCodeExecutionDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Previous Feedback Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Previous AI Feedback
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {previousFeedback.length > 0 ? (
              previousFeedback.map((feedback, index) => (
                <div key={index} className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    Feedback #{previousFeedback.length - index}
                  </h3>
                  <div className="bg-card/50 rounded-md p-1">
                    <div className="feedback-container prose prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: formatMarkdown(feedback) }} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-10 w-10 mx-auto mb-4 opacity-50" />
                <p>No previous feedback available</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add View Images Dialog */}
      <Dialog open={isViewImagesDialogOpen} onOpenChange={setIsViewImagesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Converted Images
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {convertedImages.length > 0 ? (
              convertedImages.map((image) => (
                <Card key={image._id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="aspect-video relative mb-4">
                      <img
                        src={image.imageUrl}
                        alt="Converted code"
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Status: {image.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(image.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {image.convertedCode && (
                        <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto">
                          {image.convertedCode}
                        </pre>
                      )}
                      {image.status === 'failed' && image.error && (
                        <div className="text-red-500 text-sm">
                          Error: {image.error.message}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No converted images found
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewImagesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

