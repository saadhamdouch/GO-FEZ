// client/components/gamification/BadgeGrid.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/lib/types'; // Le type Badge du backend
import { useTranslations } from 'next-intl';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';

// Assumant shadcn/ui Tooltip
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface BadgeGridProps {
	badges: Badge[];
	locale: string;
}

// Sous-composant pour un seul badge
const BadgeIcon: React.FC<{ badge: Badge; locale: string }> = ({
	badge,
	locale,
}) => {
	const name = badge[locale as 'fr' | 'en' | 'ar'] || badge.fr;
	const description =
		badge[`description${locale.charAt(0).toUpperCase() + locale.slice(1)}` as
			| 'descriptionFr'
			| 'descriptionEn'
			| 'descriptionAr'] || badge.descriptionFr;

	return (
		<TooltipProvider delayDuration={100}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex flex-col items-center gap-2">
						<div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-gray-200 p-1 transition-transform duration-200 hover:scale-110">
							<Image
								loader={cloudinaryLoader}
								src={badge.icon}
								alt={name}
								layout="fill"
								objectFit="cover"
							/>
						</div>
						<span className="w-24 truncate text-center text-xs font-medium">
							{name}
						</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p className="max-w-xs">{description}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

// Composant grille principal
const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, locale }) => {
	const t = useTranslations('GamificationProfile');

	return (
		<div className="rounded-lg border bg-white p-6 shadow-sm">
			<h3 className="text-lg font-semibold text-gray-700">
				{t('myBadges')}
			</h3>
			{badges.length === 0 ? (
				<p className="mt-4 text-center text-gray-500">
					{t('noBadges')}
				</p>
			) : (
				<div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5">
					{badges.map((badge) => (
						<BadgeIcon key={badge.id} badge={badge} locale={locale} />
					))}
				</div>
			)}
		</div>
	);
};

export default BadgeGrid;