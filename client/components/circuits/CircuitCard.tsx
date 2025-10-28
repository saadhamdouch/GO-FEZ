// client/components/circuits/CircuitCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Circuit } from '@/lib/types';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';
import { useTranslations } from 'next-intl';

// Icônes et composants UI
import { Map, Clock, Zap, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CircuitCardProps {
	circuit: Circuit;
	locale: string;
}

// Sous-composant pour les icônes (distance, durée)
const InfoBadge: React.FC<{ icon: React.ReactNode; text: string }> = ({
	icon,
	text,
}) => (
	<div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
		<div className="text-blue-600">{icon}</div>
		<span className="text-xs font-medium text-gray-800">{text}</span>
	</div>
);

const CircuitCard: React.FC<CircuitCardProps> = ({ circuit, locale }) => {
	const t = useTranslations('CircuitCard');
	const imageUrl = circuit.image || '/images/hero.jpg';

	// Logique pour obtenir la bonne traduction
	const name = circuit[locale as 'fr' | 'en' | 'ar']?.name || circuit.fr.name;
	const description =
		circuit[locale as 'fr' | 'en' | 'ar']?.description ||
		circuit.fr.description;

	return (
		<Link href={`/${locale}/circuits/${circuit.id}`} legacyBehavior>
			<a className="group block overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg">
				{/* Image */}
				<div className="relative h-56 w-full overflow-hidden">
					<Image
						loader={cloudinaryLoader}
						src={imageUrl}
						alt={name}
						layout="fill"
						objectFit="cover"
						className="transition-transform duration-300 group-hover:scale-105"
						quality={80}
					/>
					{circuit.isPremium && (
						<Badge
							variant="destructive"
							className="absolute top-3 right-3 flex items-center gap-1"
						>
							<Star className="h-3 w-3" />
							Premium
						</Badge>
					)}
				</div>

				{/* Contenu */}
				<div className="p-5">
					{/* Thèmes (Tags) */}
					<div className="flex flex-wrap gap-2">
						{circuit.themes?.slice(0, 2).map((theme) => (
							<Badge key={theme.id} variant="secondary">
								{theme[locale as 'fr' | 'en' | 'ar'] || theme.fr}
							</Badge>
						))}
					</div>

					{/* Nom */}
					<h3 className="mt-3 truncate text-xl font-bold text-gray-900">
						{name}
					</h3>
					{/* Description courte */}
					<p className="mt-1 h-10 text-sm text-gray-600 line-clamp-2">
						{description}
					</p>

					{/* Infos (Distance, Durée, POIs) */}
					<div className="mt-4 flex flex-wrap items-center gap-3">
						<InfoBadge
							icon={<Map className="h-4 w-4" />}
							text={`${circuit.distance} ${t('km')}`}
						/>
						<InfoBadge
							icon={<Clock className="h-4 w-4" />}
							text={`${circuit.duration} ${t('min')}`}
						/>
						<InfoBadge
							icon={<Zap className="h-4 w-4" />}
							text={`${circuit.pois?.length || 0} ${t('pois')}`}
						/>
					</div>
				</div>
			</a>
		</Link>
	);
};

export default CircuitCard;