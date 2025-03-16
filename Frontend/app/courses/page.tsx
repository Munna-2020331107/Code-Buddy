export default function CoursesPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-6">Our Courses</h1>
      <p className="text-lg text-muted-foreground mb-8">Structured learning paths to help you master coding skills.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Course cards would go here */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Web Development Fundamentals</h3>
          <p className="text-muted-foreground">Learn HTML, CSS, and JavaScript basics.</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">React Masterclass</h3>
          <p className="text-muted-foreground">Build modern web applications with React.</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Full-Stack Development</h3>
          <p className="text-muted-foreground">Master both frontend and backend technologies.</p>
        </div>
      </div>
    </div>
  )
}

