"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";

export interface DropzoneProps {
  onFile: (file: File | null) => void;
  maxSizeBytes?: number;
}

export default function Dropzone({ onFile, maxSizeBytes = 6 * 1024 * 1024 }: DropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejected: FileRejection[]) => {
      setError(null);
      if (rejected && rejected.length > 0) {
        const first = rejected[0];
        if (first?.errors?.length) {
          setError(first.errors[0].message);
        }
        onFile(null);
        return;
      }
      const f = acceptedFiles[0];
      if (!f) {
        onFile(null);
        return;
      }
      if (!f.type.startsWith("image/")) {
        setError("Please select an image file");
        onFile(null);
        return;
      }
      if (f.size > maxSizeBytes) {
        setError("Image is too large (max 6MB)");
        onFile(null);
        return;
      }
      setPreview(URL.createObjectURL(f));
      onFile(f);
    },
    [onFile, maxSizeBytes]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    maxSize: maxSizeBytes,
  });

  const stateClass = useMemo(() => {
    if (isDragActive) return "ring-2 ring-primary";
    if (error) return "ring-2 ring-destructive";
    return "";
  }, [isDragActive, error]);

  return (
    <div className="grid gap-3">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/60 p-6 glass cursor-pointer elevate ${stateClass}`}
      >
        <input {...getInputProps()} />
        <div className="text-sm text-muted-foreground">
          {isDragActive ? "Drop your image here…" : "Drag & drop your drawing, or click to select"}
        </div>
      </div>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview" className="max-h-80 w-auto rounded-xl border border-border" />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}


