"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export interface Submission {
  file: File | null;
  email: string;
  name: string;
  category?: string;
  videoId?: string;
}

interface SubmissionContextValue extends Submission {
  setFile: (f: File | null) => void;
  setEmail: (e: string) => void;
  setName: (n: string) => void;
  setMeta: (m: { category?: string; videoId?: string }) => void;
  reset: () => void;
}

const SubmissionContext = createContext<SubmissionContextValue | undefined>(undefined);

export function SubmissionProvider({ children, initial }: { children: React.ReactNode; initial?: Partial<Submission> }) {
  const [file, setFile] = useState<File | null>(initial?.file ?? null);
  const [email, setEmail] = useState<string>(initial?.email ?? "");
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [meta, setMetaState] = useState<{ category?: string; videoId?: string }>({
    category: initial?.category,
    videoId: initial?.videoId,
  });

  const setMeta = (m: { category?: string; videoId?: string }) => setMetaState((prev) => ({ ...prev, ...m }));
  const reset = () => {
    setFile(null);
    setEmail("");
    setName("");
    setMetaState({});
  };

  const value = useMemo<SubmissionContextValue>(
    () => ({ file, email, name, category: meta.category, videoId: meta.videoId, setFile, setEmail, setName, setMeta, reset }),
    [file, email, name, meta]
  );

  return <SubmissionContext.Provider value={value}>{children}</SubmissionContext.Provider>;
}

export function useSubmission() {
  const ctx = useContext(SubmissionContext);
  if (!ctx) throw new Error("useSubmission must be used within SubmissionProvider");
  return ctx;
}


