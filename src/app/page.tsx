import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_40%_0%,_rgba(255,192,203,0.35),_transparent),radial-gradient(80%_60%_at_70%_20%,_rgba(135,206,235,0.25),_transparent)]" />
        <div className="grain" />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-20">
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">Learn art by drawing along</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">Watch a tutorial, draw with it, upload your piece, and receive human feedback.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/category/anime" className="rounded-full px-5 py-3 bg-primary text-primary-foreground shadow hover:opacity-90">Explore Anime</Link>
            <Link href="/category/animals" className="rounded-full px-5 py-3 border border-border hover:bg-muted/40">Cute Animals</Link>
            <Link href="/category/fashion" className="rounded-full px-5 py-3 border border-border hover:bg-muted/40">Fashion</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CategoryCard slug="anime" title="Anime" description="Expressive characters and clean lines." />
        <CategoryCard slug="animals" title="Animals" description="Adorable creatures with personality." />
        <CategoryCard slug="fashion" title="Fashion" description="Elegant dress illustrations." />
      </section>
    </div>
  );
}

function CategoryCard({ slug, title, description }: { slug: string; title: string; description: string }) {
  return (
    <Link href={`/category/${slug}`} className="group relative rounded-2xl border border-border bg-card p-6 shadow hover:shadow-lg transition-shadow">
      <div className="absolute -z-10 inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(50%_50%_at_50%_0%,_rgba(255,192,203,0.25),_transparent_60%),radial-gradient(60%_50%_at_90%_90%,_rgba(135,206,235,0.2),_transparent_60%)]" />
      <div className="text-2xl font-semibold">{title}</div>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <div className="mt-6 inline-flex items-center gap-2 text-sm">Start learning<span aria-hidden>→</span></div>
    </Link>
  );
}

