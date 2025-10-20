import { setRequestLocale } from 'next-intl/server';
import FezDiscoveryApp from '@/components/FezDiscoveryApp';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FezDiscoveryApp />;
}