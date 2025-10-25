import React from 'react';
import Link from 'next/link';

export default async function AdminHomePage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  // ✅ Await params in server component
  const { locale } = await params;

  return (
    <section className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-indigo-700">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome to the admin panel — manage your content below.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          href={`/${locale}/admin/themes`}
          className="block bg-white shadow-sm hover:shadow-md rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 transition-all"
        >
          <h2 className="text-xl font-semibold text-indigo-600">Themes</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Manage your app themes and appearances.
          </p>
        </Link>

        <Link
          href={`/${locale}/admin/pois`}
          className="block bg-white shadow-sm hover:shadow-md rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 transition-all"
        >
          <h2 className="text-xl font-semibold text-indigo-600">POIs</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Manage points of interest and related data.
          </p>
        </Link>

        <Link
          href={`/${locale}/admin/circuits`}
          className="block bg-white shadow-sm hover:shadow-md rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 transition-all"
        >
          <h2 className="text-xl font-semibold text-indigo-600">Circuits</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Manage circuits and routes configurations.
          </p>
        </Link>
      </div>
    </section>
  );
}