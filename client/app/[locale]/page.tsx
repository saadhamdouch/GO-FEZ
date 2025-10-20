import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Activer le rendu statique
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <>
      <div className='mb-5 p-3'>
        <Link href="/" className='bg-blue-300 px-2 m-2 rounded-md' locale="fr">FR</Link>{' '}
        <Link href="/" className='bg-green-300 px-2 m-2 rounded-md' locale="ar">AR</Link>{' '}
        <Link href="/" className='bg-blue-300 px-2 m-2 rounded-md' locale="en">EN</Link>
      </div>
      {t('hello')}
    </>
  );
}
