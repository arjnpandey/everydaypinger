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

export async function DELETE(req: Request) {
const { searchParams } = new URL(req.url);
const id = searchParams.get('id');
if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
const p = await prisma.prompt.delete({ where: { id: Number(id) } });
return NextResponse.json({ prompt: p });
}