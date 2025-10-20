import { setRequestLocale } from 'next-intl/server';
import GoFezLogo from '@/components/GoFezLogo';

export default async function LogoPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <GoFezLogo />;
}