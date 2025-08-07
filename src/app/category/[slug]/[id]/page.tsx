"use client";

import { getCategoryBySlug, getVideoById } from "@/data/videos";
import SiteHeader from "@/components/SiteHeader";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function VideoPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const p = use(params);
  const category = getCategoryBySlug(p.slug);
  const video = getVideoById(p.id);
  if (!category || !video) {
    return (
      <div className="p-10">
        <p>Video not found.</p>
      </div>
    );
  }

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [canProceed, setCanProceed] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);

  const onReady: YouTubeProps["onReady"] = (e: YouTubeEvent) => {
    playerRef.current = e.target;
  };

  const onStateChange: YouTubeProps["onStateChange"] = (e: YouTubeEvent) => {
    const YTPlayerState = (window as any).YT?.PlayerState;
    if (!YTPlayerState) return;
    if (e.data === YTPlayerState.PLAYING) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        try {
          const cur = playerRef.current?.getCurrentTime?.() ?? 0;
          const dur = playerRef.current?.getDuration?.() ?? 0;
          if (dur > 0) setProgress(cur / dur);
          if (dur > 0 && cur / dur >= 0.8) setCanProceed(true);
        } catch {}
      }, 500);
    } else if (e.data === YTPlayerState.ENDED) {
      setCanProceed(true);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    } else if (e.data === YTPlayerState.PAUSED) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    }
  };

  useEffect(() => () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pt-8 pb-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={`/category/${category.slug}`}>{category.name}</Link>
          <span>·</span>
          <span>{video.title}</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold">{video.title}</h1>

        {/* Stepper */}
        <div className="mt-6 flex items-center gap-4">
          <StepDot active={step === 1} done={step > 1} label="Watch" />
          <StepDot active={step === 2} done={step > 2} label="Upload" />
          <StepDot active={step === 3} done={step > 3} label="Email" />
          <StepDot active={step === 4} done={step > 4} label="Finish" />
        </div>

        {/* Step content */}
        <div className="mt-8">
          {step === 1 && (
            <div>
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
                <YouTube
                  videoId={video.id}
                  onReady={onReady}
                  onStateChange={onStateChange}
                  opts={{ playerVars: { modestbranding: 1, rel: 0 } }}
                  className="w-full h-full"
                  iframeClassName="w-full h-full"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Progress: {(progress * 100).toFixed(0)}%</div>
                <div className="flex gap-2">
                  <button
                    className="rounded-full px-4 py-2 border border-border hover:bg-muted/40"
                    onClick={() => setCanProceed(true)}
                    disabled={canProceed}
                  >
                    I’ve finished drawing
                  </button>
                  <button
                    className="rounded-full px-4 py-2 bg-primary text-primary-foreground disabled:opacity-50"
                    onClick={() => setStep(2)}
                    disabled={!canProceed}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && <UploadStep onNext={() => setStep(3)} />}
          {step === 3 && <EmailStep onNext={() => setStep(4)} />}
          {step === 4 && <FinishStep />}
        </div>
      </section>
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-3 w-3 rounded-full ${done ? "bg-secondary" : active ? "bg-primary" : "bg-muted"}`}
        aria-hidden
      />
      <span className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

function UploadStep({ onNext }: { onNext: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const onFile = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-muted-foreground">Upload your drawing (JPG/PNG)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm"
          />
          <p className="mt-2 text-sm text-muted-foreground">We’ll send this to a human reviewer for feedback.</p>
        </div>
        <div>{preview && /* eslint-disable-next-line @next/next/no-img-element */ <img alt="Preview" src={preview} className="rounded-xl border border-border" />}</div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          className="rounded-full px-4 py-2 bg-primary text-primary-foreground disabled:opacity-50"
          onClick={onNext}
          disabled={!file}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function EmailStep({ onNext }: { onNext: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      if (file) form.append("image", file);
      form.append("email", email);
      form.append("name", name);
      const res = await fetch("/api/submit", { method: "POST", body: form });
      if (!res.ok) throw new Error("Failed to send");
      onNext();
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <label className="text-sm text-muted-foreground">Your name</label>
      <input
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
        placeholder="Optional"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label className="mt-4 block text-sm text-muted-foreground">Email</label>
      <input
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <label className="mt-4 block text-sm text-muted-foreground">Attach your drawing (again)</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mt-2 block w-full text-sm"
      />
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-6 flex justify-end">
        <button
          className="rounded-full px-4 py-2 bg-primary text-primary-foreground disabled:opacity-50"
          onClick={onSubmit}
          disabled={!email || submitting || !file}
        >
          {submitting ? "Sending…" : "Send for review"}
        </button>
      </div>
    </div>
  );
}

function FinishStep() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold">Thanks! 🎨</h2>
      <p className="mt-2 text-muted-foreground">
        Your drawing has been sent to our human reviewer. You’ll receive an email with feedback soon.
      </p>
      <div className="mt-6">
        <Link href="/" className="rounded-full px-4 py-2 border border-border hover:bg-muted/40">
          Back home
        </Link>
      </div>
    </div>
  );
}


