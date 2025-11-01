// client/app/[locale]/themes/page.tsx
'use client';

import React, { use } from 'react';
import { useTranslations } from 'next-intl';
import { useGetAllThemesQuery } from '@/services/api/ThemeApi';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import Image from 'next/image';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';
import { useRouter } from '@/i18n/navigation';

interface ThemesPageProps {
	params: Promise<{
		locale: string;
	}>;
}

export default function ThemesPage({ params }: ThemesPageProps) {
	const { locale } = use(params);
	const t = useTranslations('ThemesPage');
	const router = useRouter();

	const { 
		data: themesData, 
		isLoading, 
		isError, 
		error 
	} = useGetAllThemesQuery();

	if (isLoading) {
		return <LoadingState message={t('loading') || 'Loading themes...'} />;
	}

	if (isError) {
		return (
			<ErrorState
				error={(error as any)?.data?.message || t('error') || 'Error loading themes'}
				onRetry={() => {}}
			/>
		);
	}

	const themes = themesData?.data || [];

	const handleThemeClick = (themeId: string) => {
		router.push(`/pois?theme=${themeId}`);
	};

	return (
		<main className="container mx-auto max-w-7xl px-4 py-24">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">
					{t('title') || 'Explorer Fès par thème'}
				</h1>
				<p className="mt-2 text-lg text-gray-600">
					{t('subtitle') || 'Découvrez les trésors de Fès organisés par thèmes'}
				</p>
			</div>

			{themes.length === 0 ? (
				<p className="text-center text-gray-500 py-8">
					{t('noThemes') || 'No themes available'}
				</p>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{themes.map((theme: any) => (
						<div
							key={theme.id}
							onClick={() => handleThemeClick(theme.id)}
							className="group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-300 cursor-pointer"
						>
							{/* Image */}
							<div className="relative h-56 w-full overflow-hidden">
								<Image
									loader={cloudinaryLoader}
									src={theme.image || '/images/placeholder.jpg'}
									alt={theme[locale]?.name || theme.fr?.name || 'Theme'}
									fill
									className="object-cover transition-transform duration-300 group-hover:scale-105"
									quality={80}
								/>
								{/* Overlay gradient */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>

							{/* Content */}
							<div className="p-6">
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{theme[locale]?.name || theme.fr?.name || 'Theme'}
								</h3>
								<p className="text-sm text-gray-600 line-clamp-2">
									{theme[locale]?.description || theme.fr?.description || ''}
								</p>
							</div>
						</div>
					))}
				</div>
			)}
		</main>
	);
}
