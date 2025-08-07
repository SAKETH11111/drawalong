import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Container from "@/components/Container";
import CategoryCardComp from "@/components/CategoryCard";
import { categories, getVideosByCategory } from "@/data/videos";
import HomeHero from "@/components/HomeHero";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <HomeHero />

      <Container className="py-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <CategoryCardComp
            key={c.slug}
            slug={c.slug}
            title={c.name}
            description={c.description}
            accent={c.slug as any}
            count={getVideosByCategory(c.slug as any).length}
          />
        ))}
      </Container>
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

