export async function compressImage(file: File, maxDim = 1600, quality = 0.85): Promise<File> {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Invalid image file");
  }

  const arrayBuf = await file.arrayBuffer();
  const orientation = parseExifOrientation(arrayBuf) ?? 1;

  const img = await loadImage(URL.createObjectURL(file));
  const { drawWidth, drawHeight, canvasWidth, canvasHeight } = computeDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    maxDim,
    orientation
  );

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  applyOrientationTransform(ctx, orientation, canvasWidth, canvasHeight);

  // Draw scaled image
  ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) return reject(new Error("Compression failed"));
        resolve(b);
      },
      "image/jpeg",
      clamp(quality, 0.5, 0.95)
    );
  });

  const outName = withExt(file.name || "drawing", "jpg");
  return new File([blob], outName, { type: "image/jpeg" });
}

/**
 * Compute target draw and canvas dimensions based on maxDim and orientation.
 */
function computeDimensions(
  width: number,
  height: number,
  maxDim: number,
  orientation: number
) {
  const ratio = width / height;
  let targetW = width;
  let targetH = height;

  if (Math.max(width, height) > maxDim) {
    if (ratio > 1) {
      targetW = maxDim;
      targetH = Math.round(maxDim / ratio);
    } else {
      targetH = maxDim;
      targetW = Math.round(maxDim * ratio);
    }
  }

  // If orientation swaps axes (5-8), canvas dims are swapped
  const swap = orientation >= 5 && orientation <= 8;
  const canvasWidth = swap ? targetH : targetW;
  const canvasHeight = swap ? targetW : targetH;

  return { drawWidth: targetW, drawHeight: targetH, canvasWidth, canvasHeight };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function withExt(name: string, ext: string) {
  const base = name.replace(/\.[^/.]+$/, "");
  return `${base}.${ext}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(src);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Minimal EXIF parser to read Orientation (0x0112) from JPEG.
 * Returns 1..8 or undefined if not found.
 */
function parseExifOrientation(buf: ArrayBuffer): number | undefined {
  const view = new DataView(buf);
  if (view.getUint16(0, false) !== 0xffd8) return undefined; // not JPEG

  let offset = 2;
  const length = view.byteLength;

  while (offset < length) {
    if (view.getUint16(offset, false) === 0xffe1) {
      // APP1
      const exifLength = view.getUint16(offset + 2, false);
      const exifStart = offset + 4;
      if (getString(view, exifStart, 4) !== "Exif") break;

      const tiffOffset = exifStart + 6;
      const little = view.getUint16(tiffOffset, false) === 0x4949;
      const firstIFDOffset = view.getUint32(tiffOffset + 4, little);
      if (firstIFDOffset < 0x00000008) return undefined;

      const dirStart = tiffOffset + firstIFDOffset;
      const entries = view.getUint16(dirStart, little);

      for (let i = 0; i < entries; i++) {
        const entryOffset = dirStart + 2 + i * 12;
        const tag = view.getUint16(entryOffset, little);
        if (tag === 0x0112) {
          const value = view.getUint16(entryOffset + 8, little);
          return value;
        }
      }
      break;
    } else if (view.getUint16(offset, false) === 0xffda) {
      // Start of scan
      break;
    } else {
      offset += 2;
      const size = view.getUint16(offset, false);
      offset += size;
    }
  }
  return undefined;
}

function getString(view: DataView, start: number, length: number) {
  let out = "";
  for (let i = 0; i < length; i++) out += String.fromCharCode(view.getUint8(start + i));
  return out;
}

/**
 * Apply canvas transform based on EXIF orientation.
 * Reference orientations:
 * 1: default
 * 2: flip X
 * 3: rotate 180
 * 4: flip Y
 * 5: transpose
 * 6: rotate 90 CW
 * 7: transverse
 * 8: rotate 270 CW
 */
function applyOrientationTransform(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  w: number,
  h: number
) {
  switch (orientation) {
    case 2:
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      break;
    case 3:
      ctx.translate(w, h);
      ctx.rotate(Math.PI);
      break;
    case 4:
      ctx.translate(0, h);
      ctx.scale(1, -1);
      break;
    case 5:
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -h);
      break;
    case 7:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(w, -h);
      ctx.scale(-1, 1);
      break;
    case 8:
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-w, 0);
      break;
    default:
      // 1: no-op
      break;
  }
}