import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pickPrompt } from "@/lib/selectPrompt";
import { sendEmail } from "@/lib/mailer";


export async function POST(req: Request) {
const auth = req.headers.get("x-cron-secret");
if (!auth || auth !== process.env.CRON_SECRET) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}


const choice = await pickPrompt();
if (!choice) return NextResponse.json({ status: "no-prompts" });


const subjectPrefix = process.env.SUBJECT_PREFIX || "Memory Ping: ";
const subject = subjectPrefix + choice.text.slice(0, 60);
const body = `<p style="font-size:16px;line-height:1.6">${escapeHtml(choice.text)}</p>`;


await sendEmail(subject, body);
await prisma.delivery.create({ data: { promptId: choice.id } });
await prisma.prompt.update({ where: { id: choice.id }, data: { lastSent: new Date(), timesSent: { increment: 1 } } });


return NextResponse.json({ status: "sent", id: choice.id });
}


function escapeHtml(s: string) {
return s
.replaceAll("&", "&amp;")
.replaceAll("<", "&lt;")
.replaceAll(">", "&gt;")
.replaceAll('"', "&quot;")
.replaceAll("'", "&#39;");
}