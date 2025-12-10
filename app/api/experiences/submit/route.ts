import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      submitterName,
      submitterEmail,
      submitterPhone,
      university,
      faculty,
      year,
      authorPseudonym,
      jukuName,
      selectionProcess,
      interviewQuestions,
      interviewAtmosphere,
      preparationTips,
      adviceToJuniors,
      motivationTheme,
      motivationStructure,
    } = body;

    // 必須フィールドのバリデーション
    if (
      !submitterName ||
      !submitterEmail ||
      !university ||
      !faculty ||
      !year ||
      !authorPseudonym ||
      !jukuName ||
      !selectionProcess ||
      !interviewQuestions ||
      !interviewAtmosphere ||
      !preparationTips ||
      !adviceToJuniors
    ) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    // 体験記を作成
    const experience = await prisma.experience.create({
      data: {
        submitterName,
        submitterEmail,
        submitterPhone: submitterPhone || null,
        university,
        faculty,
        year: parseInt(year),
        authorPseudonym,
        jukuName,
        selectionProcess,
        interviewQuestions,
        interviewAtmosphere,
        preparationTips,
        adviceToJuniors,
        motivationTheme: motivationTheme || null,
        motivationStructure: motivationStructure || null,
        status: 'PENDING_REVIEW', // 審査待ち
        paymentStatus: 'PENDING', // 報酬支払い待ち
      },
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '投稿に失敗しました' },
      { status: 500 }
    );
  }
}
