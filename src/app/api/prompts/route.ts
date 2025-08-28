import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function GET() {
const prompts = await prisma.prompt.findMany({ orderBy: { createdAt: "desc" } });
return NextResponse.json({ prompts });
}


export async function POST(req: Request) {
const { text, tag, cooldown } = await req.json();
if (!text || !text.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });
const p = await prisma.prompt.create({ data: { text: text.trim(), tag: tag || null, cooldown: Number(cooldown||0) } });
return NextResponse.json({ prompt: p });
}