// LOCATION: components/admin/AdminHeader.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Route, Palette, Folder,Globe  } from 'lucide-react';

interface AdminHeaderProps {
  locale?: string;
}

export default function AdminHeader({ locale = 'fr' }: AdminHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `/${locale}/admin/pois`, label: 'POIs', icon: MapPin },
    { href: `/${locale}/admin/circuits`, label: 'Circuits', icon: Route },
    { href: `/${locale}/admin/themes`, label: 'Thèmes', icon: Palette },
    { href: `/${locale}/admin/categories`, label: 'Catégories', icon: Folder },
    { href: `/${locale}/admin/cities`, label: 'Cities', icon: Globe  }
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href={`/${locale}/admin/pois`} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Go Fez Admin
              </h1>
              <p className="text-xs text-gray-500">Dashboard de gestion</p>
            </div>
          </Link>

          <nav className="flex space-x-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}