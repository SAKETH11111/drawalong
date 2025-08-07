import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "crypto";
import { UTApi } from "uploadthing/server";

export const runtime = "nodejs";

// Constraints
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const form = await req.formData();

    const email = String(form.get("email") || "").trim();
    const name = String(form.get("name") || "").trim();
    const category = String(form.get("category") || "").trim();
    const videoId = String(form.get("videoId") || "").trim();
    const image = form.get("image");

    // Basic validation
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Validate size
    const size = typeof image.size === "number" ? image.size : (await image.arrayBuffer()).byteLength;
    if (size > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large (max 6MB)" }, { status: 413 });
    }

    // Validate type
    const mime = image.type || "application/octet-stream";
    if (!ALLOWED_TYPES.has(mime)) {
      return NextResponse.json({ error: "Unsupported image type. Use JPEG, PNG, or WebP." }, { status: 415 });
    }

    // Prepare attachment as base64 (do not store)
    const bytes = Buffer.from(await image.arrayBuffer());
    const base64 = bytes.toString("base64");
    const filename =
      image.name ||
      (mime === "image/png" ? "drawing.png" : mime === "image/webp" ? "drawing.webp" : "drawing.jpg");

    // Persist with UploadThing if configured, else fall back to Supabase if configured
    let submissionId: string | null = null;
    let storagePath: string | null = null;
    let publicUrl: string | null = null;
    const utToken = process.env.UPLOADTHING_TOKEN;
    if (utToken) {
      const utapi = new UTApi({ token: utToken });
      const utRes = await utapi.uploadFiles(image);
      if (utRes.error || !utRes.data) {
        console.error("[submit] UploadThing error:", utRes.error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
      }
      storagePath = utRes.data.key;
      // Prefer new ufsUrl if available (url is deprecated in v9)
      publicUrl = (utRes.data as any).ufsUrl || utRes.data.url;
    } else {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
        const path = `submissions/${category || "unspecified"}/${videoId || "unknown"}/${Date.now()}-${randomUUID()}.${ext}`;
        const upload = await supabase.storage.from("drawings").upload(path, bytes, { contentType: mime, upsert: false });
        if (upload.error) {
          return NextResponse.json({ error: `Upload failed: ${upload.error.message}` }, { status: 500 });
        }
        storagePath = path;
        const insert = await supabase
          .from("submissions")
          .insert({ email, name, category, video_id: videoId, image_path: path })
          .select("id")
          .single();
        if (insert.error) {
          return NextResponse.json({ error: `DB insert failed: ${insert.error.message}` }, { status: 500 });
        }
        submissionId = String(insert.data.id);
      } else {
        console.warn("[submit] No upload backend configured — skipping persistence");
      }
    }

    // Subject and HTML
    const subject = `New DrawAlong submission — ${category || "unspecified"} / ${videoId || "unknown"}`;
    const html = `
      <div style="font-family: Poppins, Arial, sans-serif; color: #333; line-height:1.6">
        <h2 style="margin:0 0 12px">New DrawAlong Submission</h2>
        <p style="margin:0 0 6px"><strong>From:</strong> ${name || "(no name)"} <${email}></p>
        <p style="margin:0 0 6px"><strong>Category:</strong> ${category || "unspecified"}</p>
        <p style="margin:0 0 12px"><strong>Video ID:</strong> ${videoId || "unknown"}</p>
        ${publicUrl ? `<p style="margin:0 0 12px"><a href="${publicUrl}">View image</a></p>` : ""}
        <p style="margin:0 0 12px">Please provide constructive, kind feedback focused on strengths and specific improvements.</p>
      </div>
    `;

    // Dev-friendly behavior when missing API key
    if (!process.env.RESEND_API_KEY) {
      console.warn("[submit] RESEND_API_KEY missing — returning ok: true (dev mode), no email sent");
      return NextResponse.json({ ok: true, dev: true, submissionId, storagePath, publicUrl });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const reviewInbox = process.env.REVIEW_INBOX;
    const to = reviewInbox || email; // for local/dev, fall back to submitter

    // Prefer snake_case reply_to if supported; include camelCase fallback for older SDKs.
    const mailFromEnv = process.env.MAIL_FROM || "";
    const invalidFrom = !mailFromEnv || /@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/i.test(mailFromEnv);
    const fromAddress = invalidFrom ? "DrawAlong <onboarding@resend.dev>" : mailFromEnv;

    const sendRes: any = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
      ...( { reply_to: email } as any ),
      replyTo: email as any,
      attachments: [
        {
          filename,
          content: base64,
          encoding: "base64",
          contentType: mime,
        } as any,
      ],
    });
    if (sendRes?.error) {
      console.error("[submit] Resend send error:", sendRes.error);
      return NextResponse.json({ error: "Email send failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, submissionId, storagePath, publicUrl });
  } catch (err) {
    console.error("[submit] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
