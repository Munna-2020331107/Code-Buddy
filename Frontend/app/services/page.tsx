export default function ServicesPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-6">Our Services</h1>
      <p className="text-lg text-muted-foreground mb-8">Discover how Code Buddy can help you on your coding journey.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Service cards would go here */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Code Mentorship</h3>
          <p className="text-muted-foreground">One-on-one guidance from experienced developers.</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Project Reviews</h3>
          <p className="text-muted-foreground">Get expert feedback on your coding projects.</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Interview Prep</h3>
          <p className="text-muted-foreground">Prepare for technical interviews with mock sessions.</p>
        </div>
      </div>
    </div>
  )
}

