import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import DocumentDetail from '@/components/DocumentDetail';

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  return <DocumentDetail id={id} session={session} />;
}
