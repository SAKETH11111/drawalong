import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") || "").trim();
    const name = String(form.get("name") || "").trim();
    const image = form.get("image");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const base64 = bytes.toString("base64");
    const filename = image.name || "drawing.jpg";
    const mime = image.type || "image/jpeg";

    const resend = new Resend(process.env.RESEND_API_KEY);

    const toAddress = process.env.REVIEW_INBOX || process.env.REVIEW_EMAIL || email; // fallback for local dev
    const subject = `New drawing submission from ${name || "student"}`;
    const html = `
      <div style="font-family: Poppins, Arial, sans-serif; color: #333">
        <h2>New DrawAlong Submission</h2>
        <p><strong>From:</strong> ${name || "(no name)"} &lt;${email}&gt;</p>
        <p>Please review the attached drawing and reply with constructive feedback.</p>
      </div>
    `;

    const attachments = [
      {
        filename,
        content: base64,
        path: undefined,
        content_id: undefined,
      },
    ] as any;

    await resend.emails.send({
      from: process.env.MAIL_FROM || "DrawAlong <onboarding@resend.dev>",
      to: toAddress,
      subject,
      html,
      attachments: [
        {
          filename,
          content: base64,
          encoding: "base64",
          contentType: mime,
        } as any,
      ],
      replyTo: email,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


