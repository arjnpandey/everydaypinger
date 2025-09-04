import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle photo upload
      const formData = await req.formData()
      const photo = formData.get('photo') as File
      const tag = formData.get('tag') as string
      const cooldown = parseInt(formData.get('cooldown') as string) || 0
      
      if (!photo) {
        return NextResponse.json({ error: "Photo is required" }, { status: 400 })
      }
      
      // Validate file type and size
      if (!photo.type.startsWith('image/')) {
        return NextResponse.json({ error: "File must be an image" }, { status: 400 })
      }
      
      if (photo.size > 10 * 1024 * 1024) { // 10MB limit
        return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
      }
      
      // Upload to Vercel Blob
      const blob = await put(photo.name, photo, {
        access: 'public',
        addRandomSuffix: true, // Adds unique suffix to prevent conflicts
      });
      
      // Save to database
      const prompt = await prisma.prompt.create({
        data: {
          photoUrl: blob.url,
          promptType: 'PHOTO',
          tag: tag || null,
          cooldown: cooldown || 0,
          timesSent: 0
        }
      })
      
      return NextResponse.json({ prompt })
      
    } else {
      // Handle text upload (existing logic)
      const { text, tag, cooldown } = await req.json()
      
      if (!text || !text.trim()) {
        return NextResponse.json({ error: "Text required" }, { status: 400 })
      }
      
      const prompt = await prisma.prompt.create({
        data: {
          text: text.trim(),
          promptType: 'TEXT',
          tag: tag || null,
          cooldown: Number(cooldown || 0),
          timesSent: 0
        }
      })
      
      return NextResponse.json({ prompt })
    }
    
  } catch (error) {
    console.error('POST /api/prompts error:', error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET() {
  const prompts = await prisma.prompt.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ prompts });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const p = await prisma.prompt.delete({ where: { id: Number(id) } });
  return NextResponse.json({ prompt: p });
}