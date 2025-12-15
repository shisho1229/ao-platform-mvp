import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(experiences);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}