import ExperienceDetail from '@/components/ExperienceDetail';

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExperienceDetail id={id} />;
}