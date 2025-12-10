import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const consultation = await prisma.consultation.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        grade: body.grade,
        university: body.university,
        faculty: body.faculty,
        concerns: body.concerns,
        consultationType: body.consultationType,
        preferredDate: body.preferredDate,
        preferredTime: body.preferredTime,
        jukuName: body.jukuName || 'AO義塾',
      },
    });

    console.log('📧 新規相談予約:', consultation.trackingId);

    return NextResponse.json({
      success: true,
      trackingId: consultation.trackingId,
    }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}