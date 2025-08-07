export type Category = "anime" | "animals" | "fashion";

export type Video = {
  id: string; // YouTube video ID
  title: string;
  category: Category;
};

export const videos: Video[] = [
  // Anime (girls)
  { id: "845IK1lJshE", title: "Anime Girl 1", category: "anime" },
  { id: "P-2tu7ct5fA", title: "Anime Girl 2", category: "anime" },
  { id: "mAF2ZVuDxe0", title: "Anime Girl 3", category: "anime" },
  { id: "1o-xA66j0gU", title: "Anime Girl 4", category: "anime" },
  { id: "AtNs3BjThPs", title: "Anime Girl 5", category: "anime" },

  // Cute animals
  { id: "MLgztbkq6Rk", title: "Cute Animal 1", category: "animals" },
  { id: "9PRTLcqON6E", title: "Cute Animal 2", category: "animals" },
  { id: "JgEtCyuzbRQ", title: "Cute Animal 3", category: "animals" },
  { id: "pB6UDUICL8U", title: "Cute Animal 4", category: "animals" },
  { id: "sz_c2BRaG6U", title: "Cute Animal 5", category: "animals" },

  // Dresses / Fashion
  { id: "q0DVOJdR_7o", title: "Dress Design 1", category: "fashion" },
  { id: "SjZ2y5Vj3OQ", title: "Dress Design 2", category: "fashion" },
  { id: "imEDmDRaLsU", title: "Dress Design 3", category: "fashion" },
];

export function getVideosByCategory(category: Category): Video[] {
  return videos.filter((v) => v.category === category);
}

export function getVideoById(id: string): Video | undefined {
  return videos.find((v) => v.id === id);
}

export const categories: { slug: Category; name: string; description: string }[] = [
  {
    slug: "fashion",
    name: "Fashion",
    description: "Elegant dress illustrations and styling silhouettes.",
  },
  {
    slug: "anime",
    name: "Anime",
    description: "Expressive characters and clean line art.",
  },
  {
    slug: "animals",
    name: "Animals",
    description: "Adorable creatures with personality.",
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function thumbnailUrl(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}


