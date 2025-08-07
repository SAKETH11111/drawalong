"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-wide text-lg">
          DrawAlong
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/category/anime" className="hover:opacity-80">
            Anime
          </Link>
          <Link href="/category/animals" className="hover:opacity-80">
            Animals
          </Link>
          <Link href="/category/fashion" className="hover:opacity-80">
            Fashion
          </Link>
          {mounted && (
            <button
              aria-label="Toggle theme"
              className="ml-2 rounded-full px-3 py-1 text-sm border border-border hover:bg-muted/40"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}


