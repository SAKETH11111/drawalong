import { getCategoryBySlug, getVideosByCategory, thumbnailUrl } from "@/data/videos";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import { use } from "react";
import Container from "@/components/Container";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = use(params);
  const category = getCategoryBySlug(p.slug);
  if (!category) {
    return (
      <div className="p-10">
        <p>Category not found.</p>
      </div>
    );
  }
  const vids = getVideosByCategory(category.slug);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Container className="pt-12 pb-8">
        <div className="text-sm text-muted-foreground"><Link href="/">Home</Link> · {category.name}</div>
        <h1 className="mt-2 text-4xl font-semibold">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">{category.description}</p>
      </Container>
      <Container className="pb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vids.map((v) => (
          <Link
            key={v.id}
            href={`/category/${category.slug}/${v.id}`}
            className="group overflow-hidden rounded-2xl border border-border bg-card elevate"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={v.title}
              src={thumbnailUrl(v.id)}
              className="w-full aspect-video object-cover group-hover:scale-[1.02] transition-transform"
            />
            <div className="p-4">
              <div className="font-medium">{v.title}</div>
              <div className="text-sm text-muted-foreground mt-1">YouTube • Draw along</div>
            </div>
          </Link>
        ))}
      </Container>
    </div>
  );
}


