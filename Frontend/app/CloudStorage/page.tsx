"use client"

import { useState, useEffect } from "react"
import SimpleCodeEditor from "@/components/Playground/SimpleCodeEditor"
import { LANGUAGE_VERSIONS } from "@/components/Playground/LanguageVersions"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface CodeSnippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  programmingLanguage: string;
  category: string;
  difficulty: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_OPTIONS = [
  "algorithm", "data-structure", "web-development", "mobile-development", "game-development", "system-programming", "database", "machine-learning", "security", "testing", "other"
]
const DIFFICULTY_OPTIONS = ["beginner", "intermediate", "advanced"]

// Common languages for quick selection
const COMMON_LANGUAGES = [
  "javascript", "python", "java", "cpp", "csharp", "php", "ruby", "swift", "kotlin", "go", "rust", "typescript", "html", "css", "sql", "shell"
]

// Combine all supported languages
const LANGUAGE_OPTIONS = [
  ...Object.keys(LANGUAGE_VERSIONS),
  "java", "c++", "c#", "php", "ruby", "swift", "kotlin", "go", "rust", "typescript", "html", "css", "sql", "shell", "other"
].filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates

export default function CloudStoragePage() {
  const [tab, setTab] = useState("editor")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [code, setCode] = useState("")
  const [programmingLanguage, setProgrammingLanguage] = useState("")
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [difficulty, setDifficulty] = useState(DIFFICULTY_OPTIONS[0])
  const [tags, setTags] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveAsPublic, setSaveAsPublic] = useState(true)
  const [ownSnippets, setOwnSnippets] = useState<CodeSnippet[]>([])
  const [allSnippets, setAllSnippets] = useState<CodeSnippet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [customLanguage, setCustomLanguage] = useState("")
  const [showCustomLanguageInput, setShowCustomLanguageInput] = useState(false)
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null)

  const fetchSnippets = async (type = "own") => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "50",
        sortBy: "createdAt",
        sortOrder: "desc"
      });

      const endpoint = type === "own" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/code/user`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/code`;

      const response = await fetch(`${endpoint}?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch code snippets");

      if (type === "own") {
        setOwnSnippets(data.data.codes);
      } else {
        setAllSnippets(data.data.codes);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch code snippets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "own") {
      fetchSnippets("own");
    } else if (tab === "all") {
      fetchSnippets("all");
    }
  }, [tab]);

  const handleSave = async () => {
    if (!title || !description || !code || !programmingLanguage) {
      toast.error("Please fill in all required fields");
      return;
    }

    setShowSaveDialog(true);
  };

  const handleSnippetClick = (snippet: CodeSnippet) => {
    setTab("editor");
    setTitle(snippet.title);
    setDescription(snippet.description);
    setCode(snippet.code);
    setProgrammingLanguage(snippet.programmingLanguage);
    setCategory(snippet.category);
    setDifficulty(snippet.difficulty);
    setTags(snippet.tags.join(", "));
    setSaveAsPublic(snippet.isPublic);
    setSelectedSnippetId(snippet._id);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const codeData = {
        title,
        description,
        code,
        programmingLanguage: programmingLanguage === "custom" ? customLanguage : programmingLanguage,
        category,
        difficulty,
        tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        isPublic: saveAsPublic
      };

      const url = selectedSnippetId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/code/${selectedSnippetId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/code`;

      const response = await fetch(url, {
        method: selectedSnippetId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(codeData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save code");

      toast.success(selectedSnippetId ? "Code updated successfully!" : "Code saved successfully!");
      setShowSaveDialog(false);
      setTitle("");
      setDescription("");
      setCode("");
      setProgrammingLanguage("");
      setCustomLanguage("");
      setCategory(CATEGORY_OPTIONS[0]);
      setDifficulty(DIFFICULTY_OPTIONS[0]);
      setTags("");
      setSaveAsPublic(true);
      setSelectedSnippetId(null);
      
      // Refresh the snippets list
      if (tab === "own") {
        fetchSnippets("own");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save code");
    } finally {
      setIsSaving(false);
    }
  };

  const CodeSnippetCard = ({ snippet }: { snippet: CodeSnippet }) => {
    return (
      <Card className="w-full cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleSnippetClick(snippet)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{snippet.title}</span>
            <Badge variant={snippet.isPublic ? "default" : "secondary"}>
              {snippet.isPublic ? "Public" : "Private"}
            </Badge>
          </CardTitle>
          <CardDescription>{snippet.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{snippet.programmingLanguage}</Badge>
            <Badge variant="outline">{snippet.category}</Badge>
            <Badge variant="outline">{snippet.difficulty}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {snippet.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-gray-500">
          <span>Created {formatDate(snippet.createdAt)}</span>
          <span>Updated {formatDate(snippet.updatedAt)}</span>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Cloud Storage</h1>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="own">Own Code Snippets</TabsTrigger>
          <TabsTrigger value="all">All Code Snippets</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Programming Language</label>
                {showCustomLanguageInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customLanguage}
                      onChange={(e) => setCustomLanguage(e.target.value)}
                      placeholder="Enter custom language"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setProgrammingLanguage(customLanguage);
                        setShowCustomLanguageInput(false);
                      }}
                    >
                      Set
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowCustomLanguageInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select 
                      value={programmingLanguage} 
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setShowCustomLanguageInput(true);
                        } else {
                          setProgrammingLanguage(value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom Language...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-2 font-medium">Title</label>
                <input className="w-full p-2 border rounded mb-4" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
                <label className="block mb-2 font-medium">Description</label>
                <textarea className="w-full p-2 border rounded mb-4" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
                <label className="block mb-2 font-medium">Category</label>
                <select className="w-full p-2 border rounded mb-4" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <label className="block mb-2 font-medium">Difficulty</label>
                <select className="w-full p-2 border rounded mb-4" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  {DIFFICULTY_OPTIONS.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
                <label className="block mb-2 font-medium">Tags (comma separated)</label>
                <input className="w-full p-2 border rounded mb-4" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. array, sorting, recursion" />
                <Button onClick={handleSave} className="w-full">Save Code</Button>
              </div>
            </div>
            <div className="h-[400px]">
              <SimpleCodeEditor
                value={code}
                setValue={setCode}
                selectedLanguage={programmingLanguage}
                editorTheme="dark"
                fontSize="16px"
                tabSize={2}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="own">
          <div className="space-y-4">
            {isLoading ? (
              <div>Loading...</div>
            ) : ownSnippets.length > 0 ? (
              ownSnippets.map((snippet) => (
                <CodeSnippetCard key={snippet._id} snippet={snippet} />
              ))
            ) : (
              <div>No code snippets found.</div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="all">
          <div className="space-y-4">
            {isLoading ? (
              <div>Loading...</div>
            ) : allSnippets.length > 0 ? (
              allSnippets.map((snippet) => (
                <CodeSnippetCard key={snippet._id} snippet={snippet} />
              ))
            ) : (
              <div>No code snippets found.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Code</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Do you want to save this code as public or private?</label>
            <div className="flex gap-4">
              <Button variant={saveAsPublic ? "default" : "outline"} onClick={() => setSaveAsPublic(true)}>
                Public
              </Button>
              <Button variant={!saveAsPublic ? "default" : "outline"} onClick={() => setSaveAsPublic(false)}>
                Private
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Public code can be seen by everyone. Private code is only visible to you.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmSave} disabled={isSaving}>{isSaving ? "Saving..." : "Confirm & Save"}</Button>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} disabled={isSaving}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}