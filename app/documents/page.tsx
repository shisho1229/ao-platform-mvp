import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import DocumentList from '@/components/DocumentList';

export default async function DocumentsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <DocumentList session={session} />;
}
