import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const experience = await prisma.experience.findUnique({
      where: { id: params.id },
    });

    if (!experience) {
      return NextResponse.json({ error: '体験記が見つかりません' }, { status: 404 });
    }

    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json(
      { error: '体験記の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { action, reviewComments, reviewedBy, paymentAmount } = body;

    let updateData: any = {};

    switch (action) {
      case 'request_revision':
        updateData = {
          status: 'REVISION_REQUESTED',
          reviewComments,
          reviewedBy,
          reviewedAt: new Date(),
        };
        break;

      case 'approve':
        updateData = {
          status: 'APPROVED',
          reviewedBy,
          reviewedAt: new Date(),
        };
        break;

      case 'publish':
        updateData = {
          status: 'PUBLISHED',
        };
        break;

      case 'record_payment':
        if (!paymentAmount || paymentAmount <= 0) {
          return NextResponse.json(
            { error: '正しい金額を入力してください' },
            { status: 400 }
          );
        }
        updateData = {
          paymentStatus: 'COMPLETED',
          paymentAmount,
          paymentDate: new Date(),
        };
        break;

      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        );
    }

    const experience = await prisma.experience.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json(
      { error: '体験記の更新に失敗しました' },
      { status: 500 }
    );
  }
}
