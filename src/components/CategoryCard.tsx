"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Accent = "anime" | "animals" | "fashion";

export interface CategoryCardProps {
  slug: string;
  title: string;
  description: string;
  accent: Accent;
  count?: number;
  className?: string;
}

const ACCENT: Record<Accent, { border: string; glow: string; hint: string }> = {
  anime: {
    border:
      "bg-[linear-gradient(135deg,rgba(255,192,203,0.65),rgba(255,192,203,0)_40%),linear-gradient(45deg,rgba(255,192,203,0.35),rgba(255,255,255,0)_60%)]",
    glow: "shadow-[0_10px_30px_-12px_rgba(255,192,203,0.35)]",
    hint: "fill-[rgba(255,192,203,0.22)]",
  },
  animals: {
    border:
      "bg-[linear-gradient(135deg,rgba(135,206,235,0.6),rgba(135,206,235,0)_40%),linear-gradient(45deg,rgba(135,206,235,0.3),rgba(255,255,255,0)_60%)]",
    glow: "shadow-[0_10px_30px_-12px_rgba(135,206,235,0.35)]",
    hint: "fill-[rgba(135,206,235,0.22)]",
  },
  fashion: {
    border:
      "bg-[linear-gradient(135deg,rgba(255,255,0,0.45),rgba(255,255,0,0)_40%),linear-gradient(45deg,rgba(255,192,203,0.28),rgba(255,255,255,0)_60%)]",
    glow: "shadow-[0_10px_30px_-12px_rgba(255,228,0,0.25)]",
    hint: "fill-[color-mix(in_oklab,var(--accent)_18%,transparent)]",
  },
};

export default function CategoryCard({
  slug,
  title,
  description,
  accent,
  count,
  className,
}: CategoryCardProps) {
  const a = ACCENT[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Link
        href={`/category/${slug}`}
        className={cn(
          "group relative block rounded-2xl",
          "p-[1px]", // gradient border wrapper
          a.border,
          a.glow,
          className
        )}
        aria-label={`${title} tutorials`}
      >
        <div
          className={cn(
            "relative h-full w-full rounded-2xl glass elevate",
            "p-6 overflow-hidden"
          )}
        >
          {/* Faint art hint backdrop */}
          <div className="pointer-events-none absolute -z-10 inset-0 opacity-100">
            <svg
              aria-hidden
              className={cn("absolute -right-6 -top-6 w-40 h-40 blur-md", a.hint)}
              viewBox="0 0 100 100"
              focusable="false"
            >
              {accent === "anime" && (
                <g>
                  <ellipse cx="35" cy="45" rx="14" ry="10" />
                  <ellipse cx="70" cy="45" rx="14" ry="10" />
                  <circle cx="35" cy="45" r="4" />
                  <circle cx="70" cy="45" r="4" />
                </g>
              )}
              {accent === "animals" && (
                <path d="M50 18 C60 10,80 20,78 36 C78 48,68 60,50 74 C32 60,22 48,22 36 C20 20,40 10,50 18 Z" />
              )}
              {accent === "fashion" && (
                <path d="M40 18 L60 18 L55 28 L70 42 L62 82 L38 82 L30 42 L45 28 Z" />
              )}
            </svg>
            {/* subtle radial glow */}
            <div className="absolute -z-10 inset-0 bg-[radial-gradient(60%_40%_at_80%_0%,rgba(255,255,255,0.2),transparent)]" />
          </div>

          <div className="text-2xl font-semibold tracking-wide">{title}</div>
          <p className="mt-2 text-muted-foreground">{description}</p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-foreground/80">
            {typeof count === "number" ? `${count} tutorials` : "See tutorials"}
            <span
              aria-hidden
              className="origin-left scale-x-100 transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}