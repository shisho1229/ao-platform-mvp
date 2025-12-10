import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ReviewDashboard from '@/components/ReviewDashboard';

export default async function ReviewPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <ReviewDashboard session={session} />;
}
