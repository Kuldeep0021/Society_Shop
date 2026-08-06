export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>
      <div className="prose prose-emerald max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Welcome to Society Store, your number one source for all your daily needs. We're dedicated to giving you the very best of groceries and household items, with a focus on dependability, customer service and uniqueness.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="text-muted-foreground mb-4">
          To provide high-quality products directly to your doorstep within your society, ensuring freshness, quality, and convenience.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Vision</h2>
        <p className="text-muted-foreground">
          To be the most trusted and reliable local delivery partner for every household in our community.
        </p>
      </div>
    </div>
  );
}
