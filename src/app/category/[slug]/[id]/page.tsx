"use client";

import { getCategoryBySlug, getVideoById } from "@/data/videos";
import SiteHeader from "@/components/SiteHeader";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import Stepper from "@/components/Stepper";
import Dropzone from "@/components/Dropzone";
import { SubmissionProvider, useSubmission } from "@/context/SubmissionContext";
import { compressImage } from "@/lib/image";
import { useParams } from "next/navigation";

export default function VideoPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const category = getCategoryBySlug(slug);
  const video = getVideoById(id);
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
      <SubmissionProvider initial={{ category: category.slug, videoId: video.id }}>
        <Container className="pt-8 pb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/category/${category.slug}`}>{category.name}</Link>
            <span>·</span>
            <span>{video.title}</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold">{video.title}</h1>

          <div className="mt-6">
            <Stepper currentStep={step} />
          </div>

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
        </Container>
      </SubmissionProvider>
    </div>
  );
}

function UploadStep({ onNext }: { onNext: () => void }) {
  const { file, setFile } = useSubmission();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (f: File | null) => {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    try {
      setBusy(true);
      const compressed = await compressImage(f, 1600, 0.85);
      setFile(compressed);
    } catch (e: any) {
      setError(e?.message ?? "Failed to process image");
      setFile(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="text-sm text-muted-foreground">Upload your drawing (JPG/PNG)</label>
      <div className="mt-2">
        <Dropzone onFile={handleFile} />
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <div className="mt-6 flex justify-end">
        <button className="rounded-full px-4 py-2 bg-primary text-primary-foreground disabled:opacity-50" onClick={onNext} disabled={!file || busy}>
          Next
        </button>
      </div>
    </div>
  );
}

function EmailStep({ onNext }: { onNext: () => void }) {
  const { file, email, name, setEmail, setName, category, videoId } = useSubmission();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("email", email);
      if (name) form.append("name", name);
      if (category) form.append("category", category);
      if (videoId) form.append("videoId", videoId);
      const res = await fetch("/api/submit", { method: "POST", body: form });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to send");
      }
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
      <input className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
      <label className="mt-4 block text-sm text-muted-foreground">Email</label>
      <input className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-6 flex justify-end">
        <button className="rounded-full px-4 py-2 bg-primary text-primary-foreground disabled:opacity-50" onClick={onSubmit} disabled={!email || !name || submitting || !file}>
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


