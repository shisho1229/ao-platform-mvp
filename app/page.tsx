import HomePage from '@/components/HomePage';

// Force dynamic rendering to avoid SSR issues with SessionProvider
export const dynamic = 'force-dynamic';

export default function Home() {
  return <HomePage />;
}