"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { Cloud, Upload, FileText, Folder } from "@/components/icons"

export default function CloudStoragePage() {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  return (
    <div className="container py-8 px-4 md:px-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 mb-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Cloud Storage
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-6">
          Store and manage your code files securely in the cloud with easy access from anywhere.
        </p>

        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Cloud width={18} height={18} className="text-primary" />
            <span className="text-sm font-medium">Secure Storage</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Upload width={18} height={18} className="text-primary" />
            <span className="text-sm font-medium">Easy Upload</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <FileText width={18} height={18} className="text-primary" />
            <span className="text-sm font-medium">File Management</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
          <div className="bg-muted/50 p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <Upload width={18} height={18} className="h-5 w-5 mr-2 text-primary" />
                Upload Files
              </h2>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
              <input type="file" className="hidden" id="file-upload" multiple />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload width={32} height={32} className="text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Support for code files, images, and documents
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Files Section */}
        <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
          <div className="bg-muted/50 p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <Folder width={18} height={18} className="h-5 w-5 mr-2 text-primary" />
                Your Files
              </h2>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="text-center text-muted-foreground py-8">
              <Folder width={48} height={48} className="mx-auto mb-4 opacity-50" />
              <p>No files uploaded yet</p>
              <p className="text-sm mt-2">Upload your first file to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Cloud width={24} height={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
          <p className="text-muted-foreground">
            Your files are encrypted and stored securely in the cloud with regular backups and version control.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload width={24} height={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
          <p className="text-muted-foreground">
            Drag and drop or select files to upload. Support for multiple file types and batch uploads.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText width={24} height={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">File Management</h3>
          <p className="text-muted-foreground">
            Organize your files with folders, tags, and search functionality. Access your files from anywhere.
          </p>
        </div>
      </div>
    </div>
  )
} 