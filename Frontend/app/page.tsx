import Link from "next/link"
import {
  Code,
  FileJson,
  Database,
  Terminal,
  Braces,
  Hash,
  Coffee,
  FileType2,
  Cpu,
  BookOpen,
  Server,
  Users,
  Lightbulb,
} from "@/components/icons"
import "./styles/home.css"

export default function Home() {
  return (
    <main className="main-container safe-area">
      <div className="page-decoration decoration-1"></div>
      <div className="page-decoration decoration-2"></div>

      <div className="welcome-container">
        <h1 className="welcome-heading">Welcome to Code Buddy</h1>
        <p className="welcome-subheading">
          Code Buddy lets users run, analyze, store, convert, and learn from code with AI assistance.
        </p>

        <div className="language-icons-container">
          <div className="language-icon-wrapper">
            <div className="icon-circle icon-html">
              <Code className="h-8 w-8" />
            </div>
            <span className="language-label">HTML/CSS</span>
          </div>
          <div className="language-icon-wrapper">
            <div className="icon-circle icon-javascript">
              <FileJson className="h-8 w-8" />
            </div>
            <span className="language-label">JavaScript</span>
          </div>
          <div className="language-icon-wrapper">
            <div className="icon-circle icon-react">
              <Braces className="h-8 w-8" />
            </div>
            <span className="language-label">React</span>
          </div>
          <div className="language-icon-wrapper">
            <div className="icon-circle icon-typescript">
              <FileType2 className="h-8 w-8" />
            </div>
            <span className="language-label">TypeScript</span>
          </div>
          <div className="language-icon-wrapper">
            <div className="icon-circle icon-python">
              <Terminal className="h-8 w-8" />
            </div>
            <span className="language-label">Python</span>
          </div>
          <div className="language-icon-wrapper">
            <div className="icon-circle icon-sql">
              <Database className="h-8 w-8" />
            </div>
            <span className="language-label">SQL</span>
          </div>
          <div className="language-icon-wrapper">
            <div className="icon-circle icon-csharp">
              <Hash className="h-8 w-8" />
            </div>
            <span className="language-label">C#</span>
          </div>
          <div className="language-icon-wrapper">
            <div className="icon-circle icon-cpp">
              <Cpu className="h-8 w-8" />
            </div>
            <span className="language-label">C++</span>
          </div>
          <div className="language-icon-wrapper">
            <div className="icon-circle icon-c">
              <Cpu className="h-8 w-8" />
            </div>
            <span className="language-label">C</span>
          </div>
          <div className="language-icon-wrapper">
            <div className="icon-circle icon-java">
              <Coffee className="h-8 w-8" />
            </div>
            <span className="language-label">Java</span>
          </div>
        </div>
      </div>

      <div className="services-grid">
        <Link href="/code-execution-and-error-analysis" className="service-link">
          <div className="service-icon">
            <Server className="h-10 w-10" />
          </div>
          <h2 className="service-title">
            Code Execution and Error Analysis <span className="service-arrow">→</span>
          </h2>
          <p className="service-description">Run code and get detailed error analysis with AI assistance.</p>
        </Link>

        <Link href="/code-collaboration" className="service-link">
          <div className="service-icon">
            <BookOpen className="h-10 w-10" />
          </div>
          <h2 className="service-title">
            Code Collaboration <span className="service-arrow">→</span>
          </h2>
          <p className="service-description">Work together on code projects in real-time with team members.</p>
        </Link>

        <Link href="/image-code-identifier" className="service-link">
          <div className="service-icon">
            <Lightbulb className="h-10 w-10" />
          </div>
          <h2 className="service-title">
            Image Code Identifier <span className="service-arrow">→</span>
          </h2>
          <p className="service-description">Extract and analyze code from images with our AI tools.</p>
        </Link>

        <Link href="/learning-schedule" className="service-link">
          <div className="service-icon">
            <Users className="h-10 w-10" />
          </div>
          <h2 className="service-title">
            Learning Schedule <span className="service-arrow">→</span>
          </h2>
          <p className="service-description">Create personalized learning paths for your coding journey.</p>
        </Link>

        <Link href="/CloudStorage" className="service-link">
          <div className="service-icon">
            <Database className="h-10 w-10" />
          </div>
          <h2 className="service-title">
            Cloud Storage <span className="service-arrow">→</span>
          </h2>
          <p className="service-description">Store and manage your code and files securely in the cloud.</p>
        </Link>
      </div>
    </main>
  )
}

