"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "./Container";

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-gradient" />
      <div className="grain" />
      <Container className="relative pt-24 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.22 }}
          className="text-5xl sm:text-6xl font-semibold tracking-tight"
        >
          Learn art by drawing along
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.05 }}
          className="mt-4 text-lg text-muted-foreground max-w-2xl"
        >
          Watch a tutorial, draw with it, upload your piece, and receive human feedback.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link href="/category/anime" className="rounded-full px-5 py-3 bg-primary text-primary-foreground shadow hover:opacity-90">
            Explore Anime
          </Link>
          <Link href="/category/animals" className="rounded-full px-5 py-3 border border-border hover:bg-muted/40">
            Cute Animals
          </Link>
          <Link href="/category/fashion" className="rounded-full px-5 py-3 border border-border hover:bg-muted/40">
            Fashion
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}


