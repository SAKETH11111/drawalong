"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "./Container";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border/70">
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-[0.06em] text-lg">
          DrawAlong
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink href="/category/anime">Anime</NavLink>
          <NavLink href="/category/animals">Animals</NavLink>
          <NavLink href="/category/fashion">Fashion</NavLink>
          {mounted && <ThemeToggle />}
        </nav>
      </Container>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative hover:opacity-100">
      <span className="after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-foreground/60 after:transition-transform hover:after:scale-x-100">
        {children}
      </span>
    </Link>
  );
}


