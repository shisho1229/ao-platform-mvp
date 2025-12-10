import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import DocumentForm from '@/components/DocumentForm';

export default async function NewDocumentPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <DocumentForm session={session} />;
}
