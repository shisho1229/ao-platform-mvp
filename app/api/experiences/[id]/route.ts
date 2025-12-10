import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const experience = await prisma.experience.findUnique({
      where: { id },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 閲覧数を増やす
    await prisma.experience.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}