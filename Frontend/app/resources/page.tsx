export default function ResourcesPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-6">Resources</h1>
      <p className="text-lg text-muted-foreground mb-8">Free tools and resources to support your coding journey.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Resource cards would go here */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Coding Cheatsheets</h3>
          <p className="text-muted-foreground">Quick reference guides for popular languages.</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Project Templates</h3>
          <p className="text-muted-foreground">Starter templates for common applications.</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Free eBooks</h3>
          <p className="text-muted-foreground">Comprehensive guides on programming topics.</p>
        </div>
      </div>
    </div>
  )
}

