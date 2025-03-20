"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import SimpleCodeEditor from "@/components/Playground/SimpleCodeEditor"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import RunButton from "@/components/Playground/RunButton"
import AiFeedback from "@/components/Playground/AiFeedback"
import { LANGUAGE_VERSIONS } from "@/components/Playground/LanguageVersions"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import "./styles.css"
import { formatMarkdown } from "@/lib/utils"
import { Upload, ImageIcon, Code, Zap, Sparkles, Crop, Check, X, FileText, Move, Maximize } from "@/components/icons"

export default function ImageCodeIdentifierPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [extractedCode, setExtractedCode] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [output, setOutput] = useState("")
  const [isError, setIsError] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [previousFeedback, setPreviousFeedback] = useState<string[]>([])

  // Professional cropping states
  const [isCropping, setIsCropping] = useState(false)
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null)
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [showCropConfirm, setShowCropConfirm] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  const [cropMode, setCropMode] = useState<"draw" | "move" | "resize">("draw")
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [cropBoxDimensions, setCropBoxDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isCodeExecutionDialogOpen, setIsCodeExecutionDialogOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cropContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Effect to calculate dimensions when cropBox changes
  useEffect(() => {
    if (cropBox && imageRef.current) {
      const imgWidth = imageRef.current.naturalWidth
      const imgHeight = imageRef.current.naturalHeight

      const pixelWidth = Math.round((cropBox.width / 100) * imgWidth)
      const pixelHeight = Math.round((cropBox.height / 100) * imgHeight)

      setCropBoxDimensions({ width: pixelWidth, height: pixelHeight })
    } else {
      setCropBoxDimensions(null)
    }
  }, [cropBox])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create a URL for the image
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)

    // Reset states
    setCroppedImage(null)
    setExtractedCode("")
    setCropBox(null)
    setCropStart(null)
    setCropEnd(null)
    setIsCropping(false)
    setCropMode("draw")

    toast({
      title: "Image Uploaded",
      description: 'Use the "Crop Code Region" button to select the code area',
    })
  }

  // Start professional cropping
  const startCropping = () => {
    setIsCropping(true)
    setCropStart(null)
    setCropEnd(null)
    setCropBox(null)
    setCropMode("draw")

    toast({
      title: "Cropping Mode Active",
      description: "Draw a rectangle to select the code region",
    })
  }

  // Cancel cropping
  const cancelCropping = () => {
    setIsCropping(false)
    setCropStart(null)
    setCropEnd(null)
    setCropBox(null)
    setShowCropConfirm(false)
    setCropMode("draw")
  }

  // Set crop mode
  const changeCropMode = (mode: "draw" | "move" | "resize") => {
    setCropMode(mode)

    // Show toast with instructions
    if (mode === "draw") {
      toast({
        title: "Draw Mode",
        description: "Click and drag to create a selection",
      })
    } else if (mode === "move") {
      toast({
        title: "Move Mode",
        description: "Click and drag to move the selection",
      })
    } else if (mode === "resize") {
      toast({
        title: "Resize Mode",
        description: "Drag the handles to resize the selection",
      })
    }
  }

  // Handle mouse down event for cropping
  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !cropContainerRef.current) return

    const rect = cropContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Check if we're clicking on an existing crop box
    if (cropBox && cropMode !== "draw") {
      setIsDragging(true)
      setDragStartPos({ x, y })

      // Check if we're clicking on a resize handle
      if (cropMode === "resize") {
        // Determine which handle was clicked
        const handleSize = 10 // Size of the handle in percentage
        const handles = [
          { name: "top-left", x: cropBox.x, y: cropBox.y },
          { name: "top-right", x: cropBox.x + cropBox.width, y: cropBox.y },
          { name: "bottom-left", x: cropBox.x, y: cropBox.y + cropBox.height },
          { name: "bottom-right", x: cropBox.x + cropBox.width, y: cropBox.y + cropBox.height },
          { name: "top", x: cropBox.x + cropBox.width / 2, y: cropBox.y },
          { name: "right", x: cropBox.x + cropBox.width, y: cropBox.y + cropBox.height / 2 },
          { name: "bottom", x: cropBox.x + cropBox.width / 2, y: cropBox.y + cropBox.height },
          { name: "left", x: cropBox.x, y: cropBox.y + cropBox.height / 2 },
        ]

        for (const handle of handles) {
          const distance = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2))
          if (distance < handleSize / 2) {
            setResizeHandle(handle.name)
            break
          }
        }
      }

      return
    }

    // Start drawing a new crop box
    if (cropMode === "draw") {
      setCropStart({ x, y })
      setCropEnd({ x, y }) // Initialize end to same as start
      setCropBox({
        x: x,
        y: y,
        width: 0,
        height: 0,
      })
      setIsDragging(true)
    }
  }

  // Handle mouse move event for cropping
  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !cropContainerRef.current || !isDragging) return

    const rect = cropContainerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))

    // Handle different crop modes
    if (cropMode === "draw" && cropStart) {
      setCropEnd({ x, y })

      // Calculate crop box dimensions
      const left = Math.min(cropStart.x, x)
      const top = Math.min(cropStart.y, y)
      const width = Math.abs(x - cropStart.x)
      const height = Math.abs(y - cropStart.y)

      setCropBox({ x: left, y: top, width, height })
    } else if (cropMode === "move" && dragStartPos && cropBox) {
      // Move the crop box
      const deltaX = x - dragStartPos.x
      const deltaY = y - dragStartPos.y

      // Calculate new position, ensuring it stays within bounds
      const newX = Math.max(0, Math.min(100 - cropBox.width, cropBox.x + deltaX))
      const newY = Math.max(0, Math.min(100 - cropBox.height, cropBox.y + deltaY))

      setCropBox({
        ...cropBox,
        x: newX,
        y: newY,
      })

      setDragStartPos({ x, y })
    } else if (cropMode === "resize" && resizeHandle && cropBox) {
      // Resize the crop box based on which handle is being dragged
      let newBox = { ...cropBox }

      switch (resizeHandle) {
        case "top-left":
          newBox = {
            x: Math.min(cropBox.x + cropBox.width, x),
            y: Math.min(cropBox.y + cropBox.height, y),
            width: Math.max(0, cropBox.x + cropBox.width - x),
            height: Math.max(0, cropBox.y + cropBox.height - y),
          }
          break
        case "top-right":
          newBox = {
            x: cropBox.x,
            y: Math.min(cropBox.y + cropBox.height, y),
            width: Math.max(0, x - cropBox.x),
            height: Math.max(0, cropBox.y + cropBox.height - y),
          }
          break
        case "bottom-left":
          newBox = {
            x: Math.min(cropBox.x + cropBox.width, x),
            y: cropBox.y,
            width: Math.max(0, cropBox.x + cropBox.width - x),
            height: Math.max(0, y - cropBox.y),
          }
          break
        case "bottom-right":
          newBox = {
            x: cropBox.x,
            y: cropBox.y,
            width: Math.max(0, x - cropBox.x),
            height: Math.max(0, y - cropBox.y),
          }
          break
        case "top":
          newBox = {
            x: cropBox.x,
            y: Math.min(cropBox.y + cropBox.height, y),
            width: cropBox.width,
            height: Math.max(0, cropBox.y + cropBox.height - y),
          }
          break
        case "right":
          newBox = {
            x: cropBox.x,
            y: cropBox.y,
            width: Math.max(0, x - cropBox.x),
            height: cropBox.height,
          }
          break
        case "bottom":
          newBox = {
            x: cropBox.x,
            y: cropBox.y,
            width: cropBox.width,
            height: Math.max(0, y - cropBox.y),
          }
          break
        case "left":
          newBox = {
            x: Math.min(cropBox.x + cropBox.width, x),
            y: cropBox.y,
            width: Math.max(0, cropBox.x + cropBox.width - x),
            height: cropBox.height,
          }
          break
      }

      // Ensure the box stays within bounds
      newBox.x = Math.max(0, Math.min(100, newBox.x))
      newBox.y = Math.max(0, Math.min(100, newBox.y))
      newBox.width = Math.max(0, Math.min(100 - newBox.x, newBox.width))
      newBox.height = Math.max(0, Math.min(100 - newBox.y, newBox.height))

      setCropBox(newBox)
    }
  }

  // Handle mouse up event for cropping
  const handleCropMouseUp = () => {
    if (!isCropping) return

    setIsDragging(false)
    setResizeHandle(null)

    // If we just finished drawing and the selection is too small, show a message
    if (cropMode === "draw" && cropBox && (cropBox.width < 5 || cropBox.height < 5)) {
      toast({
        title: "Selection too small",
        description: "Please make a larger selection or click to create a default selection",
        variant: "destructive",
      })

      // Create a default selection if it was just a click
      if (cropBox.width < 1 && cropBox.height < 1 && cropStart) {
        const defaultSize = 20 // Default size in percentage
        const x = cropStart.x
        const y = cropStart.y

        // Ensure the box stays within bounds
        const boxX = Math.max(0, Math.min(100 - defaultSize, x - defaultSize / 2))
        const boxY = Math.max(0, Math.min(100 - defaultSize, y - defaultSize / 2))

        setCropBox({
          x: boxX,
          y: boxY,
          width: defaultSize,
          height: defaultSize,
        })

        // Show confirmation dialog
        setShowCropConfirm(true)
      }

      return
    }

    // If we just finished drawing and the selection is valid, switch to move mode
    if (cropMode === "draw" && cropBox && cropBox.width >= 5 && cropBox.height >= 5) {
      setCropMode("move")

      // Show confirmation dialog
      setShowCropConfirm(true)
    }
  }

  // Apply the crop and extract code
  const applyCrop = () => {
    if (!cropBox || !imageRef.current || !canvasRef.current) {
      toast({
        title: "No selection made",
        description: "Please select a region of the image first",
        variant: "destructive",
      })
      return
    }

    // Create cropped image
    createCroppedImage()

    // Exit cropping mode
    setIsCropping(false)
    setShowCropConfirm(false)
    setCropMode("draw")

    // Simulate OCR processing
    setIsExtracting(true)
    setTimeout(() => {
      extractTextFromImage()
      setIsExtracting(false)
    }, 2000)
  }

  // Create cropped image from selection
  const createCroppedImage = () => {
    if (!imageRef.current || !canvasRef.current || !cropBox) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Get image dimensions
    const imgWidth = imageRef.current.naturalWidth
    const imgHeight = imageRef.current.naturalHeight

    // Calculate crop dimensions in pixels
    const cropX = (cropBox.x / 100) * imgWidth
    const cropY = (cropBox.y / 100) * imgHeight
    const cropWidth = (cropBox.width / 100) * imgWidth
    const cropHeight = (cropBox.height / 100) * imgHeight

    // Set canvas dimensions
    canvas.width = cropWidth
    canvas.height = cropHeight

    // Draw the cropped region onto the canvas
    ctx.drawImage(imageRef.current, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height)

    // Convert canvas to data URL
    const croppedImageUrl = canvas.toDataURL("image/png")
    setCroppedImage(croppedImageUrl)
  }

  // Simulate OCR to extract text from the cropped image
  const extractTextFromImage = () => {
    // In a real application, this would call an OCR service
    // For this demo, we'll simulate OCR by generating text based on the image

    // Generate a random code snippet based on the selected language
    // This simulates what an OCR service would return
    let extractedText = ""

    // Simulate different code patterns based on language
    if (selectedLanguage === "javascript") {
      extractedText = `// Extracted from image using OCR
function calculateArea(width, height) {
  return width * height;
}

const width = 10;
const height = 5;
const area = calculateArea(width, height);
console.log(\`The area is \${area} square units\`);`
    } else if (selectedLanguage === "python") {
      extractedText = `# Extracted from image using OCR
def calculate_area(width, height):
  return width * height

width = 10
height = 5
area = calculate_area(width, height)
print(f"The area is {area} square units")`
    } else if (selectedLanguage === "java") {
      extractedText = `// Extracted from image using OCR
public class AreaCalculator {
  public static void main(String[] args) {
      int width = 10;
      int height = 5;
      int area = calculateArea(width, height);
      System.out.println("The area is " + area + " square units");
  }
  
  public static int calculateArea(int width, int height) {
      return width * height;
  }
}`
    } else {
      // Default for other languages
      extractedText = `// Extracted from image using OCR
// Code appears to be in ${selectedLanguage}
// This is a simulation of OCR text extraction
// In a real application, the actual text from the image would be extracted`
    }

    // Set the extracted code
    setExtractedCode(extractedText)

    toast({
      title: "Code Extracted",
      description: "Code has been extracted from the image",
    })
  }

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)

    // If code has already been extracted, update it for the new language
    if (croppedImage) {
      // Simulate OCR for the new language
      setIsExtracting(true)
      setTimeout(() => {
        extractTextFromImage()
        setIsExtracting(false)

        toast({
          title: "Language Changed",
          description: `Code converted to ${language}`,
        })
      }, 1000)
    }
  }

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

  // Function to auto-fit the crop box to detect code regions
  const autoDetectCode = () => {
    if (!imageRef.current || !cropContainerRef.current) return

    // In a real application, this would use computer vision to detect code regions
    // For this demo, we'll simulate by creating a crop box in the center

    toast({
      title: "Auto-detecting Code",
      description: "Analyzing image for code regions...",
    })

    // Simulate processing delay
    setTimeout(() => {
      // Create a crop box that covers 70% of the image, centered
      setCropBox({
        x: 15,
        y: 15,
        width: 70,
        height: 70,
      })

      // Show confirmation dialog
      setShowCropConfirm(true)

      toast({
        title: "Code Region Detected",
        description: "A potential code region has been identified. You can adjust it if needed.",
      })
    }, 1500)
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
          Extract, identify, and run code from images with our professional cropping tool.
        </p>

        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <ImageIcon size={18} className="text-primary" />
            <span className="text-sm font-medium">Image Upload</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Crop size={18} className="text-primary" />
            <span className="text-sm font-medium">Professional Cropping</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <FileText size={18} className="text-primary" />
            <span className="text-sm font-medium">OCR Extraction</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Code size={18} className="text-primary" />
            <span className="text-sm font-medium">Multi-language Support</span>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-8">
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <Button
          onClick={handleUploadButtonClick}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
          size="lg"
        >
          <Upload className="mr-2 h-5 w-5" />
          Upload Image with Code
        </Button>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Content */}
      {!selectedImage ? (
        <div className="bg-card rounded-xl border shadow-lg p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">No Image Selected</h2>
            <p className="text-muted-foreground max-w-md">
              Upload an image containing code to extract and analyze it. You can then use our professional cropping
              tools to select the code region.
            </p>
            <Button onClick={handleUploadButtonClick} variant="outline" className="mt-4">
              <Upload className="mr-2 h-4 w-4" />
              Select Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Image with Cropping */}
          <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
            <div className="bg-muted/50 p-4 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2 text-primary" />
                  Original Image
                </h2>

                {/* Cropping Controls */}
                {isCropping ? (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={applyCrop}
                      size="sm"
                      variant="default"
                      disabled={!cropBox || cropBox.width < 5 || cropBox.height < 5}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Apply Crop
                    </Button>
                    <Button onClick={cancelCropping} size="sm" variant="outline">
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={startCropping}
                      size="sm"
                      variant={croppedImage ? "outline" : "default"}
                      className="flex items-center gap-1"
                      disabled={isExtracting}
                    >
                      <Crop className="h-4 w-4 mr-1" />
                      {croppedImage ? "Crop Again" : "Manual Crop"}
                    </Button>
                    <Button
                      onClick={autoDetectCode}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      disabled={isExtracting || isCropping}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Auto-detect
                    </Button>
                  </div>
                )}
              </div>

              {/* Cropping Mode Controls */}
              {isCropping && cropBox && (cropBox.width >= 5 || cropBox.height >= 5) && (
                <div className="flex items-center justify-center gap-2 p-2 bg-background/50 rounded-md mb-2">
                  <Button
                    size="sm"
                    variant={cropMode === "draw" ? "default" : "outline"}
                    className="h-8 px-2"
                    onClick={() => changeCropMode("draw")}
                  >
                    <Crop className="h-4 w-4 mr-1" />
                    Draw
                  </Button>
                  <Button
                    size="sm"
                    variant={cropMode === "move" ? "default" : "outline"}
                    className="h-8 px-2"
                    onClick={() => changeCropMode("move")}
                  >
                    <Move className="h-4 w-4 mr-1" />
                    Move
                  </Button>
                  <Button
                    size="sm"
                    variant={cropMode === "resize" ? "default" : "outline"}
                    className="h-8 px-2"
                    onClick={() => changeCropMode("resize")}
                  >
                    <Maximize className="h-4 w-4 mr-1" />
                    Resize
                  </Button>
                </div>
              )}

              {/* Crop Box Dimensions */}
              {isCropping && cropBoxDimensions && (
                <div className="text-xs text-center text-muted-foreground bg-background/50 rounded-md p-1 mb-2">
                  Selection: {cropBoxDimensions.width} × {cropBoxDimensions.height} px
                </div>
              )}
            </div>
            <CardContent className="p-0">
              <div
                ref={cropContainerRef}
                className={`relative image-container ${isCropping ? `cropping-active cropping-mode-${cropMode}` : ""}`}
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={() => {
                  if (isDragging) {
                    setIsDragging(false)
                    setResizeHandle(null)
                  }
                }}
              >
                <img
                  ref={imageRef}
                  src={selectedImage || "/placeholder.svg"}
                  alt="Uploaded code"
                  className="w-full h-auto max-h-[50vh] object-contain p-4"
                />

                {/* Manual crop overlay */}
                {isCropping && cropBox && cropBox.width > 0 && cropBox.height > 0 && (
                  <div
                    className="professional-crop-box"
                    style={{
                      left: `${cropBox.x}%`,
                      top: `${cropBox.y}%`,
                      width: `${cropBox.width}%`,
                      height: `${cropBox.height}%`,
                    }}
                  >
                    {/* Resize handles */}
                    {cropMode === "resize" && (
                      <>
                        <div className="resize-handle top-left" data-handle="top-left"></div>
                        <div className="resize-handle top-right" data-handle="top-right"></div>
                        <div className="resize-handle bottom-left" data-handle="bottom-left"></div>
                        <div className="resize-handle bottom-right" data-handle="bottom-right"></div>
                        <div className="resize-handle top" data-handle="top"></div>
                        <div className="resize-handle right" data-handle="right"></div>
                        <div className="resize-handle bottom" data-handle="bottom"></div>
                        <div className="resize-handle left" data-handle="left"></div>
                      </>
                    )}

                    {/* Grid overlay for better visual guidance */}
                    <div className="crop-grid">
                      <div className="grid-line horizontal-1"></div>
                      <div className="grid-line horizontal-2"></div>
                      <div className="grid-line vertical-1"></div>
                      <div className="grid-line vertical-2"></div>
                    </div>
                  </div>
                )}

                {/* Show the finalized crop box when not in cropping mode */}
                {!isCropping && cropBox && croppedImage && (
                  <div
                    className="finalized-crop-box"
                    style={{
                      left: `${cropBox.x}%`,
                      top: `${cropBox.y}%`,
                      width: `${cropBox.width}%`,
                      height: `${cropBox.height}%`,
                    }}
                  />
                )}

                {isCropping && (
                  <div className="cropping-instructions">
                    {cropMode === "draw" && "Click and drag to select the code region"}
                    {cropMode === "move" && "Click and drag to move the selection"}
                    {cropMode === "resize" && "Drag the handles to resize the selection"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cropped Code and Extracted Text */}
          <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
            <Tabs defaultValue="extracted" className="w-full">
              <div className="bg-muted/50 p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Code className="h-5 w-5 mr-2 text-primary" />
                      Extracted Code
                    </h2>
                  </div>
                  <Button
                    onClick={handleRunCode}
                    size="sm"
                    className="glow-run-on-hover"
                    disabled={isExtracting || !extractedCode}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Run Code
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <TabsList className="bg-background/50">
                    <TabsTrigger value="extracted" className="data-[state=active]:bg-primary/10">
                      <Code className="h-4 w-4 mr-2" />
                      Code Editor
                    </TabsTrigger>
                    <TabsTrigger value="cropped" className="data-[state=active]:bg-primary/10">
                      <Crop className="h-4 w-4 mr-2" />
                      Cropped Region
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
                {isExtracting ? (
                  <div className="h-[50vh] flex flex-col items-center justify-center">
                    <Spinner className="w-10 h-10 text-primary mb-4" />
                    <p className="text-muted-foreground">Extracting code from image...</p>
                    <p className="text-xs text-muted-foreground mt-2">Using OCR to convert image to text</p>
                  </div>
                ) : !croppedImage ? (
                  <div className="h-[50vh] flex flex-col items-center justify-center">
                    <Crop className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Crop a region from the image first</p>
                    <p className="text-xs text-muted-foreground mt-2">Use the "Manual Crop" button</p>
                  </div>
                ) : !extractedCode ? (
                  <div className="h-[50vh] flex flex-col items-center justify-center">
                    <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No code extracted yet</p>
                    <p className="text-xs text-muted-foreground mt-2">Try cropping a different region</p>
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

              <TabsContent value="cropped" className="m-0">
                <div className="h-[50vh] flex items-center justify-center p-4 bg-muted/30">
                  {croppedImage ? (
                    <div className="text-center">
                      <div className="mb-4 border border-primary/20 rounded-lg overflow-hidden inline-block">
                        <img
                          src={croppedImage || "/placeholder.svg"}
                          alt="Cropped code region"
                          className="max-h-[40vh] object-contain"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">Manually cropped code region</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Crop className="h-10 w-10 mx-auto mb-4 opacity-50" />
                      <p>No code region selected</p>
                      <p className="text-sm mt-2">Use the "Manual Crop" button to select a region</p>
                    </div>
                  )}
                </div>
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
            <Crop size={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Professional Cropping</h3>
          <p className="text-muted-foreground">
            Precisely select code regions with our professional cropping tools, including move, resize, and grid guides.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText size={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">OCR Text Extraction</h3>
          <p className="text-muted-foreground">
            Our OCR technology converts your cropped code images into editable text that you can run and modify.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Code size={24} className="text-primary" />
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

      {/* Crop Confirmation Dialog */}
      <Dialog open={showCropConfirm} onOpenChange={setShowCropConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Selection</DialogTitle>
            <DialogDescription>Do you want to extract code from this selected area?</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCropConfirm(false)}>
              No, Continue Editing
            </Button>
            <Button onClick={applyCrop}>Yes, Extract Code</Button>
          </div>
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
    </div>
  )
}

