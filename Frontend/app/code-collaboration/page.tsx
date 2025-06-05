"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { Plus, Share2, Users, Code2 } from "lucide-react"
import CodeEditor from "@/components/Playground/CodeEditor"
import { io, Socket } from "socket.io-client"

interface User {
  id: string
  name: string
}

interface Workspace {
  _id: string
  title: string
  description: string
  programmingLanguage: string
  code: string
  collaboratorsCount: number
  lastEdited?: {
    by: string
    at: string
  }
  owner: string
  collaborators: {
    user: string
    role: string
  }[]
  version?: number
}

interface WebSocketMessage {
  type: "code_update" | "user_joined" | "user_left" | "cursor_update"
  workspaceId?: string
  code?: string
  lastEdited?: {
    by: string
    at: string
  }
  user?: User
  userId?: string
  userName?: string
}

const languages = [
  "javascript",
  "python",
  "java",
  "cpp",
  "c#",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "go",
  "rust",
  "typescript",
  "html",
  "css",
  "sql",
  "shell",
]

export default function CodeCollaborationPage() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [newWorkspace, setNewWorkspace] = useState({
    title: "",
    description: "",
    programmingLanguage: "javascript",
    code: "",
    isPublic: false,
    viewPassword: "",
    editPassword: "",
  })
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("viewer")

  useEffect(() => {
    fetchWorkspaces()
    setupWebSocket()
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  const setupWebSocket = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000"
    const token = localStorage.getItem("token")
    const newSocket: Socket = io(wsUrl, {
      auth: { token },
      transports: ["websocket"],
      path: "/socket.io",
    })

    newSocket.on("connect", () => {
      console.log("Socket.io connected")
      const currentUser = {
        id: localStorage.getItem("userId"),
        name: localStorage.getItem("userName")
      }
      if (currentUser.id && currentUser.name) {
        setActiveUsers([currentUser])
      }
    })

    newSocket.on("connect_error", (err) => {
      toast.error("Connection error. Please refresh the page.")
      console.error("Socket.io error:", err)
    })

    newSocket.on("sync-code", (data: any) => {
      console.log("Sync code received:", data)
      if (selectedWorkspace && selectedWorkspace._id === data.collaborationId) {
        setSelectedWorkspace(prev => prev ? {
          ...prev,
          code: data.code,
          version: data.version
        } : null)
      }
    })

    newSocket.on("code-update", (data: any) => {
      console.log("Code update received:", data)
      if (selectedWorkspace && selectedWorkspace._id === data.collaborationId) {
        setSelectedWorkspace(prev => prev ? {
          ...prev,
          code: data.changes,
          version: data.version,
          lastEdited: {
            by: data.editedBy,
            at: new Date().toISOString()
          }
        } : null)
      }
    })

    newSocket.on("user-joined", (data: any) => {
      console.log("User joined:", data)
      setActiveUsers(prev => [...prev, { id: data.userId, name: data.username }])
      toast.success(`${data.username} joined the workspace`)
    })

    newSocket.on("user-left", (data: any) => {
      console.log("User left:", data)
      setActiveUsers(prev => prev.filter(user => user.id !== data.userId))
      if (data.username) {
        toast(`${data.username} left the workspace`)
      }
    })

    setSocket(newSocket)
  }

  const handleCodeChange = (newCode: string) => {
    if (socket && selectedWorkspace) {
      console.log("Sending code update:", newCode)
      socket.emit("code-change", {
        collaborationId: selectedWorkspace._id,
        changes: newCode,
        version: selectedWorkspace.version || 1
      })
    }
  }

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/code-collaboration`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setWorkspaces(data)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to fetch workspaces")
      }
    }
  }

  const getDefaultCode = (language: string) => {
    switch (language) {
      case "javascript":
        return "console.log('Hello, World!');"
      case "python":
        return "print('Hello, World!')"
      case "java":
        return "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}"
      case "cpp":
        return "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}"
      case "c#":
        return "using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello, World!\");\n    }\n}"
      case "php":
        return "<?php\necho \"Hello, World!\";\n?>"
      case "ruby":
        return "puts \"Hello, World!\""
      case "swift":
        return "print(\"Hello, World!\")"
      case "kotlin":
        return "fun main() {\n    println(\"Hello, World!\")\n}"
      case "go":
        return "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}"
      case "rust":
        return "fn main() {\n    println!(\"Hello, World!\");\n}"
      case "typescript":
        return "console.log('Hello, World!');"
      case "html":
        return "<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>"
      case "css":
        return "body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}"
      case "sql":
        return "SELECT 'Hello, World!' AS greeting;"
      case "shell":
        return "echo 'Hello, World!'"
      default:
        return "// Write your code here"
    }
  }

  const createWorkspace = async () => {
    try {
      const workspaceData = {
        ...newWorkspace,
        code: getDefaultCode(newWorkspace.programmingLanguage),
        shareSettings: {
          isPublic: newWorkspace.isPublic,
          viewPassword: newWorkspace.viewPassword,
          editPassword: newWorkspace.editPassword
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/code-collaboration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(workspaceData),
      })

      if (!response.ok) {
        throw new Error("Failed to create workspace")
      }

      const data = await response.json()
      setWorkspaces(prev => [...prev, data])
      setIsCreateDialogOpen(false)
      toast.success("Workspace created successfully")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to create workspace")
      }
    }
  }

  const shareWorkspace = async (workspaceId: string, email: string, role: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/code-collaboration/${workspaceId}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email, role }),
      })

      if (!response.ok) {
        throw new Error("Failed to share workspace")
      }

      toast.success("Workspace shared successfully")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to share workspace")
      }
    }
  }

  const joinWorkspace = async (workspaceId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/code-collaboration/${workspaceId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to join workspace")
      }

      const data = await response.json()
      setSelectedWorkspace(data)
      if (socket) {
        console.log("Joining workspace:", data._id)
        socket.emit("join-collaboration", data._id)
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to join workspace")
      }
    }
  }

  const isEditor = (workspace: Workspace) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return false;
    
    return workspace.owner === userId || 
      workspace.collaborators?.some(c => c.user === userId && c.role === "editor");
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Code Collaboration</h1>
          <p className="text-lg text-muted-foreground">Collaborate on code in real-time with your team</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      </div>

      {/* Workspaces Grid */}
      {!selectedWorkspace && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card key={workspace._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{workspace.title}</CardTitle>
                <CardDescription>{workspace.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Code2 className="mr-2 h-4 w-4" />
                    {workspace.programmingLanguage}
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    {workspace.collaboratorsCount} collaborators
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {workspace.owner === localStorage.getItem("userId") ? (
                  <Button onClick={() => setSelectedWorkspace(workspace)}>
                    Open
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => joinWorkspace(workspace._id)}>
                    Join
                  </Button>
                )}
                <Button variant="ghost" onClick={() => {
                  setSelectedWorkspace(workspace);
                  setIsShareDialogOpen(true);
                }}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Code Editor */}
      {selectedWorkspace && (
        <div className="h-[calc(100vh-12rem)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{selectedWorkspace.title}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{activeUsers.length} active users</span>
              </div>
              {selectedWorkspace.owner === localStorage.getItem("userId") && (
                <Button variant="ghost" onClick={() => setIsShareDialogOpen(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedWorkspace(null)}>
                Back to Workspaces
              </Button>
            </div>
          </div>
          <CodeEditor
            language={selectedWorkspace.programmingLanguage}
            value={selectedWorkspace.code}
            onChange={handleCodeChange}
            // readOnly={!isEditor(selectedWorkspace)}
          />
        </div>
      )}

      {/* Create Workspace Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newWorkspace.title}
                onChange={(e) => setNewWorkspace(prev => ({ ...prev, title: e.target.value }))}
                placeholder="My Workspace"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newWorkspace.description}
                onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of your workspace"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Language</label>
              <Select
                value={newWorkspace.programmingLanguage}
                onValueChange={(value) => setNewWorkspace(prev => ({ ...prev, programmingLanguage: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={newWorkspace.isPublic}
                onChange={(e) => setNewWorkspace(prev => ({ ...prev, isPublic: e.target.checked }))}
              />
              <label htmlFor="isPublic" className="text-sm font-medium">
                Make this workspace public
              </label>
            </div>
            {newWorkspace.isPublic && (
              <>
                <div>
                  <label className="text-sm font-medium">View Password (optional)</label>
                  <Input
                    type="password"
                    value={newWorkspace.viewPassword}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, viewPassword: e.target.value }))}
                    placeholder="Password for viewing"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Edit Password (optional)</label>
                  <Input
                    type="password"
                    value={newWorkspace.editPassword}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, editPassword: e.target.value }))}
                    placeholder="Password for editing"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createWorkspace}>Create Workspace</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Workspace Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input 
                placeholder="user@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select 
                defaultValue="viewer"
                onValueChange={(value) => setRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedWorkspace?._id && shareWorkspace(selectedWorkspace._id, email, role)}>
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

