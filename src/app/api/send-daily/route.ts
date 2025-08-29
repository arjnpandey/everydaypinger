// src/app/api/send-daily/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pickPrompt } from "@/lib/selectPrompt";
import { sendEmail } from "@/lib/mailer";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("Authorization");
    if (process.env.VERCEL_ENV === "production") {
      if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized " + auth }, { status: 401 });
     }
    }

    const url = new URL(req.url);
    const dry = url.searchParams.get("dry") === "1";

    const choice = await pickPrompt();
    if (!choice) return NextResponse.json({ status: "no-prompts" });

    const subjectPrefix = process.env.SUBJECT_PREFIX || "Memory Ping: ";
    const subject = subjectPrefix + choice.text.slice(0, 60);
    const body = `<p style="font-size:16px;line-height:1.6">${escapeHtml(choice.text)}</p>`;

    if (!dry) {
      await sendEmail(subject, body);
      await prisma.delivery.create({ data: { promptId: choice.id } });
      await prisma.prompt.update({
        where: { id: choice.id },
        data: { lastSent: new Date(), timesSent: { increment: 1 } },
      });
    }

    return NextResponse.json({ status: dry ? "dry-run" : "sent", id: choice.id, preview: { subject } });
  } catch (err: any) {
    console.error("[GET /api/send-daily] ", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
