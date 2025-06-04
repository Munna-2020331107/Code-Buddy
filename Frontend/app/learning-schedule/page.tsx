export default function AboutPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-6">About Code Buddy</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Our mission is to make coding education accessible to everyone.
      </p>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-muted-foreground mb-4">
            Code Buddy was founded in 2023 by a group of passionate developers who wanted to create a supportive
            community for people learning to code. We believe that everyone should have access to quality coding
            education, regardless of their background or experience level.
          </p>
          <p className="text-muted-foreground">
            Today, we offer a range of services, courses, and resources designed to help people at all stages of their
            coding journey, from complete beginners to experienced developers looking to level up their skills.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Values</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Accessibility - Making coding education available to everyone</li>
            <li>• Community - Building a supportive network of learners and mentors</li>
            <li>• Quality - Providing high-quality, up-to-date content</li>
            <li>• Innovation - Embracing new technologies and teaching methods</li>
            <li>• Inclusivity - Creating a welcoming environment for all</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

