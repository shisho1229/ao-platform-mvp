import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ReviewDetail from '@/components/ReviewDetail';

export default async function ReviewDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const experience = await prisma.experience.findUnique({
    where: { id: params.id },
  });

  if (!experience) {
    notFound();
  }

  return <ReviewDetail experience={experience} reviewerName={session.user.name || ''} />;
}
